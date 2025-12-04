"use client";

import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/services/config';
import { azureStorageService } from '@/services/azureStorageService';
import "../../app/styles/ConversationsModal.css";
import "./InstitutionPublicationsModal.css";

// Interface para publicação (estrutura da API)
interface Publicacao {
  id: number;
  descricao: string;
  imagem: string | null;
  criado_em: string;
  atualizado_em: string | null;
  id_instituicao: number;
}

interface InstitutionPublicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instituicaoId: number;
}

// Ícone de publicações
const PublicationsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// Ícone de fechar
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Ícone de plus
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Ícone de calendário
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Ícone de empty state
const EmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// Ícone de imagem
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// Ícone de lixeira
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// Ícone de alerta
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const InstitutionPublicationsModal: React.FC<InstitutionPublicationsModalProps> = ({
  isOpen,
  onClose,
  instituicaoId
}) => {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do modal de criação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDescricao, setNewDescricao] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do modal de delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<Publicacao | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Busca publicações da instituição
  const fetchPublicacoes = async () => {
    if (!instituicaoId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/publicacaoInstituicoes/instituicao/${instituicaoId}`);
      if (response.ok) {
        const data = await response.json();
        setPublicacoes(Array.isArray(data?.publicacoes_instituicao) ? data.publicacoes_instituicao : []);
      } else {
        setPublicacoes([]);
      }
    } catch (err) {
      console.error('Erro ao buscar publicações:', err);
      setError('Não foi possível carregar as publicações');
      setPublicacoes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && instituicaoId) {
      fetchPublicacoes();
    }
  }, [isOpen, instituicaoId]);

  // Formata data para exibição
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handler para abrir modal de criação
  const handleOpenCreateModal = () => {
    setNewDescricao('');
    setNewImageFile(null);
    setNewImagePreview(null);
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  // Fechar modal de criação
  const closeCreateModal = () => {
    if (isCreating) return;
    setIsCreateModalOpen(false);
    setNewDescricao('');
    setNewImageFile(null);
    setNewImagePreview(null);
    setCreateError(null);
  };

  // Handler para seleção de imagem
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover imagem selecionada
  const removeSelectedImage = () => {
    setNewImageFile(null);
    setNewImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Criar publicação
  const handleCreatePublication = async () => {
    if (!newDescricao.trim()) {
      setCreateError('Por favor, adicione uma descrição.');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      let imageUrl: string | null = null;

      // Upload da imagem se houver
      if (newImageFile) {
        imageUrl = await azureStorageService.uploadImage(newImageFile);
      }

      // Enviar publicação para API
      const payload = {
        id_instituicao: instituicaoId,
        descricao: newDescricao.trim(),
        imagem: imageUrl
      };

      const response = await fetch(`${API_BASE_URL}/publicacaoInstituicoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Falha ao criar publicação');
      }

      // Fechar modal e atualizar lista
      closeCreateModal();
      await fetchPublicacoes();
    } catch (err) {
      console.error('Erro ao criar publicação:', err);
      setCreateError('Não foi possível criar a publicação. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  // Abrir modal de confirmação de delete
  const handleDeleteClick = (pub: Publicacao) => {
    setPublicationToDelete(pub);
    setIsDeleteModalOpen(true);
  };

  // Fechar modal de delete
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setPublicationToDelete(null);
  };

  // Confirmar delete
  const handleConfirmDelete = async () => {
    if (!publicationToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/publicacaoInstituicoes/${publicationToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar publicação');
      }

      // Fechar modal e atualizar lista
      closeDeleteModal();
      await fetchPublicacoes();
    } catch (err) {
      console.error('Erro ao deletar publicação:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="conversations-modal-overlay" onClick={onClose}>
      <div 
        className="conversations-modal-card publications-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="conversations-modal-header">
          <div className="conversations-modal-title">
            <span className="conversations-modal-title-icon">
              <PublicationsIcon />
            </span>
            <h2>Minhas Publicações</h2>
          </div>
          <button 
            className="conversations-modal-close" 
            onClick={onClose}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Divider */}
        <div className="conversations-modal-divider" />

        {/* Content */}
        <div className="conversations-main publications-content">
          {isLoading ? (
            <div className="publications-loading">
              <div className="loading-spinner"></div>
              <p>Carregando publicações...</p>
            </div>
          ) : error ? (
            <div className="publications-error">
              <p>{error}</p>
              <button onClick={fetchPublicacoes}>Tentar novamente</button>
            </div>
          ) : publicacoes.length === 0 ? (
            <div className="publications-empty">
              <EmptyIcon />
              <h3>Nenhuma publicação</h3>
              <p>Você ainda não criou nenhuma publicação. Clique no botão + para criar sua primeira!</p>
            </div>
          ) : (
            <div className="publications-list">
              {publicacoes.map((pub) => (
                <div key={pub.id} className="publication-card">
                  {/* Botão de deletar */}
                  <button 
                    className="publication-delete-btn"
                    onClick={() => handleDeleteClick(pub)}
                    title="Excluir publicação"
                  >
                    <TrashIcon />
                  </button>
                  {pub.imagem && (
                    <div className="publication-image">
                      <img src={pub.imagem} alt="Publicação" />
                    </div>
                  )}
                  <div className="publication-content">
                    <p className="publication-description">{pub.descricao}</p>
                    <div className="publication-date">
                      <CalendarIcon />
                      <span>{formatDate(pub.criado_em)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de criar publicação */}
        <button 
          className="create-publication-btn"
          onClick={handleOpenCreateModal}
          title="Criar nova publicação"
        >
          <PlusIcon />
        </button>
      </div>

      {/* Área clicável para fechar */}
      <div className="conversations-dismiss-area" onClick={onClose} />
    </div>

    {/* Modal de criação de publicação */}
    {isCreateModalOpen && (
        <div className="create-publication-modal-overlay" onClick={closeCreateModal}>
          <div className="create-publication-modal" onClick={(e) => e.stopPropagation()}>
            <div className="create-publication-modal-header">
              <div className="create-publication-modal-title">
                <span className="create-publication-modal-title-icon">
                  <PublicationsIcon />
                </span>
                <h2>Nova Publicação</h2>
              </div>
              <button className="create-publication-modal-close" onClick={closeCreateModal}>
                <CloseIcon />
              </button>
            </div>

            <div className="create-publication-modal-body">
              {/* Upload de imagem */}
              <div className="create-publication-image-section">
                <label className="create-publication-form-label">Foto</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                {newImagePreview ? (
                  <div className="create-publication-image-preview">
                    <img src={newImagePreview} alt="Preview" />
                    <button 
                      className="create-publication-remove-image"
                      onClick={removeSelectedImage}
                      type="button"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="create-publication-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <ImageIcon />
                    <span>Clique para anexar uma foto</span>
                  </button>
                )}
              </div>

              {/* Descrição */}
              <div className="create-publication-form-group">
                <label className="create-publication-form-label">Descrição</label>
                <textarea
                  className="create-publication-textarea"
                  placeholder="Escreva a descrição da sua publicação..."
                  value={newDescricao}
                  onChange={(e) => setNewDescricao(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Erro */}
              {createError && (
                <div className="create-publication-error">
                  {createError}
                </div>
              )}
            </div>

            <div className="create-publication-modal-footer">
              <button 
                className="create-publication-btn-cancel"
                onClick={closeCreateModal}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button 
                className="create-publication-btn-submit"
                onClick={handleCreatePublication}
                disabled={isCreating || !newDescricao.trim()}
              >
                {isCreating ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de delete */}
      {isDeleteModalOpen && (
        <div className="delete-publication-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-publication-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-publication-modal-icon">
              <AlertIcon />
            </div>
            <h3 className="delete-publication-modal-title">Excluir publicação?</h3>
            <p className="delete-publication-modal-text">
              Esta ação não pode ser desfeita. Deseja realmente excluir esta publicação?
            </p>
            <div className="delete-publication-modal-actions">
              <button 
                className="delete-publication-btn-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="delete-publication-btn-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstitutionPublicationsModal;
