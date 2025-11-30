'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@services/authService';
import { azureStorageService } from '@services/azureStorageService';
import { childService } from '@services/childService';
import { maskEmail, maskPhone, getInitials } from '@/utils/formatters';
import { saveAvatarToStorage, loadAvatarFromStorage, generateAvatarStorageKey, fileToBase64 } from '@/utils/avatarUtils';
import styles from '@/app/styles/SimpleAccountModal.module.css';

interface CriancaProfileProps {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  foto_perfil?: string;
  data_nascimento?: string;
  cpf?: string;
  onAvatarUpdate?: (url: string) => void;
  onDataUpdate?: (updatedData: { nome?: string; email?: string; telefone?: string }) => void;
}

const CriancaProfile: React.FC<CriancaProfileProps> = ({
  id,
  nome,
  email,
  telefone,
  foto_perfil,
  data_nascimento,
  cpf,
  onAvatarUpdate,
  onDataUpdate
}) => {
  const [currentName, setCurrentName] = useState(nome);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentPhone, setCurrentPhone] = useState(telefone);
  const [currentAvatar, setCurrentAvatar] = useState(foto_perfil || '');
  const [institutions, setInstitutions] = useState<any[]>([]);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValues, setEditValues] = useState({ nome: '', email: '', telefone: '' });
  
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    const storedAvatar = loadAvatarFromStorage(generateAvatarStorageKey(id, 'crianca'));
    if (storedAvatar) {
      setCurrentAvatar(storedAvatar);
    }
    loadChildData();
  }, [id]);

  const loadChildData = async () => {
    try {
      const childData = await childService.getUserById(Number(id));
      if (childData?.atividades_matriculadas) {
        setInstitutions(childData.atividades_matriculadas);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da criança:', error);
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setEditValues({ nome: currentName, email: currentEmail, telefone: currentPhone });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditValues({ nome: '', email: '', telefone: '' });
  };

  const handleInputChange = (field: 'nome' | 'email' | 'telefone', value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/criancas/${Number(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      if (!response.ok) throw new Error('Falha ao salvar dados');

      setCurrentName(editValues.nome);
      setCurrentEmail(editValues.email);
      setCurrentPhone(editValues.telefone);
      
      onDataUpdate?.(editValues);
      
      setIsEditMode(false);
      setShowSaveModal(false);
      
      const userData = JSON.parse(localStorage.getItem('user-data') || '{}');
      userData.nome = editValues.nome;
      userData.email = editValues.email;
      userData.telefone = editValues.telefone;
      localStorage.setItem('user-data', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      alert('Erro ao salvar alterações. Tente novamente.');
    }
  };

  const onAvatarSelected = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setCurrentAvatar(base64);
      saveAvatarToStorage(generateAvatarStorageKey(id, 'crianca'), base64);
      onAvatarUpdate?.(base64);

      try {
        const azureUrl = await azureStorageService.uploadImage(file);
        setCurrentAvatar(azureUrl);
        saveAvatarToStorage(generateAvatarStorageKey(id, 'crianca'), azureUrl);
        onAvatarUpdate?.(azureUrl);
      } catch (azureError) {
        console.warn('Falha no upload para Azure, mantendo base64:', azureError);
      }
    } catch (error) {
      console.error('Erro ao processar avatar:', error);
      alert('Erro ao fazer upload da foto. Tente novamente.');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Não informado';
    }
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <>
      <div className={styles.profileHeader}>
        <div className={styles.profileBlock}>
          <label className={styles.profileAvatar}>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => e.target.files?.[0] && onAvatarSelected(e.target.files[0])}
            />
            {currentAvatar ? (
              <img src={currentAvatar} alt={currentName} />
            ) : (
              <div style={{ fontSize: '48px', fontWeight: '700', color: 'white' }}>{getInitials(currentName)}</div>
            )}
            <div className={styles.editBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
              </svg>
            </div>
          </label>
        </div>

        <div className={styles.userInfo}>
          {isEditMode ? (
            <input 
              type="text"
              value={editValues.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '2px solid #fb923c',
                borderRadius: '6px',
                fontSize: '20px',
                fontWeight: '600',
                outline: 'none',
                background: '#fef7ed'
              }}
            />
          ) : (
            <h3 className={styles.userName}>{currentName}</h3>
          )}
          <button 
            onClick={handleEditMode}
            disabled={isEditMode}
            style={{
              padding: '8px 16px',
              background: isEditMode ? '#d1d5db' : '#fb923c',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '500',
              cursor: isEditMode ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(251,146,60,0.2)'
            }}
            onMouseOver={(e) => {
              if (!isEditMode) {
                e.currentTarget.style.background = '#f97316';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(251,146,60,0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!isEditMode) {
                e.currentTarget.style.background = '#fb923c';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(251,146,60,0.2)';
              }
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className={styles.fieldContent}>
            <span className={styles.label}>Data de Nascimento:</span>
            <span className={styles.value}>{formatDate(data_nascimento)}</span>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.leftIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div className={styles.fieldContent}>
            <span className={styles.label}>CPF:</span>
            <span className={styles.value}>{formatCPF(cpf)}</span>
          </div>
        </div>

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
              <span className={styles.value}>{maskEmail(currentEmail || "crianca@dominio.com")}</span>
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

      {institutions.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <span>Instituições Matriculadas:</span>
          </div>
          <div className={styles.childrenList}>
            {institutions.map((inst: any, idx: number) => (
              <div key={inst.instituicao_id || inst.id || `inst-${idx}`} className={styles.institutionItem} style={{ padding: '12px', marginBottom: '8px' }}>
                <img className={styles.institutionIcon} alt="instituicao" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvb2stbWFya2VkLWljb24gbHVjaWRlLWJvb2stbWFya2VkIj48cGF0aCBkPSJNMTAgMnY4bDMtMyAzIDNWMiIvPjxwYXRoIGQ9Ik00IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJIMTlhMSAxIDAgMCAxIDEgMXYxOGExIDEgMCAwIDEtMSAxSDYuNWExIDEgMCAwIDEgMC01SDIwIi8+PC9zdmc+" />
                <div className={styles.institutionName}>{inst.instituicao_nome || 'Instituição'}</div>
              </div>
            ))}
          </div>
        </>
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
    </>
  );
};

export default CriancaProfile;
