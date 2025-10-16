"use client";

import { useState } from "react";
import BarraLateral from "@/components/BarraLateral";
import SearchBar from "@/components/SearchBar";
const Mapa = dynamic(() => import("../components/Mapa"), { ssr: false });
import dynamic from "next/dynamic";
import { Instituicao } from "@/types";
import NotificationsModal from "@/components/modals/NotificationsModal";
import PushNotifications from "@/components/PushNotifications";
import Perfil from "@/components/shared/Perfil";
import mapaStyles from "./styles/Mapa.module.css";

export default function HomePage() {
  const [selectedInstitution, setSelectedInstitution] = useState<Instituicao | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleInstitutionSelect = (institution: Instituicao) => {
    setSelectedInstitution(institution);
  };

  const handleNotificationClick = (data?: any) => {
    console.log("handleNotificationClick chamado com:", data);
    if (data) {
      setNotifications(data);
    }
    setIsNotificationsModalOpen(true);
    console.log("Modal deve abrir agora, isOpen:", true);
  };

  const closeNotificationsModal = () => {
    setIsNotificationsModalOpen(false);
  };

  const handleProfileMenuClick = (action: string) => {
    console.log("Ação do perfil:", action);
    // Aqui você pode implementar as ações do menu do perfil
    switch (action) {
      case 'profile':
        console.log("Abrir perfil");
        break;
      case 'settings':
        console.log("Abrir configurações");
        break;
      case 'theme':
        console.log("Alternar tema");
        break;
      case 'help':
        console.log("Abrir ajuda");
        break;
      case 'logout':
        console.log("Fazer logout");
        break;
      case 'login':
        console.log("Fazer login");
        break;
    }
  };

  // Dados de exemplo do usuário (você pode substituir pela lógica real)
  const user = {
    nome: "João Silva",
    foto_perfil: undefined // ou uma URL de imagem
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

  return (
    <div className="main-container">
      <BarraLateral onNotificationClick={handleNotificationClick} />
      <div className="app-content-wrapper">
        {/* Mapa ocupa toda a área */}
        <div className={mapaStyles.mapWrapper}>
          <Mapa highlightedInstitution={selectedInstitution} />
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
    </div>
  );
}