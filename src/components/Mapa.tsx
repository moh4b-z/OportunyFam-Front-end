"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Instituicao } from "@/types";
import styles from "../app/styles/Mapa.module.css"

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

      const marker = L.marker([latitude, longitude]).bindPopup(
        `<strong>${highlightedInstitution.nome}</strong><br>${highlightedInstitution.descricao || ""}`
      );

      markersLayer.addLayer(marker);

      map.setView([latitude, longitude], 15);
    }
  }, [highlightedInstitution]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "500px" }} />;
}