'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Input from '../Input'
import { authService } from '@/services/authService'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email')
  const [errorMessage, setErrorMessage] = useState<string | false>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setErrorMessage('Por favor, insira seu email')
      return
    }

    setIsLoading(true)
    setErrorMessage(false)

    try {
      await authService.requestPasswordReset({ email })
      setStep('code')
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao enviar código. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async () => {
    if (!code.trim()) {
      setErrorMessage('Por favor, insira o código')
      return
    }

    if (code.length !== 6) {
      setErrorMessage('O código deve ter 6 dígitos')
      return
    }

    setIsLoading(true)
    setErrorMessage(false)

    try {
      await authService.verifyResetCode({ email, codigo: code })
      setStep('password')
    } catch (error: any) {
      setErrorMessage(error.message || 'Código inválido. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (!newPassword.trim()) {
      setErrorMessage('Por favor, insira a nova senha')
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem')
      return
    }

    setIsLoading(true)
    setErrorMessage(false)

    try {
      await authService.resetPassword({ 
        email, 
        codigo: code, 
        novaSenha: newPassword 
      })
      setStep('success')
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao redefinir senha. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    setErrorMessage(false)

    try {
      await authService.requestPasswordReset({ email })
      setErrorMessage('Novo código enviado!')
      setTimeout(() => setErrorMessage(false), 3000)
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao reenviar código.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setCode('')
    setNewPassword('')
    setConfirmPassword('')
    setStep('email')
    setErrorMessage(false)
    setIsLoading(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault()
      if (step === 'email') handleEmailSubmit()
      else if (step === 'code') handleCodeSubmit()
      else if (step === 'password') handlePasswordSubmit()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="forgot-password-overlay" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <button className="forgot-password-close" onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {step === 'email' && (
          <>
            <div className="forgot-password-header">
              <div className="forgot-password-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z"/>
                </svg>
              </div>
              <h1>Esqueceu sua senha?</h1>
              <p>Digite seu email e enviaremos um código de verificação para redefinir sua senha.</p>
            </div>

            <div className="forgot-password-form">
              <Input
                srcImage="/icons-email.svg"
                inputName="Email"
                placeholder="Digite seu email"
                type="email"
                name="forgot_email"
                mask="email"
                value={email}
                onChange={setEmail}
                onKeyPress={handleKeyPress}
                className={errorMessage ? 'input_error' : ''}
              />

              {errorMessage && (
                <div className="forgot-password-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {errorMessage}
                </div>
              )}

              <div className="forgot-password-actions">
                <button 
                  className="forgot-password-cancel" 
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button 
                  className="forgot-password-submit" 
                  onClick={handleEmailSubmit}
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <div className="forgot-password-spinner"></div>
                  ) : (
                    'Enviar código'
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'code' && (
          <>
            <div className="forgot-password-header">
              <div className="forgot-password-icon code-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
                  <polyline points="3,5 12,13 21,5"/>
                </svg>
              </div>
              <h1>Verifique seu email</h1>
              <p>Enviamos um código de 6 dígitos para <strong>{email}</strong></p>
            </div>

            <div className="forgot-password-form">
              <div className="code-input-container">
                <Input
                  srcImage="/icons-lock.svg"
                  inputName="Código de verificação"
                  placeholder="Digite o código de 6 dígitos"
                  type="text"
                  name="verification_code"
                  value={code}
                  onChange={setCode}
                  onKeyPress={handleKeyPress}
                  className={errorMessage ? 'input_error' : ''}
                  maxLength={6}
                />
              </div>

              {errorMessage && (
                <div className={`forgot-password-error ${errorMessage === 'Novo código enviado!' ? 'success' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {errorMessage === 'Novo código enviado!' ? (
                      <>
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9 12l2 2 4-4"/>
                      </>
                    ) : (
                      <>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </>
                    )}
                  </svg>
                  {errorMessage}
                </div>
              )}

              <div className="resend-code">
                <p>Não recebeu o código?</p>
                <button 
                  type="button" 
                  className="resend-button" 
                  onClick={handleResendCode}
                  disabled={isLoading}
                >
                  Reenviar código
                </button>
              </div>

              <div className="forgot-password-actions">
                <button 
                  className="forgot-password-cancel" 
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                >
                  Voltar
                </button>
                <button 
                  className="forgot-password-submit" 
                  onClick={handleCodeSubmit}
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? (
                    <div className="forgot-password-spinner"></div>
                  ) : (
                    'Verificar código'
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'password' && (
          <>
            <div className="forgot-password-header">
              <div className="forgot-password-icon password-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h1>Nova senha</h1>
              <p>Crie uma nova senha segura para sua conta</p>
            </div>

            <div className="forgot-password-form">
              <div className="password-input">
                <Input
                  srcImage="/icons-lock.svg"
                  inputName="Nova senha"
                  placeholder="Digite sua nova senha"
                  type={showPassword ? 'text' : 'password'}
                  name="new_password"
                  value={newPassword}
                  onChange={setNewPassword}
                  onKeyPress={handleKeyPress}
                  className={errorMessage ? 'input_error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img 
                    src={showPassword ? '/icons-eye-off.svg' : '/icons-eye-on.svg'} 
                    alt={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  />
                </button>
              </div>

              <div className="password-input">
                <Input
                  srcImage="/icons-lock.svg"
                  inputName="Confirmar senha"
                  placeholder="Confirme sua nova senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  onKeyPress={handleKeyPress}
                  className={errorMessage ? 'input_error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <img 
                    src={showConfirmPassword ? '/icons-eye-off.svg' : '/icons-eye-on.svg'} 
                    alt={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  />
                </button>
              </div>

              {errorMessage && (
                <div className="forgot-password-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {errorMessage}
                </div>
              )}

              <div className="password-requirements">
                <p>Sua senha deve ter:</p>
                <ul>
                  <li className={newPassword.length >= 6 ? 'valid' : ''}>
                    Pelo menos 6 caracteres
                  </li>
                  <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'valid' : ''}>
                    Confirmação de senha igual
                  </li>
                </ul>
              </div>

              <div className="forgot-password-actions">
                <button 
                  className="forgot-password-cancel" 
                  onClick={() => setStep('code')}
                  disabled={isLoading}
                >
                  Voltar
                </button>
                <button 
                  className="forgot-password-submit" 
                  onClick={handlePasswordSubmit}
                  disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                >
                  {isLoading ? (
                    <div className="forgot-password-spinner"></div>
                  ) : (
                    'Redefinir senha'
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="forgot-password-success">
              <div className="forgot-password-success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h1>Senha redefinida!</h1>
              <p>
                Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
              </p>
              <div className="forgot-password-instructions">
                <div className="success-message">
                  <h3>🎉 Tudo pronto!</h3>
                  <p>Sua conta está segura e você já pode acessar o <strong>OportunyFam</strong> normalmente.</p>
                </div>
              </div>
              <button className="forgot-password-done" onClick={handleClose}>
                Fazer login
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}