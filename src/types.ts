// Tipos e interfaces para os serviços da aplicação

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
