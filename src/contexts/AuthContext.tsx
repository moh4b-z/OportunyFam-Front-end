'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { childService } from '@/services/childService'
import { API_BASE_URL } from '@/services/config'

interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  cnpj?: string
  endereco?: string
  enderecoCoords?: { lat: number; lng: number } | null
  foto_perfil?: string
  logo?: string
  descricao?: string
  isFirstLogin?: boolean
  hasChildren?: boolean
  tipo: 'usuario' | 'instituicao' | 'crianca'
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

  // Busca os dados completos do usuário pela API baseado no tipo
  const fetchUserData = async (entityId: number, tipo: User['tipo']): Promise<User | null> => {
    try {
      let entityData: any = null
      
      if (tipo === 'usuario') {
        // Busca dados do responsável
        const fullUserData = await childService.getUserById(entityId)
        entityData = fullUserData?.usuario ?? fullUserData
      } else if (tipo === 'instituicao') {
        // Busca dados da instituição
        const response = await fetch(`${API_BASE_URL}/instituicoes/${entityId}`)
        if (response.ok) {
          const data = await response.json()
          entityData = data?.result?.instituicao ?? data?.instituicao ?? data?.result ?? data
        }
      } else if (tipo === 'crianca') {
        // Busca dados da criança
        const response = await fetch(`${API_BASE_URL}/criancas/${entityId}`)
        if (response.ok) {
          const data = await response.json()
          entityData = data?.result?.crianca ?? data?.crianca ?? data?.result ?? data
        }
      }
      
      if (!entityData) return null

      let hasChildren = false
      let enderecoFormatado: string | undefined = undefined
      let enderecoCoords: { lat: number; lng: number } | null = null

      if (tipo === 'usuario') {
        // Para responsáveis: verifica crianças e usa locais_salvos
        hasChildren = Array.isArray(entityData?.criancas_dependentes) && entityData.criancas_dependentes.length > 0
        
        if (Array.isArray(entityData?.locais_salvos) && entityData.locais_salvos.length > 0) {
          const local = entityData.locais_salvos[0]
          const bairro = local.bairro || ''
          const cidade = local.cidade || ''
          const estado = local.estado || ''
          if (bairro || cidade || estado) {
            enderecoFormatado = `${bairro}${cidade ? `, ${cidade}` : ''}${estado ? ` - ${estado}` : ''}`
          }
          if (local.latitude && local.longitude && local.latitude !== 0 && local.longitude !== 0) {
            enderecoCoords = { lat: local.latitude, lng: local.longitude }
          }
        }
      } else if (tipo === 'instituicao') {
        // Para instituições: usa endereco diretamente
        if (entityData?.endereco) {
          const end = entityData.endereco
          const bairro = end.bairro || ''
          const cidade = end.cidade || ''
          const estado = end.estado || ''
          if (bairro || cidade || estado) {
            enderecoFormatado = `${bairro}${cidade ? `, ${cidade}` : ''}${estado ? ` - ${estado}` : ''}`
          }
          if (end.latitude && end.longitude && end.latitude !== 0 && end.longitude !== 0) {
            enderecoCoords = { lat: end.latitude, lng: end.longitude }
          }
        }
      }
      // Para crianças: não tem endereço próprio

      return {
        id: entityId.toString(),
        nome: entityData?.nome ?? '',
        email: entityData?.email ?? '',
        telefone: entityData?.telefone ?? undefined,
        cpf: entityData?.cpf ?? undefined,
        cnpj: entityData?.cnpj ?? undefined,
        endereco: enderecoFormatado,
        enderecoCoords,
        foto_perfil: entityData?.foto_perfil ?? undefined,
        logo: entityData?.logo ?? undefined,
        descricao: entityData?.descricao ?? undefined,
        hasChildren,
        isFirstLogin: tipo === 'usuario' && !hasChildren,
        tipo,
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

      const storedTipo = localStorage.getItem('user-tipo') as User['tipo'] | null
      
      // Busca o ID correto baseado no tipo
      let storedId: string | null = null
      if (storedTipo === 'usuario') {
        storedId = localStorage.getItem('usuario_id')
      } else if (storedTipo === 'instituicao') {
        storedId = localStorage.getItem('instituicao_id')
      } else if (storedTipo === 'crianca') {
        storedId = localStorage.getItem('crianca_id')
      }
      
      if (token && storedId && storedTipo) {
        try {
          const entityId = Number(storedId)
          if (Number.isFinite(entityId)) {
            // Busca os dados completos do usuário via API baseado no tipo
            const userData = await fetchUserData(entityId, storedTipo)
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

      // O tipo vem direto na resposta: "usuario", "instituicao" ou "crianca"
      const tipo = response.tipo as User['tipo']
      if (!tipo || !['usuario', 'instituicao', 'crianca'].includes(tipo)) {
        throw new Error('Tipo de usuário inválido na resposta do login')
      }

      // Os dados vêm diretamente em result (não em result.usuario, etc)
      const entityData = response.result
      if (!entityData) {
        throw new Error('Dados do usuário não encontrados na resposta')
      }

      // O ID vem como instituicao_id, usuario_id ou crianca_id dependendo do tipo
      let entityId: number
      if (tipo === 'instituicao') {
        entityId = Number(entityData.instituicao_id)
      } else if (tipo === 'usuario') {
        entityId = Number(entityData.usuario_id)
      } else {
        entityId = Number(entityData.crianca_id)
      }
      
      if (!Number.isFinite(entityId)) {
        throw new Error('ID de usuário inválido na resposta do login')
      }

      // Usa o accessToken real que vem da API
      const token = response.accessToken || `auth-token-${Date.now()}-${entityId}`
      
      // Define a duração do cookie baseado na opção "lembrar-se de mim"
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 dias ou 24 horas
      
      // Define o cookie de autenticação
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}`

      // Limpa IDs antigos
      localStorage.removeItem('usuario_id')
      localStorage.removeItem('instituicao_id')
      localStorage.removeItem('crianca_id')
      
      // Salva o ID correto baseado no tipo
      if (tipo === 'usuario') {
        localStorage.setItem('usuario_id', entityId.toString())
      } else if (tipo === 'instituicao') {
        localStorage.setItem('instituicao_id', entityId.toString())
      } else if (tipo === 'crianca') {
        localStorage.setItem('crianca_id', entityId.toString())
      }
      
      // Salva o tipo do usuário logado
      localStorage.setItem('user-tipo', tipo)
      
      // Salva a preferência "lembrar-se de mim"
      localStorage.setItem('remember-me', rememberMe.toString())
      
      // Monta o objeto do usuário com os dados que já vieram no login
      let hasChildren = false
      let enderecoFormatado: string | undefined = undefined
      let enderecoCoords: { lat: number; lng: number } | null = null
      
      if (tipo === 'usuario') {
        // Para responsáveis: verifica crianças e usa locais_salvos para endereço
        hasChildren = Array.isArray(entityData?.criancas_dependentes) && entityData.criancas_dependentes.length > 0
        
        if (Array.isArray(entityData?.locais_salvos) && entityData.locais_salvos.length > 0) {
          const local = entityData.locais_salvos[0]
          const bairro = local.bairro || ''
          const cidade = local.cidade || ''
          const estado = local.estado || ''
          if (bairro || cidade || estado) {
            enderecoFormatado = `${bairro}${cidade ? `, ${cidade}` : ''}${estado ? ` - ${estado}` : ''}`
          }
          if (local.latitude && local.longitude && local.latitude !== 0 && local.longitude !== 0) {
            enderecoCoords = { lat: local.latitude, lng: local.longitude }
          }
        }
      } else if (tipo === 'instituicao') {
        // Para instituições: usa endereco diretamente
        if (entityData?.endereco) {
          const end = entityData.endereco
          const bairro = end.bairro || ''
          const cidade = end.cidade || ''
          const estado = end.estado || ''
          if (bairro || cidade || estado) {
            enderecoFormatado = `${bairro}${cidade ? `, ${cidade}` : ''}${estado ? ` - ${estado}` : ''}`
          }
          if (end.latitude && end.longitude && end.latitude !== 0 && end.longitude !== 0) {
            enderecoCoords = { lat: end.latitude, lng: end.longitude }
          }
        }
      }
      // Para crianças: não tem endereço próprio
      
      const loggedUser: User = {
        id: entityId.toString(),
        nome: entityData.nome ?? '',
        email: entityData.email ?? '',
        telefone: entityData.telefone ?? undefined,
        cpf: entityData.cpf ?? undefined,
        cnpj: entityData.cnpj ?? undefined,
        endereco: enderecoFormatado,
        enderecoCoords,
        foto_perfil: entityData.foto_perfil ?? undefined,
        logo: entityData.logo ?? undefined,
        descricao: entityData.descricao ?? undefined,
        hasChildren,
        isFirstLogin: tipo === 'usuario' && !hasChildren,
        tipo,
      }
      
      setUser(loggedUser)
      
      // Se é responsável e não tem crianças, mostra modal de cadastro
      if (tipo === 'usuario' && !hasChildren) {
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
    
    // Remove todos os IDs e dados do localStorage
    localStorage.removeItem('usuario_id')
    localStorage.removeItem('instituicao_id')
    localStorage.removeItem('crianca_id')
    localStorage.removeItem('user-tipo')
    localStorage.removeItem('remember-me')
    
    setUser(null)
    
    // Redireciona para login
    router.push('/login')
  }

  // Função para atualizar os dados do usuário (busca novamente da API)
  const refreshUserData = async () => {
    const storedTipo = localStorage.getItem('user-tipo') as User['tipo'] | null
    if (!storedTipo) return
    
    let storedId: string | null = null
    if (storedTipo === 'usuario') {
      storedId = localStorage.getItem('usuario_id')
    } else if (storedTipo === 'instituicao') {
      storedId = localStorage.getItem('instituicao_id')
    } else if (storedTipo === 'crianca') {
      storedId = localStorage.getItem('crianca_id')
    }
    
    if (storedId) {
      const entityId = Number(storedId)
      if (Number.isFinite(entityId)) {
        const userData = await fetchUserData(entityId, storedTipo)
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
