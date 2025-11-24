"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import "../../app/styles/ConversationsModal.css";
import "../../app/styles/SearchCard.css";
import ChatModal from './ChatModal';
import { Instituicao } from "@/types";

interface ConversationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoOpenInstitution?: Instituicao | null;
  conversationsFromApi?: ApiConversation[] | null;
  currentUserPessoaId?: number | null;
}

interface Conversation {
  id: string; // string usada como key
  conversationId: number; // id_conversa real
  otherParticipantId?: number | null;
  name: string;
  lastMessage: string;
  lastMessagePrefix?: string;
   lastMessageTime?: string;
  unreadCount?: number;
  avatarInitial: string;
  avatarUrl?: string | null;
}
interface ApiUltimaMensagem {
  id: number;
  descricao: string;
  data_envio?: string;
  id_remetente?: number;
}

interface ApiConversation {
  id_conversa: number;
  ultima_mensagem: string | ApiUltimaMensagem | null;
  outro_participante?: {
    id: number;
    nome: string;
    foto_perfil?: string | null;
  };
}

const ConversationAvatar: React.FC<{ name: string; avatarUrl?: string | null }> = ({ name, avatarUrl }) => {
  const [imgError, setImgError] = useState(false);

  // Se há foto de perfil e ela ainda não falhou, exibe a imagem
  if (avatarUrl && !imgError) {
    return (
      <div className="conversation-avatar">
        <img
          src={avatarUrl}
          alt={name}
          className="card-logo-img"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Caso não tenha foto ou tenha falhado, exibe o ícone padrão igual ao dos cards de instituições
  return (
    <div className="conversation-avatar">
      <div className="default-institution-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        </svg>
      </div>
    </div>
  );
};

const ConversationsModal: React.FC<ConversationsModalProps> = ({
  isOpen,
  onClose,
  autoOpenInstitution,
  conversationsFromApi,
  currentUserPessoaId,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Conversation | null>(null);
  const [hasAutoOpenedFromProfile, setHasAutoOpenedFromProfile] = useState(false);

  // Lista de conversas vinda da API mapeada para o formato interno
  const conversations: Conversation[] = useMemo(
    () =>
      (conversationsFromApi ?? []).map((conv: ApiConversation) => {
        const conversationId = Number(conv.id_conversa);
        const name = conv.outro_participante?.nome || 'Instituição';
        const lastMessageRaw = conv.ultima_mensagem;
        let lastMessage = '';
        let lastMessagePrefix: string | undefined;
        let lastMessageTime: string | undefined;

        if (typeof lastMessageRaw === 'string') {
          lastMessage = lastMessageRaw;
          // Quando vier apenas string, não sabemos o remetente; por padrão usamos o nome da instituição
          lastMessagePrefix = name;
        } else if (lastMessageRaw && typeof lastMessageRaw === 'object') {
          const { descricao, id_remetente, data_envio } = lastMessageRaw as ApiUltimaMensagem;
          if (typeof descricao === 'string') {
            lastMessage = descricao;
            if (currentUserPessoaId != null && id_remetente === currentUserPessoaId) {
              lastMessagePrefix = 'Você';
            } else {
              lastMessagePrefix = name;
            }
            if (data_envio) {
              const dt = new Date(data_envio);
              if (!isNaN(dt.getTime())) {
                lastMessageTime = dt.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
            }
          }
        }

        const id = String(conversationId || '');
        const avatarInitial = name.trim().charAt(0).toUpperCase() || 'I';
        const avatarUrl = conv.outro_participante?.foto_perfil || null;
        const otherParticipantId = conv.outro_participante?.id ?? null;

        return {
          id,
          conversationId: Number.isNaN(conversationId) ? 0 : conversationId,
          otherParticipantId,
          name,
          lastMessage,
          lastMessagePrefix,
          lastMessageTime,
          unreadCount: undefined,
          avatarInitial,
          avatarUrl,
        };
      }),
    [conversationsFromApi, currentUserPessoaId]
  );

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

  // Quando uma instituição for passada externamente (ex.: clique no "+" do perfil),
  // tenta encontrar a conversa correspondente vinda da API e abre diretamente o chat.
  useEffect(() => {
    if (!isOpen || !autoOpenInstitution || hasAutoOpenedFromProfile) return;

    // Tenta localizar uma conversa cujo outro_participante corresponda à instituição
    let matchedConversation: Conversation | undefined;
    const instPessoaId = autoOpenInstitution.pessoa_id;

    if (instPessoaId != null) {
      matchedConversation = conversations.find(
        (c) => c.otherParticipantId === instPessoaId
      );
    }

    // Fallback: tenta casar pelo nome, caso o id de pessoa não esteja disponível
    if (!matchedConversation) {
      matchedConversation = conversations.find(
        (c) => c.name === autoOpenInstitution.nome
      );
    }

    if (matchedConversation) {
      setSelectedContact(matchedConversation);
      setIsChatModalOpen(true);
      setHasAutoOpenedFromProfile(true);
      return;
    }

    // Se não encontrou conversa (caso muito raro / condição de corrida),
    // cria um contato temporário sem id de conversa válido (não permitirá envio).
    const name = autoOpenInstitution.nome || 'Instituição';
    const autoContact: Conversation = {
      id: String(autoOpenInstitution.instituicao_id ?? autoOpenInstitution.id ?? ''),
      conversationId: 0,
      otherParticipantId: autoOpenInstitution.pessoa_id ?? null,
      name,
      lastMessage: '',
      unreadCount: undefined,
      avatarInitial: name.trim().charAt(0).toUpperCase() || 'I',
      avatarUrl: autoOpenInstitution.foto_perfil || null,
    };

    setSelectedContact(autoContact);
    setIsChatModalOpen(true);
    setHasAutoOpenedFromProfile(true);
  }, [autoOpenInstitution, isOpen, conversations, hasAutoOpenedFromProfile]);

  useEffect(() => {
    if (!isOpen) {
      setHasAutoOpenedFromProfile(false);
      setSelectedContact(null);
      setIsChatModalOpen(false);
    }
  }, [isOpen]);

  // Removido o fechamento automático ao clicar fora do card.
  // Agora o modal fecha apenas via botão "X" (onClose explícito).

  if (!isOpen) return null;

  return (
    <div className="conversations-modal-overlay">
      <div className="conversations-modal-card" ref={cardRef}>
        {/* Header com título e botão X (somente na lista de conversas) */}
        {!isChatModalOpen && (
          <div className="conversations-modal-header">
            <h1 className="conversations-modal-title">
              <svg
                className="conversations-modal-title-icon"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5A8.48 8.48 0 0 1 21 11v.5z" />
              </svg>
              <span>Conversas</span>
            </h1>
            <button className="conversations-modal-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* Barra de pesquisa (somente quando lista de conversas estiver visível) */}
        {!isChatModalOpen && (
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
        )}

        {/* Lista de conversas */}
        <div className="conversations-main">
          {isChatModalOpen && selectedContact ? (
            <ChatModal
              isOpen={true}
              onClose={handleCloseChatModal}
              contactName={selectedContact.name}
              conversationId={selectedContact.conversationId}
              currentUserPessoaId={currentUserPessoaId ?? null}
            />
          ) : (
            <div className="conversations-list">
              {filteredConversations.length === 0 ? (
                <div className="conversations-empty-state">
                  <div className="conversations-empty-icon">
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
                  <p className="conversations-empty-text">
                    Você ainda não tem nenhuma conversa em andamento.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="conversation-item"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    {/* Avatar com foto da instituição (ou ícone padrão) */}
                    <ConversationAvatar
                      name={conversation.name}
                      avatarUrl={conversation.avatarUrl}
                    />

                    {/* Conteúdo da conversa */}
                    <div className="conversation-content">
                      <h3 className="conversation-name">{conversation.name}</h3>
                      <p className="conversation-message">
                        <span className="conversation-message-text">
                          {conversation.lastMessage && conversation.lastMessage.trim() ? (
                            <>
                              {conversation.lastMessagePrefix && (
                                <strong>{conversation.lastMessagePrefix}: </strong>
                              )}
                              {conversation.lastMessage}
                            </>
                          ) : (
                            "Nenhuma mensagem ainda. Envie a primeira mensagem."
                          )}
                        </span>
                        {conversation.lastMessageTime && (
                          <span className="conversation-message-time">{conversation.lastMessageTime}</span>
                        )}
                      </p>
                    </div>

                    {/* Apenas contador de não lidas */}
                    <div className="conversation-meta">
                      {conversation.unreadCount && (
                        <span className="conversation-unread">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Chat */}
      
    </div>
  );
};

export default ConversationsModal;
