"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  // índice do ícone ativo (null = nenhum)
  const [activeIcon, setActiveIcon] = useState<number | null>(null);
  // modal
  const [showModal, setShowModal] = useState<boolean>(true);

  const icons = ['/icons-notif.svg', 'icons-chat.svg', 'icons-pin.svg', 'icons-people.svg'];

  return (
    <>
      {/* O conteúdo que recebe o blur */}
      <div className={showModal ? "app-root blurred" : "app-root"}>
        {/* Sidebar amarela fixa à esquerda */}
        <aside className="sidebar">
          {/* QUADRADO VERMELHO -> LOGO */}
          <div className="logo-box">
            <img src="/logo-branca.png" alt="Logo" className="logo-img" />
          </div>

          {/* RETÂNGULO ROXO -> painel de ícones */}
          <div className="icon-panel">
            {icons.map((ic, i) => (
              <button
                key={i}
                className={`icon-btn ${activeIcon === i ? "active" : ""}`}
                onClick={() => setActiveIcon(i)}
                aria-label={`Ícone ${i}`}
                title={`Ícone ${i}`}
              >
                <img src={ic} alt={`Ícone ${i}`} className="icon-symbol" />
              </button>
            ))}
          </div>
        </aside>

        {/* Main area do mapa */}
        <main className="map-area">
          {/* Search bar */}
          <div className="search-box">
            <input className="search-input" placeholder="Pesquise aqui" />
            <button className="search-btn">🔎</button>
          </div>

          {/* Chips / filtros */}
          <div className="chips">
            <span className="chip">Jiu Jitsu</span>
            <span className="chip">T.I</span>
            <span className="chip">Centro Cultural</span>
            <span className="chip">Biblioteca</span>
          </div>

          {/* Foto de perfil */}
          <div className="profile-wrapper">
            <img src="/profile.png" alt="Perfil" className="profile-img" />
            <div className="notif-dot" />
          </div>

          {/* Mapa (fundo) */}
          <div className="map" role="img" aria-label="Mapa de fundo" />

          {/* Link para acessar a Home do Filho */}
          <div style={{ marginTop: 20 }}>
            <Link href="/filho" className="btn btn-primary">
              Ir para Home do Filho
            </Link>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <button
              className="modal-exit"
              onClick={() => setShowModal(false)}
              aria-label="Fechar"
            >
              ✕
            </button>

            <h1 className="modal-title">
              Olá, Seja Bem Vindo a OportunityFam!
            </h1>
            <hr className="modal-hr" />

            <p className="modal-text">
              Aqui você vai encontrar as melhores instituições para o seu filho.
            </p>

            <p className="modal-question">Deseja cadastrar seu filho agora?</p>

            <div className="modal-actions">
              <button className="btn btn-outline">Não</button>
              <button className="btn btn-primary">Sim</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
