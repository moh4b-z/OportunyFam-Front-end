import { InstituicaoRequest, TipoInstituicao, Instituicao } from '@/types'
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
      console.log('🔍 Buscando tipos de instituição...')
      const response = await fetch(`${API_BASE_URL}/tipoInstituicoes`)
      console.log('📊 Status tipos:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Tipos recebidos:', data)
        
        if (data.tipos_instituicao && Array.isArray(data.tipos_instituicao)) {
          return data.tipos_instituicao.map((item: any) => ({
            value: item.id.toString(),
            label: item.nome
          }))
        }
      }
      
      throw new Error('API indisponível')
    } catch (error) {
      console.log('❌ Usando tipos padrão:', error.message)
      
      return [
        { value: 'educacao', label: 'Educação' },
        { value: 'saude', label: 'Saúde' },
        { value: 'assistencia_social', label: 'Assistência Social' },
        { value: 'cultura', label: 'Cultura' },
        { value: 'esporte', label: 'Esporte' },
        { value: 'meio_ambiente', label: 'Meio Ambiente' }
      ]
    }
  },

  async getById(id: number) {
    try {
      console.log(`🔍 Buscando instituição ID: ${id}`)
      const response = await fetch(`${API_BASE_URL}/instituicoes/${id}`)
      console.log('📊 Status busca:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Instituição encontrada:', data)
        return data
      }
      
      throw new Error('Não encontrada')
    } catch (error) {
      console.log('❌ Erro busca instituição:', error.message)
      throw error
    }
  },

  async search(query: string) {
    const url = `${API_BASE_URL}/instituicoes/?nome=${encodeURIComponent(query)}&pagina=1&tamanho=20`
    console.log('🔍 URL da API:', url)
    
    try {
      console.log('📡 Fazendo requisição...')
      const response = await fetch(url)
      console.log('📊 Status:', response.status, response.statusText)
      
      const data = await response.json()
      console.log('📊 Resposta da API:', data)
      
      if (response.ok) {
        console.log('✅ API funcionou! Dados:', data)
        return data
      } else if (response.status === 500 && data.messagem?.includes('erros internos')) {
        console.log('⚠️ API sem dados ainda (erro 500 esperado)')
        throw new Error('API sem dados')
      } else {
        console.log('❌ Erro da API:', response.status, data.messagem)
        throw new Error(`Erro ${response.status}`)
      }
    } catch (error) {
      console.log('❌ API não disponível:', error.message)
      console.log('🔄 Usando dados locais...')
      
      // Fallback para dados locais
      const { populateService } = await import('./populateInstitutions')
      const localResults = populateService.searchLocal(query)
      
      return {
        status: true,
        status_code: 200,
        messagem: 'Dados locais (API indisponível)',
        data: localResults
      }
    }
  },


}
