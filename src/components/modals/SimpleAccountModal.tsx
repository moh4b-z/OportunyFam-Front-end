"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "../../app/styles/ConversationsModal.css";
import styles from "../../app/styles/SimpleAccountModal.module.css";
import { childService } from "@/services/childService";
import { azureStorageService } from "@/services/azureStorageService";
import { Crianca } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/services/config";

interface SimpleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  endereco?: string;
  profilePhoto?: string;
  userId?: number;
  childrenNames?: string[];
  onUserUpdate?: (updatedData: {email?: string, telefone?: string}) => void;
  // Dados pré-carregados da home (evita chamadas duplicadas)
  initialChildren?: Crianca[];
  onChildrenChange?: () => void;
  onGoToHome?: () => void;
}

const SimpleAccountModal: React.FC<SimpleAccountModalProps> = ({
  isOpen,
  onClose,
  userName,
  email,
  phone,
  cpf,
  cnpj,
  endereco,
  profilePhoto,
  userId,
  childrenNames,
  onUserUpdate,
  initialChildren,
  onChildrenChange,
  onGoToHome,
}) => {
  const { refreshUserData, user: authUser } = useAuth();
  const isInstitution = authUser?.tipo === 'instituicao';
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null); // Guarda URL original para restaurar
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null); // URL pendente (não salva ainda)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [children, setChildren] = useState<Crianca[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Crianca | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [currentEmail, setCurrentEmail] = useState(email || '');
  const [currentPhone, setCurrentPhone] = useState(phone || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [childrenDropdownOpen, setChildrenDropdownOpen] = useState(false);
  
  // Estados para alunos da instituição
  const [institutionStudents, setInstitutionStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Sincroniza estados locais quando props mudam (após refresh)
  useEffect(() => {
    if (email) setCurrentEmail(email);
  }, [email]);
  
  useEffect(() => {
    if (phone) setCurrentPhone(phone);
  }, [phone]);

  // Usa dados pré-carregados da home (se disponíveis) - evita chamadas duplicadas
  useEffect(() => {
    if (initialChildren) {
      // Converte formato ChildDependente para Crianca se necessário
      const convertedChildren = initialChildren.map((child: any) => ({
        crianca_id: child.id_crianca || child.crianca_id,
        nome: child.nome,
        foto_perfil: child.foto_perfil,
        id_responsavel: child.id_responsavel,
        id_pessoa: child.id_pessoa
      }));
      setChildren(convertedChildren);
    }
  }, [initialChildren]);

  // Carrega alunos da instituição quando for instituição e modal abrir
  const loadInstitutionStudents = async () => {
    if (!isInstitution || !userId) return;
    
    setIsLoadingStudents(true);
    try {
      const response = await fetch(`${API_BASE_URL}/instituicoes/alunos/?instituicao_id=${userId}&atividade_id=&status_id=`);
      if (response.ok) {
        const data = await response.json();
        setInstitutionStudents(data.alunos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (isOpen && isInstitution) {
      loadInstitutionStudents();
    }
  }, [isOpen, isInstitution, userId]);

  const handleDeleteChild = (child: Crianca) => {
    setChildToDelete(child);
    setDeleteModalOpen(true);
  };

  const confirmDeleteChild = async () => {
    const childId = childToDelete?.crianca_id;
    console.log('Excluindo criança ID:', childId);
    
    setDeleteModalOpen(false);
    setChildToDelete(null);
    
    if (childId) {
      // Remove da lista imediatamente
      setChildren(prev => prev.filter(child => child.crianca_id !== childId));
      // Fecha qualquer dropdown aberto
      setExpandedIndex(null);
      
      // Chama API para excluir
      try {
        await childService.deleteChild(childId);
        console.log('Criança excluída da API');
        // Notifica a home para atualizar
        onChildrenChange?.();
      } catch (error) {
        console.error('Erro ao excluir da API:', error);
        // Se falhar, notifica a home para recarregar lista
        onChildrenChange?.();
      }
    }
  };

  const startEditingField = (field: string) => {
    if (!editingField) {
      // Aplica máscara ao telefone ao iniciar edição
      const formattedPhone = currentPhone ? applyPhoneMask(currentPhone) : '';
      setEditValues({
        email: currentEmail || '',
        telefone: formattedPhone
      });
    }
    setEditingField(field);
  };

  const handleSaveChanges = async () => {
    console.log('handleSaveChanges chamado, userId:', userId);
    if (!userId) {
      console.error('userId não definido!');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Remove máscara do telefone para enviar apenas números
      const phoneToSend = (editValues.telefone || currentPhone || '').replace(/\D/g, '');
      
      // Monta o payload completo com os dados atuais + alterações
      const payload: Record<string, any> = {
        nome: userName,
        email: editValues.email || currentEmail,
        telefone: phoneToSend,
        cpf: cpf || '',
        id_tipo_nivel: 1 // Padrão sempre 1
      };
      
      // Adiciona foto_perfil - trata upload de nova foto ou remoção
      if (pendingAvatarUrl !== null) {
        // Se pendingAvatarUrl é '' (string vazia), significa remoção
        // Se pendingAvatarUrl tem URL, significa nova foto
        payload.foto_perfil = pendingAvatarUrl || null;
      } else if (avatarUrl) {
        payload.foto_perfil = avatarUrl;
      }
      
      console.log('Enviando payload para salvar:', payload);
      
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json().catch(() => null);
      console.log('Resposta da API:', response.status, data);
      
      if (response.ok) {
        // Atualiza os estados locais com os novos valores
        const newEmail = editValues.email || currentEmail;
        const newPhone = editValues.telefone || currentPhone;
        setCurrentEmail(newEmail);
        setCurrentPhone(newPhone);
        
        if (onUserUpdate) {
          onUserUpdate({
            email: newEmail,
            telefone: newPhone
          });
        }
      } else {
        console.error('Erro ao salvar dados:', data);
      }
      
      // Limpa estados de edição
      setEditingField(null);
      setHasChanges(false);
      setShowSaveModal(false);
      setEditValues({});
      setOriginalAvatarUrl(null);
      setPendingAvatarUrl(null);
      
      // Sempre faz refresh dos dados do usuário após comunicação com a API
      await refreshUserData();
      setIsSaving(false);
    } catch (error) {
      console.error('Erro de conexão:', error);
      
      // Limpa estados mesmo em caso de erro
      setEditingField(null);
      setHasChanges(false);
      setShowSaveModal(false);
      setEditValues({});
      setOriginalAvatarUrl(null);
      setPendingAvatarUrl(null);
      
      // Faz refresh dos dados do usuário mesmo em caso de erro
      await refreshUserData();
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = async () => {
    setEditingField(null);
    setHasChanges(false);
    setEditValues({});
    setShowDiscardModal(false);
    setOriginalAvatarUrl(null);
    setPendingAvatarUrl(null);
    
    // Faz refresh para restaurar os dados da API
    await refreshUserData();
    
    // Restaura a foto da API
    setAvatarUrl(profilePhoto || null);
    
    if (pendingCloseAction) {
      pendingCloseAction();
      setPendingCloseAction(null);
    }
  };

  const handleCloseWithCheck = () => {
    if (hasChanges) {
      setPendingCloseAction(() => onClose);
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  // Função para aplicar máscara de telefone
  const applyPhoneMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return '(' + numbers.slice(0, 2) + ') ' + numbers.slice(2);
    } else if (numbers.length <= 10) {
      return '(' + numbers.slice(0, 2) + ') ' + numbers.slice(2, 6) + '-' + numbers.slice(6);
    } else {
      return '(' + numbers.slice(0, 2) + ') ' + numbers.slice(2, 7) + '-' + numbers.slice(7, 11);
    }
  };

  // Função para aplicar máscara de CPF
  const applyCpfMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return numbers.slice(0, 3) + '.' + numbers.slice(3);
    } else if (numbers.length <= 9) {
      return numbers.slice(0, 3) + '.' + numbers.slice(3, 6) + '.' + numbers.slice(6);
    } else {
      return numbers.slice(0, 3) + '.' + numbers.slice(3, 6) + '.' + numbers.slice(6, 9) + '-' + numbers.slice(9, 11);
    }
  };

  // Função para aplicar máscara de CNPJ
  const applyCnpjMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return numbers.slice(0, 2) + '.' + numbers.slice(2);
    } else if (numbers.length <= 8) {
      return numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5);
    } else if (numbers.length <= 12) {
      return numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5, 8) + '/' + numbers.slice(8);
    } else {
      return numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5, 8) + '/' + numbers.slice(8, 12) + '-' + numbers.slice(12, 14);
    }
  };

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'telefone') {
      // Remove caracteres não numéricos e limita a 11 dígitos
      const numbers = value.replace(/\D/g, '');
      if (numbers.length > 11) return; // Não permite mais que 11 dígitos
      processedValue = applyPhoneMask(value);
    } else if (field === 'email') {
      // Remove espaços e converte para minúsculo
      processedValue = value.toLowerCase().replace(/\s/g, '');
      if (processedValue.length > 100) return; // Limita a 100 caracteres
    }
    
    setEditValues({...editValues, [field]: processedValue});
    
    // Verifica se há mudanças reais comparando com valores originais
    const newEditValues = {...editValues, [field]: processedValue};
    
    // Para email, compara diretamente
    const emailChanged = (newEditValues.email || '').toLowerCase() !== (currentEmail || '').toLowerCase();
    
    // Para telefone, compara apenas os números (sem máscara)
    const newPhoneNumbers = (newEditValues.telefone || '').replace(/\D/g, '');
    const currentPhoneNumbers = (currentPhone || '').replace(/\D/g, '');
    const phoneChanged = newPhoneNumbers !== currentPhoneNumbers;
    
    setHasChanges(emailChanged || phoneChanged || pendingAvatarUrl !== null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hasChanges) {
      e.preventDefault();
      setShowSaveModal(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  // Função para cancelar edição do campo atual
  const cancelEditing = () => {
    // Restaura os valores originais
    const formattedPhone = currentPhone ? applyPhoneMask(currentPhone) : '';
    setEditValues({
      email: currentEmail || '',
      telefone: formattedPhone
    });
    setEditingField(null);
    
    // Recalcula hasChanges baseado apenas na foto pendente
    setHasChanges(pendingAvatarUrl !== null);
  };

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Guarda a URL original antes de qualquer alteração
    if (!originalAvatarUrl && avatarUrl) {
      setOriginalAvatarUrl(avatarUrl);
    } else if (!originalAvatarUrl && !avatarUrl) {
      setOriginalAvatarUrl(''); // Marca que não tinha avatar
    }
    
    setIsUploadingAvatar(true);
    try {
      const imageUrl = await azureStorageService.uploadImage(file);
      // Apenas atualiza a visualização, NÃO salva no localStorage ainda
      setAvatarUrl(imageUrl);
      setPendingAvatarUrl(imageUrl);
      setHasChanges(true);
      if (!editValues.email && !editValues.telefone) {
        setEditValues({
          email: currentEmail || '',
          telefone: currentPhone || ''
        });
      }
    } catch (error) {
      console.error('Erro no upload do Azure:', error);
      // Fallback para base64 local
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAvatarUrl(dataUrl);
        setPendingAvatarUrl(dataUrl);
        setHasChanges(true);
        if (!editValues.email && !editValues.telefone) {
          setEditValues({
            email: currentEmail || '',
            telefone: currentPhone || ''
          });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Quando o modal abre, usa a foto da API como fonte primária
  useEffect(() => {
    if (isOpen) {
      // Faz refresh dos dados do usuário ao abrir o modal
      refreshUserData();
      
      // Usa a foto da API como fonte primária
      if (profilePhoto) {
        setAvatarUrl(profilePhoto);
      } else {
        setAvatarUrl(null);
      }
      
      // Limpa estados de edição
      setOriginalAvatarUrl(null);
      setPendingAvatarUrl(null);
      setHasChanges(false);
      setEditingField(null);
      setEditValues({});
    }
  }, [isOpen, profilePhoto]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(251, 146, 60, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 4px 12px rgba(251, 146, 60, 0.6); }
        }
        .profile-scroll-container {
          flex: 1;
          overflow-y: auto !important;
          overflow-x: hidden;
          min-height: 0;
          padding: 20px;
        }
        .profile-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .profile-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .profile-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(244, 162, 97, 0.4);
          border-radius: 3px;
        }
        .profile-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(244, 162, 97, 0.6);
        }
      `}</style>
      <div className="conversations-modal-overlay">
      <div className="conversations-modal-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Minha Conta</span>
          </h1>
          <button className="conversations-modal-close" onClick={handleCloseWithCheck}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Botão de salvar - posicionado abaixo do X de fechar */}
        {hasChanges && (
          <div 
            className="profile-description-container"
            style={{
              position: 'absolute',
              top: '100px',
              right: '20px',
              zIndex: 10
            }}
          >
            <button 
              type="button"
              className="profile-description-trigger"
              onClick={() => setShowSaveModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="profile-description-label">Salvar alterações</span>
            </button>
          </div>
        )}

        <div className="profile-scroll-container">
          <div className={styles.profileBlock}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.profileAvatar}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" />
                ) : (
                  <svg
                    className={styles.profileAvatarIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                <button className={styles.editBadge} aria-label="Editar foto" onClick={onPickAvatar} disabled={isUploadingAvatar}>
                  {isUploadingAvatar ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                    </svg>
                  )}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={onAvatarSelected}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>

          <div className={styles.fields}>
            {/* Campo Nome */}
            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Nome:</span>
                <span className={styles.value}>{userName || "Usuário"}</span>
              </div>
            </div>

            {/* Campo Email - Editável */}
            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Email:</span>
                {editingField === 'email' ? (
                  <input 
                    type="email"
                    value={editValues.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="usuario@dominio.com"
                    autoFocus
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #fb923c',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fef7ed',
                      flex: 1
                    }}
                  />
                ) : (
                  <span className={styles.value}>{currentEmail || "usuario@dominio.com"}</span>
                )}
              </div>
              <button 
                className={styles.editBtn} 
                onClick={() => editingField === 'email' ? cancelEditing() : startEditingField('email')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={editingField === 'email' ? 'Cancelar edição (Esc)' : 'Editar email'}
              >
                {editingField === 'email' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Campo Telefone - Editável */}
            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Telefone:</span>
                {editingField === 'telefone' ? (
                  <input 
                    type="tel"
                    value={editValues.telefone || ''}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="(00) 00000-0000"
                    autoFocus
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #fb923c',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fef7ed',
                      flex: 1
                    }}
                  />
                ) : (
                  <span className={styles.value}>{currentPhone ? applyPhoneMask(currentPhone) : "Não informado"}</span>
                )}
              </div>
              <button 
                className={styles.editBtn} 
                onClick={() => editingField === 'telefone' ? cancelEditing() : startEditingField('telefone')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={editingField === 'telefone' ? 'Cancelar edição (Esc)' : 'Editar telefone'}
              >
                {editingField === 'telefone' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                  </svg>
                )}
              </button>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2"/>
                  <path d="M7 8h2"/>
                  <path d="M7 12h10"/>
                  <path d="M7 16h6"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>{isInstitution ? 'CNPJ:' : 'CPF:'}</span>
                <span className={styles.value}>
                  {isInstitution 
                    ? (cnpj ? applyCnpjMask(cnpj) : "Não informado")
                    : (cpf ? applyCpfMask(cpf) : "Não informado")
                  }
                </span>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className={styles.fieldContent} style={{ overflow: 'hidden', minWidth: 0 }}>
                <span className={styles.label}>Endereço:</span>
                <span 
                  className={styles.value} 
                  title={endereco || "Não informado"}
                  style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                    display: 'inline-block',
                    verticalAlign: 'bottom',
                    cursor: endereco ? 'pointer' : 'default'
                  }}
                >
                  {endereco || "Não informado"}
                </span>
              </div>
              {!isInstitution && (
                <button 
                  className={styles.editBtn}
                  onClick={() => {
                    if (onGoToHome) {
                      onGoToHome();
                      onClose();
                    }
                  }}
                  title="Centralizar mapa na minha casa"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4"/>
                    <path d="M12 18v4"/>
                    <path d="M2 12h4"/>
                    <path d="M18 12h4"/>
                    <circle cx="12" cy="12" r="8"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Dropdown de Crianças/Alunos */}
          <button
            type="button"
            className="enroll-child-item"
            onClick={() => setChildrenDropdownOpen(!childrenDropdownOpen)}
            style={{
              marginTop: '24px',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="enroll-child-avatar">
                <div className="default-institution-icon" style={{ 
                  background: 'linear-gradient(135deg, #f4a261 0%, #e8943f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span className="enroll-child-name" style={{ display: 'block' }}>
                  {isInstitution ? 'Alunos da instituição' : 'Crianças cadastradas'}
                </span>
                <span style={{ fontSize: '13px', color: '#888' }}>
                  {isInstitution 
                    ? (isLoadingStudents ? 'Carregando...' : `${institutionStudents.length} ${institutionStudents.length === 1 ? 'aluno' : 'alunos'}`)
                    : (isLoadingChildren ? 'Carregando...' : `${children.length} ${children.length === 1 ? 'criança' : 'crianças'}`)
                  }
                </span>
              </div>
            </div>
            <svg 
              className="enroll-child-arrow"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#e8943f" 
              strokeWidth="2"
              style={{
                transition: 'transform 0.3s ease',
                transform: childrenDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Lista de crianças/alunos expandida */}
          <div 
            className="enroll-children-list"
            style={{
              maxHeight: childrenDropdownOpen ? '2000px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.4s ease-in-out, padding 0.3s ease',
              padding: childrenDropdownOpen ? '12px 8px' : '0',
              marginTop: childrenDropdownOpen ? '12px' : '0'
            }}
          >
            {isInstitution ? (
              /* Lista de alunos para instituições */
              isLoadingStudents ? (
                <div className="enroll-loading">
                  <span className="enroll-spinner"></span>
                  <span>Carregando alunos...</span>
                </div>
              ) : institutionStudents.length > 0 ? (
                institutionStudents.map((aluno, idx) => {
                  const isOpenItem = expandedIndex === idx;
                  return (
                    <div 
                      key={aluno.id_inscricao || idx}
                      className="enroll-child-item"
                      style={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        cursor: 'pointer',
                        background: isOpenItem ? 'rgba(232, 148, 63, 0.1)' : 'transparent',
                        padding: '12px',
                        width: '95%',
                        margin: '0 auto'
                      }}
                      onClick={() => setExpandedIndex(isOpenItem ? null : idx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
                        <div className="enroll-child-avatar">
                          {aluno.crianca_foto ? (
                            <img src={aluno.crianca_foto} alt={aluno.crianca_nome} />
                          ) : (
                            <div className="default-institution-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span className="enroll-child-name">{aluno.crianca_nome}</span>
                          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                            {aluno.atividade_titulo || 'Atividade não especificada'}
                          </div>
                        </div>
                        <svg 
                          className="enroll-child-arrow"
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#e8943f" 
                          strokeWidth="2"
                          style={{
                            transition: 'transform 0.2s ease',
                            transform: isOpenItem ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>

                      {/* Detalhes expandidos do aluno */}
                      {isOpenItem && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: '14px',
                            paddingTop: '14px',
                            borderTop: '1px dashed rgba(232, 148, 63, 0.3)'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                background: 'rgba(232, 148, 63, 0.08)',
                                borderRadius: '10px',
                                border: '1px solid rgba(232, 148, 63, 0.15)'
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8943f" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                              </svg>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '12px', color: '#888' }}>Atividade:</span>
                                <span className="enroll-child-name" style={{ fontSize: '14px', display: 'block' }}>
                                  {aluno.atividade_titulo || 'Não informada'}
                                </span>
                              </div>
                            </div>
                            <div 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                background: 'rgba(232, 148, 63, 0.08)',
                                borderRadius: '10px',
                                border: '1px solid rgba(232, 148, 63, 0.15)'
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8943f" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                              </svg>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '12px', color: '#888' }}>Status:</span>
                                <span className="enroll-child-name" style={{ fontSize: '14px', display: 'block' }}>
                                  {aluno.status_inscricao || 'Pendente'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="enroll-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <p style={{ fontWeight: '500', marginBottom: '4px' }}>Nenhum aluno cadastrado</p>
                  <p style={{ fontSize: '13px' }}>Os alunos aparecerão aqui quando se inscreverem nas atividades</p>
                </div>
              )
            ) : (
              /* Lista de crianças para usuários normais */
              isLoadingChildren ? (
                <div className="enroll-loading">
                  <span className="enroll-spinner"></span>
                  <span>Carregando crianças...</span>
                </div>
              ) : children.length > 0 ? (
                children.map((child, idx) => {
                  const isOpenItem = expandedIndex === idx;
                  return (
                    <div 
                      key={child.id || idx}
                      className="enroll-child-item"
                      style={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        cursor: 'pointer',
                        background: isOpenItem ? 'rgba(232, 148, 63, 0.1)' : 'transparent',
                        padding: '12px',
                        width: '95%',
                        margin: '0 auto'
                      }}
                      onClick={() => setExpandedIndex(isOpenItem ? null : idx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
                        <div className="enroll-child-avatar">
                          {child.foto_perfil ? (
                            <img src={child.foto_perfil} alt={child.nome} />
                          ) : (
                            <div className="default-institution-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span className="enroll-child-name">{child.nome}</span>
                          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                            {child.atividades_matriculadas?.length || 0} atividades
                          </div>
                        </div>
                        <svg 
                          className="enroll-child-arrow"
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#e8943f" 
                          strokeWidth="2"
                          style={{
                            transition: 'transform 0.2s ease',
                            transform: isOpenItem ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>

                      {/* Detalhes expandidos da criança */}
                      {isOpenItem && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: '14px',
                            paddingTop: '14px',
                            borderTop: '1px dashed rgba(232, 148, 63, 0.3)'
                          }}
                        >
                          <div className="enroll-confirm-text" style={{ fontWeight: '600', marginBottom: '10px' }}>
                            Instituições que faz parte:
                          </div>
                          {child.atividades_matriculadas && child.atividades_matriculadas.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {child.atividades_matriculadas.map((atividade: any, actIdx: number) => (
                                <div 
                                  key={actIdx} 
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    background: 'rgba(232, 148, 63, 0.08)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(232, 148, 63, 0.15)'
                                  }}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8943f" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                  </svg>
                                  <span className="enroll-child-name" style={{ fontSize: '14px' }}>
                                    {atividade.instituicao_nome || 'Instituição'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="enroll-confirm-text" style={{ fontStyle: 'italic' }}>
                              Nenhuma instituição cadastrada
                            </div>
                          )}

                          {/* Botão de excluir */}
                          <button 
                            type="button"
                            className="enroll-btn enroll-btn-cancel"
                            onClick={(e) => { e.stopPropagation(); handleDeleteChild(child); }}
                            style={{
                              marginTop: '14px',
                              width: '100%',
                              borderColor: '#ef4444',
                              color: '#ef4444'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ef4444';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.borderColor = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.borderColor = '#ef4444';
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                              <path d="M3 6h18"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            Remover criança
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="enroll-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <p style={{ fontWeight: '500', marginBottom: '4px' }}>Nenhuma criança cadastrada</p>
                  <p style={{ fontSize: '13px' }}>Cadastre crianças para inscrevê-las em atividades</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {deleteModalOpen && ReactDOM.createPortal(
        <div 
          className="enroll-popup-overlay"
          onClick={() => setDeleteModalOpen(false)}
          style={{ zIndex: 100000 }}
        >
          <div 
            className="enroll-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="enroll-popup-close"
              onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(false); }}
              aria-label="Fechar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="enroll-step">
              <div className="enroll-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8943f" strokeWidth="1.5">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <h3 className="enroll-title">Deseja excluir {childToDelete?.nome}?</h3>
              <p className="enroll-confirm-text">Esta ação não pode ser desfeita.</p>
              <div className="enroll-actions">
                <button 
                  type="button"
                  className="enroll-btn enroll-btn-cancel"
                  onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(false); }}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="enroll-btn enroll-btn-confirm"
                  onClick={(e) => { e.stopPropagation(); confirmDeleteChild(); }}
                  style={{ background: '#ef4444' }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {showSaveModal && ReactDOM.createPortal(
        <div 
          className="enroll-popup-overlay"
          onClick={() => !isSaving && setShowSaveModal(false)}
          style={{ zIndex: 100000 }}
        >
          <div 
            className="enroll-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="enroll-popup-close"
              onClick={(e) => { e.stopPropagation(); if (!isSaving) setShowSaveModal(false); }}
              aria-label="Fechar"
              disabled={isSaving}
              style={{ opacity: isSaving ? 0.5 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="enroll-step">
              <div className="enroll-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8943f" strokeWidth="1.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </div>
              <h3 className="enroll-title">Salvar alterações?</h3>
              <p className="enroll-confirm-text">Suas alterações serão salvas permanentemente.</p>
              <div className="enroll-actions">
                <button 
                  type="button"
                  className="enroll-btn enroll-btn-cancel"
                  onClick={(e) => { e.stopPropagation(); setShowSaveModal(false); }}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="enroll-btn enroll-btn-confirm"
                  onClick={() => { console.log('Botão Salvar clicado'); handleSaveChanges(); }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="enroll-spinner-small"></span>
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showDiscardModal && ReactDOM.createPortal(
        <div 
          className="enroll-popup-overlay"
          onClick={() => { setShowDiscardModal(false); setPendingCloseAction(null); }}
          style={{ zIndex: 100000 }}
        >
          <div 
            className="enroll-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="enroll-popup-close"
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowDiscardModal(false);
                setPendingCloseAction(null);
              }}
              aria-label="Fechar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="enroll-step">
              <div className="enroll-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8943f" strokeWidth="1.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="enroll-title">Descartar alterações?</h3>
              <p className="enroll-confirm-text">Você tem alterações não salvas. Deseja descartá-las?</p>
              <div className="enroll-actions">
                <button 
                  type="button"
                  className="enroll-btn enroll-btn-cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDiscardModal(false);
                    setPendingCloseAction(null);
                  }}
                >
                  Continuar editando
                </button>
                <button 
                  type="button"
                  className="enroll-btn enroll-btn-confirm"
                  onClick={(e) => { e.stopPropagation(); handleDiscardChanges(); }}
                  style={{ background: '#ef4444' }}
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      </div>
    </>
  );
};

export default SimpleAccountModal;

function maskEmail(e: string) {
  const [user, domain] = e.split("@");
  if (!user || !domain) return e;
  const maskedUser = user.length <= 2 ? "**" : user[0] + "*".repeat(Math.max(2, user.length - 2));
  const parts = domain.split(".");
  const maskedDomain = parts[0][0] + "*".repeat(Math.max(2, parts[0].length - 2)) + "." + parts.slice(1).join(".");
  return `${maskedUser}@${maskedDomain}`;
}

function maskPhone(p: string) {
  const digits = p.replace(/\D/g, "");
  const d = digits.padEnd(11, "0");
  return `11 ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}
