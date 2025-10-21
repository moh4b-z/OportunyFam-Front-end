"use client";

import React, { useState } from 'react';
import "../../app/styles/ChatModal.css";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactTag: string;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, contactName, contactTag }) => {
  const [messageText, setMessageText] = useState('');

  // Mensagens fixas (mesmas para todos os contatos)
  const messages: Message[] = [
    {
      id: '1',
      text: 'Olá! Gostaria de saber sobre as atividades disponíveis para minha filha de 8 anos.',
      time: '13:05',
      isSent: true
    },
    {
      id: '2',
      text: 'Olá! Que bom que entrou em contato conosco. Temos várias atividades para crianças de 8 anos. Oferecemos aulas de reforço escolar, atividades artísticas e esportivas.',
      time: '13:15',
      isSent: false
    },
    {
      id: '3',
      text: 'Que horários estão disponíveis? Preciso de algo no período da tarde.',
      time: '13:25',
      isSent: true
    },
    {
      id: '4',
      text: 'Temos vagas disponíveis para atividades de segunda a sexta das 14h às 18h. As crianças ficam em um ambiente seguro e supervisionado, com lanche incluído.',
      time: '14:00',
      isSent: false
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Aqui você pode implementar a lógica para enviar a mensagem
      console.log('Mensagem enviada:', messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal-card">
        {/* Header do Chat */}
        <div className="chat-modal-header">
          <div className="chat-header-left">
            <button className="chat-back-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="chat-contact-info">
              <h1 className="chat-contact-name">{contactName}</h1>
              <span className="chat-contact-tag">{contactTag}</span>
            </div>
          </div>
          <button className="chat-menu-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>

        {/* Área de Mensagens */}
        <div className="chat-messages-container">
          {/* Separador de Data */}
          <div className="chat-date-separator">
            <span className="chat-date-text">Hoje</span>
          </div>

          {/* Mensagens */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.isSent ? 'sent' : 'received'}`}
            >
              <div className="chat-message-bubble">
                {message.text}
              </div>
              <span className="chat-message-time">{message.time}</span>
            </div>
          ))}
        </div>

        {/* Campo de Entrada */}
        <div className="chat-input-container">
          <div className="chat-input-box">
            <input
              className="chat-input-field"
              type="text"
              placeholder="Digite uma mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="chat-microphone-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
