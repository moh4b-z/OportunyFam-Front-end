import { apiRequest } from './api-utils';

export interface Conversa {
  id: number;
  id_pessoa1: number;
  id_pessoa2: number;
  data_criacao: string;
  ultima_mensagem?: string;
  nome_contato?: string;
  tag_contato?: string;
  mensagens_nao_lidas?: number;
  online?: boolean;
}

export interface Mensagem {
  id: number;
  id_conversa: number;
  id_pessoa: number;
  descricao: string;
  criado_em: string;
  visto: boolean;
  atualizado_em?: string | null;
}

export interface ApiResponse<T> {
  status: boolean;
  status_code: number;
  messagem: string;
  mensagens?: T[];
  conversa?: T;
}

export interface NovaMensagem {
  id_conversa: number;
  id_pessoa: number;
  descricao: string;
}

/**
 * Busca todas as conversas do usuário
 */
export async function buscarConversas(idPessoa?: number): Promise<Conversa[]> {
  const endpoint = idPessoa ? `/conversas?id_pessoa=${idPessoa}` : '/conversas';
  return await apiRequest<Conversa[]>(endpoint);
}

/**
 * Busca todas as conversas (sem filtro)
 */
export async function buscarTodasConversas(): Promise<Conversa[]> {
  return await apiRequest<Conversa[]>('/conversas');
}

/**
 * Busca conversa por ID
 */
export async function buscarConversaPorId(idConversa: number): Promise<Conversa> {
  return await apiRequest<Conversa>(`/conversas/${idConversa}`);
}

/**
 * Busca conversas por ID da pessoa
 */
export async function buscarConversasPorPessoa(idPessoa: number): Promise<Conversa[]> {
  return await apiRequest<Conversa[]>(`/conversas/pessoa/${idPessoa}`);
}

/**
 * Busca mensagens de uma conversa específica
 */
export async function buscarMensagens(idConversa: number): Promise<Mensagem[]> {
  return await apiRequest<Mensagem[]>(`/conversas/mensagens?id_conversa=${idConversa}`);
}

/**
 * Envia uma nova mensagem
 */
export async function enviarMensagem(mensagem: NovaMensagem): Promise<Mensagem> {
  console.log('=== ENVIANDO PARA API ===');
  console.log('URL:', '/conversas/mensagens');
  console.log('Dados:', JSON.stringify(mensagem, null, 2));
  
  try {
    const result = await apiRequest<Mensagem>('/conversas/mensagens', {
      method: 'POST',
      body: JSON.stringify(mensagem)
    });
    console.log('Resposta da API:', result);
    return result;
  } catch (error) {
    console.error('Erro detalhado na API:', error);
    throw error;
  }
}

/**
 * Atualiza mensagem (marcar como vista)
 */
export async function atualizarMensagem(visto: boolean = true): Promise<void> {
  return await apiRequest<void>('/conversas/mensagens', {
    method: 'PUT',
    body: JSON.stringify({ visto })
  });
}

/**
 * Deleta uma mensagem
 */
export async function deletarMensagem(idMensagem: number): Promise<void> {
  return await apiRequest<void>(`/conversas/mensagens/${idMensagem}`, {
    method: 'DELETE'
  });
}

/**
 * Busca mensagem por ID
 */
export async function buscarMensagemPorId(idMensagem: number): Promise<Mensagem> {
  return await apiRequest<Mensagem>(`/conversas/mensagens/${idMensagem}`);
}

/**
 * Busca mensagens por conversa
 */
export async function buscarMensagensPorConversa(idConversa: number): Promise<Mensagem[]> {
  const response = await apiRequest<ApiResponse<Mensagem>>(`/conversas/${idConversa}/mensagens`);
  return response.mensagens || [];
}

/**
 * Busca todas as mensagens
 */
export async function buscarTodasMensagens(): Promise<Mensagem[]> {
  return await apiRequest<Mensagem[]>('/conversas/mensagens');
}

/**
 * Cria uma nova conversa
 */
export async function criarConversa(idPessoa1: number, idPessoa2: number): Promise<Conversa> {
  return await apiRequest<Conversa>('/conversas', {
    method: 'POST',
    body: JSON.stringify({
      participantes: [idPessoa1, idPessoa2]
    })
  });
}

/**
 * Atualiza uma conversa existente
 */
export async function atualizarConversa(idConversa: number, idPessoa1: number, idPessoa2: number): Promise<Conversa> {
  return await apiRequest<Conversa>(`/conversas/${idConversa}`, {
    method: 'PUT',
    body: JSON.stringify({
      participantes: [idPessoa1, idPessoa2]
    })
  });
}

/**
 * Deleta uma conversa
 */
export async function deletarConversa(idConversa: number): Promise<void> {
  return await apiRequest<void>(`/conversas/${idConversa}`, {
    method: 'DELETE'
  });
}