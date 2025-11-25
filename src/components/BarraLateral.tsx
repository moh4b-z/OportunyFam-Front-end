"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/config";

interface BarraLateralProps {
  onConversationsClick?: () => void;
  onLocationClick?: () => void;
  onChildRegistrationClick?: () => void;
  isConversationsOpen?: boolean;
  isLocationOpen?: boolean;
  isChildRegistrationOpen?: boolean;
}



export default function BarraLateral({ onConversationsClick, onLocationClick, onChildRegistrationClick, isConversationsOpen, isLocationOpen, isChildRegistrationOpen }: BarraLateralProps) {
  const [activeIcon, setActiveIcon] = useState<string | null>(null);

  const handleIconClick = (iconName: string) => {
    setActiveIcon(activeIcon === iconName ? null : iconName);
  };



  useEffect(() => {
    // Sincroniza estado visual com os paineis abertos/fechados
    if (isConversationsOpen === false && activeIcon === 'messages') setActiveIcon(null);
    if (isLocationOpen === false && activeIcon === 'location') setActiveIcon(null);
    if (isChildRegistrationOpen === false && activeIcon === 'child-registration') setActiveIcon(null);

    if (isConversationsOpen) setActiveIcon('messages');
    if (isLocationOpen) setActiveIcon('location');
    if (isChildRegistrationOpen) setActiveIcon('child-registration');
  }, [isConversationsOpen, isLocationOpen, isChildRegistrationOpen]);

  return (
    <aside className="sidebar">
      <div className="logo-placeholder">
        <img src="/img/logo.png" alt="OportunityFam Logo" className="logo-img" />
      </div>

      <div className="icon-panel">
        <button
          className={`icon-btn ${activeIcon === "messages" ? "active" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { handleIconClick("messages"); onConversationsClick?.(); }}
          aria-label="Mensagens"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <button
          className={`icon-btn ${activeIcon === "location" ? "active" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { handleIconClick("location"); onLocationClick?.(); }}
          aria-label="Localização"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>

        <button
          className={`icon-btn ${activeIcon === "child-registration" ? "active" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { handleIconClick("child-registration"); onChildRegistrationClick?.(); }}
          aria-label="Cadastrar Criança"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" />
          </svg>
        </button>
      </div>

      <div className="spacer" />
    </aside>
  );
}