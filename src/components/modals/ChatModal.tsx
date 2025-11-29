"use client";

import React, { useEffect, useRef, useState } from 'react';
import "../../app/styles/ChatModal.css";
import { API_BASE_URL } from "@/services/config";
import { MensagemRequest, Mensagem } from "@/types";
import { azureStorageService } from "@/services/azureStorageService";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  conversationId: number;
  currentUserPessoaId: number | null;
  onRefreshConversations?: () => void | Promise<void>;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  tipo?: 'TEXTO' | 'AUDIO';
  audioUrl?: string | null;
  audioDuracao?: number | null;
}

// Componente de player de áudio
const AudioPlayer: React.FC<{ audioUrl: string; duration?: number | null; isSent: boolean }> = ({ audioUrl, duration, isSent }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [hasStarted, setHasStarted] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Atualização suave usando requestAnimationFrame
  const updateProgress = () => {
    if (audioRef.current && isPlaying) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        setHasStarted(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasStarted(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      setHasStarted(true);
    }
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  // Mostra duração total se não começou, ou tempo atual se está tocando
  const displayTime = hasStarted ? formatTime(currentTime) : formatTime(audioDuration);

  return (
    <div className={`audio-player ${isSent ? 'sent' : 'received'}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button className="audio-play-btn" onClick={togglePlay} type="button">
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="audio-progress-container">
        <input
          type="range"
          min="0"
          max={audioDuration || 1}
          step="any"
          value={currentTime}
          onChange={handleSeek}
          className="audio-progress-slider"
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />
        <span className="audio-time-single">{displayTime}</span>
      </div>
    </div>
  );
};

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, contactName, conversationId, currentUserPessoaId, onRefreshConversations }) => {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Função para rolar até o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Estados para gravação de áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

      let mapped: Message[] = mensagens
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
            tipo: msg.tipo || 'TEXTO',
            audioUrl: msg.audio_url || null,
            audioDuracao: msg.audio_duracao || null,
          };
        });

      // Se houver um horário local salvo para a última mensagem enviada
      // pelo usuário nesta conversa, sobrescreve o `time` do último
      // message.isSent = true com esse valor.
      if (typeof window !== 'undefined' && currentUserPessoaId != null && conversationId && !Number.isNaN(conversationId)) {
        const storageKey = `last-message-local-time-${conversationId}-${currentUserPessoaId}`;
        const storedTime = window.localStorage.getItem(storageKey);
        if (storedTime) {
          for (let i = mapped.length - 1; i >= 0; i--) {
            if (mapped[i].isSent) {
              mapped[i] = { ...mapped[i], time: storedTime };
              break;
            }
          }
        }
      }

      setMessages(mapped);
    } catch (error) {
      console.error('Erro ao carregar mensagens da conversa:', error);
    }
  };

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

      // Salva o horário local desta última mensagem em localStorage para ser
      // reutilizado tanto no chat quanto nos cards de conversas.
      if (typeof window !== 'undefined') {
        const storageKey = `last-message-local-time-${conversationId}-${currentUserPessoaId}`;
        const localTime = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        window.localStorage.setItem(storageKey, localTime);
      }

      // Recarrega as mensagens da conversa a partir da API e aplica o horário local salvo
      await fetchMessages();

      // Também solicita um refresh da lista de conversas (cards) na HomePage, se disponível
      if (onRefreshConversations) {
        try {
          await onRefreshConversations();
        } catch (err) {
          console.error('Erro ao atualizar lista de conversas após envio de mensagem:', err);
        }
      }

      setMessageText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Ref para armazenar o timestamp de início, duração final e flag de cancelamento
  const recordingStartTimeRef = useRef<number>(0);
  const finalDurationRef = useRef<number>(0);
  const wasCancelledRef = useRef<boolean>(false);

  // Funções para gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Tenta usar mp4/m4a, com fallback para webm
      let mimeType = 'audio/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm;codecs=opus';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Quando o MediaRecorder realmente começar a gravar
      mediaRecorder.onstart = () => {
        recordingStartTimeRef.current = Date.now();
        wasCancelledRef.current = false; // Reseta a flag de cancelamento
        setRecordingTime(0);
        
        // Inicia o timer de gravação
        recordingTimerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          setRecordingTime(elapsed);
        }, 100); // Atualiza mais frequentemente para maior precisão visual
      };

      mediaRecorder.onstop = async () => {
        // Se foi cancelado, não envia o áudio
        if (wasCancelledRef.current) {
          return;
        }
        
        // Usa a duração capturada no momento do clique em stop
        const duration = finalDurationRef.current;
        
        // Para todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
        
        // Limpa o timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingTime(0);
        
        // Determina o tipo correto do blob
        const isM4a = mimeType.includes('mp4');
        const blobType = isM4a ? 'audio/mp4' : 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        
        // Envia o áudio
        await sendAudioMessage(audioBlob, duration, isM4a);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Captura a duração exata no momento do clique (o que o usuário viu na tela)
      finalDurationRef.current = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Marca como cancelado para não enviar no onstop
      wasCancelledRef.current = true;
      
      // Para o MediaRecorder (isso vai disparar onstop, mas a flag impede o envio)
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    }
  };

  const sendAudioMessage = async (audioBlob: Blob, duration: number, isM4a: boolean) => {
    if (!conversationId || !currentUserPessoaId || Number.isNaN(conversationId) || Number.isNaN(currentUserPessoaId)) {
      console.error('Não é possível enviar áudio sem id_conversa e id_pessoa válidos');
      return;
    }

    setIsSendingAudio(true);

    try {
      // Upload do áudio para o Azure
      const audioUrl = await azureStorageService.uploadAudio(audioBlob, isM4a);

      // Envia a mensagem com o áudio
      const payload = {
        descricao: `Áudio(${duration}s)`,
        id_conversa: Number(conversationId),
        id_pessoa: Number(currentUserPessoaId),
        tipo: 'AUDIO',
        audio_url: audioUrl,
        audio_duracao: duration
      };

      const response = await fetch(`${API_BASE_URL}/conversas/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return;
      }

      // Salva o horário local
      if (typeof window !== 'undefined') {
        const storageKey = `last-message-local-time-${conversationId}-${currentUserPessoaId}`;
        const localTime = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        window.localStorage.setItem(storageKey, localTime);
      }

      // Recarrega as mensagens
      await fetchMessages();

      // Atualiza a lista de conversas
      if (onRefreshConversations) {
        try {
          await onRefreshConversations();
        } catch (err) {
          console.error('Erro ao atualizar lista de conversas:', err);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
    } finally {
      setIsSendingAudio(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteConversation = async () => {
    if (!conversationId || Number.isNaN(conversationId)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`${API_BASE_URL}/conversas/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Falha ao excluir conversa:', response.status, response.statusText);
        return;
      }

      if (onRefreshConversations) {
        try {
          await onRefreshConversations();
        } catch (err) {
          console.error('Erro ao atualizar lista de conversas após excluir conversa:', err);
        }
      }

      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
    } finally {
      setIsDeleting(false);
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
    fetchMessages();
  }, [conversationId, currentUserPessoaId]);

  // Rola para o final quando as mensagens mudam
  useEffect(() => {
    if (messages.length > 0) {
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

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
        <div className="chat-header-right">
          <div className="chat-menu-wrapper">
            <button
              className="chat-menu-btn"
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
            <div className={`chat-menu-dropdown ${isMenuOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="chat-menu-item chat-menu-item-danger"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowDeleteConfirm(true);
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Excluir conversa</span>
              </button>
            </div>
          </div>
        </div>
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
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.isSent ? 'sent' : 'received'} ${message.tipo === 'AUDIO' ? 'audio-message' : ''}`}
              >
                <div className="chat-message-bubble">
                  {message.tipo === 'AUDIO' && message.audioUrl ? (
                    <AudioPlayer
                      audioUrl={message.audioUrl}
                      duration={message.audioDuracao}
                      isSent={message.isSent}
                    />
                  ) : (
                    message.text
                  )}
                </div>
                <span className="chat-message-time">{message.time}</span>
              </div>
            ))}
            {/* Elemento invisível para scroll automático */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="chat-delete-overlay">
          <div className="chat-delete-dialog">
            <div className="chat-delete-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h2 className="chat-delete-title">Excluir conversa</h2>
            <p className="chat-delete-text">
              Tem certeza que deseja excluir esta conversa? Essa ação não poderá ser desfeita.
            </p>
            <div className="chat-delete-actions">
              <button
                type="button"
                className="chat-delete-btn chat-delete-btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="chat-delete-btn chat-delete-btn-confirm"
                onClick={handleDeleteConversation}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campo de Entrada */}
      <div className="chat-input-container">
        {isRecording ? (
          // UI de gravação de áudio
          <div className="chat-recording-box">
            <button
              type="button"
              className="chat-cancel-recording-btn"
              onClick={cancelRecording}
              title="Cancelar gravação"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="chat-recording-indicator">
              <span className="chat-recording-dot"></span>
              <span className="chat-recording-time">{formatRecordingTime(recordingTime)}</span>
            </div>
            <button
              type="button"
              className="chat-send-recording-btn"
              onClick={stopRecording}
              disabled={isSendingAudio}
              title="Enviar áudio"
            >
              {isSendingAudio ? (
                <span className="chat-sending-spinner"></span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          // UI normal de texto/áudio
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
            {messageText.trim() ? (
              // Botão de enviar texto
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
            ) : (
              // Botão de gravar áudio
              <button
                type="button"
                className="chat-mic-btn"
                onClick={startRecording}
                title="Gravar áudio"
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
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
