import React from 'react';
// Importa o módulo CSS para estilização (assumindo que está em src/app/styles ou similar)
import styles from '../../app/styles/Logout.module.css';

// Definição das props que o componente LogoutModal irá receber
interface LogoutModalProps {
  isOpen: boolean; // Indica se a modal deve estar visível
  onClose: () => void; // Função para fechar a modal (cancelar)
  onConfirmLogout: () => void; // Função para confirmar o logout (sair da conta)
}

/**
 * Componente funcional para exibir a modal de confirmação de logout com o design solicitado.
 */
const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirmLogout }) => {
  // Se a modal não estiver aberta, não renderiza nada
  if (!isOpen) {
    return null;
  }

  // Função para cancelar o logout (botão "Cancelar")
  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClose();
  };

  // Função para confirmar o logout (botão "Sair")
  const handleConfirm = (event: React.MouseEvent) => {
    event.stopPropagation();
    onConfirmLogout();
  };

  // Renderização da modal.
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {/* Ícone de saída */}
        <div className={styles.modalIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        
        {/* Texto de confirmação */}
        <p className={styles.modalText}>Tem certeza que deseja sair da sua conta?</p>
        
        {/* Texto de aviso */}
        <p className={styles.modalSubtext}>Você precisará fazer login novamente para acessar sua conta.</p>
        
        <div className={styles.modalActions}>
          {/* Botão para cancelar o logout */}
          <button
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={handleCancel}
            type="button"
          >
            Cancelar
          </button>
          {/* Botão para confirmar o logout */}
          <button
            className={`${styles.modalButton} ${styles.confirmButton}`}
            onClick={handleConfirm}
            type="button"
          >
            Sim, Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
