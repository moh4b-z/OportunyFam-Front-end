'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@services/authService';
import { azureStorageService } from '@services/azureStorageService';
import { institutionService } from '@services/institutionService';
import { maskEmail, maskPhone, getInitials } from '@/utils/formatters';
import { saveAvatarToStorage, loadAvatarFromStorage, generateAvatarStorageKey, fileToBase64 } from '@/utils/avatarUtils';
import styles from '@/app/styles/SimpleAccountModal.module.css';

interface EnderecoData {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  complemento?: string;
}

interface InstituicaoProfileProps {
  id: string;
  onAvatarUpdate?: (url: string) => void;
  onDataUpdate?: (updatedData: { nome?: string; email?: string; telefone?: string; endereco?: string; descricao?: string }) => void;
}

// Função auxiliar fora do componente
const formatarEndereco = (addr?: EnderecoData): string => {
  if (!addr) return '';
  const parts = [
    addr.logradouro,
    addr.numero,
    addr.complemento,
    addr.bairro,
    addr.cidade,
    addr.estado
  ].filter(Boolean);
  return parts.join(', ');
};

const InstituicaoProfile: React.FC<InstituicaoProfileProps> = ({
  id,
  onAvatarUpdate,
  onDataUpdate
}) => {
  const [institutionData, setInstitutionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentName, setCurrentName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPhone, setCurrentPhone] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [currentEndereco, setCurrentEndereco] = useState('');
  const [currentDescricao, setCurrentDescricao] = useState('');
  const [currentCnpj, setCurrentCnpj] = useState('');

  // Carregar dados da instituição
  useEffect(() => {
    const loadInstitutionData = async () => {
      try {
        setIsLoading(true);
        const data = await institutionService.getById(Number(id));
        
        if (data) {
          console.log('DEBUG InstituicaoProfile - Dados carregados:', data);
          setInstitutionData(data);
          setCurrentName(data.nome || '');
          setCurrentEmail(data.email || '');
          setCurrentPhone(data.telefone || '');
          setCurrentEndereco(formatarEndereco(data.endereco));
          setCurrentDescricao(data.descricao || '');
          setCurrentCnpj(data.cnpj || '');
          setCurrentAvatar(data.foto_perfil || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados da instituição:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstitutionData();
  }, [id]);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValues, setEditValues] = useState({ nome: '', email: '', telefone: '', endereco: '', descricao: '' });
  
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    const storedAvatar = loadAvatarFromStorage(generateAvatarStorageKey(id, 'instituicao'));
    if (storedAvatar) {
      setCurrentAvatar(storedAvatar);
    }
  }, [id]);

  const handleEditMode = () => {
    setIsEditMode(true);
    setEditValues({ 
      nome: currentName, 
      email: currentEmail, 
      telefone: currentPhone, 
      endereco: currentEndereco,
      descricao: currentDescricao
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditValues({ nome: '', email: '', telefone: '', endereco: '', descricao: '' });
  };

  const handleInputChange = (field: 'nome' | 'email' | 'telefone' | 'endereco' | 'descricao', value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/instituicoes/${Number(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      if (!response.ok) throw new Error('Falha ao salvar dados');

      setCurrentName(editValues.nome);
      setCurrentEmail(editValues.email);
      setCurrentPhone(editValues.telefone);
      setCurrentEndereco(editValues.endereco);
      setCurrentDescricao(editValues.descricao);
      
      onDataUpdate?.(editValues);
      
      setIsEditMode(false);
      setShowSaveModal(false);
      
      const userData = JSON.parse(localStorage.getItem('user-data') || '{}');
      userData.nome = editValues.nome;
      userData.email = editValues.email;
      userData.telefone = editValues.telefone;
      userData.endereco = editValues.endereco;
      userData.descricao = editValues.descricao;
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
      saveAvatarToStorage(generateAvatarStorageKey(id, 'instituicao'), base64);
      onAvatarUpdate?.(base64);

      try {
        const azureUrl = await azureStorageService.uploadImage(file);
        setCurrentAvatar(azureUrl);
        saveAvatarToStorage(generateAvatarStorageKey(id, 'instituicao'), azureUrl);
        onAvatarUpdate?.(azureUrl);
      } catch (azureError) {
        console.warn('Falha no upload para Azure, mantendo base64:', azureError);
      }
    } catch (error) {
      console.error('Erro ao processar avatar:', error);
      alert('Erro ao fazer upload da foto. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Carregando dados...</div>
      </div>
    );
  }

  if (!institutionData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{ fontSize: '14px', color: '#ef4444' }}>Erro ao carregar dados da instituição.</div>
      </div>
    );
  }

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
        {currentCnpj && (
          <div className={styles.fieldRow}>
            <div className={styles.leftIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div className={styles.fieldContent}>
              <span className={styles.label}>CNPJ:</span>
              <span className={styles.value}>{currentCnpj}</span>
            </div>
          </div>
        )}

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
              <span className={styles.value}>{maskEmail(currentEmail || "instituicao@dominio.com")}</span>
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className={styles.fieldContent}>
            <span className={styles.label}>Endereço:</span>
            {isEditMode ? (
              <input 
                type="text"
                value={editValues.endereco || ''}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
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
              <span className={styles.value}>{currentEndereco || 'Não informado'}</span>
            )}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.leftIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div className={styles.fieldContent}>
            <span className={styles.label}>Descrição:</span>
            {isEditMode ? (
              <textarea 
                value={editValues.descricao || ''}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                rows={3}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #fb923c',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fef7ed',
                  resize: 'vertical',
                  width: '100%'
                }}
              />
            ) : (
              <span className={styles.value}>{currentDescricao || 'Não informado'}</span>
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

      {/* Seção de Publicações - estilo Instagram */}
      {!isEditMode && institutionData?.publicacoes && institutionData.publicacoes.length > 0 && (
        <div className={styles.publicacoesSection}>
          <h3 className={styles.sectionTitle}>Publicações</h3>
          <div className={styles.publicacoesList}>
            {institutionData.publicacoes.map((pub: any) => {
              console.log('DEBUG Publicação:', { id: pub.id, descricao: pub.descricao, imagem: pub.imagem });
              return (
                <div key={pub.id} className={styles.publicacaoCard}>
                  {pub.imagem && (
                    <div className={styles.publicacaoImagemContainer}>
                      <img 
                        src={pub.imagem} 
                        alt="Publicação" 
                        className={styles.publicacaoImagem}
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', pub.imagem);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log('Imagem carregada:', pub.imagem)}
                      />
                    </div>
                  )}
                  <div className={styles.publicacaoContent}>
                    <div className={styles.publicacaoHeader}>
                      <span className={styles.publicacaoData}>
                        {new Date(pub.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className={styles.publicacaoConteudo}>{pub.descricao}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

export default InstituicaoProfile;
