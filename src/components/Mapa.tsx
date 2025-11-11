"use client";

import { useEffect, useRef } from "react";
import { Instituicao } from "@/types";
import { geocodeAddress } from "@/services/Instituicoes";
import styles from "../app/styles/Mapa.module.css"

// Declaração de tipos para Google Maps
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

interface MapaProps {
  highlightedInstitution?: Instituicao | null;
}

export default function Mapa({ highlightedInstitution }: MapaProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  // Carrega a API do Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      const w = window as any;
      if (w.google && w.google.maps) {
        initializeMap();
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      if (!apiKey) {
        console.error('Google Maps API key not found');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;
      const w = window as any;
      if (!w.google || !w.google.maps) return;

      // Cria o mapa
      googleMapRef.current = new w.google.maps.Map(mapRef.current, {
        center: { lat: -23.55052, lng: -46.633308 },
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Cria InfoWindow reutilizável
      infoWindowRef.current = new w.google.maps.InfoWindow();
    };

    loadGoogleMaps();
  }, []);

  // Atualiza marcador quando instituição muda
  useEffect(() => {
    if (!googleMapRef.current || !highlightedInstitution) return;

    const updateMapWithInstitution = async () => {
      const w = window as any;
      if (!w.google || !w.google.maps) return;

      try {
        // Limpa marcadores anteriores
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        const alwaysGeocode = (process.env.NEXT_PUBLIC_ALWAYS_GEOCODE === 'true');
        let lat: number;
        let lng: number;

        // Tenta usar as coordenadas existentes primeiro
        if (!alwaysGeocode &&
          highlightedInstitution.endereco?.latitude && 
          highlightedInstitution.endereco?.longitude
        ) {
          lat = highlightedInstitution.endereco.latitude;
          lng = highlightedInstitution.endereco.longitude;
        } else {
          // Se não tiver coordenadas, faz a geocodificação
          const coords = await geocodeAddress(highlightedInstitution);
          lat = coords?.lat ?? -23.5505;
          lng = coords?.lng ?? -46.6333;
        }

        // Cria marcador customizado com SVG
        const marker = new w.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: highlightedInstitution.nome,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="44" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#FFA726;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#FB8C00;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <path d="M12 0C5.373 0 0 5.373 0 12C0 19 12 32 12 32S24 19 24 12C24 5.373 18.627 0 12 0Z"
                      fill="url(#pinGradient)"
                      stroke="#FFFFFF"
                      stroke-width="1.5"/>
                <circle cx="12" cy="12" r="5" fill="#FFFFFF" opacity="0.92"/>
                <circle cx="12" cy="12" r="2.5" fill="#FB8C00"/>
              </svg>
            `),
            scaledSize: new w.google.maps.Size(32, 44),
            anchor: new w.google.maps.Point(16, 44)
          },
          animation: w.google.maps.Animation.DROP
        });

        // Adiciona InfoWindow ao clicar no marcador
        marker.addListener('click', () => {
          const content = `
            <div style="padding: 8px; max-width: 200px;">
              <strong style="font-size: 14px; color: #333;">${highlightedInstitution.nome}</strong>
              ${highlightedInstitution.descricao ? `<br><span style="font-size: 12px; color: #666;">${highlightedInstitution.descricao}</span>` : ''}
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(googleMapRef.current, marker);
        });

        markersRef.current.push(marker);

        // Centraliza o mapa na instituição
        googleMapRef.current.setCenter({ lat, lng });
        googleMapRef.current.setZoom(15);

      } catch (error) {
        console.error('Erro ao atualizar o mapa com a instituição:', error);
      }
    };

    updateMapWithInstitution();
  }, [highlightedInstitution]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "500px" }} />;
}