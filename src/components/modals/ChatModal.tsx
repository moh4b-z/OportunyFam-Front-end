"use client";

import React, { useState, useEffect } from 'react';
import "../../app/styles/ChatModal.css";
import { buscarMensagens, buscarMensagensPorConversa, enviarMensagem, deletarMensagem, atualizarMensagem, type Mensagem } from '../../services/messageService';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactTag: string;
  conversaId: number;
  usuarioId: number;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isSent: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, contactName, contactTag, conversaId, usuarioId }) => {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Carregar mensagens quando o modal abrir
  useEffect(() => {
    if (isOpen && conversaId) {
      carregarMensagens();
      marcarMensagensComoVistas();
    }
  }, [isOpen, conversaId]);

  // Scroll automático para última mensagem
  useEffect(() => {
    const container = document.querySelector('.chat-messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const carregarMensagens = async () => {
    try {
      setLoading(true);
      console.log('Carregando mensagens para conversa:', conversaId);
      const mensagensApi = await buscarMensagensPorConversa(conversaId);
      console.log('Mensagens recebidas da API:', mensagensApi);
      
      const mensagensFormatadas: Message[] = mensagensApi.map((msg: Mensagem) => ({
        id: msg.id,
        text: msg.descricao,
        time: new Date(msg.criado_em).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isSent: msg.id_pessoa === usuarioId
      }));
      
      console.log('Mensagens formatadas:', mensagensFormatadas);
      setMessages(mensagensFormatadas);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      // Dados de teste para debug
      setMessages([
        {
          id: 1,
          text: 'Olá! Vamos marcar a reunião para amanhã às 10h?',
          time: '12:49',
          isSent: false
        },
        {
          id: 2,
          text: 'oi',
          time: '13:37',
          isSent: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const marcarMensagensComoVistas = async () => {
    try {
      await atualizarMensagem(true);
    } catch (error) {
      console.error('Erro ao marcar mensagens como vistas:', error);
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      try {
        console.log('=== BOTÃO CLICADO ===');
        console.log('Texto da mensagem:', messageText.trim());
        console.log('ConversaId:', conversaId);
        console.log('UsuarioId:', usuarioId);
        
        // Garantir que temos um usuarioId válido
        const idPessoa = usuarioId && usuarioId > 0 ? usuarioId : 1;
        
        const novaMensagem = {
          id_conversa: conversaId,
          id_pessoa: idPessoa,
          descricao: messageText.trim()
        };
        
        console.log('Enviando mensagem:', novaMensagem);
        
        await enviarMensagem(novaMensagem);
        setMessageText('');
        setIsTyping(false);
        
        // Recarregar mensagens para mostrar a nova mensagem
        await carregarMensagens();
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      try {
        await deletarMensagem(messageId);
        await carregarMensagens();
      } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
      }
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
            <span className="chat-date-text">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="chat-loading">
              Carregando mensagens...
            </div>
          )}

          {/* Mensagens */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.isSent ? 'sent' : 'received'}`}
            >
              <div className="chat-message-content">
                <div className="chat-message-bubble">
                  {message.text}
                </div>
                {message.isSent && (
                  <button 
                    className="chat-message-delete-btn"
                    onClick={(e) => handleDeleteMessage(message.id, e)}
                    title="Excluir mensagem"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2,2h4a2,2 0 0,1,2,2v2"/>
                    </svg>
                  </button>
                )}
              </div>
              <span className="chat-message-time">{message.time}</span>
            </div>
          ))}

          {/* Indicador de digitação */}
          {isTyping && (
            <div className="chat-typing-indicator">
              <div className="chat-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="chat-typing-text">Digitando...</span>
            </div>
          )}
        </div>

        {/* Campo de Entrada */}
        <div className="chat-input-container">
          <div className="chat-input-box">
            <input
              className="chat-input-field"
              type="text"
              placeholder="Digite uma mensagem..."
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="chat-microphone-btn" 
              onClick={handleSendMessage}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
