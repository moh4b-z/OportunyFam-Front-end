'use client'

interface EmptyStateProps {
  message?: string;
  icon?: string;
}

export default function EmptyState({ 
  message = "Nenhuma instituição encontrada",
  icon = "🔍"
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <span className="empty-message">{message}</span>
      
      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          gap: 6px;
          font-family: Inter, system-ui, Arial, sans-serif;
        }
        
        .empty-icon {
          font-size: 18px;
          opacity: 0.6;
          animation: gentle-bounce 2s ease-in-out infinite;
        }
        
        .empty-message {
          color: var(--text-gray);
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          letter-spacing: 0.025em;
        }
        
        @keyframes gentle-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}