"use client";

import { useEffect, useRef } from "react";
import { ensureGoogleMapsLoaded } from "../services/Instituicoes";
import "../app/styles/StreetViewModal.css";

// Declaração de tipos para a API do Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  institutionName?: string;
}

export default function StreetViewModal({
  isOpen,
  onClose,
  latitude,
  longitude,
  institutionName
}: StreetViewModalProps) {
  const panoramaRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<any>(null);

  // Listener para fechar com ESC
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !panoramaRef.current) return;

    const initializeStreetView = () => {
      if (!panoramaRef.current) return;
      const w = window as any;
      if (!w.google || !w.google.maps) return;

      const position = { lat: latitude, lng: longitude };
      
      streetViewRef.current = new w.google.maps.StreetViewPanorama(
        panoramaRef.current,
        {
          position,
          pov: {
            heading: 34,
            pitch: 10
          },
          zoom: 1,
          addressControl: true,
          linksControl: true,
          panControl: true,
          enableCloseButton: false,
          zoomControl: true,
          fullscreenControl: true,
          motionTracking: true,
          motionTrackingControl: true
        }
      );

      // Verifica se há Street View disponível nesta localização
      const streetViewService = new w.google.maps.StreetViewService();
      streetViewService.getPanorama(
        { location: position, radius: 50 },
        (data: any, status: any) => {
          if (status !== w.google.maps.StreetViewStatus.OK) {
            console.warn('Street View não disponível nesta localização');
          }
        }
      );
    };

    (async () => {
      const w = window as any;
      if (!(w.google && w.google.maps)) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
        if (!apiKey) {
          console.error('Google Maps API key not found');
          return;
        }
        try {
          await ensureGoogleMapsLoaded(apiKey);
        } catch (e) {
          console.error('Falha ao carregar Google Maps:', e);
          return;
        }
      }
      initializeStreetView();
    })();

    return () => {
      streetViewRef.current = null;
    };
  }, [isOpen, latitude, longitude]);

  if (!isOpen) return null;

  return (
    <div className="street-view-overlay">
      <div className="street-view-modal">
        <div className="street-view-header">
          <div className="street-view-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <h3>Street View</h3>
              {institutionName && <p>{institutionName}</p>}
            </div>
          </div>
          <button className="street-view-close" onClick={onClose} aria-label="Fechar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div ref={panoramaRef} className="street-view-panorama" />
        <div className="street-view-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Arraste para olhar ao redor • Use as setas para navegar pelas ruas</span>
        </div>
      </div>
    </div>
  );
}
