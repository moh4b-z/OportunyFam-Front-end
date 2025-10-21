'use client'

import React, { useEffect } from 'react'

interface SuccessModalProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
  autoCloseDelay?: number // em milissegundos
}

export default function SuccessModal({ 
  isOpen, 
  title, 
  message, 
  onClose, 
  autoCloseDelay = 3000 
}: SuccessModalProps) {
  
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoCloseDelay, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="success-modal" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        animation: 'fadeInScale 0.3s ease-out'
      }}>
        {/* Ícone de sucesso */}
        <div style={{
          width: '60px',
          height: '60px',
          background: '#10B981',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '30px',
          color: 'white'
        }}>
          ✓
        </div>

        {/* Título */}
        <h2 style={{
          color: '#1F2937',
          fontSize: '24px',
          fontWeight: '600',
          margin: '0 0 12px 0'
        }}>
          {title}
        </h2>

        {/* Mensagem */}
        <p style={{
          color: '#6B7280',
          fontSize: '16px',
          lineHeight: '1.5',
          margin: '0 0 25px 0'
        }}>
          {message}
        </p>

        {/* Botão de fechar */}
        <button
          onClick={onClose}
          style={{
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            minWidth: '120px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
          onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}
        >
          OK
        </button>

        {/* Barra de progresso para auto-close */}
        {autoCloseDelay > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: '#E5E7EB',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: '#10B981',
              animation: `shrink ${autoCloseDelay}ms linear`,
              transformOrigin: 'left'
            }} />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  )
}
