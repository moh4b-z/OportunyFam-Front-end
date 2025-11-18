import { LoginRequest } from '@/types'
import { API_BASE_URL } from './config'
import { emailService } from './emailService'

// Interfaces para recuperação de senha
interface ForgotPasswordRequest {
  email: string
}

interface VerifyCodeRequest {
  email: string
  codigo: string
}

interface ResetPasswordRequest {
  email: string
  codigo: string
  novaSenha: string
}

// Serviços de Autenticação
export const authService = {
  async login(data: LoginRequest) {
    const { email, senha: password } = data

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
  },

  // Solicitar código de recuperação de senha
  async requestPasswordReset(data: ForgotPasswordRequest) {
    const { email } = data

    if (!email) {
      throw new Error('Email é obrigatório')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Por favor, insira um email válido')
    }

    // Primeiro verificar se o email existe na base de usuários
    const usersResponse = await fetch(`${API_BASE_URL}/usuarios`)
    if (!usersResponse.ok) {
      throw new Error('Erro ao verificar usuário')
    }

    const usersData = await usersResponse.json()
    const userExists = usersData.usuarios?.some((user: any) => user.email === email)
    
    if (!userExists) {
      throw new Error('Email não encontrado em nossa base de dados')
    }

    // Gerar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Buscar nome do usuário para personalizar email
    const user = usersData.usuarios.find((u: any) => u.email === email)
    const userName = user?.nome || 'Usuário'
    
    try {
      // Enviar email real
      await emailService.sendPasswordResetEmail(email, resetCode, userName)
      
      // Armazenar código para validação
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`reset_code_${email}`, resetCode)
        sessionStorage.setItem(`reset_code_time_${email}`, Date.now().toString())
        sessionStorage.setItem(`reset_user_name_${email}`, userName)
      }
      
      return {
        status: true,
        message: 'Código de recuperação enviado para o email',
        expiresIn: '15 minutos'
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      throw new Error('Erro ao enviar código de recuperação. Verifique sua conexão e tente novamente.')
    }
  },

  // Verificar código de recuperação
  async verifyResetCode(data: VerifyCodeRequest) {
    const { email, codigo } = data

    if (!email || !codigo) {
      throw new Error('Email e código são obrigatórios')
    }

    if (codigo.length !== 6) {
      throw new Error('O código deve ter 6 dígitos')
    }

    // Verificar código armazenado temporariamente
    if (typeof window !== 'undefined') {
      const storedCode = sessionStorage.getItem(`reset_code_${email}`)
      const storedTime = sessionStorage.getItem(`reset_code_time_${email}`)
      
      if (!storedCode || !storedTime) {
        throw new Error('Solicitação de recuperação não encontrada')
      }
      
      // Verificar se código expirou (15 minutos)
      const codeTime = parseInt(storedTime)
      const now = Date.now()
      const fifteenMinutes = 15 * 60 * 1000
      
      if (now - codeTime > fifteenMinutes) {
        sessionStorage.removeItem(`reset_code_${email}`)
        sessionStorage.removeItem(`reset_code_time_${email}`)
        throw new Error('Código expirado')
      }
      
      if (storedCode !== codigo) {
        throw new Error('Código inválido')
      }
      
      return {
        status: true,
        message: 'Código válido'
      }
    }
    
    throw new Error('Erro ao verificar código')
  },

  // Redefinir senha
  async resetPassword(data: ResetPasswordRequest) {
    const { email, codigo, novaSenha } = data

    if (!email || !codigo || !novaSenha) {
      throw new Error('Todos os campos são obrigatórios')
    }

    if (novaSenha.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }

    // Verificar código novamente
    if (typeof window !== 'undefined') {
      const storedCode = sessionStorage.getItem(`reset_code_${email}`)
      const storedTime = sessionStorage.getItem(`reset_code_time_${email}`)
      
      if (!storedCode || storedCode !== codigo) {
        throw new Error('Código inválido ou expirado')
      }
      
      const codeTime = parseInt(storedTime || '0')
      const now = Date.now()
      const fifteenMinutes = 15 * 60 * 1000
      
      if (now - codeTime > fifteenMinutes) {
        sessionStorage.removeItem(`reset_code_${email}`)
        sessionStorage.removeItem(`reset_code_time_${email}`)
        throw new Error('Código expirado')
      }
    }

    // Buscar usuário para obter ID
    const usersResponse = await fetch(`${API_BASE_URL}/usuarios`)
    if (!usersResponse.ok) {
      throw new Error('Erro ao buscar usuário')
    }

    const usersData = await usersResponse.json()
    const user = usersData.usuarios?.find((u: any) => u.email === email)
    
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Atualizar senha do usuário (assumindo endpoint PUT)
    const updateResponse = await fetch(`${API_BASE_URL}/usuarios/${user.usuario_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senha: novaSenha
      })
    })

    if (!updateResponse.ok) {
      throw new Error('Erro ao atualizar senha')
    }

    // Limpar código usado
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`reset_code_${email}`)
      sessionStorage.removeItem(`reset_code_time_${email}`)
    }

    return {
      status: true,
      message: 'Senha redefinida com sucesso'
    }
  }
}
