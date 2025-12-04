// Tipos TypeScript para os payloads retornados/aceitos pela API OportunyFam
// Gerados a partir do padrão Kotlin fornecido e das views no banco.

export interface PaginationMetadata {
    pagina_atual: number
    tamanho_pagina: number
    total_registros: number
    total_paginas: number
    link_proxima_pagina?: string | null
    link_pagina_anterior?: string | null
}

// Usado por utilsService.getCepData
export interface AddressData {
    logradouro: string
    bairro: string
    cidade: string
    estado: string
}

export interface ChildData {
  nome: string
  foto_perfil?: string
  email?: string
  cpf: string
  senha?: string
  data_nascimento: string
  id_sexo: number
  id_usuario: number
}

export interface SexoOption {
  id: number
  nome: string
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

export interface PaginatedResponse<T> {
  status: boolean
  status_code: number
  messagem: string
  metadata: PaginationMetadata
  data: T[]
}

// ----------------- USUÁRIO -----------------
export interface Usuario {
    usuario_id?: number
    pessoa_id?: number
    id?: number
    nome: string
    foto_perfil?: string | null
    email: string
    data_nascimento?: string | null
    cpf?: string | null
    criado_em?: string | null
    atualizado_em?: string | null
    telefone?: string | null
    sexo?: string | null
    tipo_nivel?: string | null
    // Campos compostos retornados pela view
    criancas_dependentes?: any[] // estrutura JSON dentro da view
    conversas?: any[]
}

export interface UsuarioResponse {
    status: boolean
    status_code: number
    messagem: string
    usuario?: Usuario | null
    accessToken?: string
    refreshToken?: string
}

export interface UsuarioRequest {
    nome: string
    foto_perfil?: string | null
    email: string
    senha: string
    data_nascimento: string
    telefone?: string | null
    cpf: string
    id_sexo: number
    id_tipo_nivel: number
    // Endereço básico incluído no request de criação
    cep?: string
    logradouro?: string
    numero?: string | null
    complemento?: string | null
    bairro?: string
    cidade?: string
    estado?: string
}

// ----------------- LOGIN -----------------
export interface LoginRequest {
    email: string
    senha: string
}

export interface LoginResponse {
    status: boolean
    status_code: number
    messagem: string
    tipo?: 'usuario' | 'instituicao' | 'crianca'
    result?: Usuario | Instituicao | Crianca
    accessToken?: string
    refreshToken?: string
}

// ----------------- INSTITUIÇÃO -----------------
export interface Endereco {
    id?: number
    cep?: string
    logradouro?: string
    numero?: string | null
    complemento?: string | null
    bairro?: string
    cidade?: string
    estado?: string
    latitude?: number | null
    longitude?: number | null
}

export interface PublicacaoInstituicao {
    id: number
    descricao?: string | null
    foto_perfil?: string | null
    criado_em?: string | null
}

export interface TipoInstituicao {
    id: number
    nome: string
}

export interface AulaResumo {
    aula_id: number
    data: string
    hora_inicio: string
    hora_fim: string
    vagas_total: number
    vagas_disponiveis: number
    status_aula?: string
}

export interface AtividadeResumo {
    atividade_id: number
    titulo: string
    descricao?: string | null
    faixa_etaria_min?: number | null
    faixa_etaria_max?: number | null
    categoria?: string | null
    aulas?: AulaResumo[]
}

export interface Instituicao {
    instituicao_id?: number
    pessoa_id?: number
    id?: number
    nome: string
    email: string
    foto_perfil?: string | null
    cnpj?: string | null
    telefone?: string | null
    descricao?: string | null
    criado_em?: string | null
    atualizado_em?: string | null
    endereco?: Endereco | null
    tipos_instituicao?: TipoInstituicao[] | number[]
    publicacoes?: PublicacaoInstituicao[]
    conversas?: any[]
    atividades?: AtividadeResumo[]
    // Campos que podem vir diretamente da API
    cep?: string
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    // Flag para instituições do Google Places (não cadastradas)
    isGooglePlace?: boolean
    googlePlaceId?: string
    googleRating?: number
    googleTypes?: string[]
}

export interface InstituicaoRequest {
    nome: string
    email: string
    senha: string
    telefone?: string | null
    foto_perfil?: string | null
    cnpj?: string
    descricao?: string | null
    id_endereco?: number
}

export interface InstituicaoResponse {
    status: boolean
    status_code: number
    messagem: string
    instituicao?: Instituicao | null
}

// ----------------- CRIANÇA -----------------
export interface Crianca {
    crianca_id?: number
    pessoa_id?: number
    id?: number
    nome: string
    email?: string | null
    foto_perfil?: string | null
    data_nascimento?: string | null
    idade?: number
    criado_em?: string | null
    atualizado_em?: string | null
    sexo?: string | null
    atividades_matriculadas?: any[]
    conversas?: any[]
}

export interface CriancaRequest {
    nome: string
    email?: string
    senha?: string
    telefone?: string
    foto_perfil?: string
    cpf?: string
    data_nascimento?: string
    id_sexo?: number
}

export interface CriancaResponse {
    status: boolean
    status_code: number
    messagem: string
    crianca?: Crianca | null
}

// ----------------- Tipos auxiliares genéricos -----------------
export interface SimpleMessageResponse {
    status: boolean
    status_code: number
    messagem: string
}

// Export padrão opcional (não obrigatório)
export default {}

// ----------------- CONVERSA / MENSAGENS -----------------
export interface PessoaConversa {
    id?: number
    id_conversa: number
    id_pessoa: number
    criado_em?: string | null
}

export interface Mensagem {
    id?: number
    descricao: string
    visto?: boolean
    id_conversa: number
    id_pessoa: number
    criado_em?: string | null
    tipo?: 'TEXTO' | 'AUDIO'
    audio_url?: string | null
    audio_duracao?: number | null
}

export interface Conversa {
    id?: number
    criado_em?: string | null
}

export interface ConversaDetalhe {
    id?: number
    criado_em?: string | null
    participantes?: PessoaConversa[]
    mensagens?: Mensagem[]
}

export interface ConversaRequest {
    participantes: number[] // ids de pessoas
}

export interface MensagemRequest {
    descricao: string
    id_conversa: number
    id_pessoa: number
    tipo?: 'TEXTO' | 'AUDIO'
    audio_url?: string | null
    audio_duracao?: number | null
}

// ----------------- REQUISIÇÕES EM LOTE (AULAS) -----------------
export interface BulkAulasRequest {
    id_atividade: number
    hora_inicio: string // 'HH:MM'
    hora_fim: string // 'HH:MM'
    vagas_total: number
    datas: string[] // array de datas ISO 'YYYY-MM-DD'
}

export interface BulkAulasResponse {
    status: boolean
    status_code: number
    messagem: string
    aulas_inseridas?: AulaResumo[]
    total_inseridas?: number
    erros?: {
        total: number
        datas: string[]
    } | null
}
