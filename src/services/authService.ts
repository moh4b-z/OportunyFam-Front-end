import { LoginData } from '@/types'
import { API_BASE_URL } from './config'

// Serviços de Autenticação
export const authService = {
  async login(data: LoginData) {
    const { email, password } = data

    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios')
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        senha: password
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 401) {
        throw new Error('Email ou senha incorretos')
      } else if (response.status === 415) {
        throw new Error('Formato de dados inválido')
      } else {
        throw new Error(errorData.message || 'Erro no servidor')
      }
    }

    return response.json()
  }
}
