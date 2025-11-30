'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { childService } from '@/services/childService'

interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  endereco?: string
  enderecoCoords?: { lat: number; lng: number } | null
  foto_perfil?: string
  isFirstLogin?: boolean
  hasChildren?: boolean
  tipo?: 'usuario' | 'instituicao' | 'crianca'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  showChildRegistration: boolean
  setShowChildRegistration: (show: boolean) => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showChildRegistration, setShowChildRegistration] = useState(false)
  const router = useRouter()

  // Busca os dados completos do usuário pela API
  const fetchUserData = async (userId: number): Promise<User | null> => {
    try {
      const fullUserData = await childService.getUserById(userId)
      const userData = fullUserData?.usuario ?? fullUserData
      
      if (!userData) return null

      const hasChildren = Array.isArray(userData?.criancas_dependentes) && userData.criancas_dependentes.length > 0
      const rawTipoNivel = userData?.tipo_nivel ?? ''
      const isResponsible = typeof rawTipoNivel === 'string' && rawTipoNivel.toLowerCase().includes('fam')

      // Formata o endereço a partir de locais_salvos
      let enderecoFormatado: string | undefined = undefined
      let enderecoCoords: { lat: number; lng: number } | null = null
      if (Array.isArray(userData?.locais_salvos) && userData.locais_salvos.length > 0) {
        const local = userData.locais_salvos[0]
        const bairro = local.bairro || ''
        const cidade = local.cidade || ''
        const estado = local.estado || ''
        if (bairro || cidade || estado) {
          enderecoFormatado = `${bairro}${cidade ? `, ${cidade}` : ''}${estado ? ` - ${estado}` : ''}`
        }
        // Pega coordenadas se existirem e forem válidas
        if (local.latitude && local.longitude && local.latitude !== 0 && local.longitude !== 0) {
          enderecoCoords = { lat: local.latitude, lng: local.longitude }
        }
      }

      return {
        id: userId.toString(),
        nome: userData?.nome ?? '',
        email: userData?.email ?? '',
        telefone: userData?.telefone ?? undefined,
        cpf: userData?.cpf ?? undefined,
        endereco: enderecoFormatado,
        enderecoCoords,
        foto_perfil: userData?.foto_perfil || undefined,
        hasChildren,
        isFirstLogin: isResponsible && !hasChildren,
        tipo: isResponsible ? 'usuario' : undefined,
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      return null
    }
  }

  // Verifica se o usuário está logado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      // Agora só salva o ID no localStorage
      const storedUserId = localStorage.getItem('user-id')
      
      if (token && storedUserId) {
        try {
          const userId = Number(storedUserId)
          if (Number.isFinite(userId)) {
            // Busca os dados completos do usuário via API
            const userData = await fetchUserData(userId)
            if (userData) {
              setUser(userData)
            } else {
              logout()
            }
          } else {
            logout()
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error)
          logout()
        }
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Chama o serviço de autenticação real
      const response = await authService.login({ email, senha: password })
      
      // Verifica se a resposta tem os dados esperados
      if (!response) {
        throw new Error('Nenhuma resposta do servidor')
      }

      // Verifica se o login foi bem-sucedido
      if (!response.status) {
        throw new Error(response.messagem || 'Falha na autenticação')
      }

      // Verifica se tem dados do usuário na estrutura correta
      if (!response.result) {
        throw new Error('Dados do usuário não encontrados na resposta')
      }

      const userData = response.result

      const rawId =
        (userData as any)?.id ??
        (userData as any)?.usuario?.id ??
        (userData as any)?.user?.id ??
        (userData as any)?.usuario_id ??
        (userData as any)?.id_usuario ??
        (userData as any)?.instituicao_id ??
        (userData as any)?.id_instituicao ??
        (userData as any)?.pessoa_id ??
        (userData as any)?.id_pessoa
      if (rawId == null) {
        throw new Error('Dados do usuário sem ID na resposta do login')
      }
      const userIdNumber = Number(rawId)
      if (!Number.isFinite(userIdNumber)) {
        throw new Error('ID de usuário inválido na resposta do login')
      }

      const token = `auth-token-${Date.now()}-${userIdNumber}`

      const loginTipo = (response as any)?.tipo as User['tipo'] | undefined

      const rawTipoNivel = userData?.tipo_nivel ?? userData?.usuario?.tipo_nivel ?? ''
      const isResponsible = typeof rawTipoNivel === 'string' && rawTipoNivel.toLowerCase().includes('fam')
      
      let hasChildren = false
      if (isResponsible) {
        try {
          const fullUserData = await childService.getUserById(userIdNumber)
          hasChildren = Array.isArray(fullUserData?.criancas_dependentes) && fullUserData.criancas_dependentes.length > 0
        } catch (error) {
          console.error('Erro ao verificar crianças do usuário:', error)
          const loginChildren = userData?.criancas_dependentes ?? userData?.usuario?.criancas_dependentes
          hasChildren = Array.isArray(loginChildren) && loginChildren.length > 0
        }
      }
      
      // Define a duração do cookie baseado na opção "lembrar-se de mim"
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 dias ou 24 horas
      
      // Define o cookie de autenticação
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}`

      // Salva APENAS o ID do usuário no localStorage (dados são buscados da API)
      localStorage.setItem('user-id', userIdNumber.toString())
      
      // Salva a preferência "lembrar-se de mim"
      localStorage.setItem('remember-me', rememberMe.toString())
      
      // Busca os dados completos do usuário via API
      const fullUser = await fetchUserData(userIdNumber)
      if (!fullUser) {
        throw new Error('Falha ao carregar dados do usuário')
      }
      
      setUser(fullUser)
      
      // Se é responsável e não tem crianças, mostra modal de cadastro
      if (isResponsible && !hasChildren) {
        setShowChildRegistration(true)
      }
      
      // Redireciona para a home
      router.push('/')
      
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      // Não salva nada no localStorage em caso de erro
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Remove o cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    
    // Remove apenas o ID do localStorage
    localStorage.removeItem('user-id')
    localStorage.removeItem('remember-me')
    
    setUser(null)
    
    // Redireciona para login
    router.push('/login')
  }

  // Função para atualizar os dados do usuário (busca novamente da API)
  const refreshUserData = async () => {
    const storedUserId = localStorage.getItem('user-id')
    if (storedUserId) {
      const userId = Number(storedUserId)
      if (Number.isFinite(userId)) {
        const userData = await fetchUserData(userId)
        if (userData) {
          setUser(userData)
        }
      }
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      showChildRegistration, 
      setShowChildRegistration,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
