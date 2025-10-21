"use client";

import React, { useState } from 'react';
import "../../app/styles/ConversationsModal.css";
import ChatModal from './ChatModal';

interface ConversationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  tag: string;
  unreadCount?: number;
  avatarInitial: string;
}

const ConversationsModal: React.FC<ConversationsModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Conversation | null>(null);

  // Dados das conversas (baseados na imagem)
  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Laura de Andrade',
      lastMessage: 'Olá, fico feliz que tenha entrado...',
      tag: 'ONG',
      unreadCount: 1,
      avatarInitial: 'L'
    },
    {
      id: '2',
      name: 'Institudo Aprender',
      lastMessage: 'Temos vagas disponíveis para de...',
      tag: 'ONG',
      unreadCount: 2,
      avatarInitial: 'I'
    },
    {
      id: '3',
      name: 'Escola Esperança',
      lastMessage: 'As incricoes para o reforço escolar...',
      tag: 'Escola',
      avatarInitial: 'E'
    },
    {
      id: '4',
      name: 'Isabela Lira',
      lastMessage: 'Olá, fico feliz que tenha entrado...',
      tag: 'ONG',
      unreadCount: 1,
      avatarInitial: 'I'
    },
    {
      id: '5',
      name: 'Nicolly Freitas',
      lastMessage: 'Temos vagas disponíveis para de...',
      tag: 'ONG',
      unreadCount: 2,
      avatarInitial: 'N'
    }
  ];

  // Filtrar conversas baseado no termo de pesquisa
  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedContact(conversation);
    setIsChatModalOpen(true);
  };

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedContact(null);
  };

  if (!isOpen) return null;

  return (
    <div className="conversations-modal-overlay">
      <div className="conversations-modal-card">
        {/* Header com título e botão X */}
        <div className="conversations-modal-header">
          <h1 className="conversations-modal-title">Conversas</h1>
          <button className="conversations-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Barra de pesquisa */}
        <div className="conversations-search-container">
          <div className="conversations-search-box">
            <svg 
              className="conversations-search-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="conversations-search-input"
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="conversations-list">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="conversation-item"
              onClick={() => handleConversationClick(conversation)}
            >
              {/* Avatar placeholder */}
              <div className="conversation-avatar">
                {conversation.avatarInitial}
              </div>

              {/* Conteúdo da conversa */}
              <div className="conversation-content">
                <h3 className="conversation-name">{conversation.name}</h3>
                <p className="conversation-message">{conversation.lastMessage}</p>
              </div>

              {/* Tag e contador */}
              <div className="conversation-meta">
                <span className="conversation-tag">{conversation.tag}</span>
                {conversation.unreadCount && (
                  <span className="conversation-unread">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Chat */}
      {selectedContact && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={handleCloseChatModal}
          contactName={selectedContact.name}
          contactTag={selectedContact.tag}
        />
      )}
    </div>
  );
};

export default ConversationsModal;
