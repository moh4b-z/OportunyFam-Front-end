"use client"

import { useState, useEffect } from "react"
import BarraLateral from "@/app/component/barralateral"

export default function Home() {
  const [showModal, setShowModal] = useState<boolean>(true)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState("light")
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

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

  return (
    <>
      <div className={showModal ? "app-root blurred" : "app-root"}>
        <BarraLateral />

        <main className="map-area">
          <header className="main-header">
            <div className={`search-and-chips ${searchFocused ? "search-and-chips-active" : ""}`}>
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
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>

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
    </>
  )
}
