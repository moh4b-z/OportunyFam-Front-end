"use client";

import React, { useEffect, useRef, useState } from 'react';
import "../../app/styles/ChatModal.css";
import { API_BASE_URL } from "@/services/config";
import { MensagemRequest, Mensagem } from "@/types";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  conversationId: number;
  currentUserPessoaId: number | null;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, contactName, conversationId, currentUserPessoaId }) => {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text) return;

    if (!conversationId || !currentUserPessoaId || Number.isNaN(conversationId) || Number.isNaN(currentUserPessoaId)) {
      console.error('Não é possível enviar mensagem sem id_conversa e id_pessoa válidos', {
        conversationId,
        currentUserPessoaId,
      });
      return;
    }

    const payload: MensagemRequest = {
      descricao: text,
      id_conversa: Number(conversationId),
      id_pessoa: Number(currentUserPessoaId),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/conversas/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Falha ao enviar mensagem:', response.status, response.statusText);
        return;
      }

      const newMessage: Message = {
        id: String(Date.now()),
        text,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
      };

      // Por enquanto mantém apenas no estado local; depois integramos com a API.
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    try {
      // Garante foco após o render do input
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    } catch {
      // ignore
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId || Number.isNaN(conversationId)) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/conversas/${conversationId}`);
        if (!response.ok) {
          console.error('Falha ao carregar mensagens da conversa:', response.status, response.statusText);
          return;
        }

        const data: any = await response.json();
        const mensagens: Mensagem[] | undefined = data?.conversa?.mensagens;

        if (!Array.isArray(mensagens)) {
          setMessages([]);
          return;
        }

        const mapped: Message[] = mensagens
          .slice()
          .sort((a, b) => {
            const aTime = a.criado_em ? new Date(a.criado_em).getTime() : 0;
            const bTime = b.criado_em ? new Date(b.criado_em).getTime() : 0;
            return aTime - bTime;
          })
          .map((msg) => {
            const time = msg.criado_em
              ? new Date(msg.criado_em).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            const isSent = currentUserPessoaId != null && msg.id_pessoa === currentUserPessoaId;

            return {
              id: String(msg.id ?? `${msg.id_conversa}-${msg.criado_em ?? ''}`),
              text: msg.descricao ?? '',
              time,
              isSent,
            };
          });

        setMessages(mapped);
      } catch (error) {
        console.error('Erro ao carregar mensagens da conversa:', error);
      }
    };

    fetchMessages();
  }, [conversationId, currentUserPessoaId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-content">
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
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5A8.48 8.48 0 0 1 21 11v.5z" />
              </svg>
            </div>
            <p className="chat-empty-text">Ainda não há mensagens.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.isSent ? 'sent' : 'received'}`}
            >
              <div className="chat-message-bubble">
                {message.text}
              </div>
              <span className="chat-message-time">{message.time}</span>
            </div>
          ))
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
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            ref={inputRef}
          />
          <button
            type="button"
            className="chat-send-btn"
            onClick={handleSendMessage}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
