"use client";

import React from "react";
import styles from "../../app/styles/SimpleAccountModal.module.css";
import { UsuarioProfile, InstituicaoProfile, CriancaProfile } from './profiles';

interface SimpleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  email?: string;
  phone?: string;
  userId?: number;
  foto_perfil?: string;
  cnpj?: string;
  endereco?: any;
  descricao?: string;
  data_nascimento?: string;
  cpf?: string;
  onUserUpdate?: (updatedData: { nome?: string; email?: string; telefone?: string }) => void;
  onAvatarUpdate?: (url: string) => void;
  userType?: 'usuario' | 'instituicao' | 'crianca';
  institutionFullData?: any;
}

const SimpleAccountModal: React.FC<SimpleAccountModalProps> = ({
  isOpen,
  onClose,
  userName,
  email,
  phone,
  userId,
  foto_perfil,
  cnpj,
  endereco,
  descricao,
  data_nascimento,
  cpf,
  onUserUpdate,
  onAvatarUpdate,
  userType = 'usuario',
  institutionFullData,
}) => {
  if (!isOpen) return null;

  const id = userId?.toString() || '0';

  const renderProfileByType = () => {
    switch (userType) {
      case 'usuario':
        return (
          <UsuarioProfile
            id={id}
            nome={userName}
            email={email || ''}
            telefone={phone || ''}
            foto_perfil={foto_perfil}
            onAvatarUpdate={onAvatarUpdate}
            onDataUpdate={onUserUpdate}
          />
        );
      
      case 'instituicao':
        return (
          <InstituicaoProfile
            id={id}
            onAvatarUpdate={onAvatarUpdate}
            onDataUpdate={onUserUpdate}
          />
        );
      
      case 'crianca':
        return (
          <CriancaProfile
            id={id}
            nome={userName}
            email={email || ''}
            telefone={phone || ''}
            foto_perfil={foto_perfil}
            data_nascimento={data_nascimento}
            cpf={cpf}
            onAvatarUpdate={onAvatarUpdate}
            onDataUpdate={onUserUpdate}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={styles.overlay}
      onClick={onClose}
    >
      <div 
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className={styles.content}>
          {renderProfileByType()}
        </div>
      </div>
    </div>
  );
};

export default SimpleAccountModal;
