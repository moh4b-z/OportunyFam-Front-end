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
    // Se query vazia, busca todas
    const url = query.trim() 
      ? `${API_BASE_URL}/instituicoes/?nome=${encodeURIComponent(query)}&pagina=1&tamanho=50`
      : `${API_BASE_URL}/instituicoes`
    
    console.log('🔍 URL da API:', url)
    
    try {
      console.log('📡 Fazendo requisição...')
      const response = await fetch(url)
      console.log('📊 Status:', response.status, response.statusText)
      
      const data = await response.json()
      console.log('📊 Resposta da API:', data)
      
      if (response.ok) {
        console.log('✅ API funcionou! Dados:', data)
        console.log('🔍 Tipo de data:', typeof data)
        console.log('🔍 É array?', Array.isArray(data))
        console.log('🔍 Propriedades:', Object.keys(data))
        console.log('🔍 data.data:', data.data)
        console.log('🔍 data.instituicoes:', data.instituicoes)
        
        // Tenta diferentes formatos de resposta
        let institutions = []
        if (Array.isArray(data)) {
          institutions = data
        } else if (data.data && Array.isArray(data.data)) {
          institutions = data.data
        } else if (data.instituicoes && Array.isArray(data.instituicoes)) {
          institutions = data.instituicoes
        } else if (data.results && Array.isArray(data.results)) {
          institutions = data.results
        }
        
        // Filtra apenas instituições que contêm o termo buscado
        let filteredInstitutions = institutions
        if (query.trim()) {
          const searchTerm = query.toLowerCase().trim()
          filteredInstitutions = institutions.filter(inst => 
            inst.nome && inst.nome.toLowerCase().includes(searchTerm)
          )
        }
        
        console.log('🎯 Instituições encontradas:', institutions.length)
        console.log('🎯 Instituições filtradas:', filteredInstitutions.length)
        console.log('🎯 Primeira instituição:', filteredInstitutions[0])
        
        return {
          status: true,
          status_code: 200,
          data: filteredInstitutions
        }
      } else {
        console.log('❌ Erro da API:', response.status, data)
        throw new Error(`Erro ${response.status}`)
      }
    } catch (error) {
      console.log('❌ Erro na requisição:', error.message)
      throw error
    }
  },

  async getAll() {
    const url = `${API_BASE_URL}/instituicoes`
    console.log('🔍 Buscando todas as instituições:', url)
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Todas as instituições carregadas:', data)
        let institutions = []
        if (Array.isArray(data)) {
          institutions = data
        } else if (data.data && Array.isArray(data.data)) {
          institutions = data.data
        } else if (data.instituicoes && Array.isArray(data.instituicoes)) {
          institutions = data.instituicoes
        } else if (data.results && Array.isArray(data.results)) {
          institutions = data.results
        }
        
        return {
          status: true,
          status_code: 200,
          data: institutions
        }
      } else {
        throw new Error(`Erro ${response.status}`)
      }
    } catch (error) {
      console.log('❌ Erro ao buscar todas:', error.message)
      throw error
    }
  },

  async searchByLocation(location: string) {
    const url = `${API_BASE_URL}/instituicoes/?bairro=${encodeURIComponent(location)}&pagina=1&tamanho=50`
    console.log('🔍 Buscando por localização:', url)
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ Instituições em ${location}:`, data)
        let institutions = []
        if (Array.isArray(data)) {
          institutions = data
        } else if (data.data && Array.isArray(data.data)) {
          institutions = data.data
        } else if (data.instituicoes && Array.isArray(data.instituicoes)) {
          institutions = data.instituicoes
        } else if (data.results && Array.isArray(data.results)) {
          institutions = data.results
        }
        
        // Filtra por localização no nome ou bairro (busca mais ampla)
        const filteredInstitutions = institutions.filter(inst => {
          const name = (inst.nome || '').toLowerCase()
          const bairro = (inst.endereco?.bairro || inst.bairro || '').toLowerCase()
          const descricao = (inst.descricao || '').toLowerCase()
          const locationLower = location.toLowerCase()
          
          return name.includes(locationLower) || 
                 bairro.includes(locationLower) ||
                 descricao.includes(locationLower) ||
                 // Busca parcial por palavras
                 locationLower.split(' ').some(word => 
                   name.includes(word) || bairro.includes(word)
                 )
        })
        
        return {
          status: true,
          status_code: 200,
          data: filteredInstitutions
        }
      } else {
        throw new Error(`Erro ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar ${location}:`, error.message)
      throw error
    }
  },


}
