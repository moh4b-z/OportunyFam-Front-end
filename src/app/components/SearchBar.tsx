"use client";

import { useState, useEffect } from "react";
import { InstituicoesByName, FetchInstituicoesParams } from "@/service/Instituicoes";

interface Institution {
  id?: string;
  nome: string;
}

interface SearchBarProps {
  onInstitutionSelect: (institution: Institution) => void;
}

const StarIcon = () => (
  <svg className="star-icon-option" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

interface SearchResultOptionProps {
  name: string;
  onClick: () => void;
  isSelected: boolean;
}

const SearchResultOption = ({ name, onClick, isSelected }: SearchResultOptionProps) => (
  <div
    className={`search-result-card ${isSelected ? "selected-card" : ""}`}
    onClick={onClick}
  >
    <div className="card-logo-block">
      <img
        src="https://static.wixstatic.com/media/b12d01_3b32456f44844df8b16019c72d691029~mv2.png"
        alt="Instituição Logo"
        className="card-logo-img"
      />
    </div>
    <div className="card-main-content">
      <span className="card-name-full">{name}</span>
      <span className="card-subtitle">Instituição de Ensino e Social</span>
    </div>
    <div className="card-rating-block">
      <div className="card-star-icons">
        <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
      </div>
      <span className="card-rating-text">5.0</span>
    </div>
  </div>
);

export default function SearchBar({ onInstitutionSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    const searchInstitutions = async () => {
      if (!debouncedSearchTerm.trim()) {
        setInstitutions([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await InstituicoesByName({ nome: debouncedSearchTerm, pagina: 1, tamanho: 20 });
        if (data.status && data.instituicoes) {
          setInstitutions(data.instituicoes);
        } else {
          setInstitutions([]);
          console.error("Formato inesperado da API:", data);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao buscar instituições");
        setInstitutions([]);
      } finally {
        setLoading(false);
      }
    };

    searchInstitutions();
  }, [debouncedSearchTerm]);

  const filteredInstitutions = institutions.filter(inst =>
    inst.nome && inst.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInstitutionClick = (institution: Institution) => {
    setSelectedInstitution(institution.id || institution.nome);
    setSearchFocused(false);
    setSearchTerm("");
    onInstitutionSelect(institution);
  };

  return (
    <div className={`search-and-chips ${searchFocused ? "search-and-chips-active" : ""}`}>
      <div className={`search-box ${searchFocused ? "search-box-active" : ""}`}>
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          className="search-input"
          placeholder="Pesquise aqui"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        />
        {searchFocused && (
          <div className="search-results-dropdown">
            {loading && <div className="loading-text">Buscando instituições...</div>}
            {error && <div className="error-text">{error}</div>}
            {!loading && !error && filteredInstitutions.length > 0 &&
              filteredInstitutions.map(inst => (
                <SearchResultOption
                  key={inst.id || inst.nome}
                  name={inst.nome}
                  isSelected={selectedInstitution === (inst.id || inst.nome)}
                  onClick={() => handleInstitutionClick(inst)}
                />
              ))
            }
            {!loading && !error && searchTerm.trim() && filteredInstitutions.length === 0 && (
              <div className="no-results-text">Nenhuma instituição encontrada</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}