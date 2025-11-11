"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Instituicao } from "@/types";
import { geocodeAddress } from "@/services/Instituicoes";
import styles from "../app/styles/Mapa.module.css"

// Ícone personalizado: pin laranja, minimalista (maior para destaque) e sem sombras
const customIcon = L.divIcon({
  html: `
    <div class="marker-container">
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
        <circle cx="12" cy="12" r="2.5" fill="url(#pinGradient)"/>
      </svg>
    </div>
  `,
  className: 'custom-marker-icon',
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -38]
});

interface MapaProps {
  highlightedInstitution?: Instituicao | null;
}

export default function Mapa({ highlightedInstitution }: MapaProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([-23.55052, -46.633308], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMapRef.current);

      markersLayerRef.current = L.markerClusterGroup();
      markersLayerRef.current.addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current!;
    const markersLayer = markersLayerRef.current!;
    markersLayer.clearLayers();

    const updateMapWithInstitution = async () => {
      if (!highlightedInstitution) return;

      try {
        const alwaysGeocode = (process.env.NEXT_PUBLIC_ALWAYS_GEOCODE === 'true');
        // Tenta usar as coordenadas existentes primeiro, a menos que esteja forçando geocodificação
        if (!alwaysGeocode &&
          highlightedInstitution.endereco?.latitude && 
          highlightedInstitution.endereco?.longitude
        ) {
          const { latitude, longitude } = highlightedInstitution.endereco;
          addMarkerToMap(highlightedInstitution, latitude, longitude);
          map.setView([latitude, longitude], 15);
        } else {
          // Se não tiver coordenadas, faz a geocodificação
          const coords = await geocodeAddress(highlightedInstitution);
          const lat = coords?.lat ?? -23.5505;
          const lng = coords?.lng ?? -46.6333;
          addMarkerToMap(highlightedInstitution, lat, lng);
          map.setView([lat, lng], 15);
        }
      } catch (error) {
        console.error('Erro ao atualizar o mapa com a instituição:', error);
      }
    };

    const addMarkerToMap = (institution: Instituicao, lat: number, lng: number) => {
      const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(
        `<strong>${institution.nome}</strong><br>${institution.descricao || ""}`
      );
      markersLayer.addLayer(marker);
    };

    updateMapWithInstitution();

  }, [highlightedInstitution]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "500px" }} />;
}