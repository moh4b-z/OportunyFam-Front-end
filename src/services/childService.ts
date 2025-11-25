import { ChildData, SexoOption } from '@/types'
import { API_BASE_URL } from './config'

// Serviços para crianças e usuários
export const childService = {
  async getUserById(userId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`)
      
      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.')
        }
        throw new Error('Erro ao carregar dados do usuário')
      }

      const data = await response.json()
      
      if (data.status && data.usuario) {
        return data.usuario
      }
      
      throw new Error('Dados do usuário não encontrados')
    } catch (err: any) {
      const msg = (typeof err?.message === 'string' && /failed to fetch|network|fetch/i.test(err.message))
        ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
        : (err?.message || 'Erro ao carregar dados do usuário')
      throw new Error(msg)
    }
  },
  async getSexoOptions(): Promise<SexoOption[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sexos`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar opções de sexo')
      }

      const data = await response.json()
      
      // Usa a mesma lógica do Card.tsx
      let genderArray = data
      
      // Se não for array, verifica se tem uma propriedade que contém o array
      if (!Array.isArray(data)) {
        // Possíveis propriedades onde pode estar o array
        if (data.data && Array.isArray(data.data)) {
          genderArray = data.data
        } else if (data.sexos && Array.isArray(data.sexos)) {
          genderArray = data.sexos
        } else if (data.results && Array.isArray(data.results)) {
          genderArray = data.results
        } else {
          throw new Error('Formato de resposta inválido')
        }
      }
      
      // Retorna no formato esperado pelo modal
      return genderArray.map((item: any) => ({
        id: item.id,
        nome: item.nome
      }))
    } catch (error) {
      console.error('❌ Erro ao buscar opções de sexo:', error)
      // Retorna opções padrão em caso de erro
      return [
        { id: 1, nome: 'Masculino' },
        { id: 2, nome: 'Feminino' }
      ]
    }
  },

  async registerChild(childData: ChildData) {
    try {
      const response = await fetch(`${API_BASE_URL}/criancas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.')
        }
        throw new Error(errorData.messagem || errorData.message || 'Não foi possível concluir o cadastro da criança.')
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
