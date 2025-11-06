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

    try {
      const response = await fetch(`${API_BASE_URL}/instituicoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institutionData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.')
        }
        throw new Error(errorData.message || 'Não foi possível concluir o cadastro da instituição.')
      }

      return response.json()
    } catch (err: any) {
      const msg = (typeof err?.message === 'string' && /failed to fetch|network|fetch/i.test(err.message))
        ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
        : (err?.message || 'Erro de conexão. Verifique sua internet.')
      throw new Error(msg)
    }
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.log('❌ Usando tipos padrão:', errorMessage);
      
      return [
        { value: '1', label: 'Educação' },
        { value: '2', label: 'Saúde' },
        { value: '3', label: 'Assistência Social' },
        { value: '4', label: 'Cultura' },
        { value: '5', label: 'Esporte' },
        { value: '6', label: 'Meio Ambiente' }
      ];
    }
  },

  async getById(id: number) {
    try {
      console.log(`🔍 Buscando instituição ID: ${id}`)
      const response = await fetch(`${API_BASE_URL}/instituicoes/${id}`)
      console.log('📊 Status busca:', response.status)
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status && data.instituicao) {
        console.log('✅ Instituição encontrada:', data.instituicao)
        return data.instituicao
      }
      
      throw new Error('Formato de resposta inesperado da API')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error(`Erro ao buscar instituição com ID ${id}:`, errorMessage)
      throw error
    }
  },

  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/instituicoes`)
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status && Array.isArray(data.instituicoes)) {
        return data.instituicoes
      }
      
      throw new Error('Formato de resposta inesperado da API')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao buscar todas as instituições:', errorMessage)
      throw error
    }
  },

  async search(query: string) {
    const url = `${API_BASE_URL}/instituicoes/?nome=${encodeURIComponent(query)}&pagina=1&tamanho=20`
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Verifica se a resposta tem o formato esperado
      if (data.status && Array.isArray(data.instituicoes)) {
        return {
          status: data.status,
          status_code: data.status_code || 200,
          message: data.messagem || 'Busca realizada com sucesso',
          data: data.instituicoes
        }
      }
      
      // Se chegou aqui, a resposta não está no formato esperado
      throw new Error('Formato de resposta inesperado da API')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao buscar instituições:', errorMessage)
      
      // Fallback para dados locais em caso de erro
      try {
        const { populateService } = await import('./populateInstitutions')
        const localResults = populateService.searchLocal(query)
        
        return {
          status: true,
          status_code: 200,
          message: 'Dados locais (API indisponível)',
          data: localResults
        }
      } catch (localError: unknown) {
        const localErrorMessage = localError instanceof Error ? localError.message : 'Erro desconhecido';
        console.error('Erro ao carregar dados locais:', localErrorMessage)
        throw new Error('Não foi possível carregar as instituições')
      }
    }
  },

}
