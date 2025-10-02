"use client"

import { MouseEventHandler } from 'react';

// Tipagem das propriedades que o componente receberá
interface InstitutionDetailModalProps {
  onClose: MouseEventHandler<HTMLButtonElement>;
}

export default function InstitutionDetailModal({ onClose }: InstitutionDetailModalProps) {
  // URL da imagem da Instituição Água Viva (fornecida anteriormente)
  const logoUrl = "https://static.wixstatic.com/media/b12d01_3b32456f44844df8b16019c72d691029~mv2.png/v1/fill/w_296,h_296,al_c,lg_1,q_85,enc_avif,quality_auto/Logotipo-original.png";

  return (
    <div className="search-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="inst-agua-viva-title">
      <div className="search-modal-card">
        {/* Botão 'X' para fechar a tela */}
        <button className="search-modal-exit" onClick={onClose} aria-label="Fechar tela de detalhes">
          ✕
        </button>
        
        {/* =============================================== */}
        {/* 1. CABEÇALHO (Logo, Título e Avaliação) */}
        {/* =============================================== */}
        <div className="inst-header">
          <div className="inst-logo-circle">
            <img
              src={logoUrl}
              alt="Logo da Inst. Água Viva"
              className="inst-logo-img"
            />
          </div>

          <div className="inst-info">
            <h2 id="inst-agua-viva-title" className="inst-title">Inst. Água Viva</h2>
            <p className="inst-subtitle">Instituição de Ensino</p>
            <div className="inst-rating">
              {/* Estrelas de 5.0 */}
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="star-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              ))}
              <span className="rating-text">5.0</span>
              <span className="rating-text">({(450).toLocaleString("pt-BR")})</span>
            </div>
          </div>
        </div>

        {/* =============================================== */}
        {/* 2. BOTÕES DE AÇÃO */}
        {/* =============================================== */}
        <div className="inst-actions">
          <button className="btn-orange-outline">Sobre nós</button>
          <button className="btn-orange-outline">Faça parte</button>
          <button className="btn-orange-outline">Associados</button>
        </div>

        {/* =============================================== */}
        {/* 3. DESCRIÇÃO (A Rede Água Viva...) */}
        {/* =============================================== */}
        <div className="inst-description-block interactive-card">
          <p className="inst-description-text">
            A Rede Água Viva pela Mudança Social reúne organizações que atuam com o esporte como fator de desenvolvimento humano. Na busca por trazer visibilidade ao trabalho das organizações e evidenciar o poder transformador do ensino.
          </p>
        </div>
        
        {/* =============================================== */}
        {/* 4. NOSSAS INFORMAÇÕES */}
        {/* =============================================== */}
        <div className="info-block interactive-card">
          <h3 className="info-title">Nossas Informações</h3>
          
          <div className="info-item">
            {/* Ícone de Localização */}
            <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span className="info-value">
              R. Interna Grupo Bandeirante, 29 - Vila Militar, Barueri - SP, 06442-130
            </span>
          </div>

          <div className="info-item">
            {/* Ícone de Telefone */}
            <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.7-6.7A19.79 19.79 0 0 1 2 4.18V2.18a2 2 0 0 1 2-2h3.18a2 2 0 0 1 2 1.72 17.5 17.5 0 0 0 .58 3.42c.16.59-.14 1.25-.76 1.54l-1.4 1.23a17.65 17.65 0 0 0 6.7 6.7l1.23-1.4a2 2 0 0 1 1.54-.76c.72.16 1.44.27 2.16.33a2 2 0 0 1 1.72 2z" /></svg>
            <span className="info-value">(11) 9999-9900</span>
          </div>

          <div className="info-item">
            {/* Ícone de Relógio */}
            <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span className="info-value">
              <span className="info-status-open">Aberto</span>, Fecha às 16:00
            </span>
          </div>

        </div>

        {/* =============================================== */}
        {/* 5. CONHEÇA NOSSA INSTITUIÇÃO (Galeria de Fotos) */}
        {/* =============================================== */}
        <h3 className="gallery-title">Conheça nossa instituição</h3>
        
        <div className="gallery-container">
          {/* Cards de Imagem (usando divs vazias como placeholder para as fotos) */}
          <div className="gallery-card interactive-card">
            <div className="gallery-image" role="img" aria-label="Foto da Instituição 1" />
          </div>

          <div className="gallery-card interactive-card">
            <div className="gallery-image" role="img" aria-label="Foto da Instituição 2" />
          </div>

          <div className="gallery-card interactive-card">
            <div className="gallery-image" role="img" aria-label="Foto da Instituição 3" />
          </div>
        </div>

      </div>
    </div>
  );
}