"use client";

import { useEffect, useState } from "react";

interface BarraLateralProps {
  onConversationsClick?: () => void;
  onChildRegistrationClick?: () => void;
  onAccountClick?: () => void;
  onPublicationsClick?: () => void;
  onLogoutClick?: () => void;
  isConversationsOpen?: boolean;
  isChildRegistrationOpen?: boolean;
  isAccountOpen?: boolean;
  isPublicationsOpen?: boolean;
  userTipo?: 'usuario' | 'instituicao' | 'crianca';
}

export default function BarraLateral({ 
  onConversationsClick, 
  onChildRegistrationClick, 
  onAccountClick,
  onPublicationsClick,
  onLogoutClick,
  isConversationsOpen, 
  isChildRegistrationOpen,
  isAccountOpen,
  isPublicationsOpen,
  userTipo
}: BarraLateralProps) {
  // Instituições não têm botão de crianças, mas têm botão de publicações
  const showChildrenButton = userTipo !== 'instituicao';
  const showPublicationsButton = userTipo === 'instituicao';
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Carregar tema do localStorage na inicialização
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      setIsDarkMode(false);
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, []);

  // Função para alternar tema
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleIconClick = (iconName: string) => {
    setActiveIcon(activeIcon === iconName ? null : iconName);
  };

  useEffect(() => {
    // Sincroniza estado visual com os paineis abertos/fechados
    if (isConversationsOpen === false && activeIcon === 'messages') setActiveIcon(null);
    if (isChildRegistrationOpen === false && activeIcon === 'child-registration') setActiveIcon(null);
    if (isAccountOpen === false && activeIcon === 'account') setActiveIcon(null);
    if (isPublicationsOpen === false && activeIcon === 'publications') setActiveIcon(null);

    if (isConversationsOpen) setActiveIcon('messages');
    if (isChildRegistrationOpen) setActiveIcon('child-registration');
    if (isAccountOpen) setActiveIcon('account');
    if (isPublicationsOpen) setActiveIcon('publications');
  }, [isConversationsOpen, isChildRegistrationOpen, isAccountOpen, isPublicationsOpen]);

  return (
    <aside className="sidebar">
      <div className="logo-placeholder">
        <img src="/img/logo.png" alt="OportunityFam Logo" className="logo-img" />
      </div>

      <div className="icon-panel">
        {/* Mensagens */}
        <button
          className={`icon-btn ${activeIcon === "messages" ? "active" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { handleIconClick("messages"); onConversationsClick?.(); }}
          aria-label="Mensagens"
          title="Mensagens"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Crianças - apenas para usuários (responsáveis), não para instituições */}
        {showChildrenButton && (
          <button
            className={`icon-btn ${activeIcon === "child-registration" ? "active" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { handleIconClick("child-registration"); onChildRegistrationClick?.(); }}
            aria-label="Crianças"
            title="Crianças"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Rosto da criança */}
              <circle cx="12" cy="9" r="7" />
              {/* Cabelo/topete */}
              <path d="M8 3c2-2 6-2 8 0" />
              {/* Olhos */}
              <circle cx="9.5" cy="8" r="1.2" fill="currentColor" />
              <circle cx="14.5" cy="8" r="1.2" fill="currentColor" />
              {/* Sorriso */}
              <path d="M9 12c1.5 2 4.5 2 6 0" />
              {/* Corpo */}
              <path d="M12 16v5" />
              <path d="M8 21h8" />
            </svg>
          </button>
        )}

        {/* Publicações - apenas para instituições */}
        {showPublicationsButton && (
          <button
            className={`icon-btn ${activeIcon === "publications" ? "active" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { handleIconClick("publications"); onPublicationsClick?.(); }}
            aria-label="Publicações"
            title="Publicações"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </button>
        )}

        {/* Conta */}
        <button
          className={`icon-btn ${activeIcon === "account" ? "active" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { handleIconClick("account"); onAccountClick?.(); }}
          aria-label="Minha Conta"
          title="Minha Conta"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* Tema */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Alternar Tema"
          title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      <div className="spacer" />

      {/* Botão de Logout fixo na parte inferior */}
      <div className="icon-panel icon-panel-bottom">
        <button
          className="icon-btn icon-btn-logout"
          onClick={onLogoutClick}
          aria-label="Sair"
          title="Sair"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

    </aside>
  );
}