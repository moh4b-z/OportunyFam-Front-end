"use client";

import React, { useState, useEffect } from 'react';
import "../../app/styles/ConversationsModal.css";
import ChatModal from './ChatModal';
import { buscarConversas, deletarConversa, type Conversa } from '../../services/messageService';

interface ConversationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: number;
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  tag: string;
  unreadCount?: number;
  avatarInitial: string;
  online?: boolean;
}

const ConversationsModal: React.FC<ConversationsModalProps> = ({ isOpen, onClose, usuarioId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar conversas quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarConversas();
    }
  }, [isOpen, usuarioId]);

  const carregarConversas = async () => {
    try {
      setLoading(true);
      const conversasApi = await buscarConversas(usuarioId);
      
      // Verificar se conversasApi é um array
      if (!Array.isArray(conversasApi)) {
        console.log('API não retornou array:', conversasApi);
        throw new Error('Dados inválidos da API');
      }
      
      const conversasFormatadas: Conversation[] = conversasApi.map((conversa: Conversa) => ({
        id: conversa.id,
        name: conversa.nome_contato || 'Contato',
        lastMessage: conversa.ultima_mensagem || 'Sem mensagens',
        tag: conversa.tag_contato || 'Contato',
        unreadCount: conversa.mensagens_nao_lidas || 0,
        avatarInitial: (conversa.nome_contato || 'C')[0].toUpperCase()
      }));
      
      setConversations(conversasFormatadas);
      setAllConversations(conversasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      // Dados de teste para desenvolvimento
      const testData = [
        {
          id: 1,
          name: 'Laura de Andrade',
          lastMessage: 'Olá, fico feliz que tenha entrado em contato!',
          tag: 'ONG',
          unreadCount: 1,
          avatarInitial: 'L'
        },
        {
          id: 2,
          name: 'Instituto Aprender',
          lastMessage: 'Temos vagas disponíveis para crianças...',
          tag: 'ONG',
          unreadCount: 2,
          avatarInitial: 'I'
        }
      ];
      setConversations(testData);
      setAllConversations(testData);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar conversas baseado no termo de pesquisa
  const filteredConversations = searchTerm
    ? allConversations.filter(conversation =>
        conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allConversations;

  const handleConversationClick = (conversation: Conversation) => {
    // Remove o contador de mensagens não lidas ao abrir a conversa
    const conversasAtualizadas = allConversations.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    );
    setConversations(conversasAtualizadas);
    setAllConversations(conversasAtualizadas);
    
    setSelectedContact({ ...conversation, unreadCount: 0 });
    setIsChatModalOpen(true);
  };

  const handleDeleteConversation = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
      try {
        // Tenta deletar da API, mas remove da lista local independente do resultado
        try {
          await deletarConversa(conversationId);
        } catch (deleteError) {
          // Continua mesmo se der erro na API
        }
        
        // Remove da lista local
        const novasConversas = allConversations.filter(conv => conv.id !== conversationId);
        setConversations(novasConversas);
        setAllConversations(novasConversas);

      } catch (error) {
        console.error('Erro detalhado:', error);
        
        // Se for 404, remove da lista local mesmo assim
        if (error instanceof Error && error.message.includes('404')) {
          console.log('Conversa não encontrada na API, removendo da lista local');
          const novasConversas = allConversations.filter(conv => conv.id !== conversationId);
          setConversations(novasConversas);
          setAllConversations(novasConversas);
        } else {
          alert(`Erro ao excluir: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
    }
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
          {loading && (
            <div className="conversations-loading">
              Carregando conversas...
            </div>
          )}
          
          {!loading && filteredConversations.length === 0 && searchTerm && (
            <div className="conversations-no-results">
              Nenhuma conversa encontrada para "{searchTerm}"
            </div>
          )}
          
          {!loading && filteredConversations.map((conversation) => (
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
                <button 
                  className="conversation-delete-btn"
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  title="Excluir conversa"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
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
          conversaId={selectedContact.id}
          usuarioId={usuarioId}
        />
      )}
    </div>
  );
};

export default ConversationsModal;
