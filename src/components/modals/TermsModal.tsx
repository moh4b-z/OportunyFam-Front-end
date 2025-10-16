"use client";

import React, { useState, useEffect } from 'react';
import "../../app/styles/TermsModal.css";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Função para aceitar os termos
  const handleAcceptTerms = () => {
    setShowSuccessMessage(true);
    
    // Fechar o modal após 3 segundos
    setTimeout(() => {
      setShowSuccessMessage(false);
      onClose();
    }, 3000);
  };

  // Função para recusar os termos
  const handleRefuseTerms = () => {
    onClose();
  };

  // Reset do estado quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setShowSuccessMessage(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="terms-modal-overlay">
      <div className="terms-modal-card">
        {/* Header com botão de voltar */}
        <div className="terms-modal-header">
          <button className="terms-back-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="terms-header-title">OportunyFam</h1>
        </div>
        
        <hr className="terms-header-divider" />

        {/* Ícone circular laranja */}
        <div className="terms-icon-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>

        {/* Título e subtítulo */}
        <h2 className="terms-title">Termos e Condições de Uso</h2>
        <p className="terms-subtitle">
          Transparência e segurança para conectar famílias e<br />
          ONGs de forma responsável e confiável.
        </p>

        {/* Card de Boas-vindas */}
        <div className="terms-card">
          <div className="terms-card-header">
            <div style={{
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #f4a261 0%, #e79e21 100%)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>👋</span>
            </div>
            <h3 className="terms-card-title">Bem-vindo à OportunyFam</h3>
          </div>
          <p className="terms-card-text">
            Nossa plataforma conecta mães, famílias e ONGs para criar uma<br />
            rede de apoio segura e organizada.
          </p>
          <p className="terms-card-text-bold">
            Ao utilizar nossa plataforma, você concorda com os termos estabelecidos neste documento. Nossa 
            missão é promover a inclusão social e fortalecer vínculos comunitários através da tecnologia, 
            sempre priorizando a segurança e bem-estar das crianças e famílias.
          </p>
        </div>

        {/* Card Nossa Missão */}
        <div className="terms-card">
          <h3 className="terms-mission-title">Nossa Missão</h3>
          <hr className="terms-mission-divider" />
          <div className="terms-mission-list">
            <div className="terms-mission-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Conectar famílias e ONGs</span>
            </div>
            <div className="terms-mission-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
                <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"/>
              </svg>
              <span>Garantir segurança infantil</span>
            </div>
            <div className="terms-mission-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <span>Fortalecer comunidades</span>
            </div>
          </div>
        </div>

        {/* Card Aceitar Termos */}
        <div className="terms-card">
          <h3 className="terms-accept-title">Aceitar Termos e Condições</h3>
          <p className="terms-accept-text">
            Ao clicar em "Aceitar", você confirma que leu e concorda com todos os<br />
            termos apresentados.
          </p>
          
          {!showSuccessMessage ? (
            <>
              <button className="terms-accept-btn" onClick={handleAcceptTerms}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Aceitar
              </button>
              <button className="terms-refuse-btn" onClick={handleRefuseTerms}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Recusar
              </button>
            </>
          ) : (
            <div className="terms-success-message">
              Obrigada por aceitar os termos da OportunyFam
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
