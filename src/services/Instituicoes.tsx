import { API_BASE_URL } from "./config";
import { GetInstituicoesResponse } from "../types";

export type FetchInstituicoesParams = {
  nome?: string;
  pagina?: number;
  tamanho?: number;
};

export async function InstituicoesByName(
  { nome, pagina = 1, tamanho = 20 }: FetchInstituicoesParams = {}
): Promise<GetInstituicoesResponse> {
  const params = new URLSearchParams();

  // Inclui o nome mesmo que seja string vazia, caso o backend interprete isso como "sem filtro"
  if (nome !== undefined) {
    params.set("nome", nome);
  }

  params.set("pagina", String(pagina));
  params.set("tamanho", String(tamanho));

  const url = `${API_BASE_URL}/instituicoes/?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      if (response.status >= 500) {
        throw new Error('Erro no servidor. Tente novamente mais tarde.');
      }
      throw new Error(text || response.statusText || 'Não foi possível buscar as instituições.');
    }

    // Retorna o JSON exatamente como o backend envia
    const data = await response.json();
    
    return data;
  } catch (err: any) {
    const msg = (typeof err?.message === 'string' && /failed to fetch|network|fetch/i.test(err.message))
      ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
      : (err?.message || 'Erro ao buscar instituições.')
    throw new Error(msg)
  }
}

// Utilitário opcional: constrói a URL final (útil para debug/teste)
export function buildInstituicoesUrl({ nome, pagina = 1, tamanho = 20 }: FetchInstituicoesParams = {}): string {
  const params = new URLSearchParams();
  if (nome !== undefined) params.set("nome", nome);
  params.set("pagina", String(pagina));
  params.set("tamanho", String(tamanho));
  return `${API_BASE_URL}/instituicoes/?${params.toString()}`;
}
