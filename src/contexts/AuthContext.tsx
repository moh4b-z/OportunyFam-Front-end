'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nome: string
  email: string
  foto_perfil?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      
      // Aqui você faria a chamada para sua API de login
      // Por enquanto, vou simular um login bem-sucedido
      const mockUser: User = {
        id: '1',
        nome: 'Usuário Teste',
        email: email,
        foto_perfil: undefined
      }

      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Define a duração do cookie baseado na opção "lembrar-se de mim"
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 dias ou 24 horas
      
      // Define o cookie de autenticação (em produção, isso seria feito pelo backend)
      document.cookie = `auth-token=mock-token-${Date.now()}; path=/; max-age=${maxAge}`

      // Salva os dados do usuário no localStorage
      localStorage.setItem('user-data', JSON.stringify(mockUser))
      
      // Salva a preferência "lembrar-se de mim"
      localStorage.setItem('remember-me', rememberMe.toString())
      
      setUser(mockUser)
      
      // Redireciona para a home
      router.push('/')
      
      return true
    } catch (error) {
      console.error('Erro no login:', error)
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
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
