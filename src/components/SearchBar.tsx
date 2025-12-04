"use client";
 

import { useState, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { Instituicao, TipoInstituicao, ConversaRequest, AtividadeResumo, AulaResumo } from "@/types";
import { geocodeAddress } from "@/services/Instituicoes";
import { API_BASE_URL } from "@/services/config";
import { childService } from "@/services/childService";
import StreetViewModal from "./StreetViewModal";
import "../app/styles/SearchCard.css";
import "../app/styles/SearchModal.css";

// Interface para criança dependente
interface ChildDependente {
  nome: string;
  id_pessoa: number;
  id_crianca: number;
  foto_perfil?: string | null;
  id_responsavel: number;
}

interface AtividadeDetalhada {
  atividade_id: number;
  titulo: string;
  descricao?: string | null;
  faixa_etaria_min?: number | null;
  faixa_etaria_max?: number | null;
  categoria?: string | null;
  foto?: string | null;
  gratuita?: number | boolean | null;
  ativa?: number | boolean | null;
  preco?: number | null;
  aulas?: AulaResumo[];
}

interface SearchBarProps {
  onInstitutionSelect: (institution: Instituicao) => void;
  onStartConversation?: (institution: Instituicao) => void;
  onRefreshConversations?: () => Promise<void> | void;
  onInstitutionsUpdate?: (institutions: Instituicao[]) => void;
  highlightedInstitution?: Instituicao | null;
  onCloseProfile?: () => void;
  onOpenChildRegistration?: () => void;
  // Dados pré-carregados da home (evita chamadas duplicadas)
  preloadedChildren?: ChildDependente[];
}

interface SearchResultOptionProps {
  institution: Instituicao;
  onClick: () => void;
  onStreetViewClick: (e: ReactMouseEvent) => void;
  isSelected: boolean;
}

const SearchResultOption = ({ institution, onClick, onStreetViewClick, isSelected }: SearchResultOptionProps) => {
  const [imgError, setImgError] = useState(false);
  // Retorna o caminho da imagem de perfil ou o ícone padrão
  const getProfileImage = () => {
    // Se houver uma foto e ela não tiver falhado, mostra a imagem
    if (institution.foto_perfil && !imgError) {
      return (
        <img
          src={institution.foto_perfil}
          alt={institution.nome}
          className="card-logo-img"
          onError={() => setImgError(true)}
        />
      );
    }

    // Caso não tenha foto ou tenha falhado, mostra o ícone padrão
    return (
      <div className="default-institution-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        </svg>
      </div>
    );
  };

  // Obtém as categorias da instituição a partir de tipos_instituicao
  const getCategories = () => {
    if (!institution.tipos_instituicao || institution.tipos_instituicao.length === 0) {
      return 'Organização';
    }
    
    // Verifica se é um array de números (IDs) ou de objetos TipoInstituicao
    if (typeof institution.tipos_instituicao[0] === 'number') {
      // Se for array de números, retorna um texto genérico
      return 'Organização';
    } else {
      // Se for array de TipoInstituicao, mapeia os nomes
      const tipos = institution.tipos_instituicao as TipoInstituicao[];
      return tipos.map(tipo => tipo.nome).join(' • ');
    }
  };

  return (
    <div
      className={`search-result-card ${isSelected ? "selected-card" : ""}`}
      onMouseDown={(e) => e.preventDefault()} /* evita perder foco do input */
      onClick={onClick}
    >
      <div className="card-logo-block">
        {getProfileImage()}
      </div>
      <div className="card-main-content">
        <div className="card-header">
          <span className="card-name-full">{institution.nome}</span>
          <span className="card-category">{getCategories()}</span>
        </div>
        <div className="card-location-row">
          <span className="card-location"> {institution.endereco?.bairro}, São Paulo</span>
          <button
            className="street-view-btn"
            onClick={onStreetViewClick}
            onMouseDown={(e) => e.preventDefault()}
            title="Ver no Street View"
            aria-label="Abrir Street View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
              <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
              <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/>
              <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
            </svg>
            Street View
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SearchBar({ onInstitutionSelect, onStartConversation, onRefreshConversations, onInstitutionsUpdate, highlightedInstitution, onCloseProfile, onOpenChildRegistration, preloadedChildren }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const [institutions, setInstitutions] = useState<Instituicao[]>([]);
  const [allInstitutions, setAllInstitutions] = useState<Instituicao[]>([]);
  const [hasLoadedAll, setHasLoadedAll] = useState<boolean>(false);
  const pageSize = 20;
  const [page, setPage] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'local' | null>(null);
  const [selecting, setSelecting] = useState<boolean>(false);
  const [detailInstitution, setDetailInstitution] = useState<Instituicao | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');
  const [profileTab, setProfileTab] = useState<'publicacoes' | 'atividades'>('publicacoes');
  const [profileActivities, setProfileActivities] = useState<AtividadeDetalhada[] | null>(null);
  const [profileActivitiesLoading, setProfileActivitiesLoading] = useState<boolean>(false);
  const [profileActivitiesError, setProfileActivitiesError] = useState<string | null>(null);
  const [profileImgError, setProfileImgError] = useState<boolean>(false);
  const [atividadeImgErrors, setAtividadeImgErrors] = useState<Record<number, boolean>>({});
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [selectedPublication, setSelectedPublication] = useState<any | null>(null);
  const [publicationOrigin, setPublicationOrigin] = useState<{ x: string; y: string }>({ x: '50%', y: '50%' });
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  // Estados para popup de inscrição de criança em atividade
  const [showEnrollPopup, setShowEnrollPopup] = useState<boolean>(false);
  const [enrollStep, setEnrollStep] = useState<'select' | 'confirm' | 'success' | 'error'>('select');
  const [enrollActivityId, setEnrollActivityId] = useState<number | null>(null);
  const [enrollActivityName, setEnrollActivityName] = useState<string>('');
  const [userChildren, setUserChildren] = useState<ChildDependente[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildDependente | null>(null);
  const [enrollLoading, setEnrollLoading] = useState<boolean>(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    // Reset image error quando trocar de instituição
    setProfileImgError(false);
    setAtividadeImgErrors({});
  }, [detailInstitution?.foto_perfil, detailInstitution?.instituicao_id, detailInstitution?.id]);

  useEffect(() => {
    // Fecha o popover de descrição ao trocar de instituição
    setShowDescription(false);
  }, [detailInstitution?.instituicao_id, detailInstitution?.id]);

  useEffect(() => {
    // Carrega detalhes das atividades da instituição selecionada
    setProfileActivities(null);
    setProfileActivitiesError(null);
    setProfileActivitiesLoading(false);

    if (!detailInstitution || !Array.isArray(detailInstitution.atividades) || detailInstitution.atividades.length === 0) {
      setProfileActivities([]);
      return;
    }

    let cancelled = false;

    const fetchActivitiesDetails = async () => {
      setProfileActivitiesLoading(true);
      try {
        const baseAtividades = (detailInstitution.atividades || []) as AtividadeResumo[];
        const uniqueIds = Array.from(
          new Set(
            baseAtividades
              .map((a) => a.atividade_id)
              .filter((id) => typeof id === 'number'),
          ),
        );

        if (uniqueIds.length === 0) {
          if (!cancelled) setProfileActivities([]);
          return;
        }

        const results = await Promise.all(
          uniqueIds.map(async (atividadeId) => {
            try {
              const response = await fetch(`${API_BASE_URL}/atividades/${atividadeId}`);
              if (!response.ok) {
                console.error('Erro ao carregar atividade', atividadeId, response.status, response.statusText);
                return null;
              }
              const json = await response.json();
              const atividade = json?.atividade ?? json;
              if (!atividade) return null;

              const aulas: AulaResumo[] = Array.isArray(atividade.aulas)
                ? (atividade.aulas as any[]).map((a: any) => ({
                  aula_id: a.aula_id,
                  data: a.data,
                  hora_inicio: a.hora_inicio,
                  hora_fim: a.hora_fim,
                  vagas_total: a.vagas_total,
                  vagas_disponiveis: a.vagas_disponiveis,
                  status_aula: a.status_aula,
                }))
                : [];

              const mapped: AtividadeDetalhada = {
                atividade_id: atividade.atividade_id,
                titulo: atividade.titulo,
                descricao: atividade.descricao ?? null,
                faixa_etaria_min: atividade.faixa_etaria_min ?? null,
                faixa_etaria_max: atividade.faixa_etaria_max ?? null,
                categoria: atividade.categoria ?? null,
                foto: atividade.foto ?? null,
                gratuita: atividade.gratuita ?? null,
                // Backend retorna o status da atividade no campo `ativo` (0/1),
                // mas mantemos compatibilidade caso venha também como `ativa`.
                ativa:
                  typeof atividade.ativo === 'number'
                    ? atividade.ativo
                    : typeof atividade.ativo === 'boolean'
                    ? atividade.ativo
                    : typeof atividade.ativa === 'number'
                    ? atividade.ativa
                    : typeof atividade.ativa === 'boolean'
                    ? atividade.ativa
                    : null,
                preco:
                  typeof atividade.preco === 'number'
                    ? atividade.preco
                    : atividade.preco
                    ? Number(atividade.preco)
                    : null,
                aulas,
              };

              return mapped;
            } catch (err) {
              console.error('Erro inesperado ao carregar atividade', atividadeId, err);
              return null;
            }
          }),
        );

        if (!cancelled) {
          setProfileActivities(results.filter(Boolean) as AtividadeDetalhada[]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Erro ao carregar atividades da instituição', err);
          setProfileActivitiesError('Não foi possível carregar as atividades.');
          setProfileActivities([]);
        }
      } finally {
        if (!cancelled) {
          setProfileActivitiesLoading(false);
        }
      }
    };

    fetchActivitiesDetails();

    return () => {
      cancelled = true;
    };
  }, [detailInstitution?.instituicao_id, detailInstitution?.id]);

  useEffect(() => {
    if (!showDescription) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (descriptionRef.current && !descriptionRef.current.contains(event.target as Node)) {
        setShowDescription(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDescription]);

  // Estados para Street View
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [streetViewCoords, setStreetViewCoords] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Estado do tipo de filtro da busca (nome ou endereço)
  const [locationFilter, setLocationFilter] = useState<string>('nome');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const isDropdownOpen = searchFocused || viewMode === 'profile'; // mantém aberto quando em perfil
  const isFullDropdownOpen = isDropdownOpen && hasLoadedAll;

  // Quando uma instituição é destacada externamente (ex.: clique no pin do mapa),
  // abre diretamente o painel de perfil dessa instituição.
  useEffect(() => {
    if (!highlightedInstitution) return;

    const id = highlightedInstitution.instituicao_id ?? highlightedInstitution.id;
    if (!id) return;

    const currentId = detailInstitution?.instituicao_id ?? detailInstitution?.id;
    if (currentId === id && viewMode === 'profile') return;

    const matchInList = institutions.find((inst) => (inst.instituicao_id ?? inst.id) === id);
    const matchInAll = allInstitutions.find((inst) => (inst.instituicao_id ?? inst.id) === id);
    const target = matchInList || matchInAll || highlightedInstitution;

    setSelectedInstitution(id);
    setDetailInstitution(target);
    setViewMode('profile');
    setProfileTab('publicacoes');
    setSearchFocused(false);
  }, [highlightedInstitution, institutions, allInstitutions, detailInstitution, viewMode]);

  // Carrega TODAS as instituições uma única vez, somente quando o usuário focar no input
  const loadAllInstitutionsOnce = async () => {
    if (hasLoadedAll || loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/instituicoes/?tamanho=500`);

      if (!response.ok) {
        throw new Error('Erro ao carregar instituições');
      }
      const data = await response.json();
      if (data.status && data.instituicoes) {
        const formattedInstitutions = data.instituicoes.map((inst: any) => ({
          id: inst.instituicao_id || inst.id,
          instituicao_id: inst.instituicao_id || inst.id,
          nome: inst.nome,
          email: inst.email,
          foto_perfil: inst.foto_perfil || null,
          cnpj: inst.cnpj || '',
          telefone: inst.telefone || '',
          descricao: inst.descricao || '',
          endereco: {
            id: inst.endereco?.id || 0,
            cep: inst.endereco?.cep || '',
            logradouro: inst.endereco?.logradouro || '',
            numero: inst.endereco?.numero || '',
            complemento: inst.endereco?.complemento || '',
            bairro: inst.endereco?.bairro || '',
            cidade: inst.endereco?.cidade || '',
            estado: inst.endereco?.estado || '',
            latitude: inst.endereco?.latitude || 0,
            longitude: inst.endereco?.longitude || 0
          },
          tipos_instituicao: inst.tipos_instituicao || [],
          publicacoes: inst.publicacoes || [],
          conversas: inst.conversas || [],
          atividades: inst.atividades || []
        }));
        setAllInstitutions(formattedInstitutions);
        setInstitutions(formattedInstitutions);
        if (onInstitutionsUpdate) {
          try { onInstitutionsUpdate(formattedInstitutions); } catch {}
        }
        setHasLoadedAll(true);
        setDataSource('api');
        setInitialLoadDone(true);
      }
    } catch (err) {
      console.error('Erro ao carregar instituições:', err);
      setError('Não foi possível carregar as instituições. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega as instituições quando o componente é montado
  useEffect(() => {
    if (!initialLoadDone && !loading) {
      loadAllInstitutionsOnce();
    }
  }, [initialLoadDone, loading]);

  // Carrega as instituições quando o usuário foca no input (como fallback)
  const handleFocus = () => {
    setSearchFocused(true);
    if (!initialLoadDone && !loading) {
      loadAllInstitutionsOnce();
    }
  };

  // Busca no front baseada na lista carregada uma vez, usando nome ou endereço conforme o filtro
  useEffect(() => {
    if (!hasLoadedAll) return;
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (!term) {
      setInstitutions(allInstitutions);
      setPage(1);
      return;
    }
    const filtered = allInstitutions.filter(inst => {
      const nome = (inst.nome || '').toLowerCase();
      const bairro = (inst.endereco?.bairro || '').toLowerCase();
      const cidade = (inst.endereco?.cidade || '').toLowerCase();
      const estado = (inst.endereco?.estado || '').toLowerCase();
      const enderecoTexto = `${bairro} ${cidade} ${estado}`.trim();

      if (locationFilter === 'endereco') {
        return enderecoTexto.includes(term);
      }
      // padrão: filtra por nome
      return nome.includes(term);
    });
    setInstitutions(filtered);
    setPage(1);
  }, [debouncedSearchTerm, hasLoadedAll, allInstitutions, locationFilter]);

  // Emite a lista atual de instituições (filtrada ou completa) para o componente pai (Mapa)
  useEffect(() => {
    if (onInstitutionsUpdate) {
      try { onInstitutionsUpdate(institutions); } catch {}
    }
  }, [institutions, onInstitutionsUpdate]);

  // Reseta para a primeira página quando a fonte de dados mudar (ex.: filtros externos)
  useEffect(() => {
    setPage(1);
  }, [hasLoadedAll]);

  const totalPages = Math.max(1, Math.ceil(institutions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedInstitutions = institutions.slice(startIndex, endIndex);

  // Atalhos de teclado: ← / → para navegar páginas quando o dropdown estiver aberto
  useEffect(() => {
    if (!isDropdownOpen || selecting) return;
    const onKey = (e: KeyboardEvent) => {
      // Captura as setas esquerda/direita mesmo se o input estiver focado
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && 
          (e.target === inputRef.current || e.target === document.body)) {
        if (e.key === 'ArrowLeft' && currentPage > 1) {
          e.preventDefault();
          setPage((p) => Math.max(1, p - 1));
        } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
          e.preventDefault();
          setPage((p) => Math.min(totalPages, p + 1));
        }
      }
    };
    window.addEventListener('keydown', onKey, true); // capture phase
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isDropdownOpen, currentPage, totalPages, selecting]);

  const handleInstitutionClick = async (institution: Instituicao) => {
    const institutionId = institution.instituicao_id || institution.id;
    if (institutionId !== undefined) {
      setSelectedInstitution(institutionId);
      setDetailInstitution(institution);
      setViewMode('profile');
      setProfileTab('publicacoes');
      try {
        inputRef.current?.blur();
      } catch {}
      setSearchFocused(false);
    } else {
      console.error('ID da instituição não encontrado');
      return;
    }
    // Mostra overlay de carregamento e bloqueia interações
    setSelecting(true);
    const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const minDisplayMs = 600;
    try {
      if (onInstitutionSelect) {
        const result: any = (onInstitutionSelect as any)(institution);
        await Promise.resolve(result);
      }
    } catch (e) {
      console.error('Erro ao selecionar instituição:', e);
    } finally {
      const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const elapsed = end - start;
      if (elapsed < minDisplayMs) {
        await new Promise(res => setTimeout(res, minDisplayMs - elapsed));
      }
      setSelecting(false);
    }
  };

  const handleStreetViewClick = async (institution: Instituicao, e: ReactMouseEvent) => {
    e.stopPropagation(); // Evita acionar o onClick do card
    
    // Tenta obter as coordenadas da instituição
    let lat = institution.endereco?.latitude;
    let lng = institution.endereco?.longitude;
    
    // Se não tiver coordenadas, tenta geocodificar
    if (!lat || !lng) {
      const coords = await geocodeAddress(institution);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    }
    
    if (lat && lng) {
      setStreetViewCoords({ lat, lng, name: institution.nome });
      setStreetViewOpen(true);
    } else {
      console.error('Não foi possível obter coordenadas para o Street View');
    }
  };

  const handleStartConversation = async () => {
    try {
      if (!detailInstitution) {
        console.error('Nenhuma instituição selecionada para iniciar conversa');
        return;
      }

      const instituicaoId = detailInstitution.instituicao_id || detailInstitution.id;
      if (!instituicaoId) {
        console.error('Instituição sem id para buscar pessoa_id');
        return;
      }

      // Busca pessoa_id da instituição
      const instResponse = await fetch(`${API_BASE_URL}/instituicoes/${instituicaoId}`);
      if (!instResponse.ok) {
        console.error('Falha ao buscar instituição para conversa:', instResponse.status, instResponse.statusText);
        return;
      }
      const instData: any = await instResponse.json();
      const instPessoaIdRaw = instData?.instituicao?.pessoa_id ?? instData?.pessoa_id;

      // Busca pessoa_id do usuário logado a partir do id salvo no localStorage
      const storedTipo = typeof window !== 'undefined' ? localStorage.getItem('user-tipo') : null;
      let userIdFromStorage: string | null = null;
      if (storedTipo === 'usuario') {
        userIdFromStorage = localStorage.getItem('usuario_id');
      } else if (storedTipo === 'instituicao') {
        userIdFromStorage = localStorage.getItem('instituicao_id');
      } else if (storedTipo === 'crianca') {
        userIdFromStorage = localStorage.getItem('crianca_id');
      }

      if (!userIdFromStorage || !storedTipo) {
        console.error('Não foi possível obter o id do usuário logado a partir do localStorage');
        return;
      }

      // Define o endpoint correto baseado no tipo
      const endpoint = storedTipo === 'instituicao' ? 'instituicoes' : storedTipo === 'crianca' ? 'criancas' : 'usuarios';
      const userResponse = await fetch(`${API_BASE_URL}/${endpoint}/${userIdFromStorage}`);
      if (!userResponse.ok) {
        console.error('Falha ao buscar usuário para conversa:', userResponse.status, userResponse.statusText);
        return;
      }
      const userData: any = await userResponse.json();
      const userPessoaIdRaw = userData?.pessoa_id ?? userData?.usuario?.pessoa_id;

      const instPessoaId = Number(instPessoaIdRaw);
      const userPessoaId = Number(userPessoaIdRaw);

      if (Number.isNaN(instPessoaId) || Number.isNaN(userPessoaId)) {
        console.error('pessoa_id inválido para instituição ou usuário', {
          instPessoaIdRaw,
          userPessoaIdRaw
        });
        return;
      }

      const payload: ConversaRequest = {
        participantes: [userPessoaId, instPessoaId]
      };

      // Envia criação da conversa para o backend
      const response = await fetch(`${API_BASE_URL}/conversas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let responseBody: any = null;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = null;
      }

      console.log('Resposta do POST /conversas:', {
        httpStatus: response.status,
        ok: response.ok,
        body: responseBody,
      });

      if (!response.ok) {
        console.error('Falha ao criar conversa:', response.status, response.statusText);
        return;
      }

      // Neste ponto, a API já decidiu se criou uma nova conversa (201)
      // ou se reutilizou uma existente (200). Usamos isso apenas para
      // logging e abrimos a UI normalmente com a lista atualizada.

      // Se a criação/reutilização funcionou, atualiza a lista de conversas do usuário e abre a UI de conversas
      if (onRefreshConversations) {
        try {
          await onRefreshConversations();
        } catch (err) {
          console.error('Erro ao atualizar conversas do usuário após criar conversa:', err);
        }
      }

      if (onStartConversation && detailInstitution) {
        onStartConversation(detailInstitution);
      }
    } catch (error) {
      console.error('Erro ao preparar criação de conversa:', error);
    }
  };

  const handleOpenPublication = (pub: any, target: HTMLElement) => {
    setSelectedPublication(pub);

    try {
      const rect = target.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const xPercent = Math.min(100, Math.max(0, (centerX / viewportWidth) * 100));
      const yPercent = Math.min(100, Math.max(0, (centerY / viewportHeight) * 100));

      setPublicationOrigin({ x: `${xPercent}%`, y: `${yPercent}%` });
    } catch {
      setPublicationOrigin({ x: '50%', y: '50%' });
    }
  };

  const handleClosePublication = () => {
    setSelectedPublication(null);
  };

  // Funções para inscrição de criança em atividade
  const handleOpenEnrollPopup = async (atividadeId: number, atividadeNome: string) => {
    setEnrollActivityId(atividadeId);
    setEnrollActivityName(atividadeNome);
    setEnrollStep('select');
    setSelectedChild(null);
    setEnrollError(null);
    setShowEnrollPopup(true);

    // Usa dados pré-carregados da home se disponíveis (evita chamada de API)
    if (preloadedChildren && preloadedChildren.length > 0) {
      setUserChildren(preloadedChildren);
      setEnrollLoading(false);
    } else {
      // Fallback: busca da API apenas se não tiver dados pré-carregados
      setEnrollLoading(true);
      try {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('usuario_id') : null;
        if (userId) {
          const children = await childService.getChildrenByUserId(Number(userId));
          setUserChildren(children || []);
        }
      } catch (err) {
        setUserChildren([]);
      } finally {
        setEnrollLoading(false);
      }
    }
  };

  const handleSelectChild = (child: ChildDependente) => {
    setSelectedChild(child);
    setEnrollStep('confirm');
  };

  const handleConfirmEnroll = async () => {
    // Proteção contra duplo clique - se já está carregando, não envia novamente
    if (enrollLoading) return;
    if (!selectedChild || !enrollActivityId) return;

    setEnrollLoading(true);
    setEnrollError(null);

    try {
      const payload = {
        id_responsavel: selectedChild.id_responsavel,
        id_atividade: enrollActivityId,
        id_crianca: selectedChild.id_crianca
      };

      const response = await fetch(`${API_BASE_URL}/inscricoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 409) {
        setEnrollError('Esta criança já está inscrita nesta atividade.');
        setEnrollStep('error');
        return;
      }

      if (!response.ok) {
        setEnrollError('Não foi possível realizar a inscrição. Tente novamente.');
        setEnrollStep('error');
        return;
      }

      setEnrollStep('success');
    } catch (err) {
      setEnrollError('Erro de conexão. Verifique sua internet e tente novamente.');
      setEnrollStep('error');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleCloseEnrollPopup = () => {
    setShowEnrollPopup(false);
    setEnrollStep('select');
    setSelectedChild(null);
    setEnrollError(null);
  };

  // Removido CategoryChips

  const locationOptions = [
    { value: 'nome', label: 'Nome', icon: 'user' },
    { value: 'endereco', label: 'Endereço', icon: 'pin' }
  ];

  const getLocationIcon = (iconType: string) => {
    const icons = {
      user: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-3.3137 3.134-6 7-6h2c3.866 0 7 2.6863 7 6" />
        </svg>
      ),
      pin: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    };
    return icons[iconType as keyof typeof icons] || icons.user;
  };

  const handleLocationChange = (location: string) => {
    setLocationFilter(location);
    setShowLocationDropdown(false);
  };

  // Função para normalizar os dados da API para o formato esperado pelo componente
  const normalizeInstituicao = (instituicao: any): Instituicao => {
    return {
      id: instituicao.instituicao_id || instituicao.id,
      instituicao_id: instituicao.instituicao_id || instituicao.id,
      nome: instituicao.nome,
      email: instituicao.email,
      cnpj: instituicao.cnpj,
      telefone: instituicao.telefone,
      descricao: instituicao.descricao || '',
      foto_perfil: instituicao.foto_perfil || null,
      endereco: {
        id: instituicao.endereco?.id || 0,
        cep: instituicao.endereco?.cep || '',
        logradouro: instituicao.endereco?.logradouro || '',
        numero: instituicao.endereco?.numero || '',
        complemento: instituicao.endereco?.complemento || '',
        bairro: instituicao.endereco?.bairro || '',
        cidade: instituicao.endereco?.cidade || '',
        estado: instituicao.endereco?.estado || '',
        latitude: instituicao.endereco?.latitude || 0,
        longitude: instituicao.endereco?.longitude || 0
      },
      tipos_instituicao: instituicao.tipos_instituicao || [],
      publicacoes: instituicao.publicacoes || [],
      conversas: instituicao.conversas || [],
      atividades: instituicao.atividades || []
    };
  };

  // Removido fetchInstitutionsByCategory

  return (
    <div className={`search-and-chips ${searchFocused ? "search-and-chips-active" : ""}`}>
      <div className={`search-box ${searchFocused ? "search-box-active" : ""}`}>
        <svg 
          className="search-icon" 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Pesquise aqui"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onBlur={(e) => {
            const next = e.relatedTarget as HTMLElement | null;
            // Se o foco for para o botão de filtro ou para o dropdown de opções, mantém aberto
            if (next && next.closest('.location-filter')) return;
            setTimeout(() => setSearchFocused(false), 200);
          }}
          disabled={viewMode === 'profile'}
        />
        
        {/* Filtro de Localização */}
        <div className="location-filter">
          <button 
            className="location-filter-btn"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            {getLocationIcon(locationFilter === 'endereco' ? 'pin' : 'user')}
            <span>{locationOptions.find(opt => opt.value === locationFilter)?.label}</span>
            <svg className={`dropdown-arrow ${showLocationDropdown ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          
          {showLocationDropdown && (
            <div className="location-dropdown">
              {locationOptions.map(option => (
                <button
                  key={option.value}
                  className={`location-option ${locationFilter === option.value ? 'active' : ''}`}
                  onClick={() => handleLocationChange(option.value)}
                >
                  <span className="option-icon">{getLocationIcon(option.icon)}</span>
                  <span className="option-label">{option.label}</span>
                  {locationFilter === option.value && (
                    <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pré-carregamento: caixinha menor com mensagem enquanto carrega todas as instituições */}
        {isDropdownOpen && !hasLoadedAll && loading && (
          <div className="search-results-dropdown preload">
            <div className="search-results-loading">
              <div className="search-results-loading-dots" aria-hidden="true">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </div>
              <span className="search-results-loading-text">Carregando instituições...</span>
            </div>
          </div>
        )}

        {/* Dropdown completo com animação */}
        {hasLoadedAll && (
          <div className={`search-results-dropdown ${isFullDropdownOpen ? 'open' : 'closing'}${(selecting || loading) ? ' loading' : ''}`}>
            <div className={`dropdown-slider ${viewMode === 'profile' ? 'to-profile' : 'to-list'}`}>
              <div className="dropdown-track">
                <div className="dropdown-panel list-panel">
                  <div className="search-results-list">
                    {error && <div className="dropdown-message error">{error}</div>}
                    {!loading && !error && pagedInstitutions.map(inst => (
                      <SearchResultOption
                        key={`${inst.instituicao_id ?? inst.id}-${inst.endereco?.id ?? inst.endereco?.cep ?? ''}-${inst.nome}`}
                        institution={inst}
                        isSelected={selectedInstitution === (inst.instituicao_id || inst.id)}
                        onClick={() => { if (!selecting && !loading) handleInstitutionClick(inst); }}
                        onStreetViewClick={(e) => handleStreetViewClick(inst, e)}
                      />
                    ))}
                  </div>
                </div>

                <div className="dropdown-panel profile-panel">
                  {detailInstitution && (
                    <>
                      <div className="profile-header">
                        <button
                          className="profile-back-btn"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { 
                            setViewMode('list'); 
                            setSearchFocused(true);
                            try { 
                              // focus após o repaint para garantir que o input esteja ativo
                              setTimeout(() => inputRef.current?.focus(), 0);
                            } catch {}

                            if (onCloseProfile) {
                              try { onCloseProfile(); } catch {}
                            }
                          }}

                          aria-label="Voltar para a lista"
                          title="Voltar"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <span className="profile-title">{detailInstitution.nome}</span>
                        <div
                          className="streetview-floating icon-only streetview-inline"
                          role="button"
                          tabIndex={0}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => handleStreetViewClick(detailInstitution, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              // @ts-ignore: reutiliza o mesmo handler também para eventos de teclado
                              handleStreetViewClick(detailInstitution, e);
                            }
                          }}
                          aria-label="Abrir Street View"
                          title="Ver no Street View"
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <circle cx="12" cy="6" r="3"></circle>
                            <path d="M12 10c-2.761 0-5 1.343-5 3v3a2 2 0 002 2h6a2 2 0 002-2v-3c0-1.657-2.239-3-5-3z"></path>
                            <ellipse cx="12" cy="20" rx="6.5" ry="2.5" opacity="0.3"></ellipse>
                          </svg>
                        </div>
                      </div>
                      <div className="profile-content">
                        <div className="profile-actions-row">
                          <div ref={descriptionRef} className={`profile-description-container ${showDescription ? 'description-open' : ''}`}>
                            <button
                              type="button"
                              className="profile-description-trigger"
                              onClick={() => setShowDescription((prev) => !prev)}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                              >
                                <path
                                  d="M7 3h8l4 4v14H7z"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M15 3v4h4"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M10 13h5M10 16h3"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="profile-description-label">Sobre a instituição</span>
                            </button>
                            <div className={`profile-description-popover ${showDescription ? 'open' : ''}`}>
                              <div className="profile-description-box">
                                {(() => {
                                  const descricao = detailInstitution.descricao || '';
                                  return descricao.trim() ? descricao : 'Sem descrição para esta instituição.';
                                })()}
                              </div>
                            </div>
                          </div>

                          <div className="profile-description-container profile-contact-container">
                            <button
                              type="button"
                              className="profile-description-trigger profile-contact-trigger"
                              onClick={handleStartConversation}
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                              >
                                <path
                                  d="M5 12h14M12 5v14"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="profile-description-label">Entrar em contato</span>
                            </button>
                          </div>
                        </div>
                        <div className="profile-card">
                          <div className="profile-center">
                            <div className="profile-logo-block-large card-logo-block">
                              {detailInstitution.foto_perfil && !profileImgError ? (
                                <img 
                                  src={detailInstitution.foto_perfil}
                                  alt={detailInstitution.nome}
                                  className="card-logo-img" 
                                  onError={() => setProfileImgError(true)}
                                />
                              ) : (
                                <div className="default-institution-icon">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="profile-name profile-name-center">{detailInstitution.nome}</div>
                            <div className="profile-email">{detailInstitution.email}</div>
                            {(() => {
                              const end = detailInstitution.endereco;
                              const logradouro = end?.logradouro || '';
                              const numero = end?.numero;
                              const addr = logradouro ? `${logradouro}${numero ? ", " + numero : ''}` : '';
                              return addr ? (
                                <div className="profile-address" title={addr}>
                                  <svg className="address-pin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                  </svg>
                                  <span className="address-text">{addr}</span>
                                </div>
                              ) : null;
                            })()}
                            {(() => {
                              const end = detailInstitution.endereco;
                              const bairro = end?.bairro || '';
                              const cidade = end?.cidade || '';
                              const estado = end?.estado || '';
                              const parts: string[] = [];
                              if (bairro) parts.push(bairro);
                              const cityState = [cidade, estado].filter(Boolean).join(', ');
                              const line = parts.length ? `${parts.join(' ')} - ${cityState}` : cityState;
                              return line ? (
                                <div className="profile-cityline">{line}</div>
                              ) : null;
                            })()}
                            <div className="profile-publicacoes-section">
                              <hr className="profile-publicacoes-divider" />
                              <div className="profile-publicacoes-header">
                                <div className="profile-tabs-switch">
                                  <button
                                    type="button"
                                    className={`profile-tab-btn ${profileTab === 'publicacoes' ? 'active' : ''}`}
                                    onClick={() => setProfileTab('publicacoes')}
                                  >
                                    Publicações
                                  </button>
                                  <button
                                    type="button"
                                    className={`profile-tab-btn ${profileTab === 'atividades' ? 'active' : ''}`}
                                    onClick={() => setProfileTab('atividades')}
                                  >
                                    Atividades
                                  </button>
                                </div>
                              </div>
                              <div className={`profile-tabs-slider ${profileTab === 'atividades' ? 'to-atividades' : 'to-publicacoes'}`}>
                                <div className="profile-tabs-track">
                                  <div className="profile-tab-panel profile-tab-panel-publicacoes">
                                    {Array.isArray(detailInstitution.publicacoes) && detailInstitution.publicacoes.length > 0 ? (
                                      <div className="profile-publicacoes-carousel">
                                        {(detailInstitution.publicacoes as any[]).map((pub, index) => (
                                          <button
                                            key={pub.id ?? index}
                                            type="button"
                                            className="profile-publicacao-item"
                                            onClick={(e) => handleOpenPublication(pub, e.currentTarget)}
                                          >
                                            {pub.imagem && (
                                              <>
                                                <img
                                                  src={pub.imagem}
                                                  alt={pub.descricao || `Publicação ${index + 1}`}
                                                  className="profile-publicacao-image"
                                                />
                                                <div className="profile-publicacao-hover-overlay">
                                                  <span>Ver publicação</span>
                                                </div>
                                              </>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="profile-publicacoes-empty">
                                        <div className="profile-publicacoes-empty-icon">
                                          <svg
                                            width="26"
                                            height="26"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                          >
                                            <rect x="3" y="5" width="18" height="14" rx="3" ry="3" />
                                            <circle cx="12" cy="12" r="3.2" />
                                            <path d="M8 5l1.5-2h5L16 5" />
                                          </svg>
                                        </div>
                                        <div className="profile-publicacoes-empty-text">
                                          Ainda não há nenhuma publicacao
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="profile-tab-panel profile-tab-panel-atividades">
                                    {profileActivitiesLoading ? (
                                      <div className="profile-publicacoes-empty">
                                        <div className="profile-publicacoes-empty-text">
                                          Carregando atividades...
                                        </div>
                                      </div>
                                    ) : profileActivities && profileActivities.length > 0 ? (
                                      <div className="profile-atividades-list">
                                        {profileActivities.map((atividade) => {
                                          const isFree =
                                            atividade.gratuita === 1 ||
                                            atividade.gratuita === true ||
                                            (atividade.preco !== undefined &&
                                              atividade.preco !== null &&
                                              Number(atividade.preco) === 0);

                                          const precoNumber =
                                            atividade.preco !== undefined && atividade.preco !== null
                                              ? Number(atividade.preco)
                                              : 0;

                                          const priceLabel = isFree
                                            ? 'Gratuita'
                                            : `R$ ${precoNumber.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}`;

                                          const aulasCount = Array.isArray(atividade.aulas)
                                            ? atividade.aulas.length
                                            : 0;
                                          const aulasLabel = aulasCount === 1 ? '1 aula' : `${aulasCount} aulas`;

                                          const idadeMin = atividade.faixa_etaria_min;
                                          const idadeMax = atividade.faixa_etaria_max;

                                          let faixaEtariaLabel: string;
                                          if (idadeMin != null && idadeMax != null) {
                                            faixaEtariaLabel = `${idadeMin} a ${idadeMax} anos`;
                                          } else if (idadeMin != null) {
                                            faixaEtariaLabel = `A partir de ${idadeMin} anos`;
                                          } else if (idadeMax != null) {
                                            faixaEtariaLabel = `Até ${idadeMax} anos`;
                                          } else {
                                            faixaEtariaLabel = 'Não informada';
                                          }

                                          const isAtiva =
                                            atividade.ativa === 1 ||
                                            atividade.ativa === true;
                                          const statusLabel = isAtiva ? 'Disponível' : 'Indisponível';

                                          return (
                                            <div className="profile-atividade-card" key={atividade.atividade_id}>
                                              <div className="profile-atividade-main">
                                                <div className="profile-atividade-info">
                                                  <div className="profile-atividade-title">{atividade.titulo}</div>
                                                  {atividade.categoria && (
                                                    <div className="profile-atividade-category">{atividade.categoria}</div>
                                                  )}
                                                  <div className="profile-atividade-meta">
                                                    <span
                                                      className={`profile-atividade-price ${
                                                        isFree ? 'profile-atividade-price-free' : ''
                                                      }`}
                                                    >
                                                      {priceLabel}
                                                    </span>
                                                    <span className="profile-atividade-dot">•</span>
                                                    <span className="profile-atividade-meta-value">{aulasLabel}</span>
                                                  </div>
                                                </div>
                                                <div className="profile-atividade-thumb">
                                                  {atividade.foto && !atividadeImgErrors[atividade.atividade_id] ? (
                                                    <img
                                                      src={atividade.foto}
                                                      alt={atividade.titulo}
                                                      className="profile-atividade-image"
                                                      onError={() =>
                                                        setAtividadeImgErrors((prev) => ({
                                                          ...prev,
                                                          [atividade.atividade_id]: true,
                                                        }))
                                                      }
                                                    />
                                                  ) : (
                                                    <div className="profile-atividade-default-icon">
                                                      <svg
                                                        width="28"
                                                        height="28"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden="true"
                                                      >
                                                        <rect x="3" y="4" width="18" height="14" rx="3" ry="3" />
                                                        <path d="M7 10h5M7 14h3" />
                                                        <circle cx="17" cy="12" r="2.2" />
                                                      </svg>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="profile-atividade-extra">
                                                <div className="profile-atividade-extra-section">
                                                  <div className="profile-atividade-extra-label">Descrição</div>
                                                  <div className="profile-atividade-extra-text">
                                                    {(atividade.descricao && atividade.descricao.trim())
                                                      ? atividade.descricao
                                                      : 'Sem descrição disponível para esta atividade.'}
                                                  </div>
                                                </div>
                                                <div className="profile-atividade-extra-row">
                                                  <div className="profile-atividade-extra-section">
                                                    <div className="profile-atividade-extra-label">Faixa etária</div>
                                                    <div className="profile-atividade-extra-text">{faixaEtariaLabel}</div>
                                                  </div>
                                                  <div className="profile-atividade-extra-section">
                                                    <div className="profile-atividade-extra-label">Status</div>
                                                    <div className="profile-atividade-extra-text">{statusLabel}</div>
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  className="profile-atividade-cta-btn"
                                                  onClick={() => handleOpenEnrollPopup(atividade.atividade_id, atividade.titulo)}
                                                >
                                                  Cadastrar criança na atividade
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="profile-atividades-empty">
                                        <div className="profile-publicacoes-empty">
                                          <div className="profile-publicacoes-empty-icon">
                                          <svg
                                            width="26"
                                            height="26"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                          >
                                            <rect x="3" y="4" width="18" height="17" rx="3" ry="3" />
                                            <path d="M8 2v4M16 2v4" />
                                            <path d="M7 11h10M7 15h6" />
                                          </svg>
                                        </div>
                                        <div className="profile-publicacoes-empty-text">
                                          {profileActivitiesError || 'Ainda não há nenhuma atividade'}
                                        </div>
                                      </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Fixed bottom pagination controls */}
            {!loading && !error && institutions.length > 0 && viewMode === 'list' && (
              <div className="pagination-controls">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className="page-btn"
                  disabled={currentPage <= 1 || selecting || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                  title="Página anterior"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span className="page-info">Página {currentPage} de {totalPages} • {institutions.length} itens</span>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className="page-btn"
                  disabled={currentPage >= totalPages || selecting || loading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  aria-label="Próxima página"
                  title="Próxima página"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
            {(selecting || loading) && (
              <div className="dropdown-loading-overlay">
                <div className="loading-content">
                  <span className="spinner" aria-hidden="true" />
                  <span className="loading-text">{selecting ? 'Carregando dados da instituição...' : 'Buscando instituições...'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      

      {/* Street View Modal */}
      {streetViewOpen && streetViewCoords && (
        <StreetViewModal
          isOpen={streetViewOpen}
          onClose={() => setStreetViewOpen(false)}
          latitude={streetViewCoords.lat}
          longitude={streetViewCoords.lng}
          institutionName={streetViewCoords.name}
        />
      )}

      {selectedPublication && (
        <div className="profile-publicacao-modal-overlay" onClick={handleClosePublication}>
          <div
            className="profile-publicacao-modal"
            style={{ transformOrigin: `${publicationOrigin.x} ${publicationOrigin.y}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="profile-publicacao-modal-close"
              onClick={handleClosePublication}
              aria-label="Fechar publicação"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {selectedPublication.imagem && (
              <img
                src={selectedPublication.imagem}
                alt={selectedPublication.descricao || 'Publicação'}
                className="profile-publicacao-modal-image"
              />
            )}
            {selectedPublication.descricao && (
              <div className="profile-publicacao-modal-description">
                {selectedPublication.descricao}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popup de inscrição de criança em atividade */}
      {showEnrollPopup && (
        <div className="enroll-popup-overlay" onClick={handleCloseEnrollPopup}>
          <div className="enroll-popup" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="enroll-popup-close"
              onClick={handleCloseEnrollPopup}
              aria-label="Fechar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Step 1: Selecionar criança */}
            {enrollStep === 'select' && (
              <div className="enroll-step">
                <div className="enroll-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8943f" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="enroll-title">Qual das crianças você deseja inscrever nesta atividade?</h3>
                
                {enrollLoading ? (
                  <div className="enroll-loading">
                    <span className="enroll-spinner"></span>
                    <span>Carregando crianças...</span>
                  </div>
                ) : userChildren.length === 0 ? (
                  <div className="enroll-empty">
                    <p>Você ainda não possui crianças cadastradas.</p>
                    <p>Cadastre uma criança primeiro para poder inscrevê-la em atividades.</p>
                    <button
                      type="button"
                      className="enroll-register-btn"
                      onClick={() => {
                        setShowEnrollPopup(false);
                        onOpenChildRegistration?.();
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="16" y1="11" x2="22" y2="11" />
                      </svg>
                      Cadastrar uma Criança Agora
                    </button>
                  </div>
                ) : (
                  <div className="enroll-children-list">
                    {userChildren.map((child) => (
                      <button
                        key={child.id_crianca}
                        type="button"
                        className="enroll-child-item"
                        onClick={() => handleSelectChild(child)}
                      >
                        <div className="enroll-child-avatar">
                          {child.foto_perfil ? (
                            <img src={child.foto_perfil} alt={child.nome} />
                          ) : (
                            <div className="default-institution-icon">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="enroll-child-name">{child.nome}</span>
                        <svg className="enroll-child-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Confirmação */}
            {enrollStep === 'confirm' && selectedChild && (
              <div className="enroll-step">
                <div className="enroll-icon enroll-icon-confirm">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8943f" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <h3 className="enroll-title">Confirmar inscrição</h3>
                <p className="enroll-confirm-text">
                  Você está inscrevendo <strong>{selectedChild.nome}</strong> na atividade <strong>{enrollActivityName}</strong>.
                </p>
                <p className="enroll-confirm-text">Deseja prosseguir?</p>
                <div className="enroll-actions">
                  <button
                    type="button"
                    className="enroll-btn enroll-btn-cancel"
                    onClick={() => setEnrollStep('select')}
                    disabled={enrollLoading}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    className="enroll-btn enroll-btn-confirm"
                    onClick={handleConfirmEnroll}
                    disabled={enrollLoading}
                  >
                    {enrollLoading ? (
                      <>
                        <span className="enroll-spinner-small"></span>
                        Inscrevendo...
                      </>
                    ) : (
                      'Confirmar inscrição'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Sucesso */}
            {enrollStep === 'success' && (
              <div className="enroll-step">
                <div className="enroll-icon enroll-icon-success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="enroll-title enroll-title-success">Solicitação enviada!</h3>
                <p className="enroll-success-text">
                  Sua solicitação de inscrição foi enviada com sucesso.
                </p>
                <p className="enroll-success-text enroll-success-note">
                  A instituição responsável pela atividade irá analisar e aprovar a inscrição.
                </p>
                <button
                  type="button"
                  className="enroll-btn enroll-btn-done"
                  onClick={handleCloseEnrollPopup}
                >
                  Entendi
                </button>
              </div>
            )}

            {/* Step 4: Erro */}
            {enrollStep === 'error' && (
              <div className="enroll-step">
                <div className="enroll-icon enroll-icon-error">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h3 className="enroll-title enroll-title-error">Não foi possível inscrever</h3>
                <p className="enroll-error-text">{enrollError}</p>
                <div className="enroll-actions">
                  <button
                    type="button"
                    className="enroll-btn enroll-btn-cancel"
                    onClick={() => setEnrollStep('select')}
                  >
                    Tentar novamente
                  </button>
                  <button
                    type="button"
                    className="enroll-btn enroll-btn-done"
                    onClick={handleCloseEnrollPopup}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}