import { LoginRequest } from '@/types'
import { API_BASE_URL } from './config'

// Serviços de Autenticação
export const authService = {
  async login(data: LoginRequest) {
    const { email, senha: password } = data

    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios')
    }

    try {
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
        } else if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.')
        } else {
          throw new Error(errorData.message || 'Não foi possível concluir o login.')
        }
      }

      return response.json()
    } catch (err: any) {
      const msg = (typeof err?.message === 'string' && /failed to fetch|network|fetch/i.test(err.message))
        ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
        : (err?.message || 'Erro de conexão. Verifique sua internet.')
      throw new Error(msg)
    }
  }
}
