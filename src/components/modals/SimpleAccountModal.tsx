"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../app/styles/ConversationsModal.css";
import styles from "../../app/styles/SimpleAccountModal.module.css";
import ChildRegistrationModal from "./ChildRegistrationModal";
import { childService } from "@/services/childService";
import { azureStorageService } from "@/services/azureStorageService";
import { Crianca } from "@/types";

interface SimpleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  email?: string;
  phone?: string;
  cpf?: string;
  userId?: number;
  childrenNames?: string[];
  onUserUpdate?: (updatedData: {email?: string, telefone?: string}) => void;
  // Dados pré-carregados da home (evita chamadas duplicadas)
  initialChildren?: Crianca[];
  onChildrenChange?: () => void;
}

const SimpleAccountModal: React.FC<SimpleAccountModalProps> = ({
  isOpen,
  onClose,
  userName,
  email,
  phone,
  cpf,
  userId,
  childrenNames,
  onUserUpdate,
  initialChildren,
  onChildrenChange,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storageKey = useMemo(
    () => `account_avatar_${(userName || "usuario").toLowerCase()}`,
    [userName]
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [children, setChildren] = useState<Crianca[]>([]);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
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

  const handleAddChild = () => {
    setIsChildModalOpen(true);
  };

  const handleChildRegistrationSuccess = () => {
    // Notifica a home para atualizar a lista de crianças (chamada centralizada)
    onChildrenChange?.();
    setIsChildModalOpen(false);
  };

  const handleDeleteAvatar = () => {
    setAvatarUrl(null);
    try { localStorage.removeItem(storageKey); } catch {}
  };

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
      setEditValues({
        email: currentEmail || '',
        telefone: currentPhone || ''
      });
    }
    setEditingField(field);
  };

  const handleSaveChanges = async () => {
    if (!userId) return;
    
    try {
      // Monta o payload completo com os dados atuais + alterações
      const payload = {
        nome: userName,
        email: editValues.email || currentEmail,
        telefone: editValues.telefone || currentPhone,
        cpf: cpf || '',
        id_tipo_nivel: 1 // Padrão sempre 1
      };
      
      const response = await fetch(`https://oportunyfam-back-end.onrender.com/v1/oportunyfam/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setCurrentEmail(editValues.email || currentEmail);
        setCurrentPhone(editValues.telefone || currentPhone);
        
        if (onUserUpdate) {
          onUserUpdate({
            email: editValues.email || currentEmail,
            telefone: editValues.telefone || currentPhone
          });
        }
        
        setEditingField(null);
        setHasChanges(false);
        setShowSaveModal(false);
        setEditValues({});
      } else {
        alert('❌ Erro ao salvar dados');
      }
    } catch (error) {
      alert('❌ Erro de conexão');
    }
  };

  const handleDiscardChanges = () => {
    setEditingField(null);
    setHasChanges(false);
    setEditValues({});
    setShowDiscardModal(false);
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

  const handleInputChange = (field: string, value: string) => {
    const originalValue = field === 'email' ? currentEmail : currentPhone;
    setEditValues({...editValues, [field]: value});
    
    // Verifica se há mudanças reais comparando com valores originais
    const newEditValues = {...editValues, [field]: value};
    const emailChanged = newEditValues.email !== currentEmail;
    const phoneChanged = newEditValues.telefone !== currentPhone;
    setHasChanges(emailChanged || phoneChanged);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hasChanges) {
      e.preventDefault();
      setShowSaveModal(true);
    }
  };

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('🔄 Iniciando upload do avatar para Azure Storage...');
    setIsUploadingAvatar(true);
    try {
      const imageUrl = await azureStorageService.uploadImage(file);
      console.log('✅ Upload concluído! URL:', imageUrl);
      setAvatarUrl(imageUrl);
      try { localStorage.setItem(storageKey, imageUrl); } catch {}
      alert('✅ Avatar enviado com sucesso para Azure Storage!');
    } catch (error) {
      console.error('❌ Erro no upload do Azure:', error);
      alert('⚠️ Falha no Azure Storage, usando armazenamento local');
      // Fallback para base64 local
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAvatarUrl(dataUrl);
        try { localStorage.setItem(storageKey, dataUrl); } catch {}
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setAvatarUrl(saved);
    } catch {}
  }, [storageKey, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(251, 146, 60, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 4px 12px rgba(251, 146, 60, 0.6); }
        }
      `}</style>
      <div className="conversations-modal-overlay">
      <div className="conversations-modal-card" style={{ display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasChanges && (
              <button 
                onClick={() => setShowSaveModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #fb923c, #f97316)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(251, 146, 60, 0.4)',
                  transition: 'all 0.2s ease',
                  animation: 'pulse 2s infinite'
                }}
                title="Salvar alterações"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </button>
            )}
            <button className="conversations-modal-close" onClick={handleCloseWithCheck}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="conversations-main" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
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
              {avatarUrl && (
                <button 
                  onClick={handleDeleteAvatar}
                  style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    color: '#6c757d',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#dc3545';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#dc3545';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(220,53,69,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#6c757d';
                    e.currentTarget.style.borderColor = '#e9ecef';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                  }}
                >
                  Excluir foto
                </button>
              )}
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
                onClick={() => startEditingField('email')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: editingField === 'email' ? 0.5 : 1
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
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
                  <span className={styles.value}>{currentPhone || "Não informado"}</span>
                )}
              </div>
              <button 
                className={styles.editBtn} 
                onClick={() => startEditingField('telefone')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: editingField === 'telefone' ? 0.5 : 1
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
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
                <span className={styles.label}>CPF:</span>
                <span className={styles.value}>{cpf || "Não informado"}</span>
              </div>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <span>Filhos:</span>
            <button className={styles.addBtn} onClick={handleAddChild} aria-label="Adicionar filho">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="16" y1="11" x2="22" y2="11"/>
              </svg>
            </button>
          </div>

          <div className={styles.childrenList}>
            {isLoadingChildren ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Carregando filhos...
              </div>
            ) : children.length > 0 ? (
              children.map((child, idx) => {
                const isOpenItem = expandedIndex === idx;
                return (
                  <div className={styles.childCard} key={child.id || idx}>
                    <div className={styles.leftAccent} />
                    <div className={styles.childAvatar}>
                      <img 
                        src={child.foto_perfil || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} 
                        alt=""
                      />
                      <span className={styles.statusDot} />
                    </div>
                    <div className={styles.childName}>{child.nome}</div>
                    <button 
                      className={styles.caret} 
                      onClick={() => setExpandedIndex(isOpenItem ? null : idx)} 
                      aria-label={isOpenItem ? "Recolher" : "Expandir"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isOpenItem ? (
                          <polyline points="8 15 12 11 16 15"/>
                        ) : (
                          <polyline points="8 9 12 13 16 9"/>
                        )}
                      </svg>
                    </button>

                    {isOpenItem && (
                      <div className={styles.childExpanded}>
                        <div className={styles.expandedHeader}>Instituições que faz parte:</div>
                        {child.atividades_matriculadas && child.atividades_matriculadas.length > 0 ? (
                          child.atividades_matriculadas.map((atividade: any, actIdx: number) => (
                            <div key={actIdx} className={styles.institutionItem}>
                              <img className={styles.institutionIcon} alt="instituicoes" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvb2stbWFya2VkLWljb24gbHVjaWRlLWJvb2stbWFya2VkIj48cGF0aCBkPSJNMTAgMnY4bDMtMyAzIDNWMiIvPjxwYXRoIGQ9Ik00IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJIMTlhMSAxIDAgMCAxIDEgMXYxOGExIDEgMCAwIDEtMSAxSDYuNWExIDEgMCAwIDEgMC01SDIwIi8+PC9zdmc+" />
                              <div className={styles.institutionName}>{atividade.instituicao_nome || 'Instituição'}</div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#666', fontSize: '14px', padding: '10px 0' }}>
                            Nenhuma instituição cadastrada
                          </div>
                        )}

                        <div className={styles.childActions}>
                          <button 
                            onClick={() => handleDeleteChild(child)}
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
                          >
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              ×
                            </div>
                          </button>
                          <img className={styles.actionIcon} alt="config-associacao" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItY29nLWljb24gbHVjaWRlLXVzZXItY29nIj48cGF0aCBkPSJNMTAgMTVINmE0IDQgMCAwIDAtNCA0djIiLz48cGF0aCBkPSJtMTQuMzA1IDE2LjUzLjkyMy0uMzgyIi8+PHBhdGggZD0ibTE1LjIyOCAxMy44NTItLjkyMy0uMzgzIi8+PHBhdGggZD0ibTE2Ljg1MiAxMi4yMjgtLjM4My0uOTIzIi8+PHBhdGggZD0ibTE2Ljg1MiAxNy43NzItLjM4My45MjQiLz48cGF0aCBkPSJtMTkuMTQ4IDEyLjIyOC4zODMtLjkyMyIvPjxwYXRoIGQ9Im0xOS41MyAxOC42OTYtLjM4Mi0uOTI0Ci8+PHBhdGggZD0ibTIwLjc3MiAxMy44NTIuOTI0LS4zODMiLz48cGF0aCBkPSJtMjAuNzcyIDE2LjE0OC45MjQuMzgzIi8+PGNpcmNsZSBjeD0iMTgiIGN5PSIxNSIgcj0iMyIvPjxjaXJjbGUgY3g9IjkiIGN5PSI3IiByPSI0Ci8+PC9zdmc+" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Nenhum filho cadastrado ainda
              </div>
            )}
          </div>
        </div>
      </div>
      
      {userId && (
        <ChildRegistrationModal
          isOpen={isChildModalOpen}
          onClose={() => setIsChildModalOpen(false)}
          onSuccess={handleChildRegistrationSuccess}
          userId={userId}
        />
      )}
      
      {deleteModalOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'auto'
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              textAlign: 'center',
              pointerEvents: 'auto'
            }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>
              Deseja excluir {childToDelete?.nome}?
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', pointerEvents: 'auto' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(false); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  pointerEvents: 'auto'
                }}
              >
                Não
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); confirmDeleteChild(); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  pointerEvents: 'auto'
                }}
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showSaveModal && (
        <div 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'auto'
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              textAlign: 'center',
              pointerEvents: 'auto'
            }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #fb923c, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              Salvar alterações?
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
              Suas alterações serão salvas permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', pointerEvents: 'auto' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSaveModal(false); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  pointerEvents: 'auto'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSaveChanges(); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #fb923c, #f97316)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  pointerEvents: 'auto'
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDiscardModal && (
        <div 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'auto'
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              textAlign: 'center',
              pointerEvents: 'auto'
            }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              Descartar alterações?
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
              Você tem alterações não salvas. Deseja descartá-las?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', pointerEvents: 'auto' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDiscardModal(false);
                  setPendingCloseAction(null);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  pointerEvents: 'auto'
                }}
              >
                Continuar editando
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDiscardChanges(); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  pointerEvents: 'auto'
                }}
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
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
