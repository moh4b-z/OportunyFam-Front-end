"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import BarraLateral from "@/components/BarraLateral";
import SearchBar from "@/components/SearchBar";
import Switch from "@/components/Switch";
const Mapa = dynamic(() => import("../components/Mapa"), { ssr: false });
import { Instituicao } from "@/types";
import NotificationsModal from "@/components/modals/NotificationsModal";
import PushNotifications from "@/components/PushNotifications";
import Perfil from "@/components/shared/Perfil";
import LogoutModal from "@/components/modals/LogoutModal";
import ConversationsModal from "@/components/modals/ConversationsModal";
import ChildRegistrationModal from "@/components/modals/ChildRegistrationModal";
import mapaStyles from "./styles/Mapa.module.css";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import SessionInfo from "@/components/SessionInfo";
import SuccessModal from "@/components/modals/SuccessModal";

export default function HomePage() {
  const { 
    user: authUser, 
    logout, 
    isLoading, 
    showChildRegistration, 
    setShowChildRegistration 
  } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState<Instituicao | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isConversationsModalOpen, setIsConversationsModalOpen] = useState<boolean>(false);
  const [isChildSuccessOpen, setIsChildSuccessOpen] = useState<boolean>(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState<boolean>(false);
  const [isLocationPanelOpen, setIsLocationPanelOpen] = useState<boolean>(false);
  const [isCommunityPanelOpen, setIsCommunityPanelOpen] = useState<boolean>(false);

  // refs para fechar ao clicar fora
  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);

  // listeners globais para clique fora
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Ignora cliques na própria sidebar (ícones) para não causar toggle duplo
      if (target && target.closest('.sidebar')) return;

      if (isSearchPanelOpen) {
        const el = searchRef.current; if (el && !el.contains(e.target as Node)) setIsSearchPanelOpen(false);
      }
      if (isLocationPanelOpen) {
        const el = locationRef.current; if (el && !el.contains(e.target as Node)) setIsLocationPanelOpen(false);
      }
      if (isCommunityPanelOpen) {
        const el = communityRef.current; if (el && !el.contains(e.target as Node)) setIsCommunityPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocMouseDown, true);
  }, [isSearchPanelOpen, isLocationPanelOpen, isCommunityPanelOpen]);

  const handleInstitutionSelect = (institution: Instituicao) => {
    setSelectedInstitution(institution);
  };

  const handleNotificationClick = (data?: any) => {
    // Toggle: se já está aberto, fecha
    if (isNotificationsModalOpen) {
      setIsNotificationsModalOpen(false);
      return;
    }
    // Vai abrir: seta dados (se houver) e abre
    if (data) {
      setNotifications(data);
    }
    setIsNotificationsModalOpen(true);
  };

  const closeNotificationsModal = () => {
    setIsNotificationsModalOpen(false);
  };

  const handleConversationsClick = () => {
    // Toggle abre/fecha
    setIsConversationsModalOpen(prev => !prev);
  };

  const closeConversationsModal = () => {
    setIsConversationsModalOpen(false);
  };

  const handleLogoutConfirm = (): void => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const handleLogoutCancel = (): void => {
    setIsLogoutModalOpen(false);
  };

  const handleProfileMenuClick = (action: string): void => {
    // Aqui você pode implementar as ações do menu do perfil
    switch (action) {
      case 'profile':
        // Abrir perfil
        break;
      case 'settings':
        // Abrir configurações
        break;
      case 'theme':
        // Alternar tema
        break;
      case 'help':
        // Abrir ajuda
        break;
      case 'logout':
        setIsLogoutModalOpen(true);
        break;
      case 'login':
        // Fazer login
        break;
    }
  };

  // Funções para o modal de cadastro de criança
  const handleChildRegistrationSuccess = async () => {
    // Atualiza o usuário para indicar que agora tem crianças
    console.log('Criança cadastrada com sucesso!');
    
    // Fechar modal de cadastro e exibir mensagem de sucesso
    setShowChildRegistration(false);
    setIsChildSuccessOpen(true);
  };

  const handleCloseChildRegistration = () => {
    setShowChildRegistration(false);
  };

  // Usa os dados do usuário logado do contexto
  const user = authUser || {
    nome: "Usuário",
    foto_perfil: undefined
  };

  // Dados de exemplo para as notificações push
  const pushNotifications = [
    {
      id: 1,
      name: "Instituto Água Viva",
      message: "Nova vaga disponível para voluntário",
      time: "Agora",
      isLate: false
    },
    {
      id: 2,
      name: "Casa da Esperança",
      message: "Evento beneficente neste sábado",
      time: "2 min",
      isLate: false
    }
  ];

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="main-container">
      <BarraLateral 
        onNotificationClick={handleNotificationClick}
        onConversationsClick={handleConversationsClick}
        isNotificationsOpen={isNotificationsModalOpen}
        isConversationsOpen={isConversationsModalOpen}
      />
      <div className="app-content-wrapper">
        {/* Mapa ocupa toda a área */}
        <div className={mapaStyles.mapWrapper}>
          <Mapa highlightedInstitution={selectedInstitution} />
        </div>
        
        {/* Switch de categorias - lado direito da barra lateral */}
        <div className="switch-container-sidebar">
          <Switch onCategoryChange={(category) => {
            // Categoria selecionada: ${category}
          }} />
        </div>

        {/* Botão temporário para testar modal de criança */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#007bff',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setShowChildRegistration(!showChildRegistration)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {showChildRegistration ? '❌ Fechar Modal Criança' : '👶 Abrir Modal Criança'}
            </button>
          </div>
        )}

        {/* Painel de busca */}
        {isSearchPanelOpen && (
          <div style={{ position: 'fixed', top: 0, left: 'var(--sidebar-width)', width: 'calc(100% - var(--sidebar-width))', height: '100%', display: 'flex', zIndex: 8000, background: 'rgba(0,0,0,0.1)', pointerEvents: 'none' }}>
            <div ref={searchRef} style={{ width: 600, maxWidth: '90vw', height: '100vh', background: 'white', boxShadow: '5px 0 15px rgba(0,0,0,0.15)', overflowY: 'auto', pointerEvents: 'auto' }}>
              <div style={{ position: 'sticky', top: 0, padding: 20, borderBottom: '1px solid #e0e0e0', background: 'white', zIndex: 1 }}>
                <h2 style={{ margin: 0 }}>Buscar Instituições</h2>
                <button onClick={() => setIsSearchPanelOpen(false)} style={{ position: 'absolute', right: 16, top: 16, background: 'transparent', border: 0, fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ padding: 20 }}>Em breve...</div>
            </div>
          </div>
        )}

        {/* Painel de localização */}
        {isLocationPanelOpen && (
          <div style={{ position: 'fixed', top: 0, left: 'var(--sidebar-width)', width: 'calc(100% - var(--sidebar-width))', height: '100%', display: 'flex', zIndex: 8000, background: 'rgba(0,0,0,0.1)', pointerEvents: 'none' }}>
            <div ref={locationRef} style={{ width: 600, maxWidth: '90vw', height: '100vh', background: 'white', boxShadow: '5px 0 15px rgba(0,0,0,0.15)', overflowY: 'auto', pointerEvents: 'auto' }}>
              <div style={{ position: 'sticky', top: 0, padding: 20, borderBottom: '1px solid #e0e0e0', background: 'white', zIndex: 1 }}>
                <h2 style={{ margin: 0 }}>Localização</h2>
                <button onClick={() => setIsLocationPanelOpen(false)} style={{ position: 'absolute', right: 16, top: 16, background: 'transparent', border: 0, fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ padding: 20 }}>Em breve...</div>
            </div>
          </div>
        )}

        {/* Painel de comunidade */}
        {isCommunityPanelOpen && (
          <div style={{ position: 'fixed', top: 0, left: 'var(--sidebar-width)', width: 'calc(100% - var(--sidebar-width))', height: '100%', display: 'flex', zIndex: 8000, background: 'rgba(0,0,0,0.1)', pointerEvents: 'none' }}>
            <div ref={communityRef} style={{ width: 600, maxWidth: '90vw', height: '100vh', background: 'white', boxShadow: '5px 0 15px rgba(0,0,0,0.15)', overflowY: 'auto', pointerEvents: 'auto' }}>
              <div style={{ position: 'sticky', top: 0, padding: 20, borderBottom: '1px solid #e0e0e0', background: 'white', zIndex: 1 }}>
                <h2 style={{ margin: 0 }}>Comunidade</h2>
                <button onClick={() => setIsCommunityPanelOpen(false)} style={{ position: 'absolute', right: 16, top: 16, background: 'transparent', border: 0, fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ padding: 20 }}>Em breve...</div>
            </div>
          </div>
        )}

        {/* Header flutuante sobre o mapa */}
        <div className="floating-header">
          <div className="search-wrapper">
            <SearchBar onInstitutionSelect={handleInstitutionSelect} />
          </div>
          <Perfil 
            user={user}
            hasNotifications={notifications.length > 0}
            onMenuItemClick={handleProfileMenuClick}
          />
        </div>
      </div>
      
      {/* Componente de notificações push que aparecem automaticamente */}
      <PushNotifications 
        notifications={pushNotifications}
        autoShow={true}
        showDelay={3000}
      />
      
      {/* Modal de notificações */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={closeNotificationsModal}
        notifications={notifications}
      />

      {/* Modal de logout */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        onConfirmLogout={handleLogoutConfirm}
      />

      {/* Modal de conversas */}
      <ConversationsModal
        isOpen={isConversationsModalOpen}
        onClose={closeConversationsModal}
      />

      {/* Modal de cadastro de criança */}
      <ChildRegistrationModal
        isOpen={showChildRegistration}
        onClose={handleCloseChildRegistration}
        onSuccess={handleChildRegistrationSuccess}
        userId={authUser ? parseInt(authUser.id) : 999} // ID temporário para testes
      />
      
      {/* Mensagem de sucesso após cadastrar criança */}
      <SuccessModal
        isOpen={isChildSuccessOpen}
        title="Tudo certo!"
        message="Criança cadastrada com sucesso."
        onClose={() => setIsChildSuccessOpen(false)}
        autoCloseDelay={1500}
      />
      
      {/* Componente para mostrar informações da sessão (apenas para demonstração) */}
      <SessionInfo />
    </div>
  );
}