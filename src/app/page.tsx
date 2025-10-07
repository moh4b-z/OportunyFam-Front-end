"use client"

import { useState, useEffect } from "react"
import BarraLateral from "@/app/component/barralateral"

// ========================================================
// COMPONENTES DE RESULTADO DE BUSCA (MANTIDOS)
// ========================================================
const StarIcon = () => (
    <svg className="star-icon-option" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);

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
      {/* 1. Logo (Canto Esquerdo) */}
      <div className="card-logo-block">
        {/* Placeholder SVG Gota (Logo Água Viva) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="#4a90e2" /* Azul mais vibrante */
          stroke="#3478c8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2.69l5.66 5.66c3.12 3.12 3.12 8.19 0 11.31-3.12 3.12-8.19 3.12-11.31 0L12 2.69z" />
        </svg>
      </div>

      {/* 2. Conteúdo Principal (Nome e Subtítulo) */}
      <div className="card-main-content">
        {/* Nome Completo da Instituição */}
        <span className="card-name-full">{name}</span>
        {/* Subtítulo informativo */}
        <span className="card-subtitle">Instituição de Ensino e Social</span>
      </div>

      {/* 3. Avaliação (Canto Direito) */}
      <div className="card-rating-block">
        <div className="card-star-icons">
            <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
        </div>
        <span className="card-rating-text">5.0</span>
      </div>
    </div>
  );
}
// COMPONENTE PRINCIPAL HOME
// ========================================================
export default function Home() {
  const [showModal, setShowModal] = useState<boolean>(true)
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false)
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState("light")
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)

  // Estados para o modal "Faça parte"
  const [joinFormData, setJoinFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [showActivitiesDropdown, setShowActivitiesDropdown] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const institutions = [
    { name: "Instituição Água Viva", key: "agua-viva" },
  ];
  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.trim() !== ""
  );

  const handleInstitutionClick = (key: string) => {
    setSelectedInstitution(key)
    setShowSearchModal(true)
    setSearchFocused(false);
    setSearchTerm("");
  }

  const chips = [
    { label: "Jiu Jitsu", active: false },
    { label: "T.I", active: false },
    { label: "Centro Cultural", active: false },
    { label: "Biblioteca", active: false },
  ]

  const [activeChip, setActiveChip] = useState<string | null>(null)

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const handleAcceptTerms = () => {
    setTermsAccepted(true)
    setTimeout(() => {
      setShowTermsModal(false)
      setTermsAccepted(false)
    }, 3000)
  }

  const handleCloseTermsModal = () => {
    setShowTermsModal(false)
    setTermsAccepted(false)
  }
  
  const handleOpenSearchModal = () => {
    // Não faz nada aqui por enquanto
  }
  
  const handleCloseSearchModal = () => {
    setShowSearchModal(false)
    setSelectedInstitution(null);
  }

  const handleOpenJoinModal = () => {
    setShowJoinModal(true)
    setShowSearchModal(false)
  }

  const handleCloseJoinModal = () => {
    setShowJoinModal(false)
    setJoinFormData({ name: "", email: "", phone: "" })
    setShowActivitiesDropdown(false)
    setSelectedActivity(null)
    setShowSuccessMessage(false)
  }

  const handleJoinFormChange = (field: string, value: string) => {
    setJoinFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity)
    setShowActivitiesDropdown(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const availableActivities = [
    { name: "Futebol", count: 15 },
    { name: "Basquete", count: 7 },
    { name: "Badminton", count: 20 }
  ]


  return (
    <>
      <BarraLateral onSearchClick={handleOpenSearchModal} />

      <div className={showModal || showSearchModal || showTermsModal || showJoinModal ? "app-content-wrapper blurred" : "app-content-wrapper"}>

        <main className="map-area">
          <header className="main-header">
            {/* O contêiner principal da busca deve ter position: relative; no CSS */}
            <div className={`search-and-chips ${searchFocused ? "search-and-chips-active" : ""}`}>
              
              {/* Onde a barra de busca realmente está */}
              <div className={`search-box ${searchFocused ? "search-box-active" : ""}`}>
                <svg
                  className="search-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  className="search-input"
                  placeholder="Pesquise aqui"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    // Delay para permitir o clique no resultado
                    setTimeout(() => setSearchFocused(false), 200);
                  }}
                />
              </div>

              {/* =================================================== */}
              {/* BLOCO MOVIDO: AGORA ESTÁ FORA DO search-box */}
              {/* =================================================== */}
              {searchFocused && filteredInstitutions.length > 0 && (
                <div className="search-results-dropdown">
                  {filteredInstitutions.map((inst) => (
                    <SearchResultOption
                      key={inst.key}
                      name={inst.name}
                      isSelected={selectedInstitution === inst.key}
                      onClick={() => handleInstitutionClick(inst.key)}
                    />
                  ))}
                </div>
              )}
              {/* =================================================== */}
              {/* FIM DO BLOCO MOVIDO */}
              {/* =================================================== */}

              <div className="chips">
                {chips.map((chip, i) => (
                  <button
                    key={i}
                    className={`chip ${activeChip === chip.label ? "active-chip" : ""}`}
                    onClick={() => setActiveChip(activeChip === chip.label ? null : chip.label)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-wrapper" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
              <svg
                className="profile-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <div className="notif-dot" />
            </div>

            {isProfileMenuOpen && (
              <div className="profile-menu">
                <div className="menu-item">
                  <span>Conta</span>
                </div>
                <div className="menu-item">
                  <span>Notificações</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="menu-item">
                  <span>Tema</span>
                  <label className="switch">
                    <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <hr className="menu-divider" />
                <div
                  className="menu-item"
                  onClick={() => {
                    setShowTermsModal(true)
                    setIsProfileMenuOpen(false)
                  }}
                >
                  <span>Termos e Condições</span>
                </div>
                <div className="menu-item">
                  <span>Sair da Conta</span>
                </div>
              </div>
            )}
          </header>

          <div className="map" role="img" aria-label="Mapa de fundo" />
        </main>
      </div>

      {/* Modal de Boas-vindas (Mantido) */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <button className="modal-exit" onClick={() => setShowModal(false)} aria-label="Fechar">
              ✕
            </button>

            <h1 className="modal-title">Olá, Seja Bem Vindo a OportunyFam!</h1>
            <hr className="modal-hr" />

            <p className="modal-text">Aqui você vai encontrar as melhores instituições para o seu filho.</p>

            <p className="modal-question">Deseja cadastrar seu filho agora?</p>

            <div className="modal-actions">
              <button className="btn btn-outline">Não</button>
              <button className="btn btn-primary">Sim</button>
            </div>
          </div>
        </div>
      )}


      {/* Modal de Detalhe da Instituição (Mantido) */}
      {showSearchModal && selectedInstitution === "agua-viva" && (
        <div className="search-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="inst-agua-viva-title">
          <div className="search-modal-card">
            <button className="search-modal-exit" onClick={handleCloseSearchModal} aria-label="Fechar tela de detalhes">
              ✕
            </button>

            {/* =============================================== */}
            {/* 1. CABEÇALHO (Logo, Título e Avaliação) */}
            {/* =============================================== */}
            <div className="inst-header">
              <div className="inst-logo-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="#3498db"
                  stroke="#2980b9"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inst-logo-img"
                >
                  <path d="M12 2.69l5.66 5.66c3.12 3.12 3.12 8.19 0 11.31-3.12 3.12-8.19 3.12-11.31 0L12 2.69z" />
                </svg>
              </div>

              <div className="inst-info">
                <h2 id="inst-agua-viva-title" className="inst-title">Inst. Água Viva</h2>
                <p className="inst-subtitle">Instituição de Ensino</p>
                <div className="inst-rating">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="star-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  ))}
                  <span className="rating-text">5.0</span>
                  <span className="rating-text">({(450).toLocaleString("pt-BR")})</span>
                </div>
              </div>
            </div>

            {/* 2. BOTÕES DE AÇÃO */}
            <div className="inst-actions">
              <button className="btn-orange-outline">Sobre nós</button>
              <button className="btn-orange-outline" onClick={handleOpenJoinModal}>Faça parte</button>
              <button className="btn-orange-outline">Associados</button>
            </div>

            {/* 3. DESCRIÇÃO */}
            <div className="inst-description-block interactive-card">
              <p className="inst-description-text">
                A Rede Água Viva pela Mudança Social reúne organizações que atuam com o esporte como fator de desenvolvimento humano. Na busca por trazer visibilidade ao trabalho das organizações e evidenciar o poder transformador do ensino.
              </p>
            </div>

            {/* 4. NOSSAS INFORMAÇÕES */}
            <div className="info-block interactive-card">
              <h3 className="info-title">Nossas Informações</h3>

              <div className="info-item">
                <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span className="info-value">
                  R. Interna Grupo Bandeirante, 29 - Vila Militar, Barueri - SP, 06442-130
                </span>
              </div>


              <div className="info-item">
                <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.7-6.7A19.79 19.79 0 0 1 2 4.18V2.18a2 2 0 0 1 2-2h3.18a2 2 0 0 1 2 1.72 17.5 17.5 0 0 0 .58 3.42c.16.59-.14 1.25-.76 1.54l-1.4 1.23a17.65 17.65 0 0 0 6.7 6.7l1.23-1.4a2 2 0 0 1 1.54-.76c.72.16 1.44.27 2.16.33a2 2 0 0 1 1.72 2z" /></svg>
                <span className="info-value">(11) 9999-9900</span>
              </div>

              <div className="info-item">
                <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span className="info-value">
                  <span className="info-status-open">Aberto</span>, Fecha às 16:00
                </span>
              </div>

            </div>
      {/* 5. GALERIA DE FOTOS */}
             <h3 className="gallery-title">Conheça nossa instituição</h3>

              <div className="gallery-container">
                <div className="gallery-card interactive-card">
                 <div className="gallery-image image-1" role="img" aria-label="Foto da Instituição 1" />
              </div>

              <div className="gallery-card interactive-card">
                <div className="gallery-image image-2" role="img" aria-label="Foto da Instituição 2" />
              </div>

              <div className="gallery-card interactive-card">
                <div className="gallery-image image-3" role="img" aria-label="Foto da Instituição 3" />
              </div>
              </div>
           </div>
         </div>
       )
     }
      {/* Modal de Termos e Condições (Mantido) */}
      {showTermsModal && (
        <div className="terms-modal-overlay" role="dialog" aria-modal="true">
          <div className={theme === "dark" ? "terms-modal-card dark" : "terms-modal-card"}>
            <div className="terms-modal-header">
              <button className="terms-back-btn" onClick={handleCloseTermsModal} aria-label="Voltar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <h1 className="terms-header-title">OportunyFam</h1>
            </div>

            <hr className="terms-header-divider" />

            <div className="terms-icon-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            </div>

            <h2 className="terms-title">Termos e Condições de Uso</h2>
            <p className="terms-subtitle">
              Transparência e segurança para conectar famílias e ONGs de forma responsável e confiável.
            </p>

            <div className="terms-card">
              <div className="terms-card-header">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f4a261"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h3 className="terms-card-title">Bem-vindo à OportunyFam</h3>
              </div>
              <p className="terms-card-text">
                Nossa plataforma conecta mães, famílias e ONGs para criar uma rede de apoio segura e organizada.
              </p>
              <p className="terms-card-text-bold">
                Ao utilizar nossa plataforma, você concorda com os termos estabelecidos neste documento. Nossa missão é
                promover a inclusão social e fortalecer vínculos comunitários através da tecnologia, sempre priorizando
                a segurança e bem-estar das crianças e famílias.
              </p>
            </div>

            <div className="terms-card">
              <h3 className="terms-mission-title">Nossa Missão</h3>
              <hr className="terms-mission-divider" />
              <div className="terms-mission-list">
                <div className="terms-mission-item">
                  <svg
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Conectar famílias e ONGs</span>
                </div>
                <div className="terms-mission-item">
                  <svg
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Garantir segurança infantil</span>
                </div>
                <div className="terms-mission-item">
                  <svg
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
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>Fortalecer comunidades</span>
                </div>
              </div>
            </div>

            <div className="terms-card">
              <h3 className="terms-accept-title">Aceitar Termos e Condições</h3>
              <p className="terms-accept-text">
                Ao clicar em "Aceitar", você confirma que leu e concorda com todos os termos apresentados.
              </p>
              <button className="terms-accept-btn" onClick={handleAcceptTerms}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Aceitar Termos
              </button>
              <button className="terms-refuse-btn" onClick={handleCloseTermsModal}>
                <svg
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Recusar
              </button>

              {termsAccepted && (
                <div className="terms-success-message">Obrigada por aceitar os Termos da OportunyFam!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal "Faça parte" */}
      {showJoinModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="join-modal-card">
            <button className="modal-exit" onClick={handleCloseJoinModal} aria-label="Fechar">
              ✕
            </button>

            <h1 className="join-modal-title">Faça parte</h1>

            <div className="join-form">
              {/* Campo Nome */}
              <div className="join-input-group">
                <div className="join-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  type="text"
                  className="join-input"
                  placeholder="Nome"
                  value={joinFormData.name}
                  onChange={(e) => handleJoinFormChange('name', e.target.value)}
                />
              </div>

              {/* Campo Email */}
              <div className="join-input-group">
                <div className="join-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  className="join-input"
                  placeholder="Email"
                  value={joinFormData.email}
                  onChange={(e) => handleJoinFormChange('email', e.target.value)}
                />
              </div>

              {/* Campo Telefone */}
              <div className="join-input-group">
                <div className="join-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.7-6.7A19.79 19.79 0 0 1 2 4.18V2.18a2 2 0 0 1 2-2h3.18a2 2 0 0 1 2 1.72 17.5 17.5 0 0 0 .58 3.42c.16.59-.14 1.25-.76 1.54l-1.4 1.23a17.65 17.65 0 0 0 6.7 6.7l1.23-1.4a2 2 0 0 1 1.54-.76c.72.16 1.44.27 2.16.33a2 2 0 0 1 1.72 2z"/>
                  </svg>
                </div>
                <input
                  type="tel"
                  className="join-input"
                  placeholder="11 99999-9999"
                  value={joinFormData.phone}
                  onChange={(e) => handleJoinFormChange('phone', e.target.value)}
                />
              </div>

              {/* Dropdown Atividades */}
              <div className="join-input-group">
                <div className="join-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                  </svg>
                </div>
                <div className="join-dropdown-wrapper">
                  <button
                    className="join-dropdown-button"
                    onClick={() => setShowActivitiesDropdown(!showActivitiesDropdown)}
                  >
                    {selectedActivity || "Atividades disponíveis"}
                    <svg 
                      className={`join-dropdown-arrow ${showActivitiesDropdown ? 'rotated' : ''}`}
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  
                  {showActivitiesDropdown && (
                    <div className="join-dropdown-menu">
                      {availableActivities.map((activity, index) => (
                        <div 
                          key={index}
                          className="join-activity-item"
                          onClick={() => handleActivitySelect(activity.name)}
                        >
                          <div className="join-activity-icon">
                            {activity.name === "Futebol" && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                                <path d="M2 12h20"/>
                              </svg>
                            )}
                            {activity.name === "Basquete" && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
                              </svg>
                            )}
                            {activity.name === "Badminton" && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.21 2.31-.48 3.43-.84"/>
                                <path d="M22 12c0 5.52-4.48 10-10 10s-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10z"/>
                              </svg>
                            )}
                          </div>
                          <span className="join-activity-name">{activity.name}</span>
                          <span className="join-activity-count">{activity.count}</span>
                          <svg 
                            className="join-activity-arrow"
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mensagem de Sucesso */}
              {showSuccessMessage && (
                <div className="join-success-message">
                  Atividade Escolhida com Sucesso
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="join-modal-actions">
              <button className="join-btn-back" onClick={handleCloseJoinModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Voltar
              </button>
              <button className="join-btn-advance">
                Avançar
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
