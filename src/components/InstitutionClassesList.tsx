'use client';

import React from 'react';
import './InstitutionClassesList.css';

// Interface para aula
interface Aula {
  aula_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status_aula: string;
  vagas_total: number;
  vagas_disponiveis: number;
  foram?: any[];
  ausentes?: any[];
  iram_participar?: any[];
}

interface InstitutionClassesListProps {
  aulas: Aula[];
  selectedDate: Date;
  atividadeTitulo?: string | null;
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
  atividadeTitulo
}) => {
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
                <div key={aula.aula_id} className="class-card">
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
    </div>
  );
};

export default InstitutionClassesList;
