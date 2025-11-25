"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  userId?: number;
  childrenNames?: string[];
  onUserUpdate?: (updatedData: {email?: string, telefone?: string}) => void;
}

const SimpleAccountModal: React.FC<SimpleAccountModalProps> = ({
  isOpen,
  onClose,
  userName,
  email,
  phone,
  userId,
  childrenNames,
  onUserUpdate,
}) => {
  if (!isOpen) return null;
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [currentEmail, setCurrentEmail] = useState(email || '');
  const [currentPhone, setCurrentPhone] = useState(phone || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Carrega filhos do usuário
  const loadChildren = async () => {
    if (!userId) return;
    
    setIsLoadingChildren(true);
    try {
      const childrenData = await childService.getChildrenByUserId(userId);
      setChildren(childrenData || []);
    } catch (error) {
      console.error('Erro ao carregar filhos:', error);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadChildren();
    }
  }, [isOpen, userId]);

  const handleAddChild = () => {
    setIsChildModalOpen(true);
  };

  const handleChildRegistrationSuccess = () => {
    loadChildren(); // Recarrega a lista de filhos
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
    const childId = childToDelete?.id_crianca;
    console.log('Excluindo criança ID:', childId);
    
    setDeleteModalOpen(false);
    setChildToDelete(null);
    
    if (childId) {
      // Remove da lista imediatamente
      setChildren(prev => prev.filter(child => child.id_crianca !== childId));
      // Fecha qualquer dropdown aberto
      setExpandedIndex(null);
      
      // Chama API para excluir
      try {
        await childService.deleteChild(childId);
        console.log('Criança excluída da API');
      } catch (error) {
        console.error('Erro ao excluir da API:', error);
        // Se falhar, recarrega lista
        loadChildren();
      }
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setEditValues({
      email: currentEmail || '',
      telefone: currentPhone || ''
    });
  };

  const handleSaveChanges = async () => {
    if (!userId) return;
    
    console.log('🔄 Enviando dados para API:', editValues);
    console.log('📍 URL:', `https://oportunyfam-back-end.onrender.com/v1/oportunyfam/usuarios/${userId}`);
    
    try {
      const response = await fetch(`https://oportunyfam-back-end.onrender.com/v1/oportunyfam/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editValues)
      });
      
      console.log('📊 Status da resposta:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resposta da API:', result);
        
        // Atualiza dados locais
        setCurrentEmail(editValues.email || '');
        setCurrentPhone(editValues.telefone || '');
        
        // Notifica componente pai
        if (onUserUpdate) {
          onUserUpdate({
            email: editValues.email,
            telefone: editValues.telefone
          });
        }
        
        setIsEditMode(false);
        setHasChanges(false);
        setShowSaveModal(false);
        alert('✅ Dados salvos com sucesso!');
      } else {
        const errorData = await response.text();
        console.error('❌ Erro da API:', errorData);
        alert('❌ Erro ao salvar dados');
      }
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      alert('❌ Erro de conexão');
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setHasChanges(false);
    setEditValues({});
  };

  const handleInputChange = (field: string, value: string) => {
    setEditValues({...editValues, [field]: value});
    setHasChanges(true);
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Conta</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.profileBlock}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.profileAvatar}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" />
                ) : (
                  <span>{(userName || "U").charAt(0).toUpperCase()}</span>
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
                  Excluir
                </button>
              )}
              <button 
                onClick={handleEditMode}
                style={{
                  marginTop: '8px',
                  marginLeft: '8px',
                  padding: '4px 8px',
                  background: '#fb923c',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(251,146,60,0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f97316';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(251,146,60,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fb923c';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(251,146,60,0.2)';
                }}
              >
                Alterar Dados
              </button>
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Email:</span>
                {isEditMode ? (
                  <input 
                    type="email"
                    value={editValues.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #fb923c',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fef7ed'
                    }}
                  />
                ) : (
                  <span className={styles.value}>{maskEmail(currentEmail || "usuario@dominio.com")}</span>
                )}
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Numero:</span>
                {isEditMode ? (
                  <input 
                    type="tel"
                    value={editValues.telefone || ''}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #fb923c',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fef7ed'
                    }}
                  />
                ) : (
                  <span className={styles.value}>{maskPhone(currentPhone || "11000000000")}</span>
                )}
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172A2 2 0 0 0 11.414 16l.814-.814a6.5 6.5 0 1 0-4-4z"/>
                  <circle cx="16.5" cy="7.5" r=".5" fill="#f4a261"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Senha:</span>
                <span className={styles.value}>****************</span>
              </div>
              <button className={styles.editBtn} aria-label="Editar senha">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>
            </div>
          </div>

          {isEditMode && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => setShowSaveModal(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #fb923c, #f97316)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(251, 146, 60, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                Salvar Dados
              </button>
              <button 
                onClick={handleCancelEdit}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
            </div>
          )}

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
            zIndex: 9999
          }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>
              Deseja excluir {childToDelete?.nome}?
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Não
              </button>
              <button 
                onClick={confirmDeleteChild}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
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
            zIndex: 9999
          }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>
              Deseja salvar dados?
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
              As alterações serão salvas permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowSaveModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Não
              </button>
              <button 
                onClick={handleSaveChanges}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#fb923c',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
