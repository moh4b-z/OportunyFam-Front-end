'use client'

import React, { useState, useEffect } from 'react'
import { ChildData, SexoOption } from '@/types'
import { childService } from '@/services/childService'
import { utilsService } from '@/services/utilsService'
import styles from '@/app/styles/GeneralModal.css'

// Hook para detectar tema atual
const useTheme = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.body.classList.contains('dark'))
    }

    // Verifica tema inicial
    checkTheme()

    // Observer para mudanças no tema
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}

interface ChildRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: number
}

export default function ChildRegistrationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userId 
}: ChildRegistrationModalProps) {
  const isDark = useTheme()
  
  const [formData, setFormData] = useState<Partial<ChildData>>({
    nome: '',
    cpf: '', // armazenar apenas dígitos
    data_nascimento: '',
    id_sexo: 0,
    id_usuario: userId,
    foto_perfil: '',
    email: '',
    senha: ''
  })
  
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [sexoOptions, setSexoOptions] = useState<SexoOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carrega opções de sexo
  useEffect(() => {
    if (isOpen) {
      loadSexoOptions()
    }
  }, [isOpen])

  const loadSexoOptions = async () => {
    try {
      const options = await childService.getSexoOptions()
      setSexoOptions(options)
    } catch (error) {
      console.error('❌ Erro ao carregar opções de sexo:', error)
      // Fallback com opções padrão
      setSexoOptions([
        { id: 1, nome: 'Masculino' },
        { id: 2, nome: 'Feminino' }
      ])
    }
  }

  const formatCPF = (digits: string) => {
    const s = digits.replace(/\D/g, '').slice(0, 11)
    if (s.length <= 3) return s
    if (s.length <= 6) return `${s.slice(0,3)}.${s.slice(3)}`
    if (s.length <= 9) return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6)}`
    return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-${s.slice(9,11)}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'cpf') {
      const digits = value.replace(/\D/g, '').slice(0, 11)
      setFormData(prev => ({ ...prev, cpf: digits }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'id_sexo' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validações básicas
      if (!formData.nome || !formData.cpf || !formData.data_nascimento || !formData.id_sexo) {
        throw new Error('Por favor, preencha todos os campos obrigatórios')
      }

      if (!formData.email) {
        throw new Error('Email é obrigatório')
      }

      if (!formData.senha) {
        throw new Error('Senha é obrigatória')
      }

      if (!utilsService.isPasswordStrong(formData.senha)) {
        throw new Error(utilsService.getPasswordStrengthMessage())
      }

      if (formData.senha !== confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      if (!formData.cpf || !utilsService.validateCPF(formData.cpf)) {
        throw new Error('CPF inválido')
      }

      const childData: ChildData = {
        nome: formData.nome,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        id_sexo: formData.id_sexo,
        id_usuario: userId,
        foto_perfil: formData.foto_perfil || '', // Opcional
        email: formData.email,
        senha: formData.senha
      }

      await childService.registerChild(childData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao cadastrar criança:', error)
      setError(error instanceof Error ? error.message : 'Erro ao cadastrar criança')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  // Estilos reutilizáveis
  const labelStyle = {
    display: 'block' as const,
    marginBottom: '5px',
    fontWeight: 'bold' as const,
    color: '#f6a623' // Cor laranja igual aos cards de login
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 15px 10px 40px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  }

  return (
    <>
      <style>{`
        .child-modal-input:focus {
          border-color: #f6a623 !important;
          box-shadow: 0 0 0 2px rgba(246, 166, 35, 0.2) !important;
        }
        .child-modal-select:focus {
          border-color: #f6a623 !important;
          box-shadow: 0 0 0 2px rgba(246, 166, 35, 0.2) !important;
        }
      `}</style>
      <div className="modal-overlay">
        <div className="modal-card" style={{ 
          maxWidth: '500px', 
          width: '90%',
          borderRadius: '18px'
        }}>
          <button 
            className="modal-exit" 
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>

          <h2 className="modal-title" style={{ color: isDark ? '#ffffff' : '#333333' }}>
            👶 Cadastrar Criança
          </h2>
          
          <hr className="modal-hr" />

          <p className="modal-text" style={{ color: isDark ? '#ffffff' : '#666666' }}>
            Para usar nossos serviços, você precisa cadastrar a criança pela qual é responsável.
          </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px', marginTop: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nome completo *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome || ''}
              onChange={handleInputChange}
              placeholder="Digite o nome da criança"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              CPF *
            </label>
            <input
              type="text"
              name="cpf"
              value={formatCPF(formData.cpf || '')}
              onChange={handleInputChange}
              placeholder="000.000.000-00"
              required
              inputMode="numeric"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            {error && error.toLowerCase().includes('cpf') && (
              <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px' }}>{error}</p>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold'
            }}>
              Data de nascimento *
            </label>
            <input
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento || ''}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Sexo *
            </label>
            <select
              name="id_sexo"
              value={formData.id_sexo || 0}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value={0}>Selecione o sexo</option>
              {Array.isArray(sexoOptions) && sexoOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder="email@exemplo.com"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Senha *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <img 
                src="/icons-lock.svg" 
                alt="lock icon" 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  width: '16px', 
                  height: '16px',
                  zIndex: 1
                }} 
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="senha"
                value={formData.senha || ''}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '10px 45px 10px 40px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <img
                src={showPassword ? '/icons-eye-on.svg' : '/icons-eye-off.svg'}
                alt={showPassword ? 'hide password' : 'show password'}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  zIndex: 1
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Confirmar senha *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <img 
                src="/icons-lock.svg" 
                alt="lock icon" 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  width: '16px', 
                  height: '16px',
                  zIndex: 1
                }} 
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '10px 45px 10px 40px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <img
                src={showConfirmPassword ? '/icons-eye-on.svg' : '/icons-eye-off.svg'}
                alt={showConfirmPassword ? 'hide password' : 'show password'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  zIndex: 1
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="modal-actions" style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onClose}
              disabled={isLoading}
              style={{ flex: 1, minWidth: '140px', transition: 'background-color 0.2s ease' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f3f4f6' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '' }}
            >
              Pular por agora
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
              style={{ flex: 1, minWidth: '180px', transition: 'filter 0.15s ease' }}
              onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(0.95)' }}
              onMouseOut={(e) => { e.currentTarget.style.filter = '' }}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Criança'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  )
}
