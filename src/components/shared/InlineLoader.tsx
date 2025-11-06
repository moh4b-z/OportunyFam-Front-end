'use client'

interface InlineLoaderProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md';
  color?: 'primary' | 'secondary' | 'muted';
}

export default function InlineLoader({ 
  message = "Carregando...", 
  size = 'sm',
  color = 'muted'
}: InlineLoaderProps) {
  const sizeConfig = {
    xs: { spinner: 'w-3 h-3', text: 'text-xs', gap: 'gap-1.5' },
    sm: { spinner: 'w-4 h-4', text: 'text-sm', gap: 'gap-2' },
    md: { spinner: 'w-5 h-5', text: 'text-base', gap: 'gap-2.5' }
  };

  const colorConfig = {
    primary: { text: '#f4a261', spinner: '#f4a261' },
    secondary: { text: '#2a9d8f', spinner: '#2a9d8f' },
    muted: { text: '#64748b', spinner: '#94a3b8' }
  };

  const config = sizeConfig[size];
  const colors = colorConfig[color];

  return (
    <div className={`inline-loader ${config.gap}`}>
      <div className={`pulse-spinner ${config.spinner}`}>
        <div className="pulse-dot"></div>
        <div className="pulse-dot"></div>
        <div className="pulse-dot"></div>
      </div>
      <span className={`loader-message ${config.text}`}>{message}</span>
      
      <style jsx>{`
        .inline-loader {
          display: inline-flex;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .pulse-spinner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .pulse-dot {
          width: 25%;
          height: 25%;
          background-color: ${colors.spinner};
          border-radius: 50%;
          animation: pulse-wave 1.4s ease-in-out infinite both;
        }
        
        .pulse-dot:nth-child(1) { animation-delay: -0.32s; }
        .pulse-dot:nth-child(2) { animation-delay: -0.16s; }
        .pulse-dot:nth-child(3) { animation-delay: 0s; }
        
        .loader-message {
          color: ${colors.text};
          font-weight: 500;
          letter-spacing: 0.025em;
        }
        
        @keyframes pulse-wave {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
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