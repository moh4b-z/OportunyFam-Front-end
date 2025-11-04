import { InstituicaoRequest, TipoInstituicao } from '@/types'
import { API_BASE_URL } from './config'

// Serviços de Instituições
export const institutionService = {
  async register(data: InstituicaoRequest & {
    cep: string;
    logradouro: string;
    numero?: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    tipos_instituicao: number[];
    logo?: string;
  }) {
    const {
      nome,
      logo,
      cnpj,
      telefone,
      email,
      senha,
      descricao,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      tipos_instituicao
    } = data

    // Validações básicas
    if (!nome || !cnpj || !telefone || !email || !senha || !cep) {
      throw new Error('Campos obrigatórios não preenchidos')
    }

    if (!tipos_instituicao || tipos_instituicao.length === 0) {
      throw new Error('Selecione pelo menos um tipo de instituição')
    }

    const institutionData = {
      nome,
      logo: logo || "",
      cnpj,
      telefone,
      email,
      senha,
      descricao: descricao || "",
      cep,
      logradouro,
      numero: numero || "",
      complemento: complemento || "",
      bairro,
      cidade,
      estado,
      tipos_instituicao
    }

    const response = await fetch(`${API_BASE_URL}/instituicoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(institutionData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erro ao cadastrar instituição')
    }

    return response.json()
  },

  async getTypes(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tipoInstituicoes`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar tipos de instituição')
      }

      const data = await response.json()

      // Verifica se a resposta tem a estrutura esperada
      if (!data.status || !data.tipos_instituicao || !Array.isArray(data.tipos_instituicao)) {
        console.error('Estrutura de resposta inválida:', data)
        throw new Error('Formato de resposta inválido')
      }

      // Mapeia os dados da API para o formato esperado pelo componente MultiSelect
      return data.tipos_instituicao.map((item: any) => ({
        value: item.id.toString(),
        label: item.nome
      }))
    } catch (error) {
      console.error('Erro ao carregar tipos de instituição:', error)
      
      // Retorna opções padrão em caso de erro
      return [
        { value: 'educacao', label: 'Educação' },
        { value: 'saude', label: 'Saúde' },
        { value: 'assistencia_social', label: 'Assistência Social' },
        { value: 'cultura', label: 'Cultura' },
        { value: 'esporte', label: 'Esporte' },
        { value: 'meio_ambiente', label: 'Meio Ambiente' }
      ]
    }
  }
}
