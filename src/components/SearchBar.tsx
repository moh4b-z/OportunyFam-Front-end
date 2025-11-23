"use client";
 

import { useState, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { Instituicao, TipoInstituicao } from "@/types";
import { geocodeAddress } from "@/services/Instituicoes";
import { API_BASE_URL } from "@/services/config";
import StreetViewModal from "./StreetViewModal";
import "../app/styles/SearchCard.css";
import "../app/styles/SearchModal.css";

interface SearchBarProps {
  onInstitutionSelect: (institution: Instituicao) => void;
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

export default function SearchBar({ onInstitutionSelect }: SearchBarProps) {
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
  const [profileImgError, setProfileImgError] = useState<boolean>(false);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [selectedPublication, setSelectedPublication] = useState<any | null>(null);
  const [publicationOrigin, setPublicationOrigin] = useState<{ x: string; y: string }>({ x: '50%', y: '50%' });

  useEffect(() => {
    // Reset image error quando trocar de instituição
    setProfileImgError(false);
  }, [detailInstitution?.foto_perfil, detailInstitution?.instituicao_id, detailInstitution?.id]);

  useEffect(() => {
    // Fecha o popover de descrição ao trocar de instituição
    setShowDescription(false);
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

  // Carrega TODAS as instituições uma única vez, somente quando o usuário focar no input
  const loadAllInstitutionsOnce = async () => {
    if (hasLoadedAll || loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/instituicoes`);
      if (!response.ok) {
        throw new Error('Erro ao carregar instituições');
      }
      const data = await response.json();
      if (data.status && data.instituicoes) {
        const formattedInstitutions = data.instituicoes.map((inst: any) => ({
          id: inst.instituicao_id,
          instituicao_id: inst.instituicao_id,
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
        setHasLoadedAll(true);
        setDataSource('api');
      }
    } catch (err) {
      console.error('Erro ao carregar instituições:', err);
      setError('Não foi possível carregar as instituições. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
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

  // Removido CategoryChips

  const locationOptions = [
    { value: 'nome', label: 'Nome', icon: 'user' },
    { value: 'endereco', label: 'Endereço', icon: 'pin' }
  ];

  const getLocationIcon = (iconType: string) => {
    const icons = {
      user: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
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
          onFocus={() => { if (viewMode !== 'profile') { setSearchFocused(true); loadAllInstitutionsOnce(); } }}
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
                              <h3 className="profile-publicacoes-title">Publicações</h3>
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
              ×
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
    </div>
  );
}