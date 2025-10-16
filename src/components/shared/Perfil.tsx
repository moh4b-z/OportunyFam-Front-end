"use client";

import React, { useState } from "react";
import styles from "../../app/styles/Perfil.module.css";

interface PerfilProps {
  user?: {
    nome?: string;
    foto_perfil?: string;
  } | null;
  hasNotifications?: boolean;
  onProfileClick?: () => void;
  onMenuItemClick?: (action: string) => void;
}

const Perfil: React.FC<PerfilProps> = ({
  user,
  hasNotifications = false,
  onProfileClick,
  onMenuItemClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleProfileClick = () => {
    setShowMenu(!showMenu);
    onProfileClick?.();
  };

  const handleMenuItemClick = (action: string) => {
    onMenuItemClick?.(action);
    setShowMenu(false);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowMenu(false);
    }
  };

  return (
    <>
      {/* Overlay para fechar o menu ao clicar fora */}
      {showMenu && (
        <div
          className={styles.overlay}
          onClick={handleClickOutside}
        />
      )}

      <div className={styles.profileContainer}>
        {/* Bolinha do Perfil */}
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
                  <span>Meu Perfil</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                <div className={styles.menuItem} onClick={() => handleMenuItemClick('settings')}>
                  <span>Configurações</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6" />
                    <path d="M1 12h6m6 0h6" />
                  </svg>
                </div>

                <div className={styles.menuItem} onClick={() => handleMenuItemClick('theme')}>
                  <span>Tema Escuro</span>
                  <div className={styles.switch}>
                    <input type="checkbox" />
                    <span className={`${styles.slider} ${styles.round}`}></span>
                  </div>
                </div>

                <hr className={styles.menuDivider} />

                <div className={styles.menuItem} onClick={() => handleMenuItemClick('help')}>
                  <span>Ajuda</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>

                <div className={styles.menuItem} onClick={() => handleMenuItemClick('logout')}>
                  <span>Sair</span>
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
    </>
  );
};

export default Perfil;
