import { API_BASE_URL } from "./config";
import { PaginatedResponse, Instituicao } from "../types";

export type FetchInstituicoesParams = {
  nome?: string;
  pagina?: number;
  tamanho?: number;
};

export async function InstituicoesByName(
  { nome, pagina = 1, tamanho = 20 }: FetchInstituicoesParams = {}
): Promise<PaginatedResponse<Instituicao>> {
  const params = new URLSearchParams();

  // Inclui o nome mesmo que seja string vazia, caso o backend interprete isso como "sem filtro"
  if (nome !== undefined) {
    params.set("nome", nome);
  }

  params.set("pagina", String(pagina));
  params.set("tamanho", String(tamanho));

  const url = `${API_BASE_URL}/instituicoes/?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro ao buscar instituições (${response.status}): ${text || response.statusText}`);
  }

  // Retorna o JSON exatamente como o backend envia
  const data = await response.json();
  
  return data;
}

// Utilitário opcional: constrói a URL final (útil para debug/teste)
export function buildInstituicoesUrl({ nome, pagina = 1, tamanho = 20 }: FetchInstituicoesParams = {}): string {
  const params = new URLSearchParams();
  if (nome !== undefined) params.set("nome", nome);
  params.set("pagina", String(pagina));
  params.set("tamanho", String(tamanho));
  return `${API_BASE_URL}/instituicoes/?${params.toString()}`;
}
