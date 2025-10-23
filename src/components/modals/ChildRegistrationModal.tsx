'use client'

import React, { useState, useEffect } from 'react'
import { ChildData, SexoOption } from '@/types'
import { childService } from '@/services/childService'
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
    cpf: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
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

      if (formData.senha !== confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      if (formData.senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres')
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
              value={formData.cpf || ''}
              onChange={handleInputChange}
              placeholder="000.000.000-00"
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

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Pular por agora
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
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
