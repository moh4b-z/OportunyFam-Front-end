
// --------------------
// Tipos básicos
// --------------------
export interface Endereco {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
}

export interface TipoInstituicao {
  id: number;
  nome: string;
}

// --------------------
// Tipos para cadastro
// --------------------
export interface CadastroInstituicao {
  nome: string;
  logo?: string | null;
  cnpj: string;
  telefone: string;
  email: string;
  senha: string;
  descricao: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipos_instituicao: number[]; // ids dos tipos
}

// --------------------
// Retorno de cadastro
// --------------------
export interface CadastroInstituicaoResponse {
  status: boolean;
  status_code: number;
  messagem: string;
  instituicao: {
    id: number;
    nome: string;
    logo?: string | null;
    cnpj: string;
    telefone: string;
    email: string;
    senha: string;
    descricao: string;
    criado_em: string; // ISO date
    id_endereco: number;
  };
}

// --------------------
// Retorno de GET por ID ou busca
// --------------------
export interface Instituicao {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  descricao: string;
  criado_em: string;
  endereco: Endereco;
  tipos_instituicao: TipoInstituicao[];
  telefone?: string;
  logo?: string | null;
}

export interface GetInstituicoesResponse {
  status: boolean;
  status_code: number;
  messagem: string;
  instituicoes: Instituicao[];
}

// --------------------
// Retorno genérico de erro ou sucesso (delete, update, etc)
// --------------------
export interface GenericResponse {
  status: boolean;
  status_code: number;
  messagem: string;
}
