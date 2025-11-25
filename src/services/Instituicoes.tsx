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

// Funções auxiliares para provedores externos
const geoCache = new Map<string, { lat: number; lng: number }>();
let __loadingGoogleMaps__: Promise<void> | null = null;
export async function ensureGoogleMapsLoaded(key: string): Promise<void> {
  if (typeof window === 'undefined') throw new Error('Google Maps só no cliente');
  const w = window as any;
  if (w.google && w.google.maps) return;
  if (__loadingGoogleMaps__) return __loadingGoogleMaps__;
  __loadingGoogleMaps__ = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&language=pt-BR&region=BR`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Falha ao carregar Google Maps JS'));
    document.head.appendChild(s);
  });
  await __loadingGoogleMaps__;
}

async function geocodeWithGoogle(
  addressOnly: string,
  components: { locality?: string; adminArea?: string; postalCode?: string }
): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key) {
    return null;
  }
  if (typeof window === 'undefined') return null;
  try {
    await ensureGoogleMapsLoaded(key);
  } catch {
    return null;
  }
  const w = window as any;
  if (!w.google || !w.google.maps) return null;
  return new Promise<{ lat: number; lng: number } | null>((resolve) => {
    const geocoder = new w.google.maps.Geocoder();
    const request: any = {
      address: addressOnly,
      region: 'BR',
      componentRestrictions: {
        country: 'BR',
        ...(components.locality ? { locality: components.locality } : {}),
        ...(components.adminArea ? { administrativeArea: components.adminArea } : {}),
        ...(components.postalCode ? { postalCode: components.postalCode } : {})
      }
    };
    geocoder.geocode(request, (results: any, status: string) => {
      if (status === 'OK' && results && results.length > 0) {
        const loc = results[0].geometry?.location;
        if (!loc) return resolve(null);
        const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
        const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
        resolve({ lat, lng });
      } else {
        resolve(null);
      }
    });
  });
}

async function geocodeWithMapbox(query: string, proximity?: { lat: number; lng: number }): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return null;
  }
  const params = new URLSearchParams();
  params.set('country', 'br');
  params.set('limit', '5');
  params.set('language', 'pt');
  if (proximity) params.set('proximity', `${proximity.lng},${proximity.lat}`);
  params.set('access_token', token);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data.features?.length) return null;
  const f = data.features[0];
  const [lng, lat] = f.center || [];
  if (lat === undefined || lng === undefined) return null;
  return { lat, lng };
}

// Função para geocodificar endereço usando API externa (provedor selecionável)
export async function geocodeAddress(instituicao: any): Promise<{ lat: number; lng: number } | null> {
  try {
    const logradouro = (instituicao.endereco?.logradouro || '').toString();
    const numero = (instituicao.endereco?.numero || '').toString();
    const bairro = (instituicao.endereco?.bairro || '').toString();
    const cidade = (instituicao.endereco?.cidade || '').toString();
    const estado = (instituicao.endereco?.estado || 'SP').toString();
    const cep = (instituicao.endereco?.cep || '').toString();


    const headers = {
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'User-Agent': 'OportunyFam-FrontEnd/1.0 (geocode)'
    } as Record<string, string>;

    // Construção do query canônico para provedores externos
    const enderecoCompleto = [
      `${logradouro} ${numero}`.trim(),
      bairro,
      cidade && estado ? `${cidade} - ${estado}` : cidade || estado,
      'Brasil',
      cep
    ].filter(Boolean).join(', ');

    const provider = (process.env.NEXT_PUBLIC_GEOCODER_PROVIDER || 'nominatim').toLowerCase();

    if (provider === 'google') {
      const addressOnlyBase = `${logradouro} ${numero}`.trim();
      const addressOnly = addressOnlyBase || `${logradouro}`.trim();
      const cacheKey1 = `google|${addressOnly}|${cidade}|${estado}|${cep}`;
      if (geoCache.has(cacheKey1)) {
        return geoCache.get(cacheKey1)!;
      }
      // 1ª tentativa: rua+número com restrições disponíveis
      let g = await geocodeWithGoogle(addressOnly, {
        locality: cidade || undefined,
        adminArea: estado || undefined,
        postalCode: cep || undefined,
      });
      if (g) {
        geoCache.set(cacheKey1, g);
        return g; // sucesso
      }
      // 2ª tentativa: endereço completo sem exigir componentes (usa apenas address)
      const cacheKey2 = `google|full|${enderecoCompleto}`;
      if (geoCache.has(cacheKey2)) {
        return geoCache.get(cacheKey2)!;
      }
      g = await geocodeWithGoogle(enderecoCompleto, {});
      if (g) {
        geoCache.set(cacheKey2, g);
        return g;
      }
    }

    if (provider === 'mapbox') {
      const m = await geocodeWithMapbox(enderecoCompleto);
      if (m) return m; // fallback automático para Nominatim abaixo
    }

    // Viewbox aproximado para Carapicuíba (reduz ambiguidades em SP)
    // Formato: left,top,right,bottom (lon,lat)
    const viewbox = {
      left: -46.90,
      top: -23.45,
      right: -46.77,
      bottom: -23.62,
    };

    const fetchStructured = async (streetValue: string) => {
      const params = new URLSearchParams();
      params.set('format', 'jsonv2');
      params.set('limit', '5');
      params.set('countrycodes', 'br');
      params.set('addressdetails', '1');
      params.set('street', streetValue);
      if (cidade) params.set('city', cidade);
      if (estado) params.set('state', estado);
      if (cep) params.set('postalcode', cep);
      params.set('country', 'Brasil');
      // limitar espacialmente
      params.set('viewbox', `${viewbox.left},${viewbox.top},${viewbox.right},${viewbox.bottom}`);
      params.set('bounded', '1');
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) throw new Error(`Erro na requisição estruturada: ${resp.status}`);
      return resp.json();
    };

    const fetchStructuredWithViewbox = async (streetValue: string, vb: {left:number;top:number;right:number;bottom:number}) => {
      const params = new URLSearchParams();
      params.set('format', 'jsonv2');
      params.set('limit', '5');
      params.set('countrycodes', 'br');
      params.set('addressdetails', '1');
      params.set('street', streetValue);
      if (cidade) params.set('city', cidade);
      if (estado) params.set('state', estado);
      if (cep) params.set('postalcode', cep);
      params.set('country', 'Brasil');
      params.set('viewbox', `${vb.left},${vb.top},${vb.right},${vb.bottom}`);
      params.set('bounded', '1');
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) throw new Error(`Erro na requisição estruturada (vb): ${resp.status}`);
      return resp.json();
    };

    const fetchFree = async (query: string, limit: number) => {
      const params = new URLSearchParams();
      params.set('format', 'jsonv2');
      params.set('q', query);
      params.set('limit', String(limit));
      params.set('countrycodes', 'br');
      params.set('addressdetails', '1');
      // limitar espacialmente
      params.set('viewbox', `${viewbox.left},${viewbox.top},${viewbox.right},${viewbox.bottom}`);
      params.set('bounded', '1');
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) throw new Error(`Erro na requisição livre: ${resp.status}`);
      return resp.json();
    };

    const fetchByPostcode = async (postal: string) => {
      const params = new URLSearchParams();
      params.set('format', 'jsonv2');
      params.set('limit', '1');
      params.set('countrycodes', 'br');
      params.set('addressdetails', '1');
      params.set('postalcode', postal);
      if (cidade) params.set('city', cidade);
      if (estado) params.set('state', estado);
      params.set('country', 'Brasil');
      // limitar espacialmente
      params.set('viewbox', `${viewbox.left},${viewbox.top},${viewbox.right},${viewbox.bottom}`);
      params.set('bounded', '1');
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) throw new Error(`Erro na requisição por CEP: ${resp.status}`);
      return resp.json();
    };

    const normalize = (s: string) => s
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .toLowerCase();

    const scoreResult = (r: any) => {
      let score = 0;
      const addr = r.address || {};
      if (numero && (addr.house_number === numero || (r.display_name && r.display_name.includes(` ${numero}`)))) score += 100;
      if (logradouro && (addr.road && normalize(addr.road) === normalize(logradouro))) score += 40;
      if (bairro && (addr.suburb && normalize(addr.suburb).includes(normalize(bairro)))) score += 50;
      if (bairro && (addr.neighbourhood && normalize(addr.neighbourhood).includes(normalize(bairro)))) score += 40;
      if (cep && (addr.postcode === cep || (addr.postcode && addr.postcode.startsWith(cep.slice(0,5))))) score += 30;
      if (cidade && (addr.city && normalize(addr.city) === normalize(cidade))) score += 20;
      if (estado && (addr.state && normalize(addr.state).includes(normalize(estado)))) score += 10;
      return score;
    };

    let data: any[] = [];
    try {
      const streetA = `${logradouro} ${numero}`.trim();
      const streetB = numero ? `${logradouro}, ${numero}`.trim() : streetA;
      const structuredA = await fetchStructured(streetA);
      const structuredB = numero ? await fetchStructured(streetB) : [] as any[];
      data = [
        ...((Array.isArray(structuredA) ? structuredA : []) as any[]),
        ...((Array.isArray(structuredB) ? structuredB : []) as any[])
      ];
    } catch {}

    if (!data || data.length === 0) {
      data = await fetchFree(enderecoCompleto, 5);
      if ((!data || data.length === 0) && (logradouro || cidade)) {
        const enderecoSemBairroCep = [
          `${logradouro} ${numero}`.trim(),
          cidade && estado ? `${cidade} - ${estado}` : cidade || estado,
          'Brasil'
        ].filter(Boolean).join(', ');
        data = await fetchFree(enderecoSemBairroCep, 5);
      }
      if (!data || data.length === 0) {
        return { lat: -23.5505, lng: -46.6333 };
      }
    }

    let best = data[0];
    let bestScore = -1;
    for (const r of data) {
      const sc = scoreResult(r);
      if (sc > bestScore) {
        best = r;
        bestScore = sc;
      }
    }

    // Priorização rígida por combinações exigidas
    const sameRoadAndNumberAndCep = (r: any) => {
      const addr = r.address || {};
      const dn = (r.display_name || '').toString();
      const hasRoad = logradouro && addr.road && normalize(addr.road) === normalize(logradouro);
      const hasNum = numero && (addr.house_number === numero || dn.includes(` ${numero}`) || dn.includes(`, ${numero}`));
      const hasCep = cep && addr.postcode && (addr.postcode === cep || addr.postcode.startsWith(cep.slice(0,5)));
      return !!(hasRoad && hasNum && hasCep);
    };

    const sameRoadAndNumber = (r: any) => {
      const addr = r.address || {};
      const dn = (r.display_name || '').toString();
      const hasRoad = logradouro && addr.road && normalize(addr.road) === normalize(logradouro);
      const hasNum = numero && (addr.house_number === numero || dn.includes(` ${numero}`) || dn.includes(`, ${numero}`));
      return !!(hasRoad && hasNum);
    };

    const sameCep = (r: any) => {
      const addr = r.address || {};
      return !!(cep && addr.postcode && (addr.postcode === cep || addr.postcode.startsWith(cep.slice(0,5))));
    };

    const exactCepMatch = (r: any) => {
      const addr = r.address || {};
      return !!(cep && addr.postcode && addr.postcode === cep);
    };

    const prefixCepMatch = (r: any) => {
      const addr = r.address || {};
      return !!(cep && addr.postcode && addr.postcode.startsWith(cep.slice(0,5)));
    };

    const notAdministrative = (r: any) => (r?.type !== 'administrative');
    const pri1 = data.filter(r => sameRoadAndNumberAndCep(r) && exactCepMatch(r) && notAdministrative(r));
    const pri2 = data.filter(r => exactCepMatch(r) && notAdministrative(r));
    const pri3 = data.filter(r => sameRoadAndNumber(r) && notAdministrative(r));
    const pri4 = data.filter(r => prefixCepMatch(r) && notAdministrative(r));

    if (pri1.length > 0) {
      best = pri1[0];
    } else if (pri2.length > 0) {
      best = pri2[0];
    } else if (pri3.length > 0) {
      best = pri3[0];
    } else if (cep) {
      // Fallback por CEP (centróide do CEP)
      try {
        const byPostcode = await fetchByPostcode(cep);
        if (Array.isArray(byPostcode) && byPostcode.length > 0) {
          best = byPostcode[0];
        }
      } catch (e) {
        
      }
    }

    

    return { lat: parseFloat(best.lat), lng: parseFloat(best.lon) };

  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return { lat: -23.5505, lng: -46.6333 };
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
