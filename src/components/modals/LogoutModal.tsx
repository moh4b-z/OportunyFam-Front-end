"use client";

import React from "react";
import styles from "../../app/styles/Logout.module.css";

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  console.log("LogoutModal renderizado, isOpen:", isOpen);
  
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed' as const,
        inset: 0,
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.6)'
      }}
      onClick={handleOverlayClick}
    >
      <div 
        style={{
          background: '#4a4a4a',
          color: 'white',
          padding: '30px 40px',
          borderRadius: '12px',
          textAlign: 'center' as const,
          minWidth: '320px',
          maxWidth: '400px'
        }}
      >
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '500' as const, 
          margin: '0 0 25px 0' 
        }}>
          Deseja sair da conta?
        </h2>

        <div style={{ 
          display: 'flex' as const, 
          gap: '15px', 
          justifyContent: 'center' as const 
        }}>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: '#f4a261',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600' as const,
              cursor: 'pointer' as const,
              minWidth: '80px'
            }}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'white',
              color: '#333',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600' as const,
              cursor: 'pointer' as const,
              minWidth: '80px'
            }}
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;