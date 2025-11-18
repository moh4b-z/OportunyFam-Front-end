'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Usuario, Instituicao, Crianca } from '@/types'

type User = Usuario | Instituicao | Crianca

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  register: (userData: { nome: string; email: string; telefone?: string; password: string; cep?: string; cpf?: string; data_nascimento?: string; id_sexo?: number }) => Promise<boolean>
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
      
      // Simula busca dos dados do usuário baseado no email
      const userData = localStorage.getItem(`user_${email}`)
      let user: Usuario
      
      if (userData) {
        // Se existe dados salvos do registro, usa eles
        user = JSON.parse(userData)
      } else {
        // Caso contrário, cria um usuário padrão
        user = {
          usuario_id: 1,
          nome: 'Usuário Teste',
          email: email,
          telefone: null,
          foto_perfil: null,
          cep: null,
          cpf: null,
          data_nascimento: null
        }
      }

      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Define a duração do cookie baseado na opção "lembrar-se de mim"
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 dias ou 24 horas
      
      // Define o cookie de autenticação (em produção, isso seria feito pelo backend)
      document.cookie = `auth-token=mock-token-${Date.now()}; path=/; max-age=${maxAge}`

      // Salva os dados do usuário no localStorage
      localStorage.setItem('user-data', JSON.stringify(user))
      
      // Salva a preferência "lembrar-se de mim"
      localStorage.setItem('remember-me', rememberMe.toString())
      
      setUser(user)
      
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

  const register = async (userData: { nome: string; email: string; telefone?: string; password: string; cep?: string; cpf?: string; data_nascimento?: string; id_sexo?: number }): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Validação básica dos campos obrigatórios
      if (!userData.nome || userData.nome.trim().length === 0) {
        throw new Error('Nome é obrigatório')
      }
      if (!userData.email || userData.email.trim().length === 0) {
        throw new Error('Email é obrigatório')
      }
      
      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email.trim())) {
        throw new Error('Formato de email inválido')
      }
      if (!userData.password || userData.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres')
      }
      
      // Validação de tamanho dos campos
      if (userData.nome.length > 100) {
        throw new Error('Nome não pode ter mais de 100 caracteres')
      }
      if (userData.email.length > 100) {
        throw new Error('Email não pode ter mais de 100 caracteres')
      }
      if (userData.telefone && userData.telefone.length > 20) {
        throw new Error('Telefone não pode ter mais de 20 caracteres')
      }
      if (userData.cpf && userData.cpf.length > 14) {
        throw new Error('CPF não pode ter mais de 14 caracteres')
      }
      
      // Prepara os dados para a API
      const apiData = {
        nome: userData.nome.trim(),
        foto_perfil: "",
        email: userData.email.trim().toLowerCase(),
        senha: userData.password,
        data_nascimento: userData.data_nascimento || "1990-01-01",
        telefone: userData.telefone || "",
        cpf: userData.cpf || "",
        id_sexo: userData.id_sexo || 1,
        id_tipo_nivel: 1,
        cep: userData.cep || "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: ""
      }
      
      // Log dos dados enviados
      console.log('📤 Dados enviados para API:', apiData)
      
      // Log de validação dos campos obrigatórios
      console.log('📋 Validação dos campos:')
      console.log('- Nome:', apiData.nome, '(tamanho:', apiData.nome.length, ')')
      console.log('- Email:', apiData.email, '(tamanho:', apiData.email.length, ')')
      console.log('- Senha:', apiData.senha ? '[DEFINIDA]' : '[VAZIA]', '(tamanho:', apiData.senha.length, ')')
      console.log('- Telefone:', apiData.telefone, '(tamanho:', apiData.telefone.length, ')')
      console.log('- CPF:', apiData.cpf, '(tamanho:', apiData.cpf.length, ')')
      console.log('- Data nascimento:', apiData.data_nascimento)
      console.log('- CEP:', apiData.cep, '(tamanho:', apiData.cep.length, ')')
      console.log('- ID Sexo:', apiData.id_sexo)
      console.log('- ID Tipo Nível:', apiData.id_tipo_nivel)
      
      // Chama a API real
      const response = await fetch('https://oportunyfam-back-end.onrender.com/v1/oportunyfam/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })
      
      console.log('📥 Status da resposta:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.log('❌ Erro da API (Status:', response.status, '):', errorData)
        console.log('📤 Dados que causaram o erro:', JSON.stringify(apiData, null, 2))
        try {
          const errorJson = JSON.parse(errorData)
          throw new Error(errorJson.messagem || `Erro ${response.status}: ${errorData}`)
        } catch (parseError) {
          throw new Error(`Erro ${response.status}: ${errorData}`)
        }
      }
      
      const result = await response.json()
      console.log('✅ Resposta da API:', result)
      
      // Cria o objeto do usuário com os dados retornados
      const newUser: Usuario = {
        usuario_id: result.usuario?.id || result.id || Date.now(),
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone || null,
        foto_perfil: null,
        cep: userData.cep || null,
        cpf: userData.cpf || null,
        data_nascimento: userData.data_nascimento || null
      }
      
      // Salva os dados do usuário para uso futuro no login
      localStorage.setItem(`user_${userData.email}`, JSON.stringify(newUser))
      
      // Define o cookie de autenticação
      document.cookie = `auth-token=register-token-${Date.now()}; path=/; max-age=${24 * 60 * 60}`
      
      // Salva os dados do usuário no localStorage
      localStorage.setItem('user-data', JSON.stringify(newUser))
      
      setUser(newUser)
      
      // Redireciona para a home
      router.push('/')
      
      return true
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error // Propaga o erro para ser tratado no componente
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
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
