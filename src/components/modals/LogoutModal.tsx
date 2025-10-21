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
  console.log('💥 LogoutModal renderizado com isOpen:', isOpen);
  
  // Se a modal não estiver aberta, não renderiza nada
  if (!isOpen) {
    console.log('💥 Modal não está aberta, não renderizando');
    return null;
  }
  
  console.log('💥 Modal ESTÁ aberta, renderizando conteúdo');

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
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modalText}>Quer mesmo sair da conta?</p>
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
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
