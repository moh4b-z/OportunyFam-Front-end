'use client'

interface ProfessionalLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function ProfessionalLoader({ 
  message = "Buscando instituições...", 
  size = 'medium'
}: ProfessionalLoaderProps) {
  const sizeConfig = {
    small: { dots: 16, text: 'text-sm', gap: 8 },
    medium: { dots: 20, text: 'text-base', gap: 12 },
    large: { dots: 24, text: 'text-lg', gap: 16 }
  };

  const config = sizeConfig[size];

  return (
    <div className="professional-loader">
      <div className="loader-animation">
        <div className="pulse-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
      <span className="loader-message">{message}</span>
      
      <style jsx>{`
        .professional-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 0;
          gap: ${config.gap}px;
          font-family: Inter, system-ui, Arial, sans-serif;
        }
        
        .loader-animation {
          display: flex;
          align-items: center;
        }
        
        .pulse-dots {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .dot {
          width: ${config.dots}px;
          height: ${config.dots}px;
          border-radius: 50%;
          animation: pulse-wave 1.4s ease-in-out infinite both;
        }
        
        .dot:nth-child(1) {
          background: var(--orange);
          animation-delay: -0.32s;
        }
        
        .dot:nth-child(2) {
          background: var(--yellow);
          animation-delay: -0.16s;
        }
        
        .dot:nth-child(3) {
          background: var(--red-orange);
          animation-delay: 0s;
        }
        
        .loader-message {
          color: var(--text-gray);
          font-weight: 500;
          font-size: ${size === 'small' ? '14px' : size === 'large' ? '18px' : '16px'};
          letter-spacing: 0.025em;
        }
        
        @keyframes pulse-wave {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}