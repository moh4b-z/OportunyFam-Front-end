"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../app/styles/SimpleAccountModal.module.css";
import AddChildModal from "./AddChildModal";

interface Child {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  data_nascimento: string;
  id_sexo: number;
  id_usuario: number;
  atividades_matriculadas?: {
    titulo: string;
    categoria: string;
    instituicao: string;
    atividade_id: number;
  }[];
}

interface Institution {
  id: number;
  nome: string;
  endereco?: string;
}

interface SimpleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    nome: string;
    email: string;
    telefone?: string | null;
    foto_perfil?: string | null;
    id?: number;
    cep?: string | null;
    cpf?: string | null;
    data_nascimento?: string | null;
  };
  childrenNames?: string[];
  onUserUpdate?: (updatedUser: any) => void;
}

const SimpleAccountModal: React.FC<SimpleAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  childrenNames,
  onUserUpdate,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storageKey = useMemo(
    () => `account_avatar_${(user.nome || "usuario").toLowerCase()}`,
    [user.nome]
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: user.email || '',
    telefone: user.telefone || '',
    senha: '',
    cep: user.cep || '',
    cpf: user.cpf || '',
    data_nascimento: user.data_nascimento || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAllData, setShowAllData] = useState(false);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      try { localStorage.setItem(storageKey, dataUrl); } catch {}
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) setAvatarUrl(saved);
      } catch {}
      
      setEditData({
        email: user.email || '',
        telefone: user.telefone || '',
        senha: '',
        cep: user.cep || '',
        cpf: user.cpf || '',
        data_nascimento: user.data_nascimento || ''
      });
      
      // Carregar filhos do usuário
      loadChildren();
    }
  }, [isOpen, storageKey, user.email, user.telefone, user.cep, user.cpf, user.data_nascimento]);

  const loadChildren = async () => {
    const userId = user.id || 1;
    setLoadingChildren(true);
    
    try {
      const response = await fetch(`https://oportunyfam-back-end.onrender.com/v1/oportunyfam/criancas?id_usuario=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.criancas && Array.isArray(data.criancas)) {
          setChildren(data.criancas);
        } else {
          setChildren([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar filhos:', error);
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleChildAdded = () => {
    setTimeout(() => {
      loadChildren();
    }, 1000);
    setIsAddChildModalOpen(false);
  };

  const handleAlterarDados = () => {
    setIsEditing(true);
  };

  const handleSalvarDados = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        nome: user.nome,
        email: editData.email,
        telefone: editData.telefone,
        cep: editData.cep,
        cpf: editData.cpf,
        data_nascimento: editData.data_nascimento
      };
      
      if (editData.senha) {
        updateData.senha = editData.senha;
      }
      
      const response = await fetch(`https://oportunyfam-back-end.onrender.com/v1/oportunyfam/usuarios/${user.id || 1}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const updatedUser = {
          ...user,
          email: editData.email,
          telefone: editData.telefone,
          cep: editData.cep,
          cpf: editData.cpf,
          data_nascimento: editData.data_nascimento
        };
        onUserUpdate?.(updatedUser);
        setIsEditing(false);
        setEditData({...editData, senha: ''});
        alert('Dados salvos com sucesso!');
      } else {
        const errorData = await response.text();
        try {
          const errorJson = JSON.parse(errorData);
          alert(errorJson.messagem || 'Erro ao salvar dados');
        } catch {
          alert('Erro ao salvar dados: ' + response.status);
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 style={{color: 'var(--text-dark)'}}>Olá {user.nome.split(' ')[0]}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.profileBlock}>
            <div className={styles.profileAvatar}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" />
              ) : (
                <span>{(user.nome || "U").charAt(0).toUpperCase()}</span>
              )}
              <button className={styles.editBadge} aria-label="Editar foto" onClick={onPickAvatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={onAvatarSelected}
                style={{ display: "none" }}
              />
            </div>
            
            <div className={styles.photoButtons}>
              <button className={styles.photoButton} onClick={onPickAvatar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
                Adicionar Foto
              </button>
              
              {avatarUrl && (
                <button className={`${styles.photoButton} ${styles.removeButton}`} onClick={() => { setAvatarUrl(null); localStorage.removeItem(storageKey); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Excluir Foto
                </button>
              )}
              
              <button 
                className={styles.showDataBadge} 
                aria-label="Mostrar dados" 
                onClick={() => {
                  setShowAllData(true);
                  setTimeout(() => setShowAllData(false), 500);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Mostrar Dados
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
              {isEditing ? (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>Email:</span>
                  <input 
                    type="email" 
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className={styles.editInput}
                  />
                </div>
              ) : (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>{showAllData ? user.email : maskEmail(user.email)}</span>
                </div>
              )}

            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              {isEditing ? (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>Numero:</span>
                  <input 
                    type="tel" 
                    value={editData.telefone}
                    onChange={(e) => setEditData({...editData, telefone: e.target.value})}
                    className={styles.editInput}
                  />
                </div>
              ) : (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>Numero:</span>
                  <span className={styles.value}>{user.telefone || "Não informado"}</span>
                </div>
              )}

            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172A2 2 0 0 0 11.414 16l.814-.814a6.5 6.5 0 1 0-4-4z"/>
                  <circle cx="16.5" cy="7.5" r=".5" fill="#f4a261"/>
                </svg>
              </div>
              {isEditing ? (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>Senha:</span>
                  <div className={styles.passwordContainer}>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={editData.senha}
                      onChange={(e) => setEditData({...editData, senha: e.target.value})}
                      placeholder="Nova senha (opcional)"
                      className={styles.editInput}
                    />
                    <button 
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>Senha:</span>
                  <span className={styles.value}>****************</span>
                </div>
              )}

            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              {isEditing ? (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>CEP:</span>
                  <input 
                    type="text" 
                    value={editData.cep}
                    onChange={(e) => setEditData({...editData, cep: e.target.value})}
                    className={styles.editInput}
                    placeholder="00000-000"
                  />
                </div>
              ) : (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>CEP:</span>
                  <span className={styles.value}>{user.cep || "Não informado"}</span>
                </div>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              {isEditing ? (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>CPF:</span>
                  <input 
                    type="text" 
                    value={editData.cpf}
                    onChange={(e) => setEditData({...editData, cpf: e.target.value})}
                    className={styles.editInput}
                    placeholder="000.000.000-00"
                  />
                </div>
              ) : (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>CPF:</span>
                  <span className={styles.value}>{showAllData ? (user.cpf || "Não informado") : maskCPF(user.cpf)}</span>
                </div>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              {isEditing ? (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>Nascimento:</span>
                  <input 
                    type="date" 
                    value={editData.data_nascimento}
                    onChange={(e) => setEditData({...editData, data_nascimento: e.target.value})}
                    className={styles.editInput}
                  />
                </div>
              ) : (
                <div className={styles.fieldContent}>
                  <span className={styles.label}>Nascimento:</span>
                  <span className={styles.value}>{formatDate(user.data_nascimento)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.actionButtons}>
            {!isEditing ? (
              <button className={styles.actionButton} onClick={handleAlterarDados}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
                Alterar Dados
              </button>
            ) : (
              <>
                <button 
                  className={styles.actionButton} 
                  onClick={() => setIsEditing(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Cancelar
                </button>
                
                <button 
                  className={`${styles.actionButton} ${styles.saveButton}`} 
                  onClick={handleSalvarDados}
                  disabled={isSaving}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  {isSaving ? 'Salvando...' : 'Salvar Dados'}
                </button>
              </>
            )}
          </div>

          <div className={styles.sectionHeader}>
            <span>Filhos:</span>
            <div style={{display: 'flex', gap: '8px'}}>
              <button 
                className={styles.addBtn} 
                aria-label="Recarregar filhos"
                onClick={loadChildren}
                disabled={loadingChildren}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </svg>
              </button>
              <button 
                className={styles.addBtn} 
                aria-label="Adicionar filho"
                onClick={() => setIsAddChildModalOpen(true)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="16" y1="11" x2="22" y2="11"/>
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.childrenList}>
            {loadingChildren ? (
              <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                Carregando filhos...
              </div>
            ) : children.length > 0 ? (
              children.map((child, idx) => {
                const isOpenItem = expandedIndex === idx;
                return (
                  <div className={styles.childCard} key={child.id}>
                    <div className={styles.leftAccent} />
                    <div className={styles.childAvatar}>
                      <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt=""/>
                      <span className={styles.statusDot} />
                    </div>
                    <div className={styles.childName}>{child.nome}</div>
                    <button className={styles.caret} onClick={() => setExpandedIndex(isOpenItem ? null : idx)} aria-label={isOpenItem ? "Recolher" : "Expandir"}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isOpenItem ? (
                          <polyline points="8 15 12 11 16 15"/>
                        ) : (
                          <polyline points="8 9 12 13 16 9"/>
                        )}
                      </svg>
                    </button>

                    {isOpenItem && (
                      <ChildDetails child={child} />
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                Nenhum filho cadastrado ainda.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        userId={user.id || 1}
        onChildAdded={handleChildAdded}
      />
    </div>
  );
};

// Componente para mostrar detalhes do filho
const ChildDetails: React.FC<{ child: Child }> = ({ child }) => {
  // Extrair instituições únicas das atividades matriculadas
  const institutions = child.atividades_matriculadas ? 
    Array.from(new Set(child.atividades_matriculadas.map(ativ => ativ.instituicao)))
      .map((nome, index) => ({ id: index, nome }))
    : [];

  return (
    <div className={styles.childExpanded}>
      <div className={styles.expandedHeader}>Instituições que faz parte:</div>
      {institutions.length > 0 ? (
        institutions.map((institution) => (
          <div key={institution.id} className={styles.institutionItem}>
            <img className={styles.institutionIcon} alt="instituicoes" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvb2stbWFya2VkLWljb24gbHVjaWRlLWJvb2stbWFya2VkIj48cGF0aCBkPSJNMTAgMnY4bDMtMyAzIDNWMiIvPjxwYXRoIGQ9Ik00IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJIMTlhMSAxIDAgMCAxIDEgMXYxOGExIDEgMCAwIDEtMSAxSDYuNWExIDEgMCAwIDEgMC01SDIwIi8+PC9zdmc+" />
            <div className={styles.institutionName}>{institution.nome}</div>
          </div>
        ))
      ) : (
        <div style={{textAlign: 'center', padding: '10px', color: '#666', fontSize: '14px'}}>
          Nenhuma instituição cadastrada
        </div>
      )}

      <div className={styles.childActions}>
        <img className={styles.actionIcon} alt="remover-associacao" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIteC1pY29uIGx1Y2lkZS11c2VyLXgiPjxwYXRoIGQ9Ik0xNiAyMXYtMmE0IDQgMCAwIDAtNC00SDZhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjciIHI9IjQiLz48bGluZSB4MT0iMTciIHgyPSIyMiIgeTE9IjgiIHkyPSIxMyIvPjxsaW5lIHgxPSIyMiIgeDI9IjE3IiB5MT0iOCIgeTI9IjEzIi8+PC9zdmc+" />
        <img className={styles.actionIcon} alt="config-associacao" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItY29nLWljb24gbHVjaWRlLXVzZXItY29nIj48cGF0aCBkPSJNMTAgMTVINmE0IDQgMCAwIDAtNCA0djIiLz48cGF0aCBkPSJtMTQuMzA1IDE2LjUzLjkyMy0uMzgyIi8+PHBhdGggZD0ibTE1LjIyOCAxMy44NTItLjkyMy0uMzgzIi8+PHBhdGggZD0ibTE2Ljg1MiAxMi4yMjgtLjM4My0uOTIzIi8+PHBhdGggZD0ibTE2Ljg1MiAxNy43NzItLjM4My45MjQiLz48cGF0aCBkPSJtMTkuMTQ4IDEyLjIyOC4zODMtLjkyMyIvPjxwYXRoIGQ9Im0xOS41MyAxOC42OTYtLjM4Mi0uOTI0Ii8+PHBhdGggZD0ibTIwLjc3MiAxMy44NTIuOTI0LS4zODMiLz48cGF0aCBkPSJtMjAuNzcyIDE2LjE0OC45MjQuMzgzIi8+PGNpcmNsZSBjeD0iMTgiIGN5PSIxNSIgcj0iMyIvPjxjaXJjbGUgY3g9IjkiIGN5PSI3IiByPSI0Ii8+PC9zdmc+" />
      </div>
    </div>
  );
};

export default SimpleAccountModal;

function maskEmail(e: string) {
  if (!e) return "u****************@dominio.com";
  const [user, domain] = e.split("@");
  if (!user || !domain) return e;
  return `${user[0]}****************@${domain}`;
}

function maskPhone(p: string) {
  return p || "";
}

function maskCPF(cpf: string | null | undefined) {
  if (!cpf) return "Não informado";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "***.***.***-**");
}

function formatDate(date: string | null | undefined) {
  if (!date) return "Não informado";
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}
