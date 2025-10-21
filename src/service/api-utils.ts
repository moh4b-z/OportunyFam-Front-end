import { BASE_URL } from './config.js';

interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Função utilitária para fazer requisições à API com tratamento de erro robusto
 * @param endpoint - Endpoint da API (sem BASE_URL)
 * @param options - Opções da requisição
 * @returns Promise com os dados da resposta
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeout = 5000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Timeout: A requisição demorou mais que ${timeout}ms`);
      }
      throw error;
    }
    
    throw new Error('Erro desconhecido na requisição');
  }
}

/**
 * Função para fazer requisições com fallback para dados mock
 * @param endpoint - Endpoint da API
 * @param mockData - Dados mock para usar em caso de falha
 * @param options - Opções da requisição
 * @returns Promise com os dados da API ou mock
 */
export async function apiRequestWithFallback<T = any>(
  endpoint: string,
  mockData: T,
  options: ApiRequestOptions = {}
): Promise<T> {
  try {
    return await apiRequest<T>(endpoint, options);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`API não disponível (${endpoint}), usando dados mock:`, 
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    }
    return mockData;
  }
}

/**
 * Dados mock para notificações
 */
export const mockNotifications = [
  {
    id: 1,
    message: "Nova vaga disponível no Instituto Água Viva",
    date: "2024-10-16 09:30",
    isLate: false
  },
  {
    id: 2,
    message: "Evento beneficente na Casa da Esperança",
    date: "2024-10-16 08:45",
    isLate: false
  },
  {
    id: 3,
    message: "Oportunidade de voluntariado na Creche Sonho Dourado",
    date: "2024-10-16 07:20",
    isLate: true
  }
];
