"use client";

import React, { useState, useEffect } from 'react';
import { ChildData, SexoOption } from '@/types';
import { childService } from '@/services/childService';
import { utilsService } from '@/services/utilsService';
import "../../app/styles/ConversationsModal.css";

interface ChildRegistrationSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

const ChildRegistrationSideModal: React.FC<ChildRegistrationSideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
}) => {
  const [formData, setFormData] = useState<Partial<ChildData>>({
    nome: '',
    cpf: '',
    data_nascimento: '',
    id_sexo: undefined,
    foto_perfil: '',
    email: '',
    senha: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sexoOptions, setSexoOptions] = useState<SexoOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar opções de sexo
  useEffect(() => {
    const loadSexoOptions = async () => {
      try {
        const options = await childService.getSexoOptions();
        setSexoOptions(options);
      } catch (error) {
        console.error('Erro ao carregar opções de sexo:', error);
      }
    };

    if (isOpen) {
      loadSexoOptions();
    }
  }, [isOpen]);

  // Função para formatar CPF
  const formatCPF = (digits: string) => {
    const s = digits.replace(/\D/g, '').slice(0, 11);
    if (s.length <= 3) return s;
    if (s.length <= 6) return `${s.slice(0,3)}.${s.slice(3)}`;
    if (s.length <= 9) return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6)}`;
    return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-${s.slice(9)}`;
  };

  const handleInputChange = (field: keyof ChildData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validações básicas
      if (!formData.nome || !formData.cpf || !formData.data_nascimento || !formData.id_sexo) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      if (!formData.email) {
        throw new Error('Email é obrigatório');
      }

      if (!formData.senha) {
        throw new Error('Senha é obrigatória');
      }

      if (!utilsService.isPasswordStrong(formData.senha)) {
        throw new Error(utilsService.getPasswordStrengthMessage());
      }

      if (formData.senha !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (!formData.cpf || !utilsService.validateCPF(formData.cpf)) {
        throw new Error('CPF inválido');
      }

      const childData: ChildData = {
        nome: formData.nome,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        id_sexo: formData.id_sexo,
        id_usuario: userId,
        foto_perfil: formData.foto_perfil || '',
        email: formData.email,
        senha: formData.senha
      };

      await childService.registerChild(childData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar criança:', error);
      setError(error instanceof Error ? error.message : 'Erro ao cadastrar criança');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="conversations-modal-overlay">
      <div className="conversations-modal-card">
        {/* Header com título e botão X */}
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
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              <circle cx="18" cy="6" r="3" />
              <path d="M18 9v6" />
              <path d="M15 12h6" />
            </svg>
            <span>Cadastrar Criança</span>
          </h1>
          <button className="conversations-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Conteúdo principal - Formulário */}
        <div className="conversations-main" style={{ padding: '20px', overflowY: 'auto' }}>
          <style jsx>{`
            .form-group {
              position: relative;
              margin-bottom: 24px;
            }
            
            .form-input {
              width: 100%;
              padding: 20px 16px 12px 16px;
              border: 1px solid rgba(244, 162, 97, 0.4);
              border-radius: 8px;
              background: transparent;
              font-size: 16px;
              color: #333;
              transition: all 0.3s ease;
              outline: none;
              box-sizing: border-box;
            }
            
            body.dark .form-input {
              color: #fff;
            }
            
            .form-input:focus {
              border-color: #f4a261;
              background: transparent;
            }
            
            .form-input:focus + .form-label,
            .form-input:not(:placeholder-shown) + .form-label {
              transform: translateY(-24px) scale(0.85);
              color: #f4a261;
              font-weight: 600;
            }
            
            .form-label {
              position: absolute;
              left: 12px;
              top: 16px;
              color: #666;
              font-size: 16px;
              pointer-events: none;
              transition: all 0.3s ease;
              transform-origin: left top;
              background: transparent;
              padding: 0 4px;
              border-radius: 4px;
            }
            
            body.dark .form-label {
              color: #fff;
            }
            
            .form-select {
              width: 100%;
              padding: 20px 16px 12px 16px;
              border: 1px solid rgba(244, 162, 97, 0.4);
              border-radius: 8px;
              background: transparent;
              font-size: 16px;
              color: #333;
              transition: all 0.3s ease;
              outline: none;
              box-sizing: border-box;
              appearance: none;
              background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23f4a261' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
              background-position: right 16px center;
              background-repeat: no-repeat;
              background-size: 16px;
              padding-right: 48px;
            }
            
            body.dark .form-select {
              color: #fff;
            }
            
            .form-select:focus {
              border-color: #f4a261;
              background-color: transparent;
            }
            
            .form-select:focus + .form-label,
            .form-select:not([value=""]) + .form-label {
              transform: translateY(-24px) scale(0.85);
              color: #f4a261;
              font-weight: 600;
            }
            
            .date-input-wrapper {
              position: relative;
            }
            
            .date-input {
              width: 100%;
              padding: 20px 48px 12px 16px;
              border: 1px solid rgba(244, 162, 97, 0.4);
              border-radius: 8px;
              background: transparent;
              font-size: 16px;
              color: #333;
              transition: all 0.3s ease;
              outline: none;
              box-sizing: border-box;
            }
            
            body.dark .date-input {
              color: #fff;
            }
            
            .date-input::-webkit-calendar-picker-indicator {
              opacity: 0;
              position: absolute;
              right: 12px;
              width: 20px;
              height: 20px;
              cursor: pointer;
            }
            
            .date-icon {
              position: absolute;
              right: 16px;
              top: 50%;
              transform: translateY(-50%);
              pointer-events: none;
              color: #f4a261;
              width: 20px;
              height: 20px;
            }
            
            .date-input:focus {
              border-color: #f4a261;
              background: transparent;
            }
            
            .date-input:focus ~ .form-label,
            .date-input:not(:placeholder-shown) ~ .form-label {
              transform: translateY(-24px) scale(0.85);
              color: #f4a261;
              font-weight: 600;
            }
            
            .password-wrapper {
              position: relative;
            }
            
            .password-wrapper .form-input:focus ~ .form-label,
            .password-wrapper .form-input:not(:placeholder-shown) ~ .form-label {
              transform: translateY(-24px) scale(0.85);
              color: #f4a261;
              font-weight: 600;
            }
            
            .password-toggle {
              position: absolute;
              right: 16px;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: none;
              cursor: pointer;
              color: #f4a261;
              font-size: 18px;
              padding: 4px;
              border-radius: 4px;
              transition: background-color 0.2s ease;
            }
            
            .password-toggle:hover {
              background-color: rgba(244, 162, 97, 0.1);
            }
            
            .error-message {
              background: linear-gradient(135deg, rgba(231, 111, 81, 0.1), rgba(231, 111, 81, 0.05));
              border: 1px solid rgba(231, 111, 81, 0.3);
              color: #e76f51;
              padding: 12px 16px;
              border-radius: 12px;
              margin-bottom: 16px;
              font-size: 14px;
              backdrop-filter: blur(10px);
            }
            
            .form-buttons {
              display: flex;
              gap: 12px;
              margin-top: 32px;
              padding-top: 20px;
              border-top: 1px solid rgba(244, 162, 97, 0.2);
            }
            
            .btn-cancel {
              flex: 1;
              padding: 16px 24px;
              border: 1px solid rgba(244, 162, 97, 0.4);
              border-radius: 8px;
              background: transparent;
              color: #666;
              cursor: pointer;
              font-size: 16px;
              font-weight: 600;
              transition: all 0.3s ease;
            }
            
            body.dark .btn-cancel {
              color: #ccc;
            }
            
            .btn-cancel:hover:not(:disabled) {
              border-color: #f4a261;
              background: rgba(244, 162, 97, 0.1);
              color: #f4a261;
            }
            
            .btn-submit {
              flex: 1;
              padding: 16px 24px;
              border: none;
              border-radius: 8px;
              background: linear-gradient(135deg, #f4a261, #e79e21);
              color: white;
              cursor: pointer;
              font-size: 16px;
              font-weight: 600;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(244, 162, 97, 0.3);
            }
            
            .btn-submit:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(244, 162, 97, 0.4);
            }
            
            .btn-submit:disabled {
              opacity: 0.7;
              cursor: not-allowed;
              transform: none;
            }
          `}</style>
          
          <form onSubmit={handleSubmit}>
            {/* Nome */}
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                value={formData.nome || ''}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder=" "
                required
              />
              <label className="form-label">Nome completo</label>
            </div>

            {/* CPF */}
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                value={formatCPF(formData.cpf || '')}
                onChange={(e) => handleInputChange('cpf', e.target.value.replace(/\D/g, ''))}
                placeholder=" "
                required
                maxLength={14}
              />
              <label className="form-label">CPF</label>
            </div>

            {/* Data de Nascimento */}
            <div className="form-group">
              <div className="date-input-wrapper">
                <input
                  type="date"
                  className="date-input"
                  value={formData.data_nascimento || ''}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  placeholder=" "
                  required
                />
                <svg className="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <label className="form-label">Data de nascimento</label>
              </div>
            </div>

            {/* Sexo */}
            <div className="form-group">
              <select
                className="form-select"
                value={formData.id_sexo || ''}
                onChange={(e) => handleInputChange('id_sexo', parseInt(e.target.value))}
                required
              >
                <option value="">Selecione o sexo</option>
                {sexoOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nome}
                  </option>
                ))}
              </select>
              <label className="form-label">Sexo</label>
            </div>

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder=" "
                required
              />
              <label className="form-label">Email</label>
            </div>

            {/* Senha */}
            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={formData.senha || ''}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  placeholder=" "
                  required
                  style={{ paddingRight: '56px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    )}
                  </svg>
                </button>
                <label className="form-label">Senha</label>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  required
                  style={{ paddingRight: '56px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showConfirmPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    )}
                  </svg>
                </button>
                <label className="form-label">Confirmar senha</label>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Botões */}
            <div className="form-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Criança'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChildRegistrationSideModal;
