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