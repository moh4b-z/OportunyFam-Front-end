"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import BarraLateral from "@/components/BarraLateral";
import SearchBar from "@/components/SearchBar";
const Mapa = dynamic(() => import("../components/Mapa"), { ssr: false });
import { Instituicao, SexoOption, Crianca } from "@/types";
import NotificationsModal from "@/components/modals/NotificationsModal";
import LogoutModal from "@/components/modals/LogoutModal";
import ConversationsModal from "@/components/modals/ConversationsModal";
import ChildRegistrationSideModal from "@/components/modals/ChildRegistrationSideModal";
import SimpleAccountModal from "@/components/modals/SimpleAccountModal";
import mapaStyles from "./styles/Mapa.module.css";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import { childService } from "@/services/childService";
import { API_BASE_URL } from "@/services/config";
import InstitutionActivitiesCarousel, { Atividade } from "@/components/InstitutionActivitiesCarousel";
import InstitutionStudentsList from "@/components/InstitutionStudentsList";
import InstitutionDateCards from "@/components/InstitutionDateCards";
import InstitutionClassesList from "@/components/InstitutionClassesList";
import InstitutionPublicationsModal from "@/components/modals/InstitutionPublicationsModal";

// Interface para crianças dependentes (formato da API)
interface ChildDependente {
  nome: string;
  id_pessoa: number;
  id_crianca: number;
  foto_perfil: string | null;
  id_responsavel: number;
}

export default function HomePage() {
  const { 
    user: authUser, 
    logout, 
    isLoading, 
    showChildRegistration, 
    setShowChildRegistration 
  } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState<Instituicao | null>(null);
  const [conversationInstitution, setConversationInstitution] = useState<Instituicao | null>(null);
  const [conversationContact, setConversationContact] = useState<{ pessoa_id: number; nome: string; foto_perfil?: string | null } | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isConversationsModalOpen, setIsConversationsModalOpen] = useState<boolean>(false);

  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState<boolean>(false);
  const [isLocationPanelOpen, setIsLocationPanelOpen] = useState<boolean>(false);
  const [isCommunityPanelOpen, setIsCommunityPanelOpen] = useState<boolean>(false);
  const [isChildRegistrationSideModalOpen, setIsChildRegistrationSideModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isPublicationsModalOpen, setIsPublicationsModalOpen] = useState<boolean>(false);
  const [userConversations, setUserConversations] = useState<any[]>([]);
  const [userPessoaId, setUserPessoaId] = useState<number | null>(null);
  const [mapInstitutions, setMapInstitutions] = useState<Instituicao[]>([]);
  const [mapCenterPosition, setMapCenterPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [goToHomeTimestamp, setGoToHomeTimestamp] = useState<number | null>(null);
  
  // === DADOS CARREGADOS UMA VEZ NA INICIALIZAÇÃO ===
  const [userChildren, setUserChildren] = useState<ChildDependente[]>([]);
  const [userSavedLocations, setUserSavedLocations] = useState<any[]>([]);
  const [sexoOptions, setSexoOptions] = useState<SexoOption[]>([]);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  // === DADOS DA INSTITUIÇÃO ===
  const [selectedActivity, setSelectedActivity] = useState<Atividade | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allAtividades, setAllAtividades] = useState<Atividade[]>([]);
  const [activitiesRefreshTrigger, setActivitiesRefreshTrigger] = useState(0);

  // Função para encontrar a próxima aula futura e selecionar a data
  const handleActivityChange = (atividade: Atividade | null) => {
    setSelectedActivity(atividade);
    
    if (atividade && atividade.aulas && atividade.aulas.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filtra aulas futuras e ordena por data
      const futureAulas = atividade.aulas
        .map(aula => {
          // Converte DD/MM/YYYY para Date
          const parts = aula.data.split('/');
          if (parts.length === 3) {
            const aulaDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            return { aula, date: aulaDate };
          }
          return null;
        })
        .filter((item): item is { aula: typeof atividade.aulas[0]; date: Date } => 
          item !== null && item.date >= today
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      if (futureAulas.length > 0) {
        // Seleciona a data da próxima aula futura
        setSelectedDate(futureAulas[0].date);
      }
    }
  };

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

  // === CARREGA TODOS OS DADOS DO USUÁRIO UMA ÚNICA VEZ ===
  const loadAllUserData = async () => {
    try {
      let userIdNumber: number | null = null;
      let userTipo: string | null = authUser?.tipo || null;

      if (authUser?.id) {
        const parsed = Number(authUser.id);
        if (!Number.isNaN(parsed)) {
          userIdNumber = parsed;
        }
      }

      if (!userIdNumber && typeof window !== "undefined") {
        // Busca ID baseado no tipo de usuário
        const storedTipo = localStorage.getItem("user-tipo");
        userTipo = storedTipo;
        let storedId: string | null = null;
        if (storedTipo === 'usuario') {
          storedId = localStorage.getItem("usuario_id");
        } else if (storedTipo === 'instituicao') {
          storedId = localStorage.getItem("instituicao_id");
        } else if (storedTipo === 'crianca') {
          storedId = localStorage.getItem("crianca_id");
        }
        if (storedId) {
          const parsedId = Number(storedId);
          if (!Number.isNaN(parsedId)) {
            userIdNumber = parsedId;
          }
        }
      }

      if (!userIdNumber) {
        return;
      }

      // Busca dados baseado no tipo de usuário
      let fullUser: any;
      
      if (userTipo === 'instituicao') {
        // Para instituições, busca de /instituicoes/{id}
        fullUser = await childService.getInstitutionById(userIdNumber);
      } else {
        // Para usuários e crianças, busca de /usuarios/{id}
        fullUser = await childService.getUserById(userIdNumber);
      }

      // pessoa_id para chat
      const pessoaIdRaw = (fullUser as any)?.pessoa_id ?? (fullUser as any)?.id_pessoa;
      const pessoaId = Number(pessoaIdRaw);
      if (!Number.isNaN(pessoaId)) {
        setUserPessoaId(pessoaId);
      }

      // Conversas
      const conversas = Array.isArray((fullUser as any)?.conversas)
        ? (fullUser as any).conversas
        : [];
      setUserConversations(conversas);

      // Crianças dependentes (apenas para usuários, não instituições)
      if (userTipo !== 'instituicao') {
        const criancas = Array.isArray((fullUser as any)?.criancas_dependentes)
          ? (fullUser as any).criancas_dependentes
          : [];
        setUserChildren(criancas);
      }

      // Locais salvos (para o mapa) - apenas para usuários
      if (userTipo !== 'instituicao') {
        const locais = Array.isArray((fullUser as any)?.locais_salvos)
          ? (fullUser as any).locais_salvos
          : [];
        setUserSavedLocations(locais);
      }

      setIsUserDataLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  // Carrega opções de sexo UMA vez (dados estáticos)
  const loadSexoOptions = async () => {
    try {
      const options = await childService.getSexoOptions();
      setSexoOptions(options);
    } catch (error) {
      console.error("Erro ao carregar opções de sexo:", error);
    }
  };

  // Callback para atualizar crianças após criar/deletar
  const refreshUserChildren = async () => {
    if (!authUser?.id) return;
    try {
      const fullUser = await childService.getUserById(parseInt(authUser.id));
      const criancas = Array.isArray((fullUser as any)?.criancas_dependentes)
        ? (fullUser as any).criancas_dependentes
        : [];
      setUserChildren(criancas);
    } catch (error) {
      console.error("Erro ao atualizar crianças:", error);
    }
  };

  // Callback para atualizar conversas (usado após enviar mensagem)
  const loadUserConversations = async () => {
    if (!authUser?.id) return;
    try {
      let fullUser: any;
      
      if (authUser?.tipo === 'instituicao') {
        // Para instituições, busca de /instituicoes/{id}
        fullUser = await childService.getInstitutionById(parseInt(authUser.id));
      } else {
        // Para usuários e crianças, busca de /usuarios/{id}
        fullUser = await childService.getUserById(parseInt(authUser.id));
      }
      
      const conversas = Array.isArray((fullUser as any)?.conversas)
        ? (fullUser as any).conversas
        : [];
      setUserConversations(conversas);
    } catch (error) {
      console.error("Erro ao atualizar conversas:", error);
    }
  };

  // Criar conversa com um responsável (usado pela instituição)
  const handleStartConversationWithResponsible = async (responsavelPessoaId: number, responsavelNome: string, responsavelFoto?: string | null) => {
    if (!userPessoaId) {
      console.error('pessoa_id da instituição não encontrado');
      return;
    }

    try {
      // Cria a conversa via API
      const payload = {
        participantes: [userPessoaId, responsavelPessoaId]
      };

      const response = await fetch(`${API_BASE_URL}/conversas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Falha ao criar conversa:', response.status, response.statusText);
        return;
      }

      // Atualiza a lista de conversas
      await loadUserConversations();

      // Define o contato para abrir automaticamente o chat
      setConversationContact({
        pessoa_id: responsavelPessoaId,
        nome: responsavelNome,
        foto_perfil: responsavelFoto || null
      });

      // Abre a modal de conversas
      setIsConversationsModalOpen(true);
    } catch (error) {
      console.error('Erro ao criar conversa com responsável:', error);
    }
  };

  // Carrega TUDO na inicialização (uma única vez)
  useEffect(() => {
    loadAllUserData();
    loadSexoOptions();
  }, [authUser?.id]);

  // Abre a modal de cadastro de criança na PRIMEIRA visita do usuário (apenas para responsáveis)
  useEffect(() => {
    if (authUser?.id && !isLoading && authUser?.tipo === 'usuario') {
      const firstVisitKey = `oportunyfam_first_visit_${authUser.id}`;
      const hasVisitedBefore = localStorage.getItem(firstVisitKey);
      
      if (!hasVisitedBefore) {
        // Primeira visita - abre a modal e marca como visitado
        setIsChildRegistrationSideModalOpen(true);
        localStorage.setItem(firstVisitKey, 'true');
      }
    }
  }, [authUser?.id, authUser?.tipo, isLoading]);

  const handleInstitutionSelect = (institution: Instituicao) => {
    setSelectedInstitution(institution);
  };

  const handleNotificationClick = (data?: any) => {
    // Toggle: se já está aberto, fecha
    if (isNotificationsModalOpen) {
      setIsNotificationsModalOpen(false);
      return;
    }
    // Fechar outros modais antes de abrir este
    setIsConversationsModalOpen(false);
    setIsChildRegistrationSideModalOpen(false);
    setConversationInstitution(null);
    
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
    // Toggle: se já está aberto, fecha
    if (isConversationsModalOpen) {
      setIsConversationsModalOpen(false);
      setConversationInstitution(null);
      return;
    }
    // Fechar outros modais antes de abrir este
    setIsNotificationsModalOpen(false);
    setIsChildRegistrationSideModalOpen(false);
    setIsAccountModalOpen(false);
    
    // Abrir modal de conversas
    setIsConversationsModalOpen(true);
  };

  const closeConversationsModal = () => {
    setIsConversationsModalOpen(false);
    setConversationInstitution(null);
    setConversationContact(null);
  };

  const handleChildRegistrationClick = () => {
    // Toggle: se já está aberto, fecha
    if (isChildRegistrationSideModalOpen) {
      setIsChildRegistrationSideModalOpen(false);
      return;
    }
    // Fechar outros modais antes de abrir este
    setIsNotificationsModalOpen(false);
    setIsConversationsModalOpen(false);
    setIsAccountModalOpen(false);
    setConversationInstitution(null);
    
    // Abrir modal de cadastro de criança
    setIsChildRegistrationSideModalOpen(true);
  };

  const closeChildRegistrationSideModal = () => {
    setIsChildRegistrationSideModalOpen(false);
  };

  const handleAccountClick = () => {
    if (isAccountModalOpen) {
      setIsAccountModalOpen(false);
      return;
    }
    setIsNotificationsModalOpen(false);
    setIsConversationsModalOpen(false);
    setIsChildRegistrationSideModalOpen(false);
    setIsPublicationsModalOpen(false);
    setConversationInstitution(null);
    setIsAccountModalOpen(true);
  };

  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
  };

  // Handler para publicações (apenas instituições)
  const handlePublicationsClick = () => {
    if (isPublicationsModalOpen) {
      setIsPublicationsModalOpen(false);
      return;
    }
    setIsNotificationsModalOpen(false);
    setIsConversationsModalOpen(false);
    setIsChildRegistrationSideModalOpen(false);
    setIsAccountModalOpen(false);
    setConversationInstitution(null);
    setIsPublicationsModalOpen(true);
  };

  const closePublicationsModal = () => {
    setIsPublicationsModalOpen(false);
  };

  const handleLogoutCancel = (): void => {
    setIsLogoutModalOpen(false);
  };

  const handleLogoutConfirm = (): void => {
    logout();
    setIsLogoutModalOpen(false);
  };

  // Funções para o modal de cadastro de criança
  const handleChildRegistrationSuccess = async () => {
    // Atualiza o usuário para indicar que agora tem crianças
    console.log('Criança cadastrada com sucesso!');
    
    // Caso exista algum fluxo usando showChildRegistration (primeiro acesso), garante fechamento
    setShowChildRegistration(false);
  };

  const handleCloseChildRegistration = () => {
    setShowChildRegistration(false);
  };

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="main-container">
      <BarraLateral 
        onConversationsClick={handleConversationsClick}
        onChildRegistrationClick={handleChildRegistrationClick}
        onAccountClick={handleAccountClick}
        onPublicationsClick={handlePublicationsClick}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        isConversationsOpen={isConversationsModalOpen}
        isChildRegistrationOpen={isChildRegistrationSideModalOpen}
        isAccountOpen={isAccountModalOpen}
        isPublicationsOpen={isPublicationsModalOpen}
        userTipo={authUser?.tipo}
      />
      <div className="app-content-wrapper">
        {/* Mapa - apenas para usuários e crianças, não para instituições */}
        {authUser?.tipo !== 'instituicao' && (
          <div className={mapaStyles.mapWrapper}>
            <Mapa 
              highlightedInstitution={selectedInstitution} 
              institutions={mapInstitutions}
              onInstitutionPinClick={handleInstitutionSelect}
              centerPosition={mapCenterPosition}
              goToHomeTimestamp={goToHomeTimestamp}
            />
          </div>
        )}

        {/* Área principal para instituições (onde ficava o mapa) */}
        {authUser?.tipo === 'instituicao' && (
          <div className="institution-dashboard">
            <InstitutionActivitiesCarousel 
              instituicaoId={authUser?.id ? parseInt(authUser.id) : 0}
              onActivityChange={handleActivityChange}
              onActivitiesLoad={setAllAtividades}
              refreshTrigger={activitiesRefreshTrigger}
            />
            <div className="institution-dashboard-content">
              <InstitutionStudentsList
                instituicaoId={authUser?.id ? parseInt(authUser.id) : 0}
                atividadeId={selectedActivity?.atividade_id || null}
                atividadeTitulo={selectedActivity?.titulo || null}
                onStartConversation={handleStartConversationWithResponsible}
                instituicaoPessoaId={userPessoaId}
              />
              <div className="institution-dashboard-right">
                <InstitutionDateCards 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  aulas={selectedActivity?.aulas || []}
                />
                <div className="institution-dashboard-main">
                  <InstitutionClassesList
                    aulas={selectedActivity?.aulas || []}
                    selectedDate={selectedDate}
                    atividadeTitulo={selectedActivity?.titulo}
                    atividades={allAtividades}
                    selectedAtividadeId={selectedActivity?.atividade_id || null}
                    onAulasCreated={() => setActivitiesRefreshTrigger(prev => prev + 1)}
                  />
                </div>
              </div>
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

        {/* Header flutuante sobre o mapa - apenas para usuários e crianças */}
        {authUser?.tipo !== 'instituicao' && (
          <div className="floating-header">
            <div className="search-wrapper">
              <SearchBar 
                onInstitutionSelect={handleInstitutionSelect}
                onStartConversation={(institution) => {
                  setConversationInstitution(institution);
                  setIsConversationsModalOpen(true);
                }}
                onRefreshConversations={loadUserConversations}
                onInstitutionsUpdate={(list) => setMapInstitutions(list)}
                highlightedInstitution={selectedInstitution}
                onCloseProfile={() => setSelectedInstitution(null)}
                onOpenChildRegistration={handleChildRegistrationClick}
                preloadedChildren={userChildren}
              />
            </div>
          </div>
        )}
      </div>
      
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
        autoOpenInstitution={conversationInstitution}
        autoOpenContact={conversationContact}
        conversationsFromApi={userConversations}
        currentUserPessoaId={userPessoaId}
        onRefreshConversations={loadUserConversations}
      />

      {/* Modal lateral de cadastro de criança - apenas para responsáveis */}
      {authUser?.tipo === 'usuario' && (
        <ChildRegistrationSideModal
          isOpen={isChildRegistrationSideModalOpen}
          onClose={closeChildRegistrationSideModal}
          onSuccess={handleChildRegistrationSuccess}
          userId={authUser ? parseInt(authUser.id) : 999}
          initialChildren={userChildren}
          initialSexoOptions={sexoOptions}
          onChildrenChange={refreshUserChildren}
        />
      )}

      {/* Modal lateral de conta */}
      <SimpleAccountModal
        isOpen={isAccountModalOpen}
        onClose={closeAccountModal}
        userName={authUser?.nome || "Usuário"}
        email={authUser?.email}
        phone={authUser?.telefone}
        cpf={authUser?.cpf}
        cnpj={authUser?.cnpj}
        endereco={authUser?.endereco}
        profilePhoto={authUser?.foto_perfil}
        userId={authUser ? parseInt(authUser.id) : undefined}
        initialChildren={userChildren}
        onChildrenChange={refreshUserChildren}
        onGoToHome={() => setGoToHomeTimestamp(Date.now())}
        onStartConversation={handleStartConversationWithResponsible}
      />

      {/* Modal de publicações - apenas para instituições */}
      {authUser?.tipo === 'instituicao' && (
        <InstitutionPublicationsModal
          isOpen={isPublicationsModalOpen}
          onClose={closePublicationsModal}
          instituicaoId={authUser?.id ? parseInt(authUser.id) : 0}
        />
      )}
    </div>
  );
}