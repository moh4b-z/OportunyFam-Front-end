"use client";

import React from "react";
import styles from "../../app/styles/SimpleAccountModal.module.css";

interface SimpleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const SimpleAccountModal: React.FC<SimpleAccountModalProps> = ({ isOpen, onClose, userName }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Minha Conta</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <h3>{userName}</h3>
            <p>Usuário</p>
          </div>
          
          <div className={styles.menuList}>
            <div className={styles.menuItem}>
              <span>✏️ Editar Perfil</span>
            </div>
            <div className={styles.menuItem}>
              <span>🔒 Alterar Senha</span>
            </div>
            <div className={styles.menuItem}>
              <span>📄 Dados Pessoais</span>
            </div>
            <div className={styles.menuItem}>
              <span>⚙️ Configurações</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAccountModal;
