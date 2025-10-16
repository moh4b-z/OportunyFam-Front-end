// Serviços de API centralizados

// Tipos
export interface LoginData {
  email: string
  password: string
}

export interface InstitutionData {
  nome: string
  logo?: string
  cnpj: string
  telefone: string
  email: string
  senha: string
  descricao?: string
  cep: string
  logradouro: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  tipos_instituicao: number[]
}

export interface ResponsibleData {
  nome: string
  foto_perfil?: string
  email: string
  senha: string
  data_nascimento: string
  cpf: string
  telefone: string
  id_sexo: number
  id_tipo_nivel?: number
  cep: string
  logradouro: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface AddressData {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

export interface InstitutionType {
  value: string
  label: string
}

// Serviços de Autenticação
export const authService = {
  async login(data: LoginData) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    return response
  }
}

// Serviços de Instituições
export const institutionService = {
  async register(data: InstitutionData) {
    const response = await fetch('/api/instituicoes/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    return response
  },

  async getTypes(): Promise<InstitutionType[]> {
    const response = await fetch('/api/instituicoes/tipos')
    if (!response.ok) {
      throw new Error('Erro ao carregar tipos de instituição')
    }
    return response.json()
  }
}

// Serviços de Usuários
export const userService = {
  async register(data: ResponsibleData) {
    const response = await fetch('/api/usuarios/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    return response
  }
}

// Serviços de Utilidades
export const utilsService = {
  async getCepData(cep: string): Promise<AddressData> {
    const response = await fetch(`/api/utils/cep?cep=${cep}`)
    if (!response.ok) {
      throw new Error('Erro ao consultar CEP')
    }
    return response.json()
  }
}
