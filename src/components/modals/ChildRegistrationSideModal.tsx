"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChildData, SexoOption } from '@/types';
import { childService } from '@/services/childService';
import { utilsService } from '@/services/utilsService';
import { azureStorageService } from '@/services/azureStorageService';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [sexoOptions, setSexoOptions] = useState<SexoOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
      setIsSuccess(false);
      setError(null);
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await azureStorageService.uploadImage(file);
      handleInputChange('foto_perfil', url);
    } catch (error) {
      console.error('Erro ao enviar foto da criança para o Azure:', error);
      setError('Não foi possível enviar a foto. Tente novamente.');
    }
  };

  const openDatePicker = () => {
    if (!dateInputRef.current) return;

    const input = dateInputRef.current as HTMLInputElement & {
      showPicker?: () => void;
    };

    try {
      if (input.showPicker) {
        input.showPicker();
        return;
      }
    } catch {
      // Ignora falhas do showPicker em navegadores que não suportam
    }

    // Fallback: foco + click para tentar abrir o datepicker nativo
    input.focus();
    try {
      input.click();
    } catch {}
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
      setIsSuccess(true);
      onSuccess();

      // Mantém a modal aberta por um curto período para exibir a mensagem de sucesso
      setTimeout(() => {
        onClose();
      }, 1500);
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
        <div className="conversations-main" style={{ padding: '20px', overflowY: 'auto', position: 'relative' }}>
          <style jsx>{`
            .photo-upload-wrapper {
              display: flex;
              justify-content: center;
              margin-bottom: 24px;
            }

            /* Mesmo visual do bloco de logo/card (card-logo-block), só que maior na modal */
            .photo-upload-circle {
              position: relative;
              width: 124px;
              height: 124px;
              border-radius: 50%;
              background: linear-gradient(135deg, rgba(244, 162, 97, 0.15), rgba(231, 111, 81, 0.1));
              padding: 2px;
              overflow: hidden;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              border: none;
              box-sizing: border-box;
              transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
            }

            .photo-upload-circle:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
            }

            .photo-upload-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .photo-upload-overlay {
              position: absolute;
              inset: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 4px;
              background: radial-gradient(circle at center, rgba(0,0,0,0.45), rgba(0,0,0,0.75));
              opacity: 0;
              transition: opacity 0.2s ease;
              color: #fff;
              text-align: center;
              padding: 8px;
            }

            .photo-upload-circle:hover .photo-upload-overlay {
              opacity: 1;
            }

            .photo-upload-plus {
              font-size: 20px;
              font-weight: 600;
              line-height: 1;
            }

            .photo-upload-text {
              font-size: 12px;
              font-weight: 500;
            }

            :global(body.dark) .photo-upload-circle {
              background: linear-gradient(135deg, rgba(244, 162, 97, 0.18), rgba(231, 111, 81, 0.16));
            }

            :global(body.dark) .photo-upload-circle:hover {
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
            }

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
            
            :global(body.dark) .form-input {
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
              background: var(--bg-card);
            }
            
            :global(body.dark) .form-input:focus + .form-label,
            :global(body.dark) .form-input:not(:placeholder-shown) + .form-label {
              background: var(--bg-card-dark);
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
              padding: 0 8px;
              border-radius: 4px;
            }
            
            :global(body.dark) .form-label {
              color: #fff;
            }
            
            .form-select {
              width: 100%;
              padding: 20px 16px 12px 16px;
              border: 1px solid rgba(244, 162, 97, 0.4);
              border-radius: 8px;
              background-color: var(--bg-card);
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
            
            :global(body.dark) .form-select {
              color: #fff;
              background-color: var(--bg-card-dark);
              border-color: rgba(244, 162, 97, 0.5);
            }
            
            .form-select:focus {
              border-color: #f4a261;
              background-color: var(--bg-card);
            }
            
            .form-select:focus + .form-label,
            .form-select:not([value=""]) + .form-label {
              transform: translateY(-24px) scale(0.85);
              color: #f4a261;
              font-weight: 600;
              background: var(--bg-card);
            }
            
            :global(body.dark) .form-select:focus + .form-label,
            :global(body.dark) .form-select:not([value=""]) + .form-label {
              background: var(--bg-card-dark);
            }
            
            /* Ajuste visual do fundo das opções do select */
            :global(.form-select option) {
              background-color: var(--bg-card);
              color: var(--text-dark);
            }
            
            :global(body.dark) .form-select option {
              background-color: var(--bg-card-dark);
              color: var(--text-dark-theme);
            }
            
            .date-input-wrapper {
              position: relative;
            }
            
            .date-input {
              width: 100%;
              padding: 20px 48px 12px 16px;
              border: 1px solid rgba(244, 162, 97, 0.4);
              border-radius: 8px;
              background-color: var(--bg-card);
              font-size: 16px;
              color: #333;
              transition: all 0.3s ease;
              outline: none;
              box-sizing: border-box;
              -webkit-appearance: none;
              -moz-appearance: textfield;
              appearance: none;
            }
            
            :global(body.dark) .date-input {
              color: #fff;
              background-color: var(--bg-card-dark);
              border-color: rgba(244, 162, 97, 0.5);
              color-scheme: dark;
            }
            
            :global(.date-input::-webkit-calendar-picker-indicator),
            :global(input[type="date"]::-webkit-calendar-picker-indicator) {
              opacity: 0 !important;
              display: none !important;
              -webkit-appearance: none;
              background: transparent;
              color: transparent;
              width: 0;
              height: 0;
              margin: 0;
              padding: 0;
            }

            /* Firefox - esconder ícone nativo do datepicker */
            :global(input[type="date"]::-moz-calendar-picker-indicator) {
              opacity: 0 !important;
              display: none !important;
              -moz-appearance: none;
              background: transparent;
              color: transparent;
              width: 0;
              height: 0;
              margin: 0;
              padding: 0;
            }
            
            .date-icon {
              position: absolute;
              right: 16px;
              top: 50%;
              transform: translateY(-50%);
              pointer-events: auto;
              color: #f4a261;
              width: 20px;
              height: 20px;
              cursor: pointer;
              z-index: 2;
            }
            
            .date-input:focus {
              border-color: #f4a261;
              background-color: var(--bg-card);
            }

            :global(body.dark) .date-input:focus {
              background-color: var(--bg-card-dark);
            }
            
            .date-input:focus ~ .form-label,
            .date-input:not(:placeholder-shown) ~ .form-label {
              transform: translateY(-24px) scale(0.85);
              color: #f4a261;
              font-weight: 600;
              background: var(--bg-card);
            }
            
            :global(body.dark) .date-input:focus ~ .form-label,
            :global(body.dark) .date-input:not(:placeholder-shown) ~ .form-label {
              background: var(--bg-card-dark);
            }
            
            .password-wrapper {
              position: relative;
            }
            
            .password-wrapper .form-input:focus ~ .form-label,
            .password-wrapper .form-input:not(:placeholder-shown) ~ .form-label {
              transform: translateY(-24px) scale(0.85);
              color: #f4a261;
              font-weight: 600;
              background: var(--bg-card);
            }
            
            :global(body.dark) .password-wrapper .form-input:focus ~ .form-label,
            :global(body.dark) .password-wrapper .form-input:not(:placeholder-shown) ~ .form-label {
              background: var(--bg-card-dark);
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
              transition: transform 0.15s ease-out;
            }
            
            .password-toggle:hover {
              transform: translateY(-50%) scale(1.08);
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
            
            :global(body.dark) .btn-cancel {
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

            .child-success-overlay {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.35);
              z-index: 50;
            }

            .child-success-card {
              background: var(--bg-card);
              border-radius: 12px;
              padding: 24px 24px 20px 24px;
              max-width: 380px;
              width: 100%;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
            }

            :global(body.dark) .child-success-card {
              background: var(--bg-card-dark);
              color: var(--text-dark-theme);
              box-shadow: 0 10px 25px var(--shadow-dark);
            }

            .child-success-icon {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: #10B981;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 30px;
              margin: 0 auto 18px auto;
            }

            .child-success-title {
              font-size: 22px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #1F2937;
            }

            .child-success-message {
              font-size: 15px;
              color: #6B7280;
              margin-bottom: 4px;
            }

            :global(body.dark) .child-success-title {
              color: var(--text-dark-theme);
            }

            :global(body.dark) .child-success-message {
              color: var(--text-secondary-dark);
            }
          `}</style>

          {isSuccess && (
            <div className="child-success-overlay">
              <div className="child-success-card">
                <div className="child-success-icon">✓</div>
                <h2 className="child-success-title">Tudo certo!</h2>
                <p className="child-success-message">Criança cadastrada com sucesso.</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="photo-upload-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                className="photo-upload-circle"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.foto_perfil ? (
                  <img
                    src={formData.foto_perfil}
                    alt="Foto da criança"
                    className="photo-upload-image"
                  />
                ) : (
                  <div className="default-institution-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Cabeça da criança */}
                      <circle cx="12" cy="7.5" r="3.2" />
                      {/* Corpo/roupa */}
                      <path d="M7 19.5c0-2.2 2.2-4 5-4s5 1.8 5 4" />
                      {/* Braços levemente abertos */}
                      <path d="M8.2 12.5 6 14.5" />
                      <path d="M15.8 12.5 18 14.5" />
                    </svg>
                  </div>
                )}
                <div className="photo-upload-overlay">
                  <span className="photo-upload-plus">+</span>
                  <span className="photo-upload-text">Adicionar foto</span>
                </div>
              </button>
            </div>

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
            <div className="form-group date-input-wrapper">
              <input
                type="date"
                ref={dateInputRef}
                className="date-input"
                value={formData.data_nascimento || ''}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                placeholder=" "
                required
              />
              <svg
                className="date-icon"
                viewBox="0 0 24 24"
                onClick={openDatePicker}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" fill="none"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor"/>
                <rect x="9" y="14" width="6" height="4" rx="1" ry="1" fill="currentColor"/>
              </svg>
              <label className="form-label">Data de nascimento</label>
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
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
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
                  title={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showConfirmPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
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
