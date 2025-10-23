import { AddressData } from '@/types'

// Serviços de Utilidades
export const utilsService = {
  async getCepData(cep: string): Promise<AddressData> {
    if (!cep) {
      throw new Error('CEP é obrigatório')
    }

    // Remove formatação do CEP
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos')
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP')
      }

      const data = await response.json()

      if (data.erro) {
        throw new Error('CEP não encontrado')
      }

      // Mapeia os dados para o formato esperado
      return {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }
    } catch (err: any) {
      const msg = (typeof err?.message === 'string' && /failed to fetch|network|fetch/i.test(err.message))
        ? 'Não foi possível conectar ao serviço de CEP. Verifique sua conexão.'
        : (err?.message || 'Erro ao consultar CEP')
      throw new Error(msg)
    }
  }
}
