"use client";

import { useState, useEffect } from "react";
import { Instituicao, TipoInstituicao } from "@/types";
import { geocodeAddress, normalizeInstituicao } from "@/services/Instituicoes";
import { logApiResponse, logInstitutionData, logGeocoding } from "@/services/debug";
import { searchMockInstitutions } from "@/services/mockData";
import { API_BASE_URL } from "@/services/config";
import CategoryChips, { Category } from "./shared/CategoryChips";
import "../app/styles/SearchCard.css";
import "../app/styles/SearchModal.css";

interface SearchBarProps {
  onInstitutionSelect: (institution: Instituicao) => void;
}

interface SearchResultOptionProps {
  institution: Instituicao;
  onClick: () => void;
  isSelected: boolean;
}

const SearchResultOption = ({ institution, onClick, isSelected }: SearchResultOptionProps) => {
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
        <span className="card-location">📍 {institution.endereco?.bairro}, São Paulo</span>
      </div>
    </div>
  );
};

export default function SearchBar({ onInstitutionSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);

  const [institutions, setInstitutions] = useState<Instituicao[]>([]);
  const [allInstitutions, setAllInstitutions] = useState<Instituicao[]>([]);
  const [hasLoadedAll, setHasLoadedAll] = useState<boolean>(false);
  const pageSize = 20;
  const [page, setPage] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'local' | null>(null);

  // Card de teste para geocodificação
  const testInstitution: Instituicao = {
    id: 999999,
    instituicao_id: 999999,
    nome: "Teste Geocodificação - Rua Paraná 10",
    email: "teste@exemplo.com",
    foto_perfil: null,
    cnpj: "",
    telefone: "",
    descricao: "Endereço de teste para Nominatim",
    endereco: {
      id: 1,
      cep: "06325010",
      logradouro: "Rua Paraná",
      numero: "10",
      complemento: "",
      bairro: "Conjunto Habitacional Presidente Castelo Branco",
      cidade: "Carapicuíba",
      estado: "SP",
      latitude: 0,
      longitude: 0
    },
    tipos_instituicao: []
  };

  // Categorias dos chips - apenas as mais relevantes
  const [categories, setCategories] = useState<Category[]>([
    { id: "informatica", name: "Informática", isActive: false },
    { id: "ingles", name: "Inglês", isActive: false },
    { id: "saude", name: "Saúde", isActive: false },
    { id: "culinaria", name: "Culinária", isActive: false }
  ]);

  // Estado do filtro de localização
  const [locationFilter, setLocationFilter] = useState<string>('todas');
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
  const isDropdownOpen = searchFocused || institutions.length > 0 || categories.some(cat => cat.isActive) || locationFilter !== 'todas';

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
          tipos_instituicao: inst.tipos_instituicao || []
        }));
        const all = [testInstitution, ...formattedInstitutions];
        setAllInstitutions(all);
        setInstitutions(all);
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

  // Busca por nome 100% no front, baseada na lista carregada uma vez
  useEffect(() => {
    if (!hasLoadedAll) return;
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (!term) {
      setInstitutions(allInstitutions);
      setPage(1);
      return;
    }
    const filtered = allInstitutions.filter(inst =>
      (inst.nome || '').toLowerCase().includes(term)
    );
    setInstitutions(filtered);
    setPage(1);
  }, [debouncedSearchTerm, hasLoadedAll, allInstitutions]);

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
    if (!isDropdownOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        e.preventDefault();
        setPage((p) => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        e.preventDefault();
        setPage((p) => Math.min(totalPages, p + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDropdownOpen, currentPage, totalPages]);

  const handleInstitutionClick = (institution: Instituicao) => {
    const institutionId = institution.instituicao_id || institution.id;
    if (institutionId !== undefined) {
      setSelectedInstitution(institutionId);
    } else {
      console.error('ID da instituição não encontrado');
      return;
    }
    setSearchFocused(false);
    setSearchTerm("");
    onInstitutionSelect(institution);
  };

  const handleCategoryClick = async (categoryId: string) => {
    setCategories(prevCategories => {
      const updatedCategories = prevCategories.map(category => {
        if (category.id === categoryId) {
          return { ...category, isActive: !category.isActive };
        } else {
          return { ...category, isActive: false };
        }
      });
      
      const activeCategory = updatedCategories.find(cat => cat.isActive);
      
      if (activeCategory) {
        // Busca instituições da categoria selecionada
        fetchInstitutionsByCategory(activeCategory.id);
      } else {
        // Limpa os resultados se desativar o chip
        setInstitutions([]);
      }
      
      return updatedCategories;
    });
  };

  const locationOptions = [
    { value: 'todas', label: 'Todas as regiões', icon: 'globe' },
    { value: 'zona_norte', label: 'Zona Norte', icon: 'north' },
    { value: 'zona_sul', label: 'Zona Sul', icon: 'south' },
    { value: 'zona_leste', label: 'Zona Leste', icon: 'east' },
    { value: 'zona_oeste', label: 'Zona Oeste', icon: 'west' },
    { value: 'centro', label: 'Centro', icon: 'building' }
  ];

  const getLocationIcon = (iconType: string) => {
    const icons = {
      globe: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="m5 5 14 14"/></svg>,
      north: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M5 9l7-7 7 7"/></svg>,
      south: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M19 15l-7 7-7-7"/></svg>,
      east: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M15 5l7 7-7 7"/></svg>,
      west: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M9 19l-7-7 7-7"/></svg>,
      building: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h12"/><path d="M6 16h12"/></svg>
    };
    return icons[iconType as keyof typeof icons] || icons.globe;
  };

  const getLocationTerms = (location: string): string => {
    const locationMap: Record<string, string> = {
      'todas': '',
      'zona_norte': 'Santana|Casa Verde|Tucuruvi|Mandaqui|Belém',
      'zona_sul': 'Santo Amaro|Campo Limpo|Jabaquara|Sapopemba|Heliópolis|Cidade Dutra',
      'zona_leste': 'Itaquera|Penha|Tatuapé|São Mateus|Guaianases|Cidade Tiradentes',
      'zona_oeste': 'Vila Leopoldina|Pinheiros|Lapa|Osasco|Butantã|Pirituba|Jaguaré',
      'centro': 'República|Centro|Liberdade|Santa Ifigênia|Sé|Bela Vista'
    };
    return locationMap[location] || '';
  };

  const fetchInstitutionsByLocation = async (location: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { institutionService } = await import('../services/institutionService');
      const searchTerm = location === 'todas' ? '' : location;
      
      // Tenta buscar da API primeiro
      try {
        const data = await institutionService.search(searchTerm);
        
        if (data?.data?.length > 0) {
          // Se encontrou resultados na API, usa eles
          setInstitutions(data.data.map(normalizeInstituicao));
          return;
        }
      } catch (apiError) {
        console.warn('Erro ao buscar da API, usando dados locais:', apiError);
      }
      
      // Se chegou aqui, ou a API não retornou resultados ou deu erro
      const { populateService } = await import('../services/populateInstitutions');
      
      if (location === 'todas') {
        const allResults = populateService.searchLocal('');
        setInstitutions(allResults.slice(0, 100));
      } else {
        const locationTerms = getLocationTerms(location);
        const locations = locationTerms.split('|');
        const results: Instituicao[] = [];
        
        locations.forEach(loc => {
          const localResults = populateService.searchLocal(loc);
          results.push(...localResults);
        });
        
        setInstitutions(results);
      }
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
      setError('Não foi possível carregar as instituições. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (location: string) => {
    setLocationFilter(location);
    setShowLocationDropdown(false);
    fetchInstitutionsByLocation(location);
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
      tipos_instituicao: instituicao.tipos_instituicao || []
    };
  };

  const fetchInstitutionsByCategory = async (categoryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const categoryMap: Record<string, string> = {
        'informatica': 'informatica',
        'ingles': 'ingles',
        'saude': 'saude',
        'culinaria': 'culinaria'
      };
      
      const searchTerm = categoryMap[categoryId] || categoryId;
      const { institutionService } = await import('../services/institutionService');
      
      // Tenta buscar da API primeiro
      try {
        const data = await institutionService.search(searchTerm);
        
        if (data?.data?.length > 0) {
          setInstitutions(data.data.map(normalizeInstituicao));
          return;
        }
      } catch (apiError) {
        console.warn('Erro ao buscar da API, usando dados locais:', apiError);
      }
      
      // Fallback para dados locais
      const { populateService } = await import('../services/populateInstitutions');
      const localResults = populateService.searchLocal(searchTerm);
      setInstitutions(localResults);
      
    } catch (error) {
      console.error('Erro ao buscar instituições por categoria:', error);
      setError('Não foi possível carregar as instituições desta categoria. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

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
          className="search-input"
          placeholder="Pesquise aqui"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { setSearchFocused(true); loadAllInstitutionsOnce(); }}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        />
        
        {/* Filtro de Localização */}
        <div className="location-filter">
          <button 
            className="location-filter-btn"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
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
        {isDropdownOpen && (
          <div className="search-results-dropdown">
            <div className="search-results-list">
              {loading && <div className="dropdown-message">Buscando instituições...</div>}
              {error && <div className="dropdown-message error">{error}</div>}
              {!loading && !error && pagedInstitutions.map(inst => (
                <SearchResultOption
                  key={`${inst.instituicao_id ?? inst.id}-${inst.endereco?.id ?? inst.endereco?.cep ?? ''}-${inst.nome}`}
                  institution={inst}
                  isSelected={selectedInstitution === (inst.instituicao_id || inst.id)}
                  onClick={() => handleInstitutionClick(inst)}
                />
              ))}

              {!loading && !error && searchTerm && institutions.length === 0 && (
                <div className="dropdown-message">Nenhuma instituição encontrada</div>
              )}
            </div>

            {!loading && !error && institutions.length > 0 && (
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >Anterior</button>
                <span className="page-info">Página {currentPage} de {totalPages} • {institutions.length} itens</span>
                <button
                  className="page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >Próxima</button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Chips de categoria ao lado direito */}
      <CategoryChips 
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />
    </div>
  );
}