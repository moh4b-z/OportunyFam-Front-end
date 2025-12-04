'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/services/config';
import SuccessModal from '@/components/modals/SuccessModal';
import './InstitutionClassesList.css';

// Interface para participante da aula
interface Participante {
  nome: string;
  pessoa_id: number;
  crianca_id: number;
  foto_perfil: string | null;
}

// Interface para aula
interface Aula {
  aula_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status_aula: string;
  vagas_total: number;
  vagas_disponiveis: number;
  foram?: Participante[];
  ausentes?: Participante[];
  iram_participar?: Participante[];
}

// Interface para atividade
interface Atividade {
  atividade_id: number;
  titulo: string;
  foto: string;
  descricao: string;
  categoria: string;
  aulas: Aula[];
}

interface InstitutionClassesListProps {
  aulas: Aula[];
  selectedDate: Date;
  atividadeTitulo?: string | null;
  atividades?: Atividade[];
  selectedAtividadeId?: number | null;
  onAulasCreated?: () => void;
}

// Ícone de relógio
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

// Ícone de usuários/vagas
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// Ícone de status
const StatusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

// Ícone de calendário vazio
const EmptyCalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <line x1="9" y1="16" x2="15" y2="16"></line>
  </svg>
);

// Ícone de plus
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Ícone de fechar
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Ícone de calendário para modal
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// Ícone de alerta/confirmação
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

// Função para formatar data DD/MM/YYYY
const formatDateToBR = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Função para formatar data para exibição
const formatDateDisplay = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  };
  return date.toLocaleDateString('pt-BR', options);
};

// Função para obter classe CSS do status
const getStatusClass = (status: string): string => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('encerrad')) return 'finished';
  if (statusLower.includes('andamento') || statusLower.includes('progress')) return 'in-progress';
  if (statusLower.includes('agendad') || statusLower.includes('programad')) return 'scheduled';
  if (statusLower.includes('cancelad')) return 'cancelled';
  return 'default';
};

// Função para formatar horário (remove segundos se houver)
const formatTime = (time: string): string => {
  if (!time) return '--:--';
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
};

const InstitutionClassesList: React.FC<InstitutionClassesListProps> = ({
  aulas,
  selectedDate,
  atividadeTitulo,
  atividades = [],
  selectedAtividadeId,
  onAulasCreated
}) => {
  // Estados do modal de criação de aula
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAulasCount, setCreatedAulasCount] = useState(0);
  
  // Estados do formulário
  const [formAtividadeId, setFormAtividadeId] = useState<number | null>(null);
  const [formHoraInicio, setFormHoraInicio] = useState('');
  const [formHoraFim, setFormHoraFim] = useState('');
  const [formVagasTotal, setFormVagasTotal] = useState<number>(20);
  const [formDatas, setFormDatas] = useState<string[]>([]);
  const [formNovaData, setFormNovaData] = useState('');

  // Estados do popup de alunos
  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const [selectedAulaForStudents, setSelectedAulaForStudents] = useState<Aula | null>(null);

  // Define a atividade selecionada por padrão quando o modal abre
  useEffect(() => {
    if (selectedAtividadeId && !formAtividadeId) {
      setFormAtividadeId(selectedAtividadeId);
    }
  }, [selectedAtividadeId]);

  // Abre o modal de criação
  const openCreateModal = () => {
    setFormAtividadeId(selectedAtividadeId || null);
    setFormHoraInicio('');
    setFormHoraFim('');
    setFormVagasTotal(20);
    setFormDatas([]);
    setFormNovaData('');
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  // Fecha o modal de criação
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  // Abre popup de alunos da aula
  const openStudentsPopup = (aula: Aula) => {
    setSelectedAulaForStudents(aula);
    setIsStudentsPopupOpen(true);
  };

  // Fecha popup de alunos
  const closeStudentsPopup = () => {
    setIsStudentsPopupOpen(false);
    setSelectedAulaForStudents(null);
  };

  // Adiciona uma data à lista
  const addData = () => {
    if (formNovaData && !formDatas.includes(formNovaData)) {
      setFormDatas([...formDatas, formNovaData].sort());
      setFormNovaData('');
    }
  };

  // Remove uma data da lista
  const removeData = (data: string) => {
    setFormDatas(formDatas.filter(d => d !== data));
  };

  // Formata data para exibição (YYYY-MM-DD para DD/MM/YYYY)
  const formatDataForDisplay = (data: string): string => {
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
  };

  // Valida e abre modal de confirmação
  const handleSubmit = () => {
    setCreateError(null);

    if (!formAtividadeId) {
      setCreateError('Selecione uma atividade');
      return;
    }
    if (!formHoraInicio) {
      setCreateError('Informe a hora de início');
      return;
    }
    if (!formHoraFim) {
      setCreateError('Informe a hora de fim');
      return;
    }
    if (formHoraFim <= formHoraInicio) {
      setCreateError('A hora de fim deve ser maior que a hora de início');
      return;
    }
    if (formVagasTotal < 1) {
      setCreateError('O número de vagas deve ser maior que 0');
      return;
    }
    if (formDatas.length === 0) {
      setCreateError('Adicione pelo menos uma data');
      return;
    }

    // Abre modal de confirmação
    setIsConfirmModalOpen(true);
  };

  // Obtém o nome da atividade selecionada
  const getSelectedAtividadeTitulo = (): string => {
    const atividade = atividades.find(a => a.atividade_id === formAtividadeId);
    return atividade?.titulo || 'Atividade não encontrada';
  };

  // Cria as aulas
  const handleConfirmCreate = async () => {
    setIsCreating(true);
    setCreateError(null);

    try {
      const payload = {
        id_atividade: formAtividadeId,
        hora_inicio: formHoraInicio + ':00',
        hora_fim: formHoraFim + ':00',
        vagas_total: formVagasTotal,
        datas: formDatas
      };

      const response = await fetch(`${API_BASE_URL}/atividades/aulas/lote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar aulas');
      }

      // Guarda a quantidade de aulas criadas para o modal de sucesso
      const aulasCount = formDatas.length;

      // Fecha os modais e limpa o formulário
      setIsConfirmModalOpen(false);
      setIsCreateModalOpen(false);
      
      // Chama callback para refresh
      onAulasCreated?.();
      
      // Mostra modal de sucesso
      setCreatedAulasCount(aulasCount);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao criar aulas:', error);
      setCreateError(error instanceof Error ? error.message : 'Erro ao criar aulas');
      setIsConfirmModalOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  // Filtra aulas pela data selecionada
  const selectedDateStr = formatDateToBR(selectedDate);
  const filteredAulas = aulas.filter(aula => aula.data === selectedDateStr);

  // Ordena por hora de início
  const sortedAulas = [...filteredAulas].sort((a, b) => {
    const timeA = a.hora_inicio || '00:00';
    const timeB = b.hora_inicio || '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="institution-classes-list">
      <div className="classes-list-header">
        <div className="classes-list-title">
          <ClockIcon />
          <span>Aulas do dia</span>
        </div>
        <div className="classes-list-date">
          {formatDateDisplay(selectedDate)}
        </div>
      </div>

      <div className="classes-list-content">
        {sortedAulas.length === 0 ? (
          <div className="classes-list-empty">
            <EmptyCalendarIcon />
            <p>Nenhuma aula agendada para este dia</p>
            {atividadeTitulo && (
              <span>em {atividadeTitulo}</span>
            )}
          </div>
        ) : (
          <div className="classes-list-items">
            {sortedAulas.map((aula) => {
              const vagasOcupadas = aula.vagas_total - aula.vagas_disponiveis;
              const percentualOcupado = (vagasOcupadas / aula.vagas_total) * 100;
              
              return (
                <div 
                  key={aula.aula_id} 
                  className="class-card class-card-clickable"
                  onClick={() => openStudentsPopup(aula)}
                  title="Clique para ver alunos matriculados"
                >
                  <div className="class-card-time">
                    <div className="class-card-time-range">
                      <span className="time-start">{formatTime(aula.hora_inicio)}</span>
                      <span className="time-separator">—</span>
                      <span className="time-end">{formatTime(aula.hora_fim)}</span>
                    </div>
                  </div>

                  <div className="class-card-info">
                    <div className="class-card-status-row">
                      <span className={`class-status-badge ${getStatusClass(aula.status_aula)}`}>
                        <StatusIcon />
                        {aula.status_aula}
                      </span>
                    </div>

                    <div className="class-card-vagas">
                      <div className="vagas-info">
                        <UsersIcon />
                        <span className="vagas-text">
                          <strong>{vagasOcupadas}</strong> de <strong>{aula.vagas_total}</strong> vagas ocupadas
                        </span>
                      </div>
                      <div className="vagas-bar">
                        <div 
                          className="vagas-bar-fill" 
                          style={{ width: `${percentualOcupado}%` }}
                        />
                      </div>
                    </div>

                    {(aula.iram_participar && aula.iram_participar.length > 0) && (
                      <div className="class-card-participants">
                        <span className="participants-count">
                          {aula.iram_participar.length} confirmado{aula.iram_participar.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão de adicionar aula */}
      <button 
        className="create-class-btn"
        onClick={openCreateModal}
        title="Criar nova aula"
      >
        <PlusIcon />
      </button>

      {/* Modal de criação de aula */}
      {isCreateModalOpen && (
        <div className="create-class-modal-overlay" onClick={closeCreateModal}>
          <div className="create-class-modal" onClick={(e) => e.stopPropagation()}>
            <div className="create-class-modal-header">
              <div className="create-class-modal-title">
                <span className="create-class-modal-title-icon">
                  <CalendarIcon />
                </span>
                <h2>Nova Aula</h2>
              </div>
              <button className="create-class-modal-close" onClick={closeCreateModal}>
                <CloseIcon />
              </button>
            </div>

            <div className="create-class-modal-body">
              {/* Dropdown de atividade */}
              <div className="create-class-form-group">
                <label className="create-class-form-label">Atividade</label>
                <select
                  className="create-class-form-select"
                  value={formAtividadeId || ''}
                  onChange={(e) => setFormAtividadeId(Number(e.target.value) || null)}
                >
                  <option value="">Selecione uma atividade</option>
                  {atividades.map((ativ) => (
                    <option key={ativ.atividade_id} value={ativ.atividade_id}>
                      {ativ.titulo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos de horário lado a lado */}
              <div className="create-class-field-row">
                <div className="create-class-form-group">
                  <label className="create-class-form-label">Hora início</label>
                  <input
                    type="time"
                    className="create-class-form-input"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                  />
                </div>
                <div className="create-class-form-group">
                  <label className="create-class-form-label">Hora fim</label>
                  <input
                    type="time"
                    className="create-class-form-input"
                    value={formHoraFim}
                    onChange={(e) => setFormHoraFim(e.target.value)}
                  />
                </div>
              </div>

              {/* Vagas */}
              <div className="create-class-form-group">
                <label className="create-class-form-label">Total de vagas</label>
                <input
                  type="number"
                  className="create-class-form-input"
                  value={formVagasTotal}
                  onChange={(e) => setFormVagasTotal(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>

              {/* Seleção de datas */}
              <div className="create-class-dates-section">
                <label className="create-class-dates-label">Datas das aulas</label>
                <div className="create-class-date-input-row">
                  <input
                    type="date"
                    className="create-class-date-input"
                    value={formNovaData}
                    onChange={(e) => setFormNovaData(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <button 
                    type="button"
                    className="create-class-date-add-btn"
                    onClick={addData}
                    disabled={!formNovaData}
                  >
                    Adicionar
                  </button>
                </div>
                
                {formDatas.length > 0 && (
                  <div className="create-class-dates-list">
                    {formDatas.map((data) => (
                      <div key={data} className="create-class-date-tag">
                        <span>{formatDataForDisplay(data)}</span>
                        <button 
                          type="button"
                          onClick={() => removeData(data)}
                          className="create-class-date-remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {formDatas.length === 0 && (
                  <p className="create-class-dates-hint">Adicione as datas em que esta aula ocorrerá</p>
                )}
              </div>

              {/* Erro */}
              {createError && (
                <div className="create-class-error">
                  {createError}
                </div>
              )}
            </div>

            <div className="create-class-modal-footer">
              <button 
                className="create-class-btn-cancel"
                onClick={closeCreateModal}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button 
                className="create-class-btn-submit"
                onClick={handleSubmit}
                disabled={isCreating}
              >
                Criar Aulas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      {isConfirmModalOpen && (
        <div className="create-class-modal-overlay" onClick={() => !isCreating && setIsConfirmModalOpen(false)}>
          <div className="create-class-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="create-class-confirm-icon">
              <AlertIcon />
            </div>
            <h3>Confirmar criação de aulas</h3>
            <p>
              Você está prestes a criar <strong>{formDatas.length} aula{formDatas.length !== 1 ? 's' : ''}</strong> para a atividade <strong>{getSelectedAtividadeTitulo()}</strong>.
            </p>
            <p className="create-class-confirm-details">
              Horário: {formHoraInicio} às {formHoraFim}<br />
              Vagas: {formVagasTotal}
            </p>
            <div className="create-class-confirm-buttons">
              <button 
                className="create-class-btn-cancel"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isCreating}
              >
                Voltar
              </button>
              <button 
                className="create-class-btn-submit"
                onClick={handleConfirmCreate}
                disabled={isCreating}
              >
                {isCreating ? 'Criando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Aulas Criadas!"
        message={`${createdAulasCount} aula${createdAulasCount !== 1 ? 's foram criadas' : ' foi criada'} com sucesso.`}
        onClose={() => setShowSuccessModal(false)}
        autoCloseDelay={3000}
      />

      {/* Popup de alunos matriculados */}
      {isStudentsPopupOpen && selectedAulaForStudents && (
        <div className="students-popup-overlay" onClick={closeStudentsPopup}>
          <div className="students-popup" onClick={(e) => e.stopPropagation()}>
            <div className="students-popup-header">
              <div className="students-popup-title">
                <UsersIcon />
                <h3>Alunos Matriculados</h3>
              </div>
              <button className="students-popup-close" onClick={closeStudentsPopup}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="students-popup-info">
              <span className="students-popup-time">
                <ClockIcon />
                {formatTime(selectedAulaForStudents.hora_inicio)} - {formatTime(selectedAulaForStudents.hora_fim)}
              </span>
              <span className="students-popup-vagas">
                {selectedAulaForStudents.vagas_total - selectedAulaForStudents.vagas_disponiveis} de {selectedAulaForStudents.vagas_total} vagas ocupadas
              </span>
            </div>

            <div className="students-popup-content">
              {(!selectedAulaForStudents.iram_participar || selectedAulaForStudents.iram_participar.length === 0) ? (
                <div className="students-popup-empty">
                  <UsersIcon />
                  <p>Nenhum aluno matriculado nesta aula</p>
                </div>
              ) : (
                <div className="students-popup-list">
                  {selectedAulaForStudents.iram_participar.map((aluno) => (
                    <div key={aluno.crianca_id} className="student-item">
                      <div className="student-avatar">
                        {aluno.foto_perfil ? (
                          <img src={aluno.foto_perfil} alt={aluno.nome} />
                        ) : (
                          <div className="student-avatar-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="student-name">{aluno.nome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionClassesList;
