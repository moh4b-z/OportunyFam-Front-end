import React, { ReactNode, MouseEvent } from "react";

type ModalOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
};

const ModalOverlay: React.FC<ModalOverlayProps> = ({
  isOpen,
  onClose,
  children,
  closeOnOutsideClick = true,
}) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOutsideClick) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackgroundClick}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        {/* Conteúdo do modal */}
        {children}
      </div>
    </div>
  );
};

export default ModalOverlay;