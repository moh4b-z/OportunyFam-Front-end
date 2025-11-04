"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Instituicao } from "@/types";
import styles from "../app/styles/Mapa.module.css"

// Ícone personalizado de pin de localização profissional
const customIcon = L.divIcon({
  html: `
    <div class="marker-container">
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FF5252;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#D32F2F;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        <path d="M18 0C8.059 0 0 8.059 0 18C0 28.5 18 48 18 48S36 28.5 36 18C36 8.059 27.941 0 18 0Z" 
              fill="url(#pinGradient)" 
              stroke="#FFFFFF" 
              stroke-width="2" 
              filter="url(#shadow)"/>
        <circle cx="18" cy="18" r="8" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="18" cy="18" r="4" fill="url(#pinGradient)"/>
      </svg>
    </div>
  `,
  className: 'custom-marker-icon',
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -48]
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

    if (
      highlightedInstitution &&
      highlightedInstitution.endereco &&
      highlightedInstitution.endereco.latitude !== undefined &&
      highlightedInstitution.endereco.longitude !== undefined
    ) {
      const { latitude, longitude } = highlightedInstitution.endereco;

      const marker = L.marker([latitude, longitude], { icon: customIcon }).bindPopup(
        `<strong>${highlightedInstitution.nome}</strong><br>${highlightedInstitution.descricao || ""}`
      );

      markersLayer.addLayer(marker);

      map.setView([latitude, longitude], 15);
    }
  }, [highlightedInstitution]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "500px" }} />;
}