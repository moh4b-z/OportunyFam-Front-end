"use client";

import { useState, useEffect } from "react";
import { Instituicao } from "@/types";
import { InstituicoesByName, geocodeAddress, normalizeInstituicao } from "@/services/Instituicoes";
import { logApiResponse, logInstitutionData, logGeocoding } from "@/services/debug";
import { searchMockInstitutions } from "@/services/mockData";
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
  // Determina o ícone baseado no tipo
  const getIcon = (name: string) => {
    if (name.toLowerCase().includes('curso')) return '📚';
    if (name.toLowerCase().includes('instituto')) return '🏛️';
    if (name.toLowerCase().includes('casa')) return '🏠';
    if (name.toLowerCase().includes('centro')) return '🏢';
    if (name.toLowerCase().includes('escola')) return '🎓';
    if (name.toLowerCase().includes('fundação')) return '🏛️';
    return '🏢';
  };

  // Determina a categoria
  const getCategory = (name: string) => {
    if (name.toLowerCase().includes('curso técnico')) return 'Curso Técnico';
    if (name.toLowerCase().includes('curso de')) return 'Curso Profissionalizante';
    if (name.toLowerCase().includes('curso')) return 'Capacitação';
    if (name.toLowerCase().includes('instituto')) return 'Instituto';
    if (name.toLowerCase().includes('casa')) return 'Casa de Apoio';
    if (name.toLowerCase().includes('centro')) return 'Centro';
    if (name.toLowerCase().includes('escola')) return 'Escola';
    if (name.toLowerCase().includes('fundação')) return 'Fundação';
    return 'Organização';
  };

  // Gera descrição baseada no nome
  const getDescription = (name: string) => {
    if (name.toLowerCase().includes('curso')) {
      return 'Capacitação profissional • Certificado incluso';
    }
    return 'Organização social • Atividades comunitárias';
  };

  return (
    <div
      className={`search-result-card ${isSelected ? "selected-card" : ""}`}
      onClick={onClick}
    >
      <div className="card-logo-block">
        <span className="card-icon">{getIcon(institution.nome)}</span>
      </div>
      <div className="card-main-content">
        <div className="card-header">
          <span className="card-name-full">{institution.nome}</span>
          <span className="card-category">{getCategory(institution.nome)}</span>
        </div>
        <span className="card-description">{getDescription(institution.nome)}</span>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categorias dos chips - apenas as mais relevantes
  const [categories, setCategories] = useState<Category[]>([
    { id: "informatica", name: "Informática", isActive: false },
    { id: "ingles", name: "Inglês", isActive: false },
    { id: "saude", name: "Saúde", isActive: false },
    { id: "culinaria", name: "Culinária", isActive: false },
    { id: "design", name: "Design", isActive: false },
    { id: "administracao", name: "Administração", isActive: false },
    { id: "mecanica", name: "Mecânica", isActive: false },
    { id: "musica", name: "Música", isActive: false }
  ]);

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchInstitutions = async () => {
      if (!debouncedSearchTerm.trim()) {
        setInstitutions([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await InstituicoesByName({ nome: debouncedSearchTerm });
        logApiResponse('InstituicoesByName', data);
        
        if (data.status && data.data && data.data.length > 0) {
          // Processa as instituições para garantir que tenham coordenadas
          const processedInstitutions = await Promise.all(
            data.data.map(async (rawInst) => {
              // Normaliza os dados da instituição
              const inst = normalizeInstituicao(rawInst);
              logInstitutionData(inst, 'after normalization');
              
              // Se a instituição não tem coordenadas, tenta geocodificar
              if (!inst.endereco?.latitude || !inst.endereco?.longitude) {
                const addressParts = [
                  inst.endereco?.logradouro,
                  inst.endereco?.numero,
                  inst.endereco?.bairro,
                  inst.endereco?.cidade,
                  inst.endereco?.estado,
                  inst.endereco?.cep
                ].filter(Boolean);
                
                if (addressParts.length > 0) {
                  const fullAddress = addressParts.join(', ');
                  const coords = await geocodeAddress(fullAddress);
                  logGeocoding(fullAddress, coords);
                  
                  if (coords) {
                    if (!inst.endereco) {
                      inst.endereco = {};
                    }
                    inst.endereco.latitude = coords.lat;
                    inst.endereco.longitude = coords.lng;
                    logInstitutionData(inst, 'after geocoding');
                  }
                }
              }
              return inst;
            })
          );
          setInstitutions(processedInstitutions);
        } else {
          setInstitutions([]);
        }
      } catch (err: any) {
        console.warn('API falhou, usando dados mock:', err.message);
        // Fallback para dados mock
        const mockResults = searchMockInstitutions(debouncedSearchTerm);
        if (mockResults.length > 0) {
          setInstitutions(mockResults);
          setError(null);
        } else {
          setError(err.message || "Erro ao buscar instituições");
          setInstitutions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [debouncedSearchTerm]);

  const handleInstitutionClick = (institution: Instituicao) => {
    setSelectedInstitution(institution.instituicao_id || institution.id);
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

  const fetchInstitutionsByCategory = async (categoryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mapeia IDs dos chips para termos de busca
      const categoryMap: Record<string, string> = {
        'jiu-jitsu': 'jiu jitsu',
        'ti': 'informatica',
        'centro-cultural': 'centro cultural',
        'biblioteca': 'biblioteca',
        'informatica': 'informatica',
        'ingles': 'ingles',
        'culinaria': 'culinaria',
        'design': 'design',
        'enfermagem': 'enfermagem',
        'administracao': 'administracao',
        'mecanica': 'mecanica',
        'eletronica': 'eletronica',
        'marketing': 'marketing',
        'musica': 'musica',
        'saude': 'saude',
        'gastronomia': 'gastronomia',
        'programacao': 'programacao',
        'soldagem': 'soldagem'
      };
      
      const searchTerm = categoryMap[categoryId] || categoryId;
      
      // Usa a mesma lógica de busca
      const data = await InstituicoesByName({ nome: searchTerm });
      logApiResponse('CategorySearch', data);
      
      if (data.status && data.data && data.data.length > 0) {
        const processedInstitutions = await Promise.all(
          data.data.map(async (rawInst) => {
            const inst = normalizeInstituicao(rawInst);
            logInstitutionData(inst, 'category search');
            
            if (!inst.endereco?.latitude || !inst.endereco?.longitude) {
              const addressParts = [
                inst.endereco?.logradouro,
                inst.endereco?.numero,
                inst.endereco?.bairro,
                inst.endereco?.cidade,
                inst.endereco?.estado,
                inst.endereco?.cep
              ].filter(Boolean);
              
              if (addressParts.length > 0) {
                const fullAddress = addressParts.join(', ');
                const coords = await geocodeAddress(fullAddress);
                logGeocoding(fullAddress, coords);
                
                if (coords) {
                  if (!inst.endereco) {
                    inst.endereco = {};
                  }
                  inst.endereco.latitude = coords.lat;
                  inst.endereco.longitude = coords.lng;
                  logInstitutionData(inst, 'after geocoding');
                }
              }
            }
            return inst;
          })
        );
        setInstitutions(processedInstitutions);
      } else {
        // Fallback para dados mock da categoria
        const mockResults = searchMockInstitutions(searchTerm);
        if (mockResults.length > 0) {
          setInstitutions(mockResults);
          setError(null);
        } else {
          setInstitutions([]);
        }
      }
    } catch (err: any) {
      console.warn('Busca por categoria falhou, usando dados mock:', err.message);
      const mockResults = searchMockInstitutions(categoryMap[categoryId] || categoryId);
      if (mockResults.length > 0) {
        setInstitutions(mockResults);
        setError(null);
      } else {
        setError('Nenhuma instituição encontrada para esta categoria');
        setInstitutions([]);
      }
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
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        />
        {(searchFocused || institutions.length > 0 || categories.some(cat => cat.isActive)) && (
          <div className="search-results-dropdown">
            {loading && <div className="dropdown-message">Buscando instituições...</div>}
            {error && <div className="dropdown-message error">{error}</div>}
            {!loading && !error && institutions.map(inst => (
              <SearchResultOption
                key={inst.instituicao_id || inst.id}
                institution={inst}
                isSelected={selectedInstitution === (inst.instituicao_id || inst.id)}
                onClick={() => handleInstitutionClick(inst)}
              />
            ))}
            {!loading && !error && searchTerm && institutions.length === 0 && (
              <div className="dropdown-message">Nenhuma instituição encontrada</div>
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