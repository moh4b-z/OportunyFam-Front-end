// Service: busca instituições por nome, com paginação
// Método: GET
// URL base: http://localhost:8080/v1/oportunyfam/instituicoes/

export type FetchInstituicoesParams = {
  nome?: string;
  pagina?: number;
  tamanho?: number;
};

export async function fetchInstituicoes(
  { nome, pagina = 1, tamanho = 20 }: FetchInstituicoesParams = {}
): Promise<any> {
  const params = new URLSearchParams();

  // Inclui o nome mesmo que seja string vazia, caso o backend interprete isso como "sem filtro"
  if (nome !== undefined) {
    params.set("nome", nome);
  }

  params.set("pagina", String(pagina));
  params.set("tamanho", String(tamanho));

  const url = `http://localhost:8080/v1/oportunyfam/instituicoes/?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    // credenciais, modo e outras opções podem ser necessários dependendo do CORS do backend
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro ao buscar instituições (${response.status}): ${text || response.statusText}`);
  }

  // Retorna o JSON exatamente como o backend envia
  const data = await response.json();
  
  // Debug: vamos ver o que a API retorna
  console.log("Resposta da API:", data);
  
  return data;
}

// Utilitário opcional: constrói a URL final (útil para debug/teste)
export function buildInstituicoesUrl({ nome, pagina = 1, tamanho = 20 }: FetchInstituicoesParams = {}): string {
  const params = new URLSearchParams();
  if (nome !== undefined) params.set("nome", nome);
  params.set("pagina", String(pagina));
  params.set("tamanho", String(tamanho));
  return `http://localhost:8080/v1/oportunyfam/instituicoes/?${params.toString()}`;
}

