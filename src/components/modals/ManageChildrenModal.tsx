"use client";

import React from "react";
import styles from "../../app/styles/ManageChildrenModal.module.css";

interface ManageChildrenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageChildrenModal: React.FC<ManageChildrenModalProps> = ({ isOpen, onClose }) => {
  console.log('ManageChildrenModal renderizado - isOpen:', isOpen);
  
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={handleOverlayClick}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 0, 0, 0.5)', // Fundo vermelho temporário para debug
        zIndex: 99999
      }}
    >
      <div className={styles.modal}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>Gerenciar Filhos</h2>
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className={styles.body}>
            <p className={styles.description}>
              Aqui você pode gerenciar as informações dos seus filhos, adicionar novos filhos ou remover existentes.
            </p>
            
            <div className={styles.childrenList}>
              <div className={styles.childCard}>
                <div className={styles.childInfo}>
                  <div className={styles.childAvatar}>
                    <span>F1</span>
                  </div>
                  <div className={styles.childDetails}>
                    <h3>Filho 1</h3>
                    <p>12 anos</p>
                  </div>
                </div>
                <div className={styles.childActions}>
                  <button className={styles.editButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button className={styles.deleteButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.childCard}>
                <div className={styles.childInfo}>
                  <div className={styles.childAvatar}>
                    <span>F2</span>
                  </div>
                  <div className={styles.childDetails}>
                    <h3>Filho 2</h3>
                    <p>8 anos</p>
                  </div>
                </div>
                <div className={styles.childActions}>
                  <button className={styles.editButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button className={styles.deleteButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button className={styles.addButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Adicionar Filho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageChildrenModal;
