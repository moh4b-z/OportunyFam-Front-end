"use client";

import { useState, useEffect } from "react";
// Ícones agora são SVGs inline para evitar erros de dependência.

export default function Home() {
  const [activeIcon, setActiveIcon] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const icons = [
    { component: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, label: "Notificações" },
    { component: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: "Chat" },
    { component: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>, label: "Pin" },
    { component: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>, label: "Organização" },
  ];

  const chips = [
    { label: "Jiu Jitsu", active: false },
    { label: "T.I", active: false },
    { label: "Centro Cultural", active: false },
    { label: "Biblioteca", active: false },
  ];

  const [activeChip, setActiveChip] = useState<string | null>(null);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <>
      <div className={showModal ? "app-root blurred" : "app-root"}>
        <aside className="sidebar">
          {/* Adicionada a div para o placeholder da logo */}
          <div className="logo-placeholder">
            {/* Adicionada a imagem da logo aqui */}
            <img src="../img/logo.png" alt="Logo" className="logo-img" />
          </div>

          <div className="icon-panel">
            {icons.map((icon, i) => (
              <button
                key={i}
                className={`icon-btn ${activeIcon === i ? "active" : ""}`}
                onClick={() => setActiveIcon(i)}
                aria-label={icon.label}
                title={icon.label}
              >
                {icon.component}
              </button>
            ))}
          </div>
        </aside>

        <main className="map-area">
          <header className="main-header">
            <div
              className={`search-and-chips ${
                searchFocused ? "search-and-chips-active" : ""
              }`}
            >
              <div
                className={`search-box ${searchFocused ? "search-box-active" : ""}`}
              >
                <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  className="search-input"
                  placeholder="Pesquise aqui"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>

              <div className="chips">
                {chips.map((chip, i) => (
                  <button
                    key={i}
                    className={`chip ${
                      activeChip === chip.label ? "active-chip" : ""
                    }`}
                    onClick={() =>
                      setActiveChip(
                        activeChip === chip.label ? null : chip.label
                      )
                    }
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="profile-wrapper"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <svg className="profile-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div className="notif-dot" />
            </div>

            {isProfileMenuOpen && (
              <div className="profile-menu">
                <div className="menu-item">
                  <span>Conta</span>
                </div>
                <div className="menu-item">
                  <span>Notificações</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="menu-item">
                  <span>Tema</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <hr className="menu-divider" />
                <div className="menu-item">
                  <span>Termos e Condições</span>
                </div>
                <div className="menu-item">
                  <span>Sair da Conta</span>
                </div>
              </div>
            )}
          </header>

          <div className="map" role="img" aria-label="Mapa de fundo" />
        </main>
      </div>

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
