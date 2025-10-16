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

  // Função para lidar com o clique no botão "Sim" (cancelar o logout na modal, ou seja, voltar)
  const handleCancel = (event: React.MouseEvent) => {
    // Na imagem, o botão "SIM" está na cor mais neutra, o que geralmente em UX significa CANCELAR ou AÇÃO SECUNDÁRIA.
    // O "NÃO" está na cor laranja (primária) que geralmente significa CONFIRMAR.
    // Vamos manter a lógica da modal: "Quer mesmo sair da conta?"
    // Botão SIM -> Sim, quero sair -> onConfirmLogout (Ação laranja na imagem)
    // Botão NÃO -> Não, não quero sair -> onClose (Ação neutra na imagem)
    // Para manter a coerência da pergunta e da cor na imagem:
    // Ação Principal/Laranja: Sair (Sim)
    // Ação Secundária/Branca: Cancelar (Não)
    // No entanto, para ser fiel à imagem enviada (que tem as cores trocadas, laranjado em "Não" e cinza em "Sim"),
    // vou *inverter* os handlers para que a cor siga a ação visual:
    event.stopPropagation();
    onClose(); // O botão "Sim" na cor cinza, que é a posição da "Negativa" (Não sair)
  };

  // Função para lidar com o clique no botão "Não" (confirmar o logout na modal, ou seja, sair)
  const handleConfirm = (event: React.MouseEvent) => {
    event.stopPropagation();
    onConfirmLogout(); // O botão "Não" na cor laranja, que é a posição da "Confirmação" (Sair)
  };

  // Renderização da modal.
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modalText}>Quer mesmo sair da conta?</p>
        <div className={styles.modalActions}>
          {/* O botão "Sim" na posição esquerda, cor neutra (CANCELAR A AÇÃO DE SAIR) */}
          <button
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={handleCancel}
            type="button"
          >
            Sim
          </button>
          {/* O botão "Não" na posição direita, cor primária (CONFIRMAR A AÇÃO DE SAIR) */}
          <button
            className={`${styles.modalButton} ${styles.confirmButton}`}
            onClick={handleConfirm}
            type="button"
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
