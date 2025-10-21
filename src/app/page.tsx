"use client";

import { useState } from "react";
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
import mapaStyles from "./styles/Mapa.module.css";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import SessionInfo from "@/components/SessionInfo";

export default function HomePage() {
  const { user: authUser, logout, isLoading } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState<Instituicao | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isConversationsModalOpen, setIsConversationsModalOpen] = useState<boolean>(false);

  const handleInstitutionSelect = (institution: Instituicao) => {
    setSelectedInstitution(institution);
  };

  const handleNotificationClick = (data?: any) => {
    if (data) {
      setNotifications(data);
    }
    setIsNotificationsModalOpen(true);
  };

  const closeNotificationsModal = () => {
    setIsNotificationsModalOpen(false);
  };

  const handleConversationsClick = () => {
    setIsConversationsModalOpen(true);
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
    console.log('🚀 HomePage.handleProfileMenuClick chamado com:', action);
    // Aqui você pode implementar as ações do menu do perfil
    switch (action) {
      case 'profile':
        console.log('🚀 Ação: profile');
        // Abrir perfil
        break;
      case 'settings':
        console.log('🚀 Ação: settings');
        // Abrir configurações
        break;
      case 'theme':
        console.log('🚀 Ação: theme');
        // Alternar tema
        break;
      case 'help':
        console.log('🚀 Ação: help');
        // Abrir ajuda
        break;
      case 'logout':
        console.log('🚀 Ação: logout - abrindo modal');
        console.log('🚀 Estado atual do modal:', isLogoutModalOpen);
        setIsLogoutModalOpen(true);
        console.log('🚀 Modal deveria estar aberto agora');
        break;
      case 'login':
        console.log('🚀 Ação: login');
        // Fazer login
        break;
      default:
        console.log('🚀 Ação desconhecida:', action);
    }
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
      />
      <div className="app-content-wrapper">
        {/* Mapa ocupa toda a área */}
        <div className={mapaStyles.mapWrapper}>
          <Mapa highlightedInstitution={selectedInstitution} />
        </div>
        
        {/* Switch de categorias - lado direito da barra lateral */}
        <div className="switch-container-sidebar">
          <Switch onCategoryChange={(category) => {/* Categoria selecionada: ${category} */}} />
        </div>

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
      
      {/* Componente para mostrar informações da sessão (apenas para demonstração) */}
      <SessionInfo />
    </div>
  );
}