"use client";

import { useState, useEffect } from "react";
import { Instituicao } from "@/types";
import { InstituicoesByName } from "@/service/Instituicoes";

interface SearchBarProps {
  onInstitutionSelect: (institution: Instituicao) => void;
}

interface SearchResultOptionProps {
  name: string;
  onClick: () => void;
  isSelected: boolean;
}

const SearchResultOption = ({ name, onClick, isSelected }: SearchResultOptionProps) => {
  return (
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
        if (data.status && data.instituicoes) {
          setInstitutions(data.instituicoes);
        } else {
          setInstitutions([]);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao buscar instituições");
        setInstitutions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [debouncedSearchTerm]);

  const handleInstitutionClick = (institution: Instituicao) => {
    setSelectedInstitution(institution.id);
    setSearchFocused(false);
    setSearchTerm("");
    onInstitutionSelect(institution);
  };

  return (
    <div className={`search-and-chips ${searchFocused ? "search-and-chips-active" : ""}`}>
      <div className={`search-box ${searchFocused ? "search-box-active" : ""}`}>
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
            {loading && <div className="dropdown-message">Buscando instituições...</div>}
            {error && <div className="dropdown-message error">{error}</div>}
            {!loading && !error && institutions.map(inst => (
              <SearchResultOption
                key={inst.id}
                name={inst.nome}
                isSelected={selectedInstitution === inst.id}
                onClick={() => handleInstitutionClick(inst)}
              />
            ))}
            {!loading && !error && searchTerm && institutions.length === 0 && (
              <div className="dropdown-message">Nenhuma instituição encontrada</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}