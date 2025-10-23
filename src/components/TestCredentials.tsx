'use client'

import { useState } from 'react'

/**
 * Componente para mostrar credenciais de teste
 * Apenas para desenvolvimento - remover em produção
 */
export default function TestCredentials() {
  const [isVisible, setIsVisible] = useState(false)

  if (process.env.NODE_ENV === 'production') {
    return null // Não mostra em produção
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      cursor: 'pointer'
    }} onClick={() => setIsVisible(!isVisible)}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🔧 Modo Desenvolvimento {isVisible ? '▼' : '▶'}
      </div>
      
      {isVisible && (
        <div>
          <div style={{ marginBottom: '8px', fontSize: '11px', opacity: 0.8 }}>
            Credenciais de teste (clique para copiar):
          </div>
          
          <div 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '5px', 
              borderRadius: '4px',
              marginBottom: '5px',
              cursor: 'copy'
            }}
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText('teste@oportunyfam.com')
            }}
          >
            📧 Email: teste@oportunyfam.com
          </div>
          
          <div 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '5px', 
              borderRadius: '4px',
              cursor: 'copy'
            }}
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText('123456')
            }}
          >
            🔑 Senha: 123456
          </div>
          
          <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.6 }}>
            ⚠️ Agora o login valida credenciais reais!
          </div>
        </div>
      )}
    </div>
  )
}
