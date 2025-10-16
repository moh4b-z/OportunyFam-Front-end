"use client";

import { useState } from "react";
import BarraLateral from "@/components/BarraLateral";
import SearchBar from "@/components/SearchBar";
const Mapa = dynamic(() => import("../components/Mapa"), { ssr: false });
import dynamic from "next/dynamic";
import { Instituicao } from "@/types";

export default function HomePage() {
  const [selectedInstitution, setSelectedInstitution] = useState<Instituicao | null>(null);

  const handleInstitutionSelect = (institution: Instituicao) => {
    setSelectedInstitution(institution);
  };

  return (
    <div className="main-container">
      <BarraLateral />
      <div className="content">
        <div className="search-wrapper">
          <SearchBar onInstitutionSelect={handleInstitutionSelect} />
        </div>
        <div className="map-wrapper">
          <Mapa highlightedInstitution={selectedInstitution} />
        </div>
      </div>
    </div>
  );
}