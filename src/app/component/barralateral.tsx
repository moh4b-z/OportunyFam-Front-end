"use client"

import { useState } from "react"

// SVG de exemplo para o novo ícone (Lupa - Search)
// Você pode substituir por qualquer outro SVG de sua preferência.
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    {...props}
  >
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </svg>
)

// SVG de exemplo para o botão (Seta para cima)
// Substitua por um ícone de sua preferência, como um ícone de perfil ou configurações
const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    {...props}
  >
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
)


export default function BarraLateral() {
  const [activeIcon, setActiveIcon] = useState<string | null>(null)

  const handleIconClick = (iconName: string) => {
    setActiveIcon(activeIcon === iconName ? null : iconName)
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo-placeholder">
        <img src="/img/logo.png" alt="OportunityFam Logo" className="logo-img" />
      </div>

      {/* Ícones de navegação */}
      <div className="icon-panel">
        {/* Ícone de notificação */}
        <button
          className={`icon-btn ${activeIcon === "notification" ? "active" : ""}`}
          onClick={() => handleIconClick("notification")}
          aria-label="Notificações"
        >
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>

        {/* Ícone de mensagens */}
        <button
          className={`icon-btn ${activeIcon === "messages" ? "active" : ""}`}
          onClick={() => handleIconClick("messages")}
          aria-label="Mensagens"
        >
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Ícone de localização */}
        <button
          className={`icon-btn ${activeIcon === "location" ? "active" : ""}`}
          onClick={() => handleIconClick("location")}
          aria-label="Localização"
        >
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
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>

        {/* Ícone de comunidade */}
        <button
          className={`icon-btn ${activeIcon === "community" ? "active" : ""}`}
          onClick={() => handleIconClick("community")}
          aria-label="Comunidade"
        >
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>

        {/* NOVO ÍCONE */}
        <button
          className={`icon-btn ${activeIcon === "new-feature" ? "active" : ""}`}
          onClick={() => handleIconClick("new-feature")}
          aria-label="Nova Funcionalidade"
        >
          <SearchIcon />
        </button>
      </div>
      
      {/* Espaçador para empurrar a seção de baixo */}
      <div className="spacer" />

      {/* NOVA SEÇÃO INFERIOR */}
      <div className="sidebar-bottom">
        {/* Ícone customizado (área para foto/svg) */}
        <div className="bottom-icon-placeholder" aria-label="Ícone de Usuário">
          {/* Adicione o SVG/Imagem aqui. Estou usando um SVG de exemplo */}
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
            className="bottom-icon-svg"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        {/* Botão abaixo do ícone */}
        <button
          className="bottom-action-btn"
          onClick={() => console.log("Botão de ação clicado")}
          aria-label="Configurações/Ação Principal"
        >
          <ArrowUpIcon />
        </button>
      </div>
    </aside>
  )
}