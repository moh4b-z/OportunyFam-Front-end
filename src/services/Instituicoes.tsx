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

  const data = await response.json();
  return data;
}

// Nova função para buscar instituição específica por nome
export async function getInstituicaoByName(nome: string): Promise<Instituicao | null> {
  try {
    const response = await InstituicoesByName({ nome, tamanho: 1 });
    if (response.status && response.data && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar instituição:', error);
    return null;
  }
}

// Função para normalizar dados da instituição
export function normalizeInstituicao(inst: any): Instituicao {
  // Se os dados de endereço estão no nível raiz, move para o objeto endereco
  if (!inst.endereco && (inst.cep || inst.logradouro)) {
    inst.endereco = {
      cep: inst.cep,
      logradouro: inst.logradouro,
      numero: inst.numero,
      complemento: inst.complemento,
      bairro: inst.bairro,
      cidade: inst.cidade,
      estado: inst.estado,
      latitude: inst.latitude,
      longitude: inst.longitude
    };
  }
  
  return inst as Instituicao;
}

// Função para geocodificar endereço usando API externa
export async function geocodeAddress(endereco: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
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
