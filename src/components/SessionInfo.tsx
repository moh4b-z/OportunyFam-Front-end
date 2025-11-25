'use client'

import { useEffect, useState } from 'react'

export default function SessionInfo() {
  const [sessionInfo, setSessionInfo] = useState<{
    hasToken: boolean
    rememberMe: boolean
    tokenExpiry?: string
  } | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const checkSession = () => {
      // Verifica se há token nos cookies
      const hasToken = document.cookie
        .split('; ')
        .some(row => row.startsWith('auth-token='))

      // Verifica a preferência remember-me
      const rememberMe = localStorage.getItem('remember-me') === 'true'

      // Extrai informações do token (simulado)
      const tokenMatch = document.cookie.match(/auth-token=mock-token-(\d+)/)
      let tokenExpiry
      if (tokenMatch) {
        const tokenTime = parseInt(tokenMatch[1])
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
        const expiryTime = new Date(tokenTime + maxAge)
        tokenExpiry = expiryTime.toLocaleString('pt-BR')
      }

      setSessionInfo({
        hasToken,
        rememberMe,
        tokenExpiry
      })

      // Mostra a mensagem apenas se houver token
      if (hasToken) {
        setIsVisible(true)
        setIsAnimating(false)
        
        // Inicia animação de fade-out após 4.5 segundos
        setTimeout(() => {
          setIsAnimating(true)
        }, 4500)
        
        // Esconde completamente após 5 segundos
        setTimeout(() => {
          setIsVisible(false)
          setIsAnimating(false)
        }, 5000)
      }
    }

    checkSession()
  }, [])

  if (!sessionInfo || !isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '250px',
      opacity: isAnimating ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      transform: 'translateY(0)',
      animation: 'slideInFromBottom 0.3s ease-out'
    }}>
      <div><strong>Status da Sessão:</strong></div>
      <div>Token: {sessionInfo.hasToken ? '✅ Ativo' : '❌ Inativo'}</div>
      <div>Lembrar-se de mim: {sessionInfo.rememberMe ? '✅ Sim' : '❌ Não'}</div>
      {sessionInfo.tokenExpiry && (
        <div>Expira em: {sessionInfo.tokenExpiry}</div>
      )}
      <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
        {sessionInfo.rememberMe ? 'Sessão de 30 dias' : 'Sessão de 24 horas'}
      </div>
      
      <style jsx>{`
        @keyframes slideInFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
