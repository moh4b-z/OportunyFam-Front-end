"use client";

import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/services/config';
import './InstitutionStudentsList.css';

// Interface para aluno inscrito
interface AlunoInscrito {
  instituicao_id: number;
  instituicao_nome: string;
  atividade_id: number;
  atividade_titulo: string;
  crianca_id: number;
  crianca_nome: string;
  crianca_foto: string | null;
  status_id: number;
  status_inscricao: string;
  data_inscricao: string;
  id_inscricao: number;
}

// Interface para detalhes da criança
interface CriancaDetalhes {
  crianca_id: number;
  pessoa_id: number;
  nome: string;
  email: string;
  foto_perfil: string | null;
  data_nascimento: string;
  idade: number;
  sexo: string;
  responsaveis: {
    nome: string;
    email: string;
    telefone: string;
    id_pessoa: number;
    id_usuario: number;
    foto_perfil: string | null;
    id_responsavel: number;
  }[];
}

// Interface para dados do usuário/responsável
interface UsuarioDetalhes {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto_perfil: string | null;
  cpf?: string;
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

interface InstitutionStudentsListProps {
  instituicaoId: number;
  atividadeId: number | null;
  atividadeTitulo: string | null;
  onViewDetails?: (crianca: CriancaDetalhes) => void;
  onStartConversation?: (responsavelPessoaId: number, responsavelNome: string, responsavelFoto?: string | null) => void;
  instituicaoPessoaId?: number | null;
}

// Ícone de alunos/estudantes
const StudentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// Ícone de fechar
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Ícone de email
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

// Ícone de telefone
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

// Ícone de idade/calendário
const AgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// Ícone de sexo/gênero (pessoa)
const GenderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Ícone de usuário padrão (quando não tem foto)
const DefaultUserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Ícone de pesquisa
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Ícone de filtro
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

// Ícone de check
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Ícone de mensagem/conversa
const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// Opções de status
const STATUS_OPTIONS = [
  { id: null, label: 'Todos' },
  { id: 4, label: 'Aprovado' },
  { id: 3, label: 'Pendente' },
  { id: 2, label: 'Cancelado' },
  { id: 5, label: 'Negado' },
];

// Opções de status para alterar (sem "Todos")
const STATUS_CHANGE_OPTIONS = [
  { id: 4, label: 'Aprovado' },
  { id: 3, label: 'Pendente' },
  { id: 2, label: 'Cancelado' },
  { id: 5, label: 'Negado' },
];

const InstitutionStudentsList: React.FC<InstitutionStudentsListProps> = ({
  instituicaoId,
  atividadeId,
  atividadeTitulo,
  onViewDetails,
  onStartConversation,
  instituicaoPessoaId
}) => {
  const [alunos, setAlunos] = useState<AlunoInscrito[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Estados do modal de detalhes
  const [selectedAluno, setSelectedAluno] = useState<AlunoInscrito | null>(null);
  const [criancaDetalhes, setCriancaDetalhes] = useState<CriancaDetalhes | null>(null);
  const [responsavelDetalhes, setResponsavelDetalhes] = useState<UsuarioDetalhes | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [newStatusId, setNewStatusId] = useState<number | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  // Cache de alunos por atividade+status (persiste entre mudanças)
  const alunosCacheRef = useRef<Map<string, AlunoInscrito[]>>(new Map());

  // Gerar chave do cache
  const getCacheKey = (activityId: number, status: number | null) => {
    return `${activityId}-${status ?? 'all'}`;
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar alunos quando atividade ou filtro muda
  useEffect(() => {
    // Se não tem atividade, limpa e sai
    if (!instituicaoId || !atividadeId) {
      setAlunos([]);
      return;
    }

    const cacheKey = getCacheKey(atividadeId, statusFilter);

    // Verifica se já tem no cache
    const cachedAlunos = alunosCacheRef.current.get(cacheKey);
    if (cachedAlunos !== undefined) {
      setAlunos(cachedAlunos);
      setError(null);
      return;
    }

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchAlunos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const statusParam = statusFilter !== null ? statusFilter : '';
        const response = await fetch(
          `${API_BASE_URL}/instituicoes/alunos/?instituicao_id=${instituicaoId}&atividade_id=${atividadeId}&status_id=${statusParam}`,
          { signal: abortController.signal }
        );
        
        // 404 significa que não há alunos cadastrados
        if (response.status === 404) {
          alunosCacheRef.current.set(cacheKey, []);
          setAlunos([]);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Erro ao buscar alunos');
        }

        const data = await response.json();
        const alunosData = data?.alunos || [];
        alunosCacheRef.current.set(cacheKey, alunosData);
        setAlunos(alunosData);
      } catch (err: any) {
        // Ignora erros de abort
        if (err.name === 'AbortError') return;
        console.error('Erro ao buscar alunos:', err);
        setError('Não foi possível carregar os alunos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlunos();

    return () => {
      abortController.abort();
    };
  }, [instituicaoId, atividadeId, statusFilter]);

  // Função para tentar novamente (força refetch e atualiza cache)
  const handleRetry = () => {
    if (!instituicaoId || !atividadeId) return;
    
    const cacheKey = getCacheKey(atividadeId, statusFilter);
    
    // Remove do cache para forçar nova busca
    alunosCacheRef.current.delete(cacheKey);
    
    setError(null);
    setIsLoading(true);
    
    const statusParam = statusFilter !== null ? statusFilter : '';
    fetch(`${API_BASE_URL}/instituicoes/alunos/?instituicao_id=${instituicaoId}&atividade_id=${atividadeId}&status_id=${statusParam}`)
      .then(response => {
        // 404 significa que não há alunos cadastrados
        if (response.status === 404) {
          alunosCacheRef.current.set(cacheKey, []);
          setAlunos([]);
          return null;
        }
        if (!response.ok) throw new Error('Erro ao buscar alunos');
        return response.json();
      })
      .then(data => {
        if (data === null) return; // Já tratado como 404
        const alunosData = data?.alunos || [];
        alunosCacheRef.current.set(cacheKey, alunosData);
        setAlunos(alunosData);
      })
      .catch(err => {
        console.error('Erro ao buscar alunos:', err);
        setError('Não foi possível carregar os alunos');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Filtrar alunos localmente por nome (searchTerm)
  const filteredAlunos = alunos.filter(aluno => 
    aluno.crianca_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selecionar filtro de status
  const handleStatusSelect = (statusId: number | null) => {
    setStatusFilter(statusId);
    setIsFilterOpen(false);
  };

  // Obter label do status selecionado
  const getSelectedStatusLabel = () => {
    const option = STATUS_OPTIONS.find(opt => opt.id === statusFilter);
    return option ? option.label : 'Todos';
  };

  // Fechar dropdown de status ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Abrir modal e buscar detalhes da criança
  const handleOpenModal = async (aluno: AlunoInscrito) => {
    setSelectedAluno(aluno);
    setNewStatusId(aluno.status_id);
    setIsModalOpen(true);
    setIsLoadingModal(true);
    setCriancaDetalhes(null);
    setResponsavelDetalhes(null);

    try {
      // Buscar detalhes da criança
      const criancaResponse = await fetch(`${API_BASE_URL}/criancas/${aluno.crianca_id}`);
      if (!criancaResponse.ok) throw new Error('Erro ao buscar detalhes da criança');
      
      const criancaData = await criancaResponse.json();
      if (criancaData?.crianca) {
        setCriancaDetalhes(criancaData.crianca);
        
        // Se tem responsável, buscar dados do usuário
        if (criancaData.crianca.responsaveis?.length > 0) {
          const idUsuario = criancaData.crianca.responsaveis[0].id_usuario;
          const usuarioResponse = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`);
          if (usuarioResponse.ok) {
            const usuarioData = await usuarioResponse.json();
            if (usuarioData?.usuario) {
              setResponsavelDetalhes(usuarioData.usuario);
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes:', err);
    } finally {
      setIsLoadingModal(false);
    }
  };

  // Fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
    setCriancaDetalhes(null);
    setResponsavelDetalhes(null);
    setNewStatusId(null);
    setIsStatusDropdownOpen(false);
  };

  // Iniciar conversa com o responsável
  const handleStartConversationWithResponsible = async () => {
    const responsavel = criancaDetalhes?.responsaveis?.[0];
    if (!responsavel || !onStartConversation) return;

    const responsavelPessoaId = responsavel.id_pessoa;
    const responsavelNome = responsavel.nome;
    const responsavelFoto = responsavelDetalhes?.foto_perfil || responsavel.foto_perfil;

    if (!responsavelPessoaId) {
      console.error('ID da pessoa do responsável não encontrado');
      return;
    }

    // Fecha o modal de detalhes
    handleCloseModal();

    // Chama o callback para criar/abrir conversa (passa também a foto)
    onStartConversation(responsavelPessoaId, responsavelNome, responsavelFoto);
  };

  // Confirmar alteração de status
  const handleConfirmStatusChange = async () => {
    if (!selectedAluno || newStatusId === null) return;
    
    setIsUpdatingStatus(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/inscricoes/${selectedAluno.id_inscricao}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_status: newStatusId,
          observacao: `Status alterado para ${STATUS_CHANGE_OPTIONS.find(s => s.id === newStatusId)?.label || ''}`
        }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar status');

      // Limpar cache e refetch
      alunosCacheRef.current.clear();
      
      // Atualizar o status local do aluno selecionado
      setSelectedAluno(prev => prev ? { ...prev, status_id: newStatusId } : null);
      
      // Fechar modal de confirmação
      setShowConfirmModal(false);
      
      // Refetch dos alunos
      if (atividadeId) {
        const statusParam = statusFilter !== null ? statusFilter : '';
        const alunosResponse = await fetch(
          `${API_BASE_URL}/instituicoes/alunos/?instituicao_id=${instituicaoId}&atividade_id=${atividadeId}&status_id=${statusParam}`
        );
        
        if (alunosResponse.ok) {
          const data = await alunosResponse.json();
          const alunosData = data?.alunos || [];
          const cacheKey = getCacheKey(atividadeId, statusFilter);
          alunosCacheRef.current.set(cacheKey, alunosData);
          setAlunos(alunosData);
        }
      }
      
      // Fechar modal principal
      handleCloseModal();
      
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status. Tente novamente.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Selecionar novo status
  const handleNewStatusSelect = (statusId: number) => {
    setNewStatusId(statusId);
    setIsStatusDropdownOpen(false);
    // Abrir modal de confirmação se o status mudou
    if (statusId !== selectedAluno?.status_id) {
      setShowConfirmModal(true);
    }
  };

  // Obter label do novo status
  const getNewStatusLabel = () => {
    const option = STATUS_CHANGE_OPTIONS.find(opt => opt.id === newStatusId);
    return option ? option.label : 'Selecionar';
  };

  // Obter cor do status
  const getStatusColor = (statusId: number): string => {
    switch (statusId) {
      case 2: return 'canceled'; // Cancelada
      case 3: return 'pending';  // Pendente
      case 4: return 'approved'; // Aprovada
      case 5: return 'denied';   // Negada
      default: return 'pending';
    }
  };

  // Se não tem atividade selecionada
  if (!atividadeId) {
    return (
      <div className="students-list-wrapper">
        <div className="students-list-title">
          <span className="students-list-icon">
            <StudentsIcon />
          </span>
          Alunos Inscritos
        </div>
        <div className="students-list-card">
          <div className="students-list-empty">
            <p>Selecione uma atividade para ver os alunos inscritos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="students-list-wrapper">
      <div className="students-list-title">
        <span className="students-list-icon">
          <StudentsIcon />
        </span>
        Alunos Inscritos
      </div>

      <div className="students-list-card">
        {/* Barra de pesquisa com filtro dentro */}
        <div className="students-search-bar">
          <div className="students-search-box">
            <svg 
              className="students-search-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="students-search-input"
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Filtro de status dentro da caixa */}
            <div className="students-filter" ref={filterRef}>
              <button 
                className="students-filter-btn"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FilterIcon />
                <span>{getSelectedStatusLabel()}</span>
                <svg 
                  className={`students-dropdown-arrow ${isFilterOpen ? 'open' : ''}`} 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>
              
              {isFilterOpen && (
                <div className="students-filter-dropdown">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.id ?? 'all'}
                      className={`students-filter-option ${statusFilter === option.id ? 'active' : ''}`}
                      onClick={() => handleStatusSelect(option.id)}
                    >
                      <span className="students-option-label">{option.label}</span>
                      {statusFilter === option.id && (
                        <svg className="students-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="students-list-content">
        {isLoading ? (
          <div className="students-list-loading">
            <div className="students-list-spinner"></div>
            <span>Carregando alunos...</span>
          </div>
        ) : error ? (
          <div className="students-list-error">
            <p>{error}</p>
            <button onClick={handleRetry}>Tentar novamente</button>
          </div>
        ) : filteredAlunos.length === 0 ? (
          <div className="students-list-empty">
            <p>{searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno inscrito nesta atividade'}</p>
          </div>
        ) : (
          <div className="students-list-grid">
            {filteredAlunos.map((aluno) => (
              <div 
                key={`${aluno.crianca_id}-${aluno.atividade_id}`} 
                className="student-card"
                onClick={() => handleOpenModal(aluno)}
              >
                <div className="student-card-photo">
                  {aluno.crianca_foto ? (
                    <img src={aluno.crianca_foto} alt={aluno.crianca_nome} />
                  ) : (
                    <div className="student-card-photo-placeholder">
                      <DefaultUserIcon />
                    </div>
                  )}
                </div>
                
                <div className="student-card-info">
                  <span className="student-card-name">{aluno.crianca_nome}</span>
                  <span className={`student-card-status ${getStatusColor(aluno.status_id)}`}>
                    {aluno.status_inscricao}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Modal de Detalhes do Aluno */}
      {isModalOpen && selectedAluno && (
        <div className="student-modal-overlay" onClick={handleCloseModal}>
          <div className="student-modal" onClick={(e) => e.stopPropagation()}>
            <button className="student-modal-close" onClick={handleCloseModal}>
              <CloseIcon />
            </button>

            {isLoadingModal ? (
              <div className="student-modal-loading">
                <div className="students-list-spinner"></div>
                <span>Carregando informações...</span>
              </div>
            ) : criancaDetalhes ? (
              <>
                {/* Header com foto e info básica */}
                <div className="student-modal-header">
                  <div className="student-modal-photo">
                    {criancaDetalhes.foto_perfil ? (
                      <img src={criancaDetalhes.foto_perfil} alt={criancaDetalhes.nome} />
                    ) : (
                      <div className="student-modal-photo-placeholder">
                        <DefaultUserIcon />
                      </div>
                    )}
                  </div>
                  <div className="student-modal-header-info">
                    <h2 className="student-modal-name">{criancaDetalhes.nome}</h2>
                    <span className={`student-modal-status ${getStatusColor(selectedAluno.status_id)}`}>
                      {selectedAluno.status_inscricao}
                    </span>
                  </div>
                </div>

                {/* Informações da Criança */}
                <div className="student-modal-section">
                  <h3 className="student-modal-section-title">Informações do Aluno</h3>
                  <div className="student-modal-info-grid">
                    <div className="student-modal-info-item">
                      <span className="student-modal-info-icon"><EmailIcon /></span>
                      <div className="student-modal-info-content">
                        <span className="student-modal-info-label">Email</span>
                        <span className="student-modal-info-value">{criancaDetalhes.email || 'Não informado'}</span>
                      </div>
                    </div>
                    <div className="student-modal-info-item">
                      <span className="student-modal-info-icon"><AgeIcon /></span>
                      <div className="student-modal-info-content">
                        <span className="student-modal-info-label">Idade</span>
                        <span className="student-modal-info-value">{criancaDetalhes.idade} {criancaDetalhes.idade === 1 ? 'ano' : 'anos'}</span>
                      </div>
                    </div>
                    <div className="student-modal-info-item">
                      <span className="student-modal-info-icon"><GenderIcon /></span>
                      <div className="student-modal-info-content">
                        <span className="student-modal-info-label">Sexo</span>
                        <span className="student-modal-info-value">{criancaDetalhes.sexo || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações do Responsável */}
                {(criancaDetalhes.responsaveis?.length > 0 || responsavelDetalhes) && (
                  <div className="student-modal-section">
                    <h3 className="student-modal-section-title">Responsável</h3>
                    <div className="student-modal-responsavel">
                      <div className="student-modal-responsavel-photo">
                        {(responsavelDetalhes?.foto_perfil || criancaDetalhes.responsaveis?.[0]?.foto_perfil) ? (
                          <img 
                            src={responsavelDetalhes?.foto_perfil || criancaDetalhes.responsaveis?.[0]?.foto_perfil || ''} 
                            alt="Responsável" 
                          />
                        ) : (
                          <div className="student-modal-photo-placeholder small">
                            <DefaultUserIcon />
                          </div>
                        )}
                      </div>
                      <div className="student-modal-responsavel-info">
                        <span className="student-modal-responsavel-name">
                          {responsavelDetalhes?.nome || criancaDetalhes.responsaveis?.[0]?.nome}
                        </span>
                        <div className="student-modal-responsavel-details">
                          <span><EmailIcon /> {responsavelDetalhes?.email || criancaDetalhes.responsaveis?.[0]?.email}</span>
                          <span><PhoneIcon /> {responsavelDetalhes?.telefone || criancaDetalhes.responsaveis?.[0]?.telefone}</span>
                        </div>
                      </div>
                      {onStartConversation && criancaDetalhes.responsaveis?.[0]?.id_pessoa && (
                        <button 
                          className="student-modal-message-btn"
                          onClick={handleStartConversationWithResponsible}
                          title="Iniciar conversa com o responsável"
                        >
                          <MessageIcon />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Alterar Status */}
                <div className="student-modal-section">
                  <h3 className="student-modal-section-title">Alterar Status da Inscrição</h3>
                  <div className="student-modal-status-change" ref={statusDropdownRef}>
                    <button 
                      className="student-modal-status-btn"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    >
                      <span className={`student-modal-status-indicator ${getStatusColor(newStatusId || selectedAluno.status_id)}`}></span>
                      <span>{getNewStatusLabel()}</span>
                      <svg 
                        className={`students-dropdown-arrow ${isStatusDropdownOpen ? 'open' : ''}`} 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </button>
                    
                    {isStatusDropdownOpen && (
                      <div className="student-modal-status-dropdown">
                        {STATUS_CHANGE_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            className={`student-modal-status-option ${newStatusId === option.id ? 'active' : ''}`}
                            onClick={() => handleNewStatusSelect(option.id)}
                          >
                            <span className={`student-modal-status-indicator ${getStatusColor(option.id)}`}></span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="student-modal-error">
                <p>Não foi possível carregar as informações</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Alteração de Status */}
      {showConfirmModal && (
        <div className="student-confirm-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="student-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Alteração</h3>
            <p>
              Deseja alterar o status de <strong>{selectedAluno?.crianca_nome}</strong> para{' '}
              <strong>{getNewStatusLabel()}</strong>?
            </p>
            <div className="student-confirm-buttons">
              <button 
                className="student-confirm-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={isUpdatingStatus}
              >
                Cancelar
              </button>
              <button 
                className="student-confirm-ok"
                onClick={handleConfirmStatusChange}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Atualizando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionStudentsList;
export type { CriancaDetalhes };
