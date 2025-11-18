'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Input from '../Input'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'success'>('email')
  const [errorMessage, setErrorMessage] = useState<string | false>(false)

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

  const handleSubmit = async () => {
    if (!email.trim()) {
      setErrorMessage('Por favor, insira seu email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor, insira um email válido')
      return
    }

    setIsLoading(true)
    setErrorMessage(false)

    try {
      // Simula chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000))
      setStep('success')
    } catch (error) {
      setErrorMessage('Erro ao enviar email. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setStep('email')
    setErrorMessage(false)
    setIsLoading(false)
    onClose()
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && step === 'email' && !isLoading) {
      event.preventDefault()
      handleSubmit()
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

        {step === 'email' ? (
          <>
            <div className="forgot-password-header">
              <div className="forgot-password-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z"/>
                </svg>
              </div>
              <h1>Esqueceu sua senha?</h1>
              <p>Não se preocupe! Digite seu email abaixo e enviaremos instruções para redefinir sua senha.</p>
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
                  onClick={handleSubmit}
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <div className="forgot-password-spinner"></div>
                  ) : (
                    'Enviar instruções'
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="forgot-password-success">
              <div className="forgot-password-success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h1>Email enviado!</h1>
              <p>
                Enviamos as instruções para redefinir sua senha para <strong>{email}</strong>
              </p>
              <div className="forgot-password-instructions">
                <h3>Próximos passos:</h3>
                <ol>
                  <li>Verifique sua caixa de entrada</li>
                  <li>Clique no link do email</li>
                  <li>Crie uma nova senha</li>
                  <li>Faça login com sua nova senha</li>
                </ol>
                <p className="forgot-password-note">
                  <strong>Não recebeu o email?</strong> Verifique sua pasta de spam ou lixo eletrônico.
                </p>
              </div>
              <button className="forgot-password-done" onClick={handleClose}>
                Entendi
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}