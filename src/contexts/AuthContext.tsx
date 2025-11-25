'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { childService } from '@/services/childService'

interface User {
  id: string
  nome: string
  email: string
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showChildRegistration, setShowChildRegistration] = useState(false)
  const router = useRouter()

  // Verifica se o usuário está logado ao carregar a página
  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      const userData = localStorage.getItem('user-data')
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          setUser(user)
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error)
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
      
      const user: User = {
        id: userIdNumber.toString(),
        nome: userData?.nome ?? userData?.usuario?.nome ?? '',
        email: userData?.email ?? userData?.usuario?.email ?? '',
        foto_perfil: (userData?.foto_perfil ?? userData?.usuario?.foto_perfil) || undefined,
        hasChildren,
        isFirstLogin: isResponsible && !hasChildren,
        tipo: loginTipo,
      }

      // Define a duração do cookie baseado na opção "lembrar-se de mim"
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 dias ou 24 horas
      
      // Define o cookie de autenticação
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}`

      // Salva os dados do usuário no localStorage
      localStorage.setItem('user-data', JSON.stringify(user))
      
      // Salva a preferência "lembrar-se de mim"
      localStorage.setItem('remember-me', rememberMe.toString())
      
      setUser(user)
      
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
    
    // Remove dados do localStorage
    localStorage.removeItem('user-data')
    localStorage.removeItem('remember-me')
    
    setUser(null)
    
    // Redireciona para login
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      showChildRegistration, 
      setShowChildRegistration 
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
