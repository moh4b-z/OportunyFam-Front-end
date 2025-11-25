"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/config";

interface BarraLateralProps {
  onSearchClick?: () => void;
  onNotificationClick?: (data?: any) => void;
  onConversationsClick?: () => void;
  onLocationClick?: () => void;
  onCommunityClick?: () => void;
  isNotificationsOpen?: boolean;
  isConversationsOpen?: boolean;
  isSearchOpen?: boolean;
  isLocationOpen?: boolean;
  isCommunityOpen?: boolean;
}

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </svg>
);

export default function BarraLateral({ onSearchClick, onNotificationClick, onConversationsClick, onLocationClick, onCommunityClick, isNotificationsOpen, isConversationsOpen, isSearchOpen, isLocationOpen, isCommunityOpen }: BarraLateralProps) {
  const [activeIcon, setActiveIcon] = useState<string | null>(null);

  const handleIconClick = (iconName: string) => {
    setActiveIcon(activeIcon === iconName ? null : iconName);
  };

  const handleNotificationClick = async () => {
    // Se já está aberto, apenas toggle para fechar via callback do pai
    if (isNotificationsOpen) {
      onNotificationClick?.();
      return;
    }
    // Vai abrir: busca dados e envia para o pai
    try {
      const res = await fetch(`${API_BASE_URL}/notificacoes`);
      const data = await res.json();
      onNotificationClick?.(data);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
      const mockNotifications = [
        { id: 1, message: "Nova vaga disponível no Instituto Água Viva", date: "2024-10-16 09:30" },
        { id: 2, message: "Evento beneficente na Casa da Esperança", date: "2024-10-16 08:45" },
        { id: 3, message: "Oportunidade de voluntariado na Creche Sonho Dourado", date: "2024-10-16 07:20" }
      ];
      onNotificationClick?.(mockNotifications);
    }
  };

  useEffect(() => {
    // Sincroniza estado visual com os paineis abertos/fechados
    if (isNotificationsOpen === false && activeIcon === 'notification') setActiveIcon(null);
    if (isConversationsOpen === false && activeIcon === 'messages') setActiveIcon(null);
    if (isSearchOpen === false && activeIcon === 'new-feature') setActiveIcon(null);
    if (isLocationOpen === false && activeIcon === 'location') setActiveIcon(null);
    if (isCommunityOpen === false && activeIcon === 'community') setActiveIcon(null);

    if (isNotificationsOpen) setActiveIcon('notification');
    if (isConversationsOpen) setActiveIcon('messages');
    if (isSearchOpen) setActiveIcon('new-feature');
    if (isLocationOpen) setActiveIcon('location');
    if (isCommunityOpen) setActiveIcon('community');
  }, [isNotificationsOpen, isConversationsOpen, isSearchOpen, isLocationOpen, isCommunityOpen]);

  return (
    <aside className="sidebar">
      <div className="logo-placeholder">
        <img src="/img/logo.png" alt="OportunityFam Logo" className="logo-img" />
      </div>

      <div className="icon-panel">
        <button
          className={`icon-btn ${activeIcon === "notification" ? "active" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { handleIconClick("notification"); handleNotificationClick(); }}
          aria-label="Notificações"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>

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
          className={`icon-btn ${activeIcon === "community" ? "active" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { handleIconClick("community"); onCommunityClick?.(); }}
          aria-label="Comunidade"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>

        <button
          className={`icon-btn ${activeIcon === "new-feature" ? "active" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { handleIconClick("new-feature"); onSearchClick?.(); }}
          aria-label="Buscar Instituições"
        >
          <SearchIcon />
        </button>
      </div>

      <div className="spacer" />
    </aside>
  );
}