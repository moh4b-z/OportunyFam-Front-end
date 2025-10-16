"use client";

import { useState } from "react";
import BarraLateral from "@/components/BarraLateral";
import SearchBar from "@/components/SearchBar";
const Mapa = dynamic(() => import("../components/Mapa"), { ssr: false });
import dynamic from "next/dynamic";
import { Instituicao } from "@/types";
import NotificationsModal from "@/components/modals/NotificationsModal";
import PushNotifications from "@/components/PushNotifications";

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
      <div className="content">
        <div className="search-wrapper">
          <SearchBar onInstitutionSelect={handleInstitutionSelect} />
        </div>
        <div className="map-wrapper">
          <Mapa highlightedInstitution={selectedInstitution} />
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