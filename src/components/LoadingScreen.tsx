'use client'

import ProfessionalLoader from './shared/ProfessionalLoader';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="brand-section">
          <div className="brand-logo">
            <span className="logo-text">OportunyFam</span>
          </div>
        </div>
        
        <ProfessionalLoader 
          message="Carregando plataforma..." 
          size="large" 
        />
      </div>
      
      <style jsx>{`
        .loading-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        
        .loading-screen::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        
        .loading-container {
          text-align: center;
          z-index: 1;
          position: relative;
        }
        
        .brand-section {
          margin-bottom: 40px;
        }
        
        .brand-logo {
          display: inline-block;
          padding: 20px 30px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .logo-text {
          font-size: 32px;
          font-weight: 700;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  )
}
