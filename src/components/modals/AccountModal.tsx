"use client";

import React, { useRef } from "react";
import styles from "../../app/styles/AccountModal.module.css";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    nome: string;
    foto_perfil?: string;
    email?: string;
    role?: string;
  };
  onPhotoUpdate?: (photoUrl: string | null) => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, user, onPhotoUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!isOpen) return null;

  const handleMenuClick = (action: string) => {
    console.log(`Ação selecionada: ${action}`);
    // Aqui você pode implementar a navegação ou ações específicas
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string;
        onPhotoUpdate?.(photoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoUpdate?.(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header do modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>Minha Conta</h2>
            <p className={styles.modalSubtitle}>Gerencie suas informações pessoais</p>
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        {/* Conteúdo do modal */}
        <div className={styles.modalBody}>
          {/* Seção do perfil */}
          <div className={styles.profileSection}>
            <div className={styles.profileImageContainer}>
              <div className={styles.profileImage}>
                {user.foto_perfil ? (
                  <img src={user.foto_perfil} alt="Foto do perfil" />
                ) : (
                  <div className={styles.profilePlaceholder}>
                    <span className={styles.initials}>{getInitials(user.nome)}</span>
                  </div>
                )}
              </div>
              <div className={styles.statusIndicator}></div>
              
              {/* Botões de foto */}
              <div className={styles.photoButtons}>
                <button 
                  className={styles.photoButton}
                  onClick={handleAddPhoto}
                  title="Adicionar Foto"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                    <circle cx="12" cy="13" r="3"></circle>
                  </svg>
                  Adicionar Foto
                </button>
                
                {user.foto_perfil && (
                  <button 
                    className={`${styles.photoButton} ${styles.removeButton}`}
                    onClick={handleRemovePhoto}
                    title="Excluir Foto"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Excluir Foto
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.userName}>{user.nome}</h3>
              <p className={styles.userEmail}>{user.email || 'usuario@exemplo.com'}</p>
              <div className={styles.userBadge}>
                <span className={styles.badgeText}>{user.role || 'Usuário Premium'}</span>
              </div>
            </div>
          </div>

          {/* Menu de opções */}
          <div className={styles.menuSection}>
            <div className={styles.menuGroup}>
              <h4 className={styles.menuGroupTitle}>Perfil</h4>
              
              <button 
                className={styles.menuItem}
                onClick={() => handleMenuClick('editar-perfil')}
              >
                <div className={styles.menuIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <span className={styles.menuText}>Editar Perfil</span>
                  <span className={styles.menuDescription}>Altere suas informações pessoais</span>
                </div>
                <div className={styles.menuArrow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </div>
              </button>

              <button 
                className={styles.menuItem}
                onClick={() => handleMenuClick('dados-pessoais')}
              >
                <div className={styles.menuIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <span className={styles.menuText}>Dados Pessoais</span>
                  <span className={styles.menuDescription}>Gerencie seus dados e documentos</span>
                </div>
                <div className={styles.menuArrow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </div>
              </button>
            </div>

            <div className={styles.menuGroup}>
              <h4 className={styles.menuGroupTitle}>Segurança</h4>
              
              <button 
                className={styles.menuItem}
                onClick={() => handleMenuClick('alterar-senha')}
              >
                <div className={styles.menuIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <span className={styles.menuText}>Alterar Senha</span>
                  <span className={styles.menuDescription}>Mantenha sua conta segura</span>
                </div>
                <div className={styles.menuArrow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </div>
              </button>

              <button 
                className={styles.menuItem}
                onClick={() => handleMenuClick('configuracoes')}
              >
                <div className={styles.menuIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <span className={styles.menuText}>Configurações</span>
                  <span className={styles.menuDescription}>Preferências e notificações</span>
                </div>
                <div className={styles.menuArrow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </div>
              </button>
            </div>

            <div className={styles.menuGroup}>
              <button 
                className={`${styles.menuItem} ${styles.logoutItem}`}
                onClick={() => handleMenuClick('logout')}
              >
                <div className={styles.menuIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </div>
                <div className={styles.menuContent}>
                  <span className={styles.menuText}>Sair da Conta</span>
                  <span className={styles.menuDescription}>Fazer logout do sistema</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
