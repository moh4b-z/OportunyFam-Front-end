"use client";

import React, { useState, useEffect } from "react";
// CORREÇÃO 1: O caminho para styles agora sobe dois níveis para chegar em 'src/' e desce para 'app/styles'
import styles from "../../app/styles/Perfil.module.css"; 
import TermsModal from "../modals/TermsModal"; 

interface PerfilProps {
  user?: {
    nome?: string;
    foto_perfil?: string;
  } | null;
  hasNotifications?: boolean;
  onProfileClick?: () => void;
  onMenuItemClick?: (action: string) => void;
  onLogout?: () => Promise<void> | void; 
}

const Perfil: React.FC<PerfilProps> = ({
  user,
  hasNotifications = false,
  onProfileClick,
  onMenuItemClick,
  onLogout,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Carregar tema do localStorage na inicialização
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isLoginPage = window.location.pathname === '/login';
    
    // Se estiver na página de login, sempre usar tema claro
    if (isLoginPage) {
      setIsDarkMode(false);
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      return;
    }
    
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
    // Verifica se estamos na página de login
    const isLoginPage = window.location.pathname === '/login';
    
    // Se estiver na página de login, não aplica tema escuro
    if (isLoginPage) {
      return;
    }
    
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

  const handleProfileClick = () => {
    setShowMenu(!showMenu);
    onProfileClick?.();
  };

  const handleMenuItemClick = (action: string) => {
    // Chama a função externa se existir
    onMenuItemClick?.(action);
    
    // Gerencia os modais locais e funcionalidades
    if (action === 'logout') {
      // O logout é gerenciado pela página principal através de onMenuItemClick
      setShowMenu(false); // Fecha menu apenas para logout
      return;
    }
    
    if (action === 'terms') {
      setShowTermsModal(true);
      setShowMenu(false); // Fecha menu para abrir modal
      return;
    }
    
    if (action === 'theme') {
      toggleTheme();
      // NÃO fecha o menu para mudança de tema
      return;
    }
    
    // Para outras ações, fecha o menu
    setShowMenu(false);
  };

  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
  };

  // Usar useEffect para detectar cliques fora do componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMenu && !target.closest(`.${styles.profileContainer}`)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <>
      {/* Container de perfil sem overlay */}
      <div className={styles.profileContainer}>
        {/* ... (Conteúdo da Bolinha do Perfil) ... */}
        <div
          className={styles.profileWrapper}
          onClick={handleProfileClick}
        >
          {user?.foto_perfil ? (
            <img
              src={user.foto_perfil}
              alt="Perfil"
              className={styles.profileImage}
            />
          ) : (
            <svg
              className={styles.profileIcon}
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}

          {/* Ponto de notificação */}
          {hasNotifications && (
            <div className={styles.notifDot}></div>
          )}
        </div>

        {/* Menu do Perfil */}
        {showMenu && (
          <div className={styles.profileMenu}>
            {user ? (
              <>
                <div className={styles.menuItem} onClick={() => handleMenuItemClick('profile')}>
                  <span>Conta</span> 
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                <div className={styles.menuItem} onClick={() => handleMenuItemClick('notification')}>
                  <span>Notificação</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>

                <div className={styles.menuItem} onClick={() => handleMenuItemClick('theme')}>
                  <span>Tema</span> 
                  <div className={styles.themeToggle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <div className={`${styles.switch} ${isDarkMode ? styles.switchActive : ''}`}>
                      <div className={styles.switchSlider}></div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.menuItem} onClick={() => handleMenuItemClick('terms')}>
                  <span>Termos e Condições</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 10 1" />
                  </svg>
                </div>
                
                <hr className={styles.menuDivider} />

                {/* ITEM DE SAIR DA CONTA */}
                <div 
                  className={`${styles.menuItem} ${styles.logoutItem}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMenuItemClick('logout');
                  }}
                >
                  <span>Sair de Conta</span> 
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16,17 21,12 16,7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
              </>
            ) : (
              <div className={styles.menuItem} onClick={() => handleMenuItemClick('login')}>
                <span>Fazer Login</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10,17 15,12 10,7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RENDERIZAÇÃO DA MODAL DE TERMOS */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={handleCloseTermsModal}
      />
    </>
  );
};

export default Perfil;
