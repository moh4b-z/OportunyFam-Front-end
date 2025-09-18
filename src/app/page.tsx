"use client";

import { useState } from "react";

export default function Home() {
  // índice do ícone ativo (null = nenhum)
  const [activeIcon, setActiveIcon] = useState<number | null>(null);
  // modal (continua do seu exemplo)
  const [showModal, setShowModal] = useState<boolean>(true);

  // Agora o array icons armazena os caminhos dos ícones novamente,
  // mas vamos usá-los dentro de uma tag <img> para renderizá-los corretamente.
  const icons = ['/icons-notif.svg', 'icons-chat.svg', 'icons-pin.svg', 'icons-people.svg'];
  
  // A cor que queremos para os ícones é branca, mas como os ícones são SVGs,
  // precisamos usar CSS para mudar a cor. O uso da tag <img> não permite 
  // essa alteração direta, por isso vamos assumir que os ícones já são brancos.
  // Uma alternativa seria usar um componente que renderiza o SVG com a cor desejada,
  // mas para resolver o erro atual, esta é a forma mais simples.
  const iconColor = "#fff"; // Branco

  return (
    <>
      {/* O conteúdo que recebe o blur */}
      <div className={showModal ? "app-root blurred" : "app-root"}>
        {/* Sidebar amarela fixa à esquerda */}
        <aside className="sidebar">
          {/* QUADRADO VERMELHO -> LOGO */}
          <div className="logo-box">
            {/* substitua a imagem em public/logo.png */}
            <img src="/logo-branca.png" alt="Logo" className="logo-img" />
          </div>

          {/* RETÂNGULO ROXO -> painel de ícones */}
          <div className="icon-panel">
            {icons.map((iconPath, i) => (
              <button
                key={i}
                className={`icon-btn ${activeIcon === i ? "active" : ""}`}
                onClick={() => setActiveIcon(i)}
                aria-label={`Ícone ${i}`}
                title={`Ícone ${i}`}
              >
                {/* Usamos a tag <img> para carregar o SVG a partir do seu caminho.
                  Isso resolve o erro de compilação e exibe os ícones corretamente.
                  Para que eles sejam brancos, você precisará garantir que os 
                  arquivos SVG originais já tenham a cor branca.
                */}
                <img src={iconPath} alt={`Ícone ${i}`} className="icon-symbol" />
              </button>
            ))}
          </div>
        </aside>

        {/* Main area do mapa */}
        <main className="map-area">
          {/* Search bar (movida um pouco para a esquerda) */}
          <div className="search-box">
            <input className="search-input" placeholder="Pesquise aqui" />
            <button className="search-btn">🔎</button>
          </div>

          {/* Chips / filtros (movidos para a esquerda) */}
          <div className="chips">
            <span className="chip">Jiu Jitsu</span>
            <span className="chip">T.I</span>
            <span className="chip">Centro Cultural</span>
            <span className="chip">Biblioteca</span>
          </div>

          {/* Foto de perfil no canto direito (com bolinha vermelha) */}
          <div className="profile-wrapper">
            <img src="/profile.png" alt="Perfil" className="profile-img" />
            <div className="notif-dot" />
          </div>

          {/* Mapa (fundo) */}
          <div className="map" role="img" aria-label="Mapa de fundo" />
        </main>
      </div>

      {/* Modal (igual ao anterior) */}
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
