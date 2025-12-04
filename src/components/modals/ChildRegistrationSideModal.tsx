"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChildData, SexoOption } from '@/types';
import { childService } from '@/services/childService';
import { utilsService } from '@/services/utilsService';
import { azureStorageService } from '@/services/azureStorageService';
import { API_BASE_URL } from '@/services/config';
import "../../app/styles/ConversationsModal.css";

interface ChildDependente {
  nome: string;
  id_pessoa: number;
  id_crianca: number;
  foto_perfil: string | null;
  id_responsavel: number;
}

// Interface para aula da atividade
interface AulaAtividade {
  aula_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  vagas_total: number;
  vagas_disponiveis: number;
}

// Interface para atividade matriculada
interface AtividadeMatriculada {
  id_inscricao: number;
  atividade_id: number;
  titulo: string;
  instituicao: string;
  categoria: string;
  status_id: number;
  status_inscricao: string;
  aulas: AulaAtividade[];
}

interface ChildRegistrationSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  // Dados pré-carregados da home (evita chamadas duplicadas)
  initialChildren?: ChildDependente[];
  initialSexoOptions?: SexoOption[];
  onChildrenChange?: () => void;
}

const ChildRegistrationSideModal: React.FC<ChildRegistrationSideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  initialChildren,
  initialSexoOptions,
  onChildrenChange,
}) => {
  // Controle de view: 'list' = lista de crianças, 'form' = formulário de cadastro, 'profile' = perfil da criança
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'profile'>('list');
  const [children, setChildren] = useState<ChildDependente[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  
  // Estados para perfil da criança
  const [selectedChild, setSelectedChild] = useState<ChildDependente | null>(null);
  const [childEmail, setChildEmail] = useState<string | null>(null);
  const [childActivities, setChildActivities] = useState<AtividadeMatriculada[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  
  // Estados para popup de inscrição em aula
  const [showClassEnrollPopup, setShowClassEnrollPopup] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<AtividadeMatriculada | null>(null);
  const [availableClasses, setAvailableClasses] = useState<AulaAtividade[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  
  // Falas da mascote Sofia
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(0);
  const sofiaSpeeches = [
    "Olá! Eu sou a <strong>Sofia</strong>! Estou aqui para te ajudar a cadastrar sua primeira criança na OportunyFam!",
    "Ao cadastrar uma criança, você poderá <strong>inscrevê-la em instituições e aulas</strong> disponíveis na plataforma. É muito fácil!",
    "Você, como responsável, terá acesso para <strong>gerenciar o perfil da criança</strong>, acompanhar inscrições e muito mais. Vamos começar?"
  ];
  const isLastSpeech = currentSpeechIndex === sofiaSpeeches.length - 1;

  // Navegação por teclado nas falas da Sofia
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (children.length === 0 && currentView === 'list') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          setCurrentSpeechIndex(prev => Math.min(sofiaSpeeches.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          setCurrentSpeechIndex(prev => Math.max(0, prev - 1));
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, children.length, currentView, sofiaSpeeches.length]);

  const [formData, setFormData] = useState<Partial<ChildData>>({
    nome: '',
    cpf: '',
    data_nascimento: '',
    id_sexo: undefined,
    foto_perfil: '',
    email: '',
    senha: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [sexoOptions, setSexoOptions] = useState<SexoOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usa dados pré-carregados da home (se disponíveis) - evita chamadas duplicadas
  useEffect(() => {
    if (initialChildren) {
      setChildren(initialChildren);
    }
  }, [initialChildren]);

  useEffect(() => {
    if (initialSexoOptions && initialSexoOptions.length > 0) {
      setSexoOptions(initialSexoOptions);
    }
  }, [initialSexoOptions]);

  // Apenas reseta a view quando abre o modal (não faz mais chamadas de API)
  useEffect(() => {
    if (isOpen) {
      setCurrentView('list');
      setError(null);
    }
  }, [isOpen]);

  // Função para formatar CPF
  const formatCPF = (digits: string) => {
    const s = digits.replace(/\D/g, '').slice(0, 11);
    if (s.length <= 3) return s;
    if (s.length <= 6) return `${s.slice(0,3)}.${s.slice(3)}`;
    if (s.length <= 9) return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6)}`;
    return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-${s.slice(9)}`;
  };

  const handleInputChange = (field: keyof ChildData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await azureStorageService.uploadImage(file);
      handleInputChange('foto_perfil', url);
    } catch (error) {
      console.error('Erro ao enviar foto da criança para o Azure:', error);
      setError('Não foi possível enviar a foto. Tente novamente.');
    }
  };

  const openDatePicker = () => {
    if (!dateInputRef.current) return;

    const input = dateInputRef.current as HTMLInputElement & {
      showPicker?: () => void;
    };

    try {
      if (input.showPicker) {
        input.showPicker();
        return;
      }
    } catch {
      // Ignora falhas do showPicker em navegadores que não suportam
    }

    // Fallback: foco + click para tentar abrir o datepicker nativo
    input.focus();
    try {
      input.click();
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validações básicas
      if (!formData.nome || !formData.cpf || !formData.data_nascimento || !formData.id_sexo) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      if (!formData.email) {
        throw new Error('Email é obrigatório');
      }

      if (!formData.senha) {
        throw new Error('Senha é obrigatória');
      }

      if (!utilsService.isPasswordStrong(formData.senha)) {
        throw new Error(utilsService.getPasswordStrengthMessage());
      }

      if (formData.senha !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (!formData.cpf || !utilsService.validateCPF(formData.cpf)) {
        throw new Error('CPF inválido');
      }

      const childData: ChildData = {
        nome: formData.nome,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        id_sexo: formData.id_sexo,
        id_usuario: userId,
        foto_perfil: formData.foto_perfil || '',
        email: formData.email,
        senha: formData.senha
      };

      await childService.registerChild(childData);
      onSuccess();

      // Notifica a home para atualizar a lista de crianças (chamada centralizada)
      onChildrenChange?.();
      
      // Limpa o formulário
      setFormData({
        nome: '',
        cpf: '',
        data_nascimento: '',
        id_sexo: undefined,
        foto_perfil: '',
        email: '',
        senha: ''
      });
      setConfirmPassword('');
      
      // Volta para a lista imediatamente
      setCurrentView('list');
    } catch (error) {
      console.error('Erro ao cadastrar criança:', error);
      setError(error instanceof Error ? error.message : 'Erro ao cadastrar criança');
    } finally {
      setIsLoading(false);
    }
  };

  // Abre o perfil da criança e busca suas atividades
  const handleOpenChildProfile = async (child: ChildDependente) => {
    setSelectedChild(child);
    setCurrentView('profile');
    setIsLoadingActivities(true);
    setChildActivities([]);
    setChildEmail(null);
    
    try {
      // Busca os dados da criança incluindo atividades matriculadas
      const response = await fetch(`${API_BASE_URL}/criancas/${child.id_crianca}`);
      if (response.ok) {
        const data = await response.json();
        const crianca = data?.crianca;
        const atividades = crianca?.atividades_matriculadas || [];
        setChildActivities(atividades);
        setChildEmail(crianca?.email || null);
      }
    } catch (err) {
      console.error('Erro ao buscar atividades da criança:', err);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Volta do perfil para a lista
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedChild(null);
    setChildActivities([]);
    setChildEmail(null);
  };

  // Estado de loading para busca de aulas
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // Abre popup de aulas para uma atividade aprovada
  const handleOpenClassEnrollPopup = async (activity: AtividadeMatriculada) => {
    setSelectedActivity(activity);
    setShowClassEnrollPopup(true);
    setSelectedClassId(null);
    setAvailableClasses([]);
    setIsLoadingClasses(true);
    
    try {
      // Busca os detalhes da atividade incluindo as aulas
      const response = await fetch(`${API_BASE_URL}/atividades/${activity.atividade_id}`);
      if (response.ok) {
        const json = await response.json();
        const atividade = json?.atividade ?? json;
        const aulas: AulaAtividade[] = Array.isArray(atividade?.aulas) 
          ? atividade.aulas.map((a: any) => ({
              aula_id: a.aula_id,
              data: a.data,
              hora_inicio: a.hora_inicio,
              hora_fim: a.hora_fim,
              vagas_total: a.vagas_total,
              vagas_disponiveis: a.vagas_disponiveis,
            }))
          : [];
        
        // Filtra apenas aulas futuras com vagas disponíveis
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureClasses = aulas.filter((aula: AulaAtividade) => {
          // Tenta parse de formato YYYY-MM-DD ou DD/MM/YYYY
          let aulaDate: Date;
          if (aula.data.includes('-')) {
            aulaDate = new Date(aula.data + 'T00:00:00');
          } else {
            const parts = aula.data.split('/');
            if (parts.length === 3) {
              aulaDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else {
              return false;
            }
          }
          return aulaDate >= today && aula.vagas_disponiveis > 0;
        });
        
        setAvailableClasses(futureClasses);
      }
    } catch (err) {
      console.error('Erro ao buscar aulas da atividade:', err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // Fecha o popup de aulas
  const handleCloseClassEnrollPopup = () => {
    setShowClassEnrollPopup(false);
    setSelectedActivity(null);
    setAvailableClasses([]);
    setSelectedClassId(null);
    setIsEnrollingClass(false);
  };

  // Estado de loading para inscrição em aula
  const [isEnrollingClass, setIsEnrollingClass] = useState(false);

  // Confirma inscrição na aula selecionada
  const handleConfirmClassEnroll = async () => {
    if (!selectedClassId || !selectedActivity) return;
    if (isEnrollingClass) return; // Proteção contra duplo clique
    
    setIsEnrollingClass(true);
    
    try {
      const payload = {
        id_inscricao_atividade: selectedActivity.id_inscricao,
        id_aula_atividade: selectedClassId,
        presente: false,
        nota_observacao: ""
      };
      
      const response = await fetch(`${API_BASE_URL}/matriculas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        // Sucesso - fecha o popup e atualiza os dados
        handleCloseClassEnrollPopup();
        
        // Recarrega os dados da criança para atualizar a lista de atividades
        if (selectedChild) {
          handleOpenChildProfile(selectedChild);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro ao matricular na aula:', errorData);
        alert('Não foi possível realizar a matrícula. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao matricular na aula:', err);
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsEnrollingClass(false);
    }
  };

  // Retorna a cor do status baseado no texto
  const getStatusColor = (statusText: string): string => {
    const status = statusText?.toLowerCase() || '';
    if (status.includes('aprovad')) return 'status-approved';
    if (status.includes('rejeitad') || status.includes('recusad')) return 'status-rejected';
    if (status.includes('pendente') || status.includes('aguardando')) return 'status-pending';
    return 'status-pending';
  };

  // Formata data DD/MM/YYYY para exibição
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}`;
    }
    return dateStr;
  };

  // Formata hora HH:MM:SS para HH:MM
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  if (!isOpen) return null;

  return (
    <div className="conversations-modal-overlay">
      <style jsx>{`
        .form-buttons {
          display: flex;
          gap: 12px;
          padding: 20px;
          background: var(--bg-card);
          flex-shrink: 0;
        }
        
        :global(body.dark) .form-buttons {
          background: var(--bg-card-dark);
        }
        
        .btn-cancel {
          flex: 1;
          padding: 10px 18px;
          border: 1px solid rgba(244, 162, 97, 0.4);
          border-radius: 26px;
          background: transparent;
          color: #666;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        :global(body.dark) .btn-cancel {
          color: #ccc;
        }
        
        .btn-cancel:hover:not(:disabled) {
          border-color: #f4a261;
          background: rgba(244, 162, 97, 0.1);
          color: #f4a261;
        }
        
        .btn-submit {
          flex: 1;
          padding: 10px 18px;
          border: none;
          border-radius: 20px;
          background: #e8943f;
          color: white;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn-submit:hover:not(:disabled) {
          background: #d4832e;
        }
        
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .mascot-container {
          position: absolute;
          bottom: 70px;
          right: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
          animation: mascotSlideIn 0.5s ease-out;
        }

        @keyframes mascotSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mascot-speech-bubble {
          background: white;
          border-radius: 16px;
          padding: 12px 16px;
          margin-bottom: 16px;
          margin-left: 20px;
          max-width: 200px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          position: relative;
          animation: bubblePop 0.3s ease-out 0.3s both;
        }

        @keyframes bubblePop {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .mascot-speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid white;
        }

        :global(body.dark) .mascot-speech-bubble {
          background: #2d3748;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        :global(body.dark) .mascot-speech-bubble::after {
          border-top-color: #2d3748;
        }

        .mascot-greeting {
          font-size: 13px;
          color: #4a5568;
          line-height: 1.4;
          margin: 0;
        }

        .mascot-greeting strong {
          color: #e8943f;
        }

        :global(body.dark) .mascot-greeting {
          color: #e2e8f0;
        }

        .mascot-image {
          width: 130px;
          height: 130px;
          object-fit: contain;
        }

        .speech-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        :global(body.dark) .speech-navigation {
          border-top-color: rgba(255, 255, 255, 0.1);
        }

        .speech-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 50%;
          background: rgba(232, 148, 63, 0.15);
          color: #e8943f;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .speech-nav-btn:hover:not(:disabled) {
          background: rgba(232, 148, 63, 0.25);
          transform: scale(1.1);
        }

        .speech-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .speech-dots {
          display: flex;
          gap: 6px;
        }

        .speech-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }

        .speech-dot.active {
          background: #e8943f;
          transform: scale(1.2);
        }

        :global(body.dark) .speech-dot {
          background: rgba(255, 255, 255, 0.2);
        }

        :global(body.dark) .speech-dot.active {
          background: #e8943f;
        }

        .btn-new-child:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* === ANIMAÇÕES DE TRANSIÇÃO === */
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .view-list-enter {
          animation: slideInFromLeft 0.3s ease-out;
        }

        .view-form-enter {
          animation: slideInFromRight 0.3s ease-out;
        }

        /* === TELA DE LISTA DE CRIANÇAS === */
        .children-list-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px;
          animation: fadeIn 0.25s ease-out;
        }

        .children-list-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }

        :global(body.dark) .children-list-title {
          color: #f5f5f5;
        }

        .children-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 4px;
        }

        .child-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          margin: 0 8px;
          background: var(--bg-light);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: transform 0.2s ease,
                      background-color 0.2s ease,
                      border-color 0.2s ease,
                      box-shadow 0.2s ease;
        }

        .child-item:hover {
          background-color: var(--bg-hover-light);
          border-color: var(--orange);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(244, 162, 97, 0.15);
        }

        :global(body.dark) .child-item {
          background: var(--bg-card-dark);
          border-color: var(--border-dark);
        }

        :global(body.dark) .child-item:hover {
          background-color: var(--hover-bg-dark);
          border-color: var(--orange);
          box-shadow: 0 2px 8px var(--shadow-dark);
        }

        .child-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .child-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .child-avatar .default-institution-icon {
          width: 100%;
          height: 100%;
        }

        .child-info {
          flex: 1;
        }

        .child-name {
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }

        :global(body.dark) .child-name {
          color: #f5f5f5;
        }

        .child-arrow {
          color: #999;
          flex-shrink: 0;
        }

        :global(body.dark) .child-arrow {
          color: #666;
        }

        .empty-children {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }

        .empty-children-text {
          font-size: 15px;
          color: #666;
          margin-top: 20px;
          line-height: 1.5;
        }

        :global(body.dark) .empty-children-text {
          color: #aaa;
        }

        .btn-new-child {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 20px;
          margin-top: 16px;
          border: none;
          border-radius: 26px;
          background: #e8943f;
          color: white;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-new-child:hover:not(:disabled) {
          background: #d4832e;
        }

        .btn-later {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px 20px;
          margin-top: 12px;
          border: 1px solid rgba(244, 162, 97, 0.4);
          border-radius: 26px;
          background: transparent;
          color: #666;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-later:hover {
          border-color: #f4a261;
          background: rgba(244, 162, 97, 0.1);
          color: #f4a261;
        }

        :global(body.dark) .btn-later {
          color: #ccc;
        }

        :global(body.dark) .btn-later:hover {
          border-color: #f4a261;
          background: rgba(244, 162, 97, 0.1);
          color: #f4a261;
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          margin-bottom: 16px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #666;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .btn-back:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #333;
        }

        :global(body.dark) .btn-back {
          color: #aaa;
        }

        :global(body.dark) .btn-back:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f5f5f5;
        }

        .loading-children {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #666;
        }

        :global(body.dark) .loading-children {
          color: #aaa;
        }

        .photo-upload-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 46px;
        }

        .photo-upload-circle {
          position: relative;
          width: 124px;
          height: 124px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(244, 162, 97, 0.15), rgba(231, 111, 81, 0.1));
          padding: 2px;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          box-sizing: border-box;
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }

        .photo-upload-circle:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .photo-upload-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-upload-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: radial-gradient(circle at center, rgba(0,0,0,0.45), rgba(0,0,0,0.75));
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #fff;
          text-align: center;
          padding: 8px;
        }

        .photo-upload-circle:hover .photo-upload-overlay {
          opacity: 1;
        }

        .photo-upload-plus {
          font-size: 20px;
          font-weight: 600;
          line-height: 1;
        }

        .photo-upload-text {
          font-size: 12px;
          font-weight: 500;
        }

        :global(body.dark) .photo-upload-circle {
          background: linear-gradient(135deg, rgba(244, 162, 97, 0.18), rgba(231, 111, 81, 0.16));
        }

        :global(body.dark) .photo-upload-circle:hover {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
        }

        .form-group {
          position: relative;
          margin-bottom: 24px;
        }
        
        .form-input {
          width: 100%;
          padding: 20px 16px 12px 16px;
          border: 1px solid rgba(244, 162, 97, 0.4);
          border-radius: 8px;
          background: transparent;
          font-size: 16px;
          color: #333;
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
        }
        
        :global(body.dark) .form-input {
          color: #fff;
        }
        
        .form-input:focus {
          border-color: #f4a261;
          background: transparent;
        }
        
        .form-input:focus + .form-label,
        .form-input:not(:placeholder-shown) + .form-label {
          transform: translateY(-24px) scale(0.85);
          color: #f4a261;
          font-weight: 600;
          background: var(--bg-card);
        }
        
        :global(body.dark) .form-input:focus + .form-label,
        :global(body.dark) .form-input:not(:placeholder-shown) + .form-label {
          background: var(--bg-card-dark);
        }
        
        .form-label {
          position: absolute;
          left: 12px;
          top: 16px;
          color: #666;
          font-size: 16px;
          pointer-events: none;
          transition: all 0.3s ease;
          transform-origin: left top;
          background: transparent;
          padding: 0 8px;
          border-radius: 4px;
        }
        
        :global(body.dark) .form-label {
          color: #fff;
        }
        
        .form-select {
          width: 100%;
          padding: 20px 16px 12px 16px;
          border: 1px solid rgba(244, 162, 97, 0.4);
          border-radius: 8px;
          background-color: var(--bg-card);
          font-size: 16px;
          color: #333;
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23f4a261' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 16px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 48px;
        }
        
        :global(body.dark) .form-select {
          color: #fff;
          background-color: var(--bg-card-dark);
          border-color: rgba(244, 162, 97, 0.5);
        }
        
        .form-select:focus {
          border-color: #f4a261;
          background-color: var(--bg-card);
        }
        
        .form-select:focus + .form-label,
        .form-select:not([value=""]) + .form-label {
          transform: translateY(-24px) scale(0.85);
          color: #f4a261;
          font-weight: 600;
          background: var(--bg-card);
        }
        
        :global(body.dark) .form-select:focus + .form-label,
        :global(body.dark) .form-select:not([value=""]) + .form-label {
          background: var(--bg-card-dark);
        }
        
        :global(.form-select option) {
          background-color: var(--bg-card);
          color: var(--text-dark);
        }
        
        :global(body.dark) .form-select option {
          background-color: var(--bg-card-dark);
          color: var(--text-dark-theme);
        }
        
        .date-input-wrapper {
          position: relative;
        }
        
        .date-input {
          width: 100%;
          padding: 20px 48px 12px 16px;
          border: 1px solid rgba(244, 162, 97, 0.4);
          border-radius: 8px;
          background-color: var(--bg-card);
          font-size: 16px;
          color: #333;
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
          -webkit-appearance: none;
          -moz-appearance: textfield;
          appearance: none;
        }
        
        :global(body.dark) .date-input {
          color: #fff;
          background-color: var(--bg-card-dark);
          border-color: rgba(244, 162, 97, 0.5);
          color-scheme: dark;
        }
        
        :global(.date-input::-webkit-calendar-picker-indicator),
        :global(input[type="date"]::-webkit-calendar-picker-indicator) {
          opacity: 0 !important;
          display: none !important;
          -webkit-appearance: none;
          background: transparent;
          color: transparent;
          width: 0;
          height: 0;
          margin: 0;
          padding: 0;
        }

        :global(input[type="date"]::-moz-calendar-picker-indicator) {
          opacity: 0 !important;
          display: none !important;
          -moz-appearance: none;
          background: transparent;
          color: transparent;
          width: 0;
          height: 0;
          margin: 0;
          padding: 0;
        }
        
        .date-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: auto;
          color: #f4a261;
          width: 20px;
          height: 20px;
          cursor: pointer;
          z-index: 2;
        }
        
        .date-input:focus {
          border-color: #f4a261;
          background-color: var(--bg-card);
        }

        :global(body.dark) .date-input:focus {
          background-color: var(--bg-card-dark);
        }
        
        .date-input:focus ~ .form-label,
        .date-input:not(:placeholder-shown) ~ .form-label {
          transform: translateY(-24px) scale(0.85);
          color: #f4a261;
          font-weight: 600;
          background: var(--bg-card);
        }
        
        :global(body.dark) .date-input:focus ~ .form-label,
        :global(body.dark) .date-input:not(:placeholder-shown) ~ .form-label {
          background: var(--bg-card-dark);
        }
        
        .password-wrapper {
          position: relative;
        }

        /* Esconde o botão nativo de mostrar senha do navegador */
        .password-wrapper input::-ms-reveal,
        .password-wrapper input::-ms-clear {
          display: none;
        }
        
        .password-wrapper .form-input:focus ~ .form-label,
        .password-wrapper .form-input:not(:placeholder-shown) ~ .form-label {
          transform: translateY(-24px) scale(0.85);
          color: #f4a261;
          font-weight: 600;
          background: var(--bg-card);
        }
        
        :global(body.dark) .password-wrapper .form-input:focus ~ .form-label,
        :global(body.dark) .password-wrapper .form-input:not(:placeholder-shown) ~ .form-label {
          background: var(--bg-card-dark);
        }
        
        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #f4a261;
          font-size: 18px;
          padding: 4px;
          border-radius: 4px;
          transition: transform 0.15s ease-out;
        }
        
        .password-toggle:hover {
          transform: translateY(-50%) scale(1.08);
        }
        
        .error-message {
          background: linear-gradient(135deg, rgba(231, 111, 81, 0.1), rgba(231, 111, 81, 0.05));
          border: 1px solid rgba(231, 111, 81, 0.3);
          color: #e76f51;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }

        .child-success-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.35);
          z-index: 50;
        }

        .child-success-card {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 24px 24px 20px 24px;
          max-width: 380px;
          width: 100%;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
        }

        :global(body.dark) .child-success-card {
          background: var(--bg-card-dark);
          color: var(--text-dark-theme);
          box-shadow: 0 10px 25px var(--shadow-dark);
        }

        .child-success-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 30px;
          margin: 0 auto 18px auto;
        }

        .child-success-title {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1F2937;
        }

        .child-success-message {
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 4px;
        }

        :global(body.dark) .child-success-title {
          color: var(--text-dark-theme);
        }

        :global(body.dark) .child-success-message {
          color: var(--text-secondary-dark);
        }

        /* === PERFIL DA CRIANÇA === */
        .child-profile-container {
          padding: 20px;
        }

        .child-profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          position: relative;
        }

        :global(body.dark) .child-profile-header {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .btn-back-profile {
          position: absolute;
          left: 0;
          top: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid transparent;
          background: transparent;
          color: var(--orange);
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
        }

        .btn-back-profile:hover {
          background: rgba(244, 162, 97, 0.12);
          border-color: rgba(244, 162, 97, 0.45);
          transform: translateY(-1px);
        }

        :global(body.dark) .btn-back-profile:hover {
          background: rgba(244, 162, 97, 0.2);
          border-color: rgba(244, 162, 97, 0.55);
        }

        .child-profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .child-profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(244, 162, 97, 0.3);
        }

        .child-profile-avatar .default-institution-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--orange);
          background: transparent;
          border: 1.5px solid rgba(244, 162, 97, 0.3);
          border-radius: 50%;
          padding: 8px;
          box-sizing: border-box;
        }

        .child-profile-avatar .default-institution-icon svg {
          width: 70%;
          height: 70%;
          opacity: 0.8;
        }

        .child-profile-name {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        :global(body.dark) .child-profile-name {
          color: #f5f5f5;
        }

        .child-profile-email {
          font-size: 13px;
          color: #888;
          margin-top: 4px;
        }

        :global(body.dark) .child-profile-email {
          color: #999;
        }

        .child-activities-section {
          margin-top: 8px;
        }

        .child-activities-title {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .child-activities-title svg {
          color: var(--orange);
        }

        :global(body.dark) .child-activities-title {
          color: #f5f5f5;
        }

        .child-activities-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .child-activity-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--bg-light);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          gap: 12px;
        }

        :global(body.dark) .child-activity-card {
          background: var(--bg-card-dark);
          border-color: var(--border-dark);
        }

        .child-activity-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .child-activity-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(body.dark) .child-activity-name {
          color: #f5f5f5;
        }

        .child-activity-institution {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(body.dark) .child-activity-institution {
          color: #999;
        }

        .child-activity-status {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 12px;
          display: inline-block;
          width: fit-content;
        }

        .child-activity-status.status-pending {
          background: rgba(251, 191, 36, 0.15);
          color: #d97706;
        }

        .child-activity-status.status-approved {
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
        }

        .child-activity-status.status-rejected {
          background: rgba(239, 68, 68, 0.15);
          color: #dc2626;
        }

        .btn-enroll-class {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: var(--orange);
          color: white;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-enroll-class:hover {
          background: #e76f51;
          transform: translateY(-1px);
        }

        .loading-activities,
        .empty-activities {
          text-align: center;
          padding: 30px 20px;
          color: #666;
        }

        .empty-activities p {
          font-size: 15px;
          font-weight: 500;
          margin: 0 0 6px 0;
          color: #444;
        }

        .empty-activities span {
          font-size: 13px;
          color: #888;
        }

        :global(body.dark) .loading-activities,
        :global(body.dark) .empty-activities {
          color: #999;
        }

        :global(body.dark) .empty-activities p {
          color: #ccc;
        }

        :global(body.dark) .empty-activities span {
          color: #888;
        }

        /* === POPUP DE INSCRIÇÃO EM AULA === */
        .class-enroll-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .class-enroll-popup {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 420px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        :global(body.dark) .class-enroll-popup {
          background: var(--bg-card-dark);
        }

        .class-enroll-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        :global(body.dark) .class-enroll-header {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .class-enroll-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        :global(body.dark) .class-enroll-header h3 {
          color: #f5f5f5;
        }

        .class-enroll-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .class-enroll-close:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #333;
        }

        :global(body.dark) .class-enroll-close {
          color: #999;
        }

        :global(body.dark) .class-enroll-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f5f5f5;
        }

        .class-enroll-subtitle {
          padding: 12px 20px;
          margin: 0;
          font-size: 14px;
          color: #666;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        :global(body.dark) .class-enroll-subtitle {
          color: #999;
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }

        .class-enroll-subtitle strong {
          color: var(--orange);
        }

        .available-classes-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px;
        }

        .available-class-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #e0e0e0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .available-class-card:hover {
          border-color: rgba(244, 162, 97, 0.5);
          background: rgba(244, 162, 97, 0.03);
        }

        .available-class-card.selected {
          border-color: var(--orange);
          background: rgba(244, 162, 97, 0.08);
        }

        :global(body.dark) .available-class-card {
          border-color: var(--border-dark);
        }

        :global(body.dark) .available-class-card:hover {
          border-color: rgba(244, 162, 97, 0.5);
          background: rgba(244, 162, 97, 0.08);
        }

        :global(body.dark) .available-class-card.selected {
          border-color: var(--orange);
          background: rgba(244, 162, 97, 0.12);
        }

        .class-card-date {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: rgba(244, 162, 97, 0.12);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .class-date-day {
          font-size: 14px;
          font-weight: 700;
          color: var(--orange);
        }

        .class-card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .class-time {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .class-time svg {
          color: #888;
        }

        :global(body.dark) .class-time {
          color: #f5f5f5;
        }

        .class-vacancies {
          font-size: 12px;
          color: #059669;
        }

        .class-card-check {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--orange);
        }

        .loading-classes,
        .empty-classes {
          text-align: center;
          padding: 30px 20px;
          color: #666;
        }

        .empty-classes p {
          font-size: 15px;
          font-weight: 500;
          margin: 0 0 6px 0;
          color: #444;
        }

        .empty-classes span {
          font-size: 13px;
          color: #888;
        }

        :global(body.dark) .loading-classes,
        :global(body.dark) .empty-classes {
          color: #999;
        }

        :global(body.dark) .empty-classes p {
          color: #ccc;
        }

        .class-enroll-footer {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        :global(body.dark) .class-enroll-footer {
          border-top-color: rgba(255, 255, 255, 0.1);
        }

        .btn-cancel-enroll {
          flex: 1;
          padding: 12px 20px;
          border-radius: 10px;
          border: 1.5px solid #e0e0e0;
          background: transparent;
          color: #666;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel-enroll:hover {
          border-color: #999;
          background: rgba(0, 0, 0, 0.03);
        }

        :global(body.dark) .btn-cancel-enroll {
          border-color: var(--border-dark);
          color: #999;
        }

        .btn-confirm-enroll {
          flex: 1;
          padding: 12px 20px;
          border-radius: 10px;
          border: none;
          background: var(--orange);
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-confirm-enroll:hover:not(:disabled) {
          background: #e76f51;
        }

        .btn-confirm-enroll:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      <div className="conversations-modal-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header com título e botão X */}
        <div className="conversations-modal-header">
          <h1 className="conversations-modal-title">
            <svg
              className="conversations-modal-title-icon"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Rosto da criança */}
              <circle cx="12" cy="9" r="7" />
              {/* Cabelo/topete */}
              <path d="M8 3c2-2 6-2 8 0" />
              {/* Olhos */}
              <circle cx="9.5" cy="8" r="1.2" fill="currentColor" />
              <circle cx="14.5" cy="8" r="1.2" fill="currentColor" />
              {/* Sorriso */}
              <path d="M9 12c1.5 2 4.5 2 6 0" />
              {/* Corpo */}
              <path d="M12 16v5" />
              <path d="M8 21h8" />
            </svg>
            <span>{currentView === 'list' ? 'Suas Crianças' : currentView === 'profile' ? selectedChild?.nome || 'Perfil' : 'Cadastrar Criança'}</span>
          </h1>
          <button className="conversations-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* === TELA DE LISTA DE CRIANÇAS === */}
        {currentView === 'list' && (
          <div className="conversations-main view-list-enter" style={{ padding: '0', overflowY: 'auto', position: 'relative', flex: 1 }}>
            <div className="children-list-container">
              {isLoadingChildren ? (
                <div className="loading-children">Carregando...</div>
              ) : children.length > 0 ? (
                <>
                  <div className="children-list">
                    {children.map((child) => (
                      <div key={child.id_crianca} className="child-item" onClick={() => handleOpenChildProfile(child)}>
                        <div className="child-avatar">
                          {child.foto_perfil ? (
                            <img src={child.foto_perfil} alt={child.nome} />
                          ) : (
                            <div className="default-institution-icon">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="child-info">
                          <div className="child-name">{child.nome}</div>
                        </div>
                        <svg className="child-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="btn-new-child"
                    onClick={() => setCurrentView('form')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nova criança
                  </button>
                </>
              ) : (
                <div className="empty-children">
                  <div className="mascot-container" style={{ position: 'relative', bottom: 'auto', right: 'auto', alignItems: 'center' }}>
                    <div className="mascot-speech-bubble">
                      <p 
                        className="mascot-greeting"
                        dangerouslySetInnerHTML={{ __html: sofiaSpeeches[currentSpeechIndex] }}
                      />
                      <div className="speech-navigation">
                        <button 
                          className="speech-nav-btn"
                          onClick={() => setCurrentSpeechIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentSpeechIndex === 0}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <div className="speech-dots">
                          {sofiaSpeeches.map((_, index) => (
                            <div 
                              key={index} 
                              className={`speech-dot ${index === currentSpeechIndex ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                        <button 
                          className="speech-nav-btn"
                          onClick={() => setCurrentSpeechIndex(prev => Math.min(sofiaSpeeches.length - 1, prev + 1))}
                          disabled={currentSpeechIndex === sofiaSpeeches.length - 1}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <img 
                      src="/images/mascot-sofia.svg" 
                      alt="Sofia - Assistente" 
                      className="mascot-image"
                    />
                  </div>
                  <button 
                    className="btn-new-child"
                    onClick={() => setCurrentView('form')}
                    disabled={!isLastSpeech}
                    title={!isLastSpeech ? 'Leia todas as mensagens da Sofia primeiro' : ''}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Cadastrar primeira criança
                  </button>
                  <button 
                    className="btn-later"
                    onClick={onClose}
                  >
                    Mais tarde
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === TELA DE PERFIL DA CRIANÇA === */}
        {currentView === 'profile' && selectedChild && (
          <div className="conversations-main view-form-enter" style={{ padding: '0', overflowY: 'auto', position: 'relative', flex: 1 }}>
            <div className="child-profile-container">
              {/* Header do perfil com foto e nome */}
              <div className="child-profile-header">
                <button className="btn-back-profile" onClick={handleBackToList}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div className="child-profile-avatar">
                  {selectedChild.foto_perfil ? (
                    <img src={selectedChild.foto_perfil} alt={selectedChild.nome} />
                  ) : (
                    <div className="default-institution-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      </svg>
                    </div>
                  )}
                </div>
                <h2 className="child-profile-name">{selectedChild.nome}</h2>
                {childEmail && (
                  <span className="child-profile-email">{childEmail}</span>
                )}
              </div>

              {/* Seção de Atividades */}
              <div className="child-activities-section">
                <h3 className="child-activities-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Atividades Inscritas
                </h3>

                {isLoadingActivities ? (
                  <div className="loading-activities">Carregando atividades...</div>
                ) : childActivities.length > 0 ? (
                  <div className="child-activities-list">
                    {childActivities.map((activity, index) => (
                      <div key={activity.id_inscricao || `activity-${index}`} className="child-activity-card">
                        <div className="child-activity-info">
                          <span className="child-activity-name">{activity.titulo}</span>
                          <span className="child-activity-institution">{activity.instituicao}</span>
                          <span className={`child-activity-status ${getStatusColor(activity.status_inscricao)}`}>
                            {activity.status_inscricao}
                          </span>
                        </div>
                        {/* Botão de inscrever em aula - apenas para aprovados */}
                        {activity.status_inscricao?.toLowerCase() === 'aprovada' && (
                          <button 
                            className="btn-enroll-class"
                            onClick={() => handleOpenClassEnrollPopup(activity)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Inscrever em aula
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-activities">
                    <p>Nenhuma atividade inscrita</p>
                    <span>Inscreva a criança em atividades através do mapa</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Popup de inscrição em aula */}
        {showClassEnrollPopup && selectedActivity && (
          <div className="class-enroll-popup-overlay" onClick={handleCloseClassEnrollPopup}>
            <div className="class-enroll-popup" onClick={(e) => e.stopPropagation()}>
              <div className="class-enroll-header">
                <h3>Aulas Disponíveis</h3>
                <button className="class-enroll-close" onClick={handleCloseClassEnrollPopup}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <p className="class-enroll-subtitle">
                Selecione uma aula para <strong>{selectedChild?.nome}</strong> na atividade <strong>{selectedActivity.titulo}</strong>
              </p>

              {isLoadingClasses ? (
                <div className="loading-classes">
                  <div className="loading-spinner"></div>
                  <p>Carregando aulas...</p>
                </div>
              ) : availableClasses.length > 0 ? (
                <div className="available-classes-list">
                  {availableClasses.map((aula) => (
                    <div 
                      key={aula.aula_id} 
                      className={`available-class-card ${selectedClassId === aula.aula_id ? 'selected' : ''}`}
                      onClick={() => setSelectedClassId(aula.aula_id)}
                    >
                      <div className="class-card-date">
                        <span className="class-date-day">{formatDate(aula.data)}</span>
                      </div>
                      <div className="class-card-info">
                        <span className="class-time">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {formatTime(aula.hora_inicio)} - {formatTime(aula.hora_fim)}
                        </span>
                        <span className="class-vacancies">
                          {aula.vagas_disponiveis} vaga{aula.vagas_disponiveis !== 1 ? 's' : ''} disponível
                        </span>
                      </div>
                      <div className="class-card-check">
                        {selectedClassId === aula.aula_id && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-classes">
                  <p>Nenhuma aula disponível</p>
                  <span>Não há aulas futuras com vagas para esta atividade</span>
                </div>
              )}

              <div className="class-enroll-footer">
                <button 
                  className="btn-cancel-enroll"
                  onClick={handleCloseClassEnrollPopup}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-confirm-enroll"
                  disabled={!selectedClassId || isEnrollingClass}
                  onClick={handleConfirmClassEnroll}
                >
                  {isEnrollingClass ? 'Inscrevendo...' : 'Inscrever na aula'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === TELA DE FORMULÁRIO === */}
        {currentView === 'form' && (
        <div className="conversations-main view-form-enter" style={{ padding: '20px', paddingBottom: '0', overflowY: 'auto', position: 'relative', flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <div className="photo-upload-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                className="photo-upload-circle"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.foto_perfil ? (
                  <img
                    src={formData.foto_perfil}
                    alt="Foto da criança"
                    className="photo-upload-image"
                  />
                ) : (
                  <div className="default-institution-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Rosto da criança */}
                      <circle cx="12" cy="12" r="8" />
                      {/* Olhos felizes */}
                      <path d="M8.5 10.5c0.3-0.5 0.8-0.5 1.2 0" />
                      <path d="M14.3 10.5c0.3-0.5 0.8-0.5 1.2 0" />
                      {/* Sorriso */}
                      <path d="M8.5 14.5c1 1.5 5.5 1.5 7 0" />
                      {/* Cabelo fofo */}
                      <path d="M7 7c1-2 3-3 5-3s4 1 5 3" />
                      <path d="M6.5 9c-0.5-1.5 0-3 0-3" />
                      <path d="M17.5 9c0.5-1.5 0-3 0-3" />
                    </svg>
                  </div>
                )}
                <div className="photo-upload-overlay">
                  <span className="photo-upload-plus">+</span>
                  <span className="photo-upload-text">Adicionar foto</span>
                </div>
              </button>
            </div>

            {/* Nome */}
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                value={formData.nome || ''}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder=" "
                required
              />
              <label className="form-label">Nome completo</label>
            </div>

            {/* CPF */}
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                value={formatCPF(formData.cpf || '')}
                onChange={(e) => handleInputChange('cpf', e.target.value.replace(/\D/g, ''))}
                placeholder=" "
                required
                maxLength={14}
              />
              <label className="form-label">CPF</label>
            </div>

            {/* Data de Nascimento */}
            <div className="form-group date-input-wrapper">
              <input
                type="date"
                ref={dateInputRef}
                className="date-input"
                value={formData.data_nascimento || ''}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                placeholder=" "
                required
              />
              <svg
                className="date-icon"
                viewBox="0 0 24 24"
                onClick={openDatePicker}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" fill="none"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor"/>
                <rect x="9" y="14" width="6" height="4" rx="1" ry="1" fill="currentColor"/>
              </svg>
              <label className="form-label">Data de nascimento</label>
            </div>

            {/* Sexo */}
            <div className="form-group">
              <select
                className="form-select"
                value={formData.id_sexo || ''}
                onChange={(e) => handleInputChange('id_sexo', parseInt(e.target.value))}
                required
              >
                <option value="">Selecione o sexo</option>
                {sexoOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nome}
                  </option>
                ))}
              </select>
              <label className="form-label">Sexo</label>
            </div>

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder=" "
                required
              />
              <label className="form-label">Email</label>
            </div>

            {/* Senha */}
            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={formData.senha || ''}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  placeholder=" "
                  required
                  style={{ paddingRight: '56px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    )}
                  </svg>
                </button>
                <label className="form-label">Senha</label>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  required
                  style={{ paddingRight: '56px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showConfirmPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    )}
                  </svg>
                </button>
                <label className="form-label">Confirmar senha</label>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

          </form>
        </div>
        )}

        {/* Botões fixos na parte inferior - só aparecem no formulário */}
        {currentView === 'form' && (
          <div className="form-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setCurrentView('list')}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Criança'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildRegistrationSideModal;
