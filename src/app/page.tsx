"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BarraLateral from "@/app/component/barralateral"
import SearchBar from "@/app/components/SearchBar"
import "./styles/JoinModal.css"

// Tipo para instituições
interface Institution {
  id?: string;
  nome: string;
}
// COMPONENTE PRINCIPAL HOME
// ========================================================
export default function Home() {
  const router = useRouter()
  
  const [showModal, setShowModal] = useState<boolean>(true)
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false)
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState("light")
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showAssociadosModal, setShowAssociadosModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<number | null>(null)
  const [notificationTimers, setNotificationTimers] = useState({
    maria: false,
    joao: false,
    ana: false
  })
  const [pushNotifications, setPushNotifications] = useState<Array<{
    id: number;
    name: string;
    message: string;
    time: string;
    isLate: boolean;
    visible: boolean;
  }>>([])
  const [pushStarted, setPushStarted] = useState(false)

  // Função chamada quando uma instituição é selecionada na busca
  const handleInstitutionSelect = (institution: Institution) => {
    // Cria uma URL amigável baseada no nome da instituição
    const institutionSlug = institution.nome
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    
    // Navega para a página da instituição
    router.push(`/instituicao/${institutionSlug}`)
  }

  // Estados para o modal "Faça parte"
  const [joinFormData, setJoinFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [showActivitiesDropdown, setShowActivitiesDropdown] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Estados para o modal de registro
  const [registrationFormData, setRegistrationFormData] = useState({
    childName: "",
    childCpf: "",
    childAge: "",
    cep: ""
  })
  const [showChildrenDropdown, setShowChildrenDropdown] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false)

  const chips = [
    { label: "Jiu Jitsu", active: false },
    { label: "T.I", active: false },
    { label: "Centro Cultural", active: false },
    { label: "Biblioteca", active: false },
  ]

  const [activeChip, setActiveChip] = useState<string | null>(null)

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  // Sistema de Notificações Push - Inicia automaticamente
  useEffect(() => {
    if (!pushStarted) {
      setPushStarted(true)
      
      // Notificação da Maria - 2 segundos
      setTimeout(() => {
        const mariaNotification = {
          id: 1,
          name: "Maria chegou em IDS",
          message: "Sua filha chegou no horário tudo certo",
          time: "Hoje 13:30",
          isLate: false,
          visible: true
        }
        setPushNotifications(prev => [...prev, mariaNotification])
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
          setPushNotifications(prev => prev.filter(n => n.id !== 1))
        }, 5000)
      }, 2000)

      // Notificação do João - 6 segundos (2 + 4)
      setTimeout(() => {
        const joaoNotification = {
          id: 2,
          name: "João chegou em IAV",
          message: "Seu filho chegou no horário tudo certo",
          time: "12/08/2025 13:30",
          isLate: false,
          visible: true
        }
        setPushNotifications(prev => [...prev, joaoNotification])
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
          setPushNotifications(prev => prev.filter(n => n.id !== 2))
        }, 5000)
      }, 6000)

      // Notificação da Ana - 12 segundos (6 + 6)
      setTimeout(() => {
        const anaNotification = {
          id: 3,
          name: "Ana chegou em CEU",
          message: "Sua filha chegou atrasada",
          time: "12/08/2025 13:40",
          isLate: true,
          visible: true
        }
        setPushNotifications(prev => [...prev, anaNotification])
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
          setPushNotifications(prev => prev.filter(n => n.id !== 3))
        }, 5000)
      }, 12000)
    }
  }, [pushStarted])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const handleAcceptTerms = () => {
    setTermsAccepted(true)
    setTimeout(() => {
      setShowTermsModal(false)
      setTermsAccepted(false)
    }, 3000)
  }

  const handleCloseTermsModal = () => {
    setShowTermsModal(false)
    setTermsAccepted(false)
  }
  

  const handleOpenJoinModal = () => {
    setShowJoinModal(true)
  }

  const handleOpenAboutModal = () => {
    setShowAboutModal(true)
  }

  const handleCloseAboutModal = () => {
    setShowAboutModal(false)
  }

  const handleOpenAssociadosModal = () => {
    setShowAssociadosModal(true)
  }

  const handleCloseAssociadosModal = () => {
    setShowAssociadosModal(false)
  }

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true)
    setIsProfileMenuOpen(false)
  }

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false)
  }

  const handleConfirmLogout = () => {
    // Fechar todos os modais e voltar ao estado inicial
    setShowModal(true)
    setShowJoinModal(false)
    setShowRegistrationModal(false)
    setShowAboutModal(false)
    setShowAssociadosModal(false)
    setShowLogoutModal(false)
    setShowTermsModal(false)
    setIsProfileMenuOpen(false)
    // Logout realizado
    setShowLogoutModal(false)
    setShowNotificationsModal(false)
    setSelectedNotification(null)
    setNotificationTimers({ maria: false, joao: false, ana: false })
  }

  const handleOpenNotificationsModal = () => {
    setShowNotificationsModal(true)
    setIsProfileMenuOpen(false)
    
    // Iniciar a sequência de notificações
    setTimeout(() => {
      setNotificationTimers(prev => ({ ...prev, maria: true }))
    }, 2000) // 2 segundos
    
    setTimeout(() => {
      setNotificationTimers(prev => ({ ...prev, joao: true }))
    }, 5000) // 5 segundos (2 + 3)
    
    setTimeout(() => {
      setNotificationTimers(prev => ({ ...prev, ana: true }))
    }, 10000) // 10 segundos (2 + 3 + 5)
  }

  const handleCloseNotificationsModal = () => {
    setShowNotificationsModal(false)
    setSelectedNotification(null)
    setNotificationTimers({ maria: false, joao: false, ana: false })
  }

  const handleNotificationClick = (index: number) => {
    setSelectedNotification(selectedNotification === index ? null : index)
  }

  const dismissPushNotification = (id: number) => {
    setPushNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handlePushNotificationClick = (notificationId: number) => {
    // Abre o modal de notificações
    setShowNotificationsModal(true)
    // Remove a notificação push que foi clicada
    dismissPushNotification(notificationId)
    // Ativa os timers das notificações no modal para mostrar o histórico
    setNotificationTimers({ maria: true, joao: true, ana: true })
  }

  const handleCloseJoinModal = () => {
    setShowJoinModal(false)
    setJoinFormData({ name: "", email: "", phone: "" })
    setShowActivitiesDropdown(false)
    setSelectedActivity(null)
    setShowSuccessMessage(false)
    // Modal da instituição permanece aberto (showSearchModal continua true)
    // O blur será removido automaticamente pela classe condicional
  }

  const handleOpenRegistrationModal = () => {
    setShowRegistrationModal(true)
    setShowJoinModal(false)
  }

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false)
    setRegistrationFormData({ childName: "", childCpf: "", childAge: "", cep: "" })
    setShowChildrenDropdown(false)
    setSelectedChild(null)
    setTermsAgreed(false)
    setShowRegistrationSuccess(false)
    // Modal da instituição permanece aberto (showSearchModal continua true)
    // O blur será removido automaticamente pela classe condicional
  }

  const handleJoinFormChange = (field: string, value: string) => {
    setJoinFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity)
    setShowActivitiesDropdown(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const handleRegistrationFormChange = (field: string, value: string) => {
    setRegistrationFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleChildSelect = (childName: string) => {
    setSelectedChild(childName)
    setShowChildrenDropdown(false)
    // Auto-fill child data based on selection
    const child = availableChildren.find(c => c.name === childName)
    if (child) {
      setRegistrationFormData(prev => ({
        ...prev,
        childName: child.name,
        childAge: child.age.toString()
      }))
    }
  }

  const handleRegistration = () => {
    if (termsAgreed) {
      setShowRegistrationSuccess(true)
      setTimeout(() => {
        setShowRegistrationSuccess(false)
        handleCloseRegistrationModal()
        // Modal da instituição permanece aberto após finalizar o registro
      }, 3000)
    }
  }

  const availableActivities = [
    { name: "Futebol", count: 15 },
    { name: "Basquete", count: 7 },
    { name: "Badminton", count: 20 }
  ]

  const availableChildren = [
    { name: "João Silva", age: 8 },
    { name: "Maria Silva", age: 10 },
    { name: "Pedro Silva", age: 6 }
  ]


  return (
    <>
      <BarraLateral onSearchClick={() => {}} onNotificationClick={handleOpenNotificationsModal} />

      <div className={showModal || showTermsModal || showJoinModal || showRegistrationModal || showLogoutModal ? "app-content-wrapper blurred" : "app-content-wrapper"}>

        <main className="map-area">
          <header className="main-header">
            {/* Componente de busca */}
            <SearchBar onInstitutionSelect={handleInstitutionSelect} />

            <div className="chips">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  className={`chip ${activeChip === chip.label ? "active-chip" : ""}`}
                  onClick={() => setActiveChip(activeChip === chip.label ? null : chip.label)}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="profile-wrapper" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
              <svg
                className="profile-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
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
                    <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <hr className="menu-divider" />
                <div
                  className="menu-item"
                  onClick={() => {
                    setShowTermsModal(true)
                    setIsProfileMenuOpen(false)
                  }}
                >
                  <span>Termos e Condições</span>
                </div>
                <div className="menu-item" onClick={handleOpenLogoutModal}>
                  <span>Sair da Conta</span>
                </div>
              </div>
            )}
          </header>

          <div className="map" role="img" aria-label="Mapa de fundo" />
        </main>
      </div>

      {/* Modal de Boas-vindas (Mantido) */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <button className="modal-exit" onClick={() => setShowModal(false)} aria-label="Fechar">
              ✕
            </button>

            <h1 className="modal-title">Olá, Seja Bem Vindo a OportunyFam!</h1>
            <hr className="modal-hr" />

            <p className="modal-text">Aqui você vai encontrar as melhores instituições para o seu filho.</p>

            <p className="modal-question">Deseja cadastrar seu filho agora?</p>

            <div className="modal-actions">
              <button className="btn btn-outline">Não</button>
              <button className="btn btn-primary">Sim</button>
            </div>
          </div>
        </div>
      )}


      {/* Modal Sobre Nós */}
      {showAboutModal && (
        <div className="about-modal-overlay" role="dialog" aria-modal="true">
          <div className="about-modal-card">
            <button className="about-modal-exit" onClick={handleCloseAboutModal} aria-label="Fechar">
              ✕
            </button>

            <div className="about-hero">
              <div className="about-video-frame">
                <iframe
                  className="about-video"
                  src="https://www.youtube.com/embed/7joj8ohz1Ik?si=Gr9tdi4CLBN6E7Sv"
                  title="Instituto Água Viva - Vídeo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="about-content">
              <h2 className="about-title">Conheça o Instituto Água Viva</h2>
              <p className="about-text">
                Criado em 2015, o Instituto Água Viva é uma organização social que atua no Sertão
                nordestino, promovendo transformação por meio da educação, saúde, esportes e
                empreendedorismo social.
              </p>
              <a
                className="about-cta"
                href="https://www.institutoaguaviva.org.br/?gad_source=1&gad_campaignid=22771344172&gbraid=0AAAAADP45zJt-9xMyf7nkRQzYTrX6DglC&gclid=CjwKCAjwup3HBhAAEiwA7euZukAJ1X0nZbqFJfVy2lczhdJgRqUZFoYOrhXlWnwO6nh3RRbwi7K5JBoCMdoQAvD_BwE"
                target="_blank"
                rel="noopener noreferrer"
              >
                Clique aqui para conhecer o Instituto Água Viva
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Termos e Condições (Mantido) */}
      {showTermsModal && (
        <div className="terms-modal-overlay" role="dialog" aria-modal="true">
          <div className={theme === "dark" ? "terms-modal-card dark" : "terms-modal-card"}>
            <div className="terms-modal-header">
              <button className="terms-back-btn" onClick={handleCloseTermsModal} aria-label="Voltar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <h1 className="terms-header-title">OportunyFam</h1>
            </div>

            <hr className="terms-header-divider" />

            <div className="terms-icon-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            </div>

            <h2 className="terms-title">Termos e Condições de Uso</h2>
            <p className="terms-subtitle">
              Transparência e segurança para conectar famílias e ONGs de forma responsável e confiável.
            </p>

            <div className="terms-card">
              <div className="terms-card-header">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f4a261"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h3 className="terms-card-title">Bem-vindo à OportunyFam</h3>
              </div>
              <p className="terms-card-text">
                Nossa plataforma conecta mães, famílias e ONGs para criar uma rede de apoio segura e organizada.
              </p>
              <p className="terms-card-text-bold">
                Ao utilizar nossa plataforma, você concorda com os termos estabelecidos neste documento. Nossa missão é
                promover a inclusão social e fortalecer vínculos comunitários através da tecnologia, sempre priorizando
                a segurança e bem-estar das crianças e famílias.
              </p>
            </div>

            <div className="terms-card">
              <h3 className="terms-mission-title">Nossa Missão</h3>
              <hr className="terms-mission-divider" />
              <div className="terms-mission-list">
                <div className="terms-mission-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Conectar famílias e ONGs</span>
                </div>
                <div className="terms-mission-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Garantir segurança infantil</span>
                </div>
                <div className="terms-mission-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>Fortalecer comunidades</span>
                </div>
              </div>
            </div>

            <div className="terms-card">
              <h3 className="terms-accept-title">Aceitar Termos e Condições</h3>
              <p className="terms-accept-text">
                Ao clicar em "Aceitar", você confirma que leu e concorda com todos os termos apresentados.
              </p>
              <button className="terms-accept-btn" onClick={handleAcceptTerms}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Aceitar Termos
              </button>
              <button className="terms-refuse-btn" onClick={handleCloseTermsModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Recusar
              </button>

              {termsAccepted && (
                <div className="terms-success-message">Obrigada por aceitar os Termos da OportunyFam!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal "Faça parte" */}
      {showJoinModal && (
        <div className="modal-overlay high-priority" role="dialog" aria-modal="true">
          <div className="join-modal-card">
            <button className="modal-exit" onClick={handleCloseJoinModal} aria-label="Fechar">
              ✕
            </button>

            <h1 className="join-modal-title">Faça parte</h1>

            <div className="join-form">
              {/* Campo Nome */}
              <div className="join-input-group">
                <div className="join-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  type="text"
                  className="join-input"
                  placeholder="Nome"
                  value={joinFormData.name}
                  onChange={(e) => handleJoinFormChange('name', e.target.value)}
                />
              </div>

              {/* Campo Email */}
              <div className="join-input-group">
                <div className="join-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  className="join-input"
                  placeholder="Email"
                  value={joinFormData.email}
                  onChange={(e) => handleJoinFormChange('email', e.target.value)}
                />
              </div>

              {/* Campo Telefone */}
              <div className="join-input-group">
                <div className="join-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.7-6.7A19.79 19.79 0 0 1 2 4.18V2.18a2 2 0 0 1 2-2h3.18a2 2 0 0 1 2 1.72 17.5 17.5 0 0 0 .58 3.42c.16.59-.14 1.25-.76 1.54l-1.4 1.23a17.65 17.65 0 0 0 6.7 6.7l1.23-1.4a2 2 0 0 1 1.54-.76c.72.16 1.44.27 2.16.33a2 2 0 0 1 1.72 2z"/>
                  </svg>
                </div>
                <input
                  type="tel"
                  className="join-input"
                  placeholder="11 99999-9999"
                  value={joinFormData.phone}
                  onChange={(e) => handleJoinFormChange('phone', e.target.value)}
                />
              </div>

              {/* Dropdown Atividades */}
              <div className="join-input-group">
                <div className="join-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                  </svg>
                </div>
                <div className="join-dropdown-wrapper">
                  <button
                    className="join-dropdown-button"
                    onClick={() => setShowActivitiesDropdown(!showActivitiesDropdown)}
                  >
                    {selectedActivity || "Atividades disponíveis"}
                    <svg 
                      className={`join-dropdown-arrow ${showActivitiesDropdown ? 'rotated' : ''}`}
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  
                  {showActivitiesDropdown && (
                    <div className="join-dropdown-menu">
                      {availableActivities.map((activity, index) => (
                        <div 
                          key={index}
                          className="join-activity-item"
                          onClick={() => handleActivitySelect(activity.name)}
                        >
                          <div className="join-activity-icon">
                            {activity.name === "Futebol" && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                                <path d="M2 12h20"/>
                              </svg>
                            )}
                            {activity.name === "Basquete" && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
                              </svg>
                            )}
                            {activity.name === "Badminton" && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.21 2.31-.48 3.43-.84"/>
                                <path d="M22 12c0 5.52-4.48 10-10 10s-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10z"/>
                              </svg>
                            )}
                          </div>
                          <span className="join-activity-name">{activity.name}</span>
                          <span className="join-activity-count">{activity.count}</span>
                          <svg 
                            className="join-activity-arrow"
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mensagem de Sucesso */}
              {showSuccessMessage && (
                <div className="join-success-message">
                  Atividade Escolhida com Sucesso
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="join-modal-actions">
              <button className="join-btn-back" onClick={handleCloseJoinModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Voltar
              </button>
              <button className="join-btn-advance" onClick={handleOpenRegistrationModal}>
                Avançar
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      {showRegistrationModal && (
        <div className="modal-overlay high-priority" role="dialog" aria-modal="true">
          <div className="registration-modal-card">
            <button className="modal-exit" onClick={handleCloseRegistrationModal} aria-label="Fechar">
              ✕
            </button>

            <h1 className="registration-modal-title">Registro</h1>

            <div className="registration-form">
              {/* Campo Filho */}
              <div className="registration-input-group">
                <div className="registration-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="registration-dropdown-wrapper">
                  <button
                    className="registration-dropdown-button"
                    onClick={() => setShowChildrenDropdown(!showChildrenDropdown)}
                  >
                    {selectedChild || "Filho"}
                    <svg 
                      className={`registration-dropdown-arrow ${showChildrenDropdown ? 'rotated' : ''}`}
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  
                  {showChildrenDropdown && (
                    <div className="registration-dropdown-menu">
                      {availableChildren.map((child, index) => (
                        <div 
                          key={index}
                          className="registration-child-item"
                          onClick={() => handleChildSelect(child.name)}
                        >
                          <div className="registration-child-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <span className="registration-child-name">{child.name}</span>
                          <span className="registration-child-age">{child.age} anos</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo CPF da criança */}
              <div className="registration-input-group">
                <div className="registration-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                </div>
                <input
                  type="text"
                  className="registration-input"
                  placeholder="CPF da criança"
                  value={registrationFormData.childCpf}
                  onChange={(e) => handleRegistrationFormChange('childCpf', e.target.value)}
                />
              </div>

              {/* Campo Idade da Criança */}
              <div className="registration-input-group">
                <div className="registration-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <input
                  type="number"
                  className="registration-input"
                  placeholder="Idade da Criança"
                  value={registrationFormData.childAge}
                  onChange={(e) => handleRegistrationFormChange('childAge', e.target.value)}
                />
              </div>

              {/* Campo CEP */}
              <div className="registration-input-group">
                <div className="registration-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <input
                  type="text"
                  className="registration-input"
                  placeholder="CEP"
                  value={registrationFormData.cep}
                  onChange={(e) => handleRegistrationFormChange('cep', e.target.value)}
                />
              </div>

              {/* Checkbox Termos */}
              <div className="registration-terms-group">
                <label className="registration-terms-label">
                  <input
                    type="checkbox"
                    className="registration-terms-checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                  />
                  <span className="registration-terms-text">
                    Concorda com os <span className="terms-link">termos de serviço</span>
                  </span>
                </label>
              </div>

              {/* Mensagem de Sucesso */}
              {showRegistrationSuccess && (
                <div className="registration-success-message">
                  Registrado com Sucesso
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="registration-modal-actions">
              <button className="registration-btn-back" onClick={handleCloseRegistrationModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Voltar
              </button>
              <button 
                className={`registration-btn-register ${!termsAgreed ? 'disabled' : ''}`}
                onClick={handleRegistration}
                disabled={!termsAgreed}
              >
                Registre-se
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Associados */}
      {showAssociadosModal && (
        <div className="associados-modal-overlay" role="dialog" aria-modal="true">
          <div className="associados-modal-card">
            <button className="associados-modal-exit" onClick={handleCloseAssociadosModal} aria-label="Fechar">
              ✕
            </button>

            <h1 className="associados-modal-title">Associados</h1>
            <hr className="associados-modal-hr" />

            <div className="associados-grid">
              {/* ACER BRASIL */}
              <div className="associado-card">
                <div className="associado-logo">
                  <img 
                    src="https://lh3.googleusercontent.com/proxy/8YsdFziELfNbRYjSg3zh6qaQRnxpbkshQYvT3dR7Drbr-yoHzpS8_tROkzgGOCxOm_BAMWTwhZ2BLYdKylXSFw" 
                    alt="ACER BRASIL Logo" 
                    className="associado-logo-img"
                  />
                </div>
                <div className="associado-name">ACER BRASIL</div>
                <div className="hover-line"></div>
              </div>

              {/* AJUDOU.ORG */}
              <div className="associado-card">
                <div className="associado-logo">
                  <img 
                    src="https://ajudou.org/wp-content/uploads/2019/07/logo-escalada.png" 
                    alt="AJUDOU.ORG Logo" 
                    className="associado-logo-img"
                  />
                </div>
                <div className="associado-name">AJUDOU.ORG</div>
                <div className="hover-line"></div>
              </div>

              {/* INSTITUTO ATLETA BOM DE NOTA */}
              <div className="associado-card">
                <div className="associado-logo">
                  <img 
                    src="https://rems.org.br/wp-content/uploads/2024/02/instituto-atleta-bom-nota.jpg" 
                    alt="INSTITUTO ATLETA BOM DE NOTA Logo" 
                    className="associado-logo-img"
                  />
                </div>
                <div className="associado-name">INSTITUTO ATLETA BOM DE NOTA</div>
                <div className="hover-line"></div>
              </div>

              {/* INSTITUTO ESPORTE MAIS */}
              <div className="associado-card">
                <div className="associado-logo">
                  <img 
                    src="https://rems.org.br/wp-content/uploads/logos/instituo-esporte-mais.png" 
                    alt="INSTITUTO ESPORTE MAIS Logo" 
                    className="associado-logo-img"
                  />
                </div>
                <div className="associado-name">INSTITUTO ESPORTE MAIS</div>
                <div className="hover-line"></div>
              </div>

              {/* INSTITUTO FUTEBOL DE RUA */}
              <div className="associado-card">
                <div className="associado-logo">
                  <img 
                    src="https://rems.org.br/wp-content/uploads/2024/02/futebol-de-rua.jpg" 
                    alt="INSTITUTO FUTEBOL DE RUA Logo" 
                    className="associado-logo-img"
                  />
                </div>
                <div className="associado-name">INSTITUTO FUTEBOL DE RUA</div>
                <div className="hover-line"></div>
              </div>

              {/* PROJETO PRIMEIRO SAQUE */}
              <div className="associado-card">
                <div className="associado-logo">
                  <img 
                    src="https://rems.org.br/wp-content/uploads/2024/02/proj-primeiro-saque.jpg" 
                    alt="PROJETO PRIMEIRO SAQUE Logo" 
                    className="associado-logo-img"
                  />
                </div>
                <div className="associado-name">PROJETO PRIMEIRO SAQUE</div>
                <div className="hover-line"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Logout */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" role="dialog" aria-modal="true">
          <div className="logout-modal-card">
            <h2 className="logout-modal-title">Quer mesmo sair da conta?</h2>
            
            <div className="logout-modal-actions">
              <button className="logout-btn-yes" onClick={handleConfirmLogout}>
                Sim
              </button>
              <button className="logout-btn-no" onClick={handleCloseLogoutModal}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificações */}
      {showNotificationsModal && (
        <div className="notifications-modal-overlay" role="dialog" aria-modal="true">
          <div className="notifications-modal-card">
            <button className="notifications-modal-exit" onClick={handleCloseNotificationsModal} aria-label="Fechar">
              ✕
            </button>

            <h1 className="notifications-modal-title">Notificação</h1>

            <div className="notifications-list">
              {/* Notificação 1 - Maria */}
              <div 
                className={`notification-item ${selectedNotification === 0 ? 'selected' : ''} ${notificationTimers.maria ? 'visible' : ''}`}
                onClick={() => handleNotificationClick(0)}
              >
                <div className="notification-dot"></div>
                {notificationTimers.maria && (
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="notification-name">Maria chegou em IDS</span>
                      <span className="notification-time">Hoje 13:30</span>
                    </div>
                    <div className="notification-message">Sua filha chegou no horário tudo certo</div>
                  </div>
                )}
              </div>

              {/* Notificação 2 - João */}
              <div 
                className={`notification-item ${selectedNotification === 1 ? 'selected' : ''} ${notificationTimers.joao ? 'visible' : ''}`}
                onClick={() => handleNotificationClick(1)}
              >
                <div className="notification-dot"></div>
                {notificationTimers.joao && (
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="notification-name">João chegou em IAV</span>
                      <span className="notification-time">12/08/2025 13:30</span>
                    </div>
                    <div className="notification-message">Seu filho chegou no horário tudo certo</div>
                  </div>
                )}
              </div>

              {/* Notificação 3 - Ana */}
              <div 
                className={`notification-item ${selectedNotification === 2 ? 'selected' : ''} ${notificationTimers.ana ? 'visible' : ''}`}
                onClick={() => handleNotificationClick(2)}
              >
                <div className="notification-dot"></div>
                {notificationTimers.ana && (
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="notification-name">Ana chegou em CEU</span>
                      <span className="notification-time late">12/08/2025 13:40</span>
                    </div>
                    <div className="notification-message">Sua filha chegou atrasada</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificações Push - Aparecem automaticamente */}
      <div className="push-notifications-container">
        {pushNotifications.map((notification) => (
          <div 
            key={notification.id}
            className={`push-notification ${notification.visible ? 'visible' : ''}`}
            onClick={() => handlePushNotificationClick(notification.id)}
          >
            <button 
              className="push-notification-close"
              onClick={(e) => {
                e.stopPropagation() // Impede que o clique no X abra o modal
                dismissPushNotification(notification.id)
              }}
              aria-label="Fechar notificação"
            >
              ✕
            </button>
            
            <div className="push-notification-content">
              <div className="push-notification-header">
                <div className="push-notification-dot"></div>
                <span className="push-notification-name">{notification.name}</span>
                <span className={`push-notification-time ${notification.isLate ? 'late' : ''}`}>
                  {notification.time}
                </span>
              </div>
              <div className="push-notification-message">{notification.message}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
