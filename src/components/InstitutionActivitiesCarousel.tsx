"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/services/config';
import { azureStorageService } from '@/services/azureStorageService';
import './InstitutionActivitiesCarousel.css';

// Interface para categoria
interface Categoria {
  id: number;
  nome: string;
}

// Interface para atividade da instituição
interface Aula {
  aula_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status_aula: string;
  vagas_total: number;
  vagas_disponiveis: number;
}

interface Atividade {
  atividade_id: number;
  titulo: string;
  foto: string;
  descricao: string;
  categoria: string;
  faixa_etaria_min: number;
  faixa_etaria_max: number;
  gratuita: number; // 1 = gratuita, 0 = paga
  preco: number;
  ativo: number; // 1 = ativo, 0 = inativo
  instituicao_id: number;
  instituicao_nome: string;
  instituicao_foto: string;
  cidade: string;
  estado: string;
  aulas: Aula[];
}

interface InstitutionActivitiesCarouselProps {
  instituicaoId: number;
  onActivityChange?: (atividade: Atividade | null) => void;
}

export type { Atividade };

// Ícone de atividades/calendário
const ActivitiesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// Ícone de categoria
const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

// Ícone de faixa etária
const AgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// Ícone de preço/gratuito
const PriceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

// Ícone de status ativo/inativo
const StatusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

// Ícone de aulas
const ClassesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// Ícone de seta esquerda
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

// Ícone de seta direita
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// Ícone de + para adicionar
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

// Ícone de upload de imagem
const ImageUploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const InstitutionActivitiesCarousel: React.FC<InstitutionActivitiesCarouselProps> = ({ 
  instituicaoId,
  onActivityChange 
}) => {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Estados para o modal de criar atividade
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Campos do formulário
  const [formTitulo, setFormTitulo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formCategoria, setFormCategoria] = useState<number | null>(null);
  const [formFaixaMin, setFormFaixaMin] = useState<number>(0);
  const [formFaixaMax, setFormFaixaMax] = useState<number>(18);
  const [formGratuita, setFormGratuita] = useState(true);
  const [formPreco, setFormPreco] = useState<number>(0);
  const [formAtivo, setFormAtivo] = useState(true);
  const [formFoto, setFormFoto] = useState<File | null>(null);
  const [formFotoPreview, setFormFotoPreview] = useState<string | null>(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar atividades da instituição
  const fetchAtividades = useCallback(async () => {
    if (!instituicaoId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/atividades/instituicao/${instituicaoId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar atividades');
      }
      
      const data = await response.json();
      const atividadesData = data?.atividades || [];
      setAtividades(atividadesData);
      
      // Centraliza no meio se houver atividades
      if (atividadesData.length > 0) {
        setCenterIndex(Math.floor(atividadesData.length / 2));
      }
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setError('Não foi possível carregar as atividades');
    } finally {
      setIsLoading(false);
    }
  }, [instituicaoId]);

  useEffect(() => {
    fetchAtividades();
  }, [fetchAtividades]);

  // Buscar categorias
  const fetchCategorias = async () => {
    if (categorias.length > 0) return; // Já carregou
    
    setIsLoadingCategorias(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categorias`);
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      
      const data = await response.json();
      if (data.status && data.categorias) {
        setCategorias(data.categorias);
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setIsLoadingCategorias(false);
    }
  };

  // Abrir modal de criar atividade
  const openCreateModal = () => {
    // Reset do formulário
    setFormTitulo('');
    setFormDescricao('');
    setFormCategoria(null);
    setFormFaixaMin(0);
    setFormFaixaMax(18);
    setFormGratuita(true);
    setFormPreco(0);
    setFormAtivo(true);
    setFormFoto(null);
    setFormFotoPreview(null);
    setCreateError(null);
    
    // Buscar categorias se ainda não carregou
    fetchCategorias();
    
    setIsCreateModalOpen(true);
  };

  // Fechar modal
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  // Handler de seleção de foto
  const handleFotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setCreateError('Por favor, selecione apenas arquivos de imagem');
      return;
    }
    
    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCreateError('A imagem deve ter no máximo 5MB');
      return;
    }
    
    setFormFoto(file);
    setFormFotoPreview(URL.createObjectURL(file));
    setCreateError(null);
  };

  // Criar atividade
  const handleCreateAtividade = async () => {
    // Validações
    if (!formTitulo.trim()) {
      setCreateError('Informe o título da atividade');
      return;
    }
    if (!formCategoria) {
      setCreateError('Selecione uma categoria');
      return;
    }
    if (formFaixaMin >= formFaixaMax) {
      setCreateError('A idade mínima deve ser menor que a máxima');
      return;
    }
    if (!formGratuita && formPreco <= 0) {
      setCreateError('Informe o preço da atividade');
      return;
    }
    
    setIsCreating(true);
    setCreateError(null);
    
    try {
      // Upload da foto se houver
      let fotoUrl = '';
      if (formFoto) {
        setIsUploadingFoto(true);
        try {
          fotoUrl = await azureStorageService.uploadImage(formFoto);
        } catch (err) {
          console.error('Erro ao fazer upload da foto:', err);
          setCreateError('Erro ao fazer upload da imagem. Tente novamente.');
          setIsCreating(false);
          setIsUploadingFoto(false);
          return;
        }
        setIsUploadingFoto(false);
      }
      
      // Montar payload
      const payload = {
        id_instituicao: instituicaoId,
        id_categoria: formCategoria,
        titulo: formTitulo.trim(),
        foto: fotoUrl,
        descricao: formDescricao.trim(),
        faixa_etaria_min: formFaixaMin,
        faixa_etaria_max: formFaixaMax,
        gratuita: formGratuita,
        preco: formGratuita ? 0 : formPreco,
        ativo: formAtivo
      };
      
      const response = await fetch(`${API_BASE_URL}/atividades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar atividade');
      }
      
      // Sucesso - fecha modal e recarrega atividades
      closeCreateModal();
      await fetchAtividades();
      
    } catch (err: any) {
      console.error('Erro ao criar atividade:', err);
      setCreateError(err.message || 'Erro ao criar atividade. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  // Ref para evitar notificações duplicadas
  const lastNotifiedActivityId = useRef<number | null>(null);

  // Notificar mudança de atividade selecionada
  useEffect(() => {
    if (!onActivityChange) return;
    
    const selectedActivity = atividades.length > 0 ? atividades[centerIndex] : null;
    const currentId = selectedActivity?.atividade_id ?? null;
    
    // Só notifica se realmente mudou
    if (currentId !== lastNotifiedActivityId.current) {
      lastNotifiedActivityId.current = currentId;
      onActivityChange(selectedActivity);
    }
  }, [centerIndex, atividades, onActivityChange]);

  // Navegação do carrossel
  const goToNext = () => {
    if (isAnimating || atividades.length <= 1) return;
    setIsAnimating(true);
    setCenterIndex((prev) => (prev + 1) % atividades.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrev = () => {
    if (isAnimating || atividades.length <= 1) return;
    setIsAnimating(true);
    setCenterIndex((prev) => (prev - 1 + atividades.length) % atividades.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Navegação por teclado (setas esquerda/direita)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (atividades.length <= 1) return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [atividades.length, isAnimating]);

  // Detectar clique no track e calcular qual card foi clicado
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAnimating || atividades.length <= 1 || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2; // Posição relativa ao centro
    
    const cardSpacing = 320; // Mesmo valor do translateX no getCardStyle
    const cardWidth = 280;
    
    // Calcular qual posição relativa foi clicada
    const clickedPosition = Math.round(clickX / cardSpacing);
    
    // Verificar se o clique foi dentro da área de um card
    const cardCenterX = clickedPosition * cardSpacing;
    const distanceFromCardCenter = Math.abs(clickX - cardCenterX);
    
    if (distanceFromCardCenter > cardWidth / 2) return; // Clicou fora de qualquer card
    
    // Calcular o índice do card clicado
    let targetIndex = centerIndex + clickedPosition;
    
    // Ajustar para o range válido (circular)
    const total = atividades.length;
    targetIndex = ((targetIndex % total) + total) % total;
    
    if (targetIndex !== centerIndex) {
      setIsAnimating(true);
      setCenterIndex(targetIndex);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  // Calcular posição e estilo de cada card no carrossel 3D
  const getCardStyle = (index: number) => {
    const total = atividades.length;
    if (total === 0) return {};

    // Calcular distância do centro (considerando o círculo)
    let diff = index - centerIndex;
    
    // Ajustar para o menor caminho no círculo
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    // Número máximo de cards visíveis de cada lado
    const maxVisible = 3;
    
    // Se está muito longe, esconder (mas ainda permitir clique)
    if (Math.abs(diff) > maxVisible) {
      return {
        opacity: 0,
        transform: `translateX(${diff > 0 ? 100 : -100}%) scale(0.5)`,
        zIndex: 0,
      };
    }

    // Calcular transformações baseadas na posição
    const translateX = diff * 320; // Espaçamento horizontal (aumentado para largura total)
    const translateZ = -Math.abs(diff) * 120; // Profundidade
    const scale = 1 - Math.abs(diff) * 0.12; // Escala diminui conforme afasta
    const opacity = 1 - Math.abs(diff) * 0.3; // Opacidade diminui nas bordas
    const rotateY = diff * -12; // Rotação Y para efeito 3D

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity: Math.max(0.2, opacity),
      zIndex: maxVisible - Math.abs(diff) + 1,
    };
  };

  // Renderizar estado de loading
  if (isLoading) {
    return (
      <div className="activities-carousel-container">
        <div className="activities-carousel-header">
          <div className="activities-carousel-title">
            <span className="activities-carousel-title-icon">
              <ActivitiesIcon />
            </span>
            Minhas Atividades
          </div>
        </div>
        <div className="activities-carousel-loading">
          <div className="activities-carousel-spinner"></div>
          <p>Carregando atividades...</p>
        </div>
      </div>
    );
  }

  // Renderizar estado de erro
  if (error) {
    return (
      <div className="activities-carousel-container">
        <div className="activities-carousel-header">
          <div className="activities-carousel-title">
            <span className="activities-carousel-title-icon">
              <ActivitiesIcon />
            </span>
            Minhas Atividades
          </div>
        </div>
        <div className="activities-carousel-error">
          <p>{error}</p>
          <button onClick={fetchAtividades} className="activities-carousel-retry-btn">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderizar estado vazio
  if (atividades.length === 0) {
    return (
      <div className="activities-carousel-container">
        <div className="activities-carousel-header">
          <div className="activities-carousel-title">
            <span className="activities-carousel-title-icon">
              <ActivitiesIcon />
            </span>
            Minhas Atividades
          </div>
        </div>
        <div className="activities-carousel-empty">
          <p>Nenhuma atividade cadastrada</p>
          <span>Cadastre sua primeira atividade para começar!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="activities-carousel-container">
      <div className="activities-carousel-header">
        <div className="activities-carousel-title">
          <span className="activities-carousel-title-icon">
            <ActivitiesIcon />
          </span>
          Minhas Atividades
        </div>
        <button 
          className="activities-carousel-add-btn"
          onClick={openCreateModal}
          title="Criar nova atividade"
        >
          <PlusIcon />
        </button>
      </div>

      <div className="activities-carousel-wrapper">
        {/* Seta esquerda */}
        <button 
          className="activities-carousel-arrow activities-carousel-arrow-left"
          onClick={goToPrev}
          disabled={isAnimating || atividades.length <= 1}
          aria-label="Anterior"
        >
          <ChevronLeftIcon />
        </button>

        {/* Container do carrossel 3D */}
        <div className="activities-carousel-3d">
          <div 
            className="activities-carousel-track" 
            ref={trackRef}
            onClick={handleTrackClick}
          >
            {atividades.map((atividade, index) => {
              const style = getCardStyle(index);
              const isAtivo = atividade.ativo === 1;
              const isGratuita = atividade.gratuita === 1;
              
              return (
                <div
                  key={atividade.atividade_id}
                  className={`activities-carousel-card ${index === centerIndex ? 'active' : ''} ${!isAtivo ? 'inactive' : ''}`}
                  style={style}
                >
                  {/* Foto da atividade */}
                  <div className="activity-card-image">
                    {atividade.foto ? (
                      <img src={atividade.foto} alt={atividade.titulo} />
                    ) : (
                      <div className="activity-card-image-placeholder">
                        <ActivitiesIcon />
                      </div>
                    )}
                  </div>

                  <div className="activity-card-content">
                    <h3 className="activity-card-title">{atividade.titulo}</h3>
                    
                    <div className="activity-card-info">
                      <div className="activity-card-row">
                        <span className="activity-card-icon">
                          <CategoryIcon />
                        </span>
                        <span className="activity-card-value">{atividade.categoria}</span>
                      </div>

                      <div className="activity-card-row">
                        <span className="activity-card-icon">
                          <ClassesIcon />
                        </span>
                        <span className="activity-card-value">
                          {atividade.aulas?.length || 0} {(atividade.aulas?.length || 0) === 1 ? 'aula' : 'aulas'}
                        </span>
                      </div>
                      
                      <div className="activity-card-row">
                        <span className="activity-card-icon">
                          <AgeIcon />
                        </span>
                        <span className="activity-card-value">
                          {atividade.faixa_etaria_min} - {atividade.faixa_etaria_max} anos
                        </span>
                      </div>
                    </div>

                    {/* Badges na parte inferior do card */}
                    <div className="activity-card-badges">
                      <span className={`activity-card-status-badge ${isAtivo ? 'active' : 'inactive'}`}>
                        {isAtivo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className={`activity-card-price-badge ${isGratuita ? 'free' : 'paid'}`}>
                        {isGratuita ? 'Gratuita' : `R$ ${atividade.preco}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seta direita */}
        <button 
          className="activities-carousel-arrow activities-carousel-arrow-right"
          onClick={goToNext}
          disabled={isAnimating || atividades.length <= 1}
          aria-label="Próximo"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* Indicadores de posição */}
      {atividades.length > 1 && (
        <div className="activities-carousel-indicators">
          {atividades.map((_, index) => (
            <button
              key={index}
              className={`activities-carousel-indicator ${index === centerIndex ? 'active' : ''}`}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setCenterIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              aria-label={`Ir para atividade ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Modal de criar atividade */}
      {isCreateModalOpen && (
        <div className="create-activity-modal-overlay" onClick={closeCreateModal}>
          <div className="create-activity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="create-activity-modal-header">
              <div className="create-activity-modal-title">
                <span className="create-activity-modal-title-icon">
                  <ActivitiesIcon />
                </span>
                <h2>Nova Atividade</h2>
              </div>
              <button className="create-activity-modal-close" onClick={closeCreateModal}>
                <CloseIcon />
              </button>
            </div>

            <div className="create-activity-modal-body">
              {/* Upload de foto */}
              <div className="create-activity-photo-section">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFotoSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div 
                  className="create-activity-photo-preview"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formFotoPreview ? (
                    <img src={formFotoPreview} alt="Preview" />
                  ) : (
                    <div className="create-activity-photo-placeholder">
                      <ImageUploadIcon />
                      <span>Clique para adicionar foto</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campos do formulário */}
              <div className="create-activity-form">
                <div className="create-activity-form-group">
                  <input
                    type="text"
                    className="create-activity-form-input"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder=" "
                    maxLength={100}
                  />
                  <label className="create-activity-form-label">Título</label>
                </div>

                <div className="create-activity-form-group">
                  <select
                    className="create-activity-form-select"
                    value={formCategoria || ''}
                    onChange={(e) => setFormCategoria(Number(e.target.value) || null)}
                    disabled={isLoadingCategorias}
                  >
                    <option value="">
                      {isLoadingCategorias ? 'Carregando...' : 'Selecione uma categoria'}
                    </option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                  <label className="create-activity-form-label create-activity-form-label-select">Categoria</label>
                </div>

                <div className="create-activity-form-group">
                  <textarea
                    className="create-activity-form-input create-activity-form-textarea"
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    placeholder=" "
                    rows={3}
                    maxLength={500}
                  />
                  <label className="create-activity-form-label">Descrição</label>
                </div>

                <div className="create-activity-field-row">
                  <div className="create-activity-form-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="create-activity-form-input"
                      value={formFaixaMin || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                        setFormFaixaMin(val ? Number(val) : 0);
                      }}
                      placeholder=" "
                      maxLength={2}
                    />
                    <label className="create-activity-form-label">Idade mínima</label>
                  </div>
                  <div className="create-activity-form-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="create-activity-form-input"
                      value={formFaixaMax || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                        setFormFaixaMax(val ? Number(val) : 0);
                      }}
                      placeholder=" "
                      maxLength={2}
                    />
                    <label className="create-activity-form-label">Idade máxima</label>
                  </div>
                </div>

                <div className="create-activity-field">
                  <label className="create-activity-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formGratuita}
                      onChange={(e) => setFormGratuita(e.target.checked)}
                    />
                    <span>Atividade gratuita</span>
                  </label>
                </div>

                {!formGratuita && (
                  <div className="create-activity-form-group">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="create-activity-form-input"
                      value={formPreco || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                        setFormPreco(val ? parseFloat(val) : 0);
                      }}
                      placeholder=" "
                    />
                    <label className="create-activity-form-label">Preço (R$)</label>
                  </div>
                )}
              </div>

              {/* Erro */}
              {createError && (
                <div className="create-activity-error">
                  {createError}
                </div>
              )}
            </div>

            <div className="create-activity-modal-footer">
              <button 
                className="create-activity-btn-cancel"
                onClick={closeCreateModal}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button 
                className="create-activity-btn-submit"
                onClick={handleCreateAtividade}
                disabled={isCreating || isUploadingFoto}
              >
                {isCreating ? (isUploadingFoto ? 'Enviando foto...' : 'Criando...') : 'Criar Atividade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionActivitiesCarousel;
