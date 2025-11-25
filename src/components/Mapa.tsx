"use client";

import { useEffect, useRef, useState } from "react";
import { Instituicao } from "@/types";
import { geocodeAddress, ensureGoogleMapsLoaded } from "@/services/Instituicoes";
import { childService } from "@/services/childService";
import { useAuth } from "@/contexts/AuthContext";

import styles from "../app/styles/Mapa.module.css";

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
  const homeMarkerRef = useRef<any | null>(null);
  const homeCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const [mapReady, setMapReady] = useState(false);

  // Carrega a API do Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;
      const w = window as any;
      if (!w.google || !w.google.maps) return;

      // Cria o mapa
      googleMapRef.current = new w.google.maps.Map(mapRef.current, {
        center: { lat: -23.55052, lng: -46.633308 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        clickableIcons: false,
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
      setMapReady(true);
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
      initializeMap();
    })();
  }, []);

  // Adiciona marcador de "casa" para o usuário logado (local salvo)
  useEffect(() => {
    const addHomeMarker = async () => {
      if (!googleMapRef.current || !user?.id) return;

      const w = window as any;
      if (!w.google || !w.google.maps) return;

      try {
        const userIdNumber = Number(user.id);
        if (!Number.isFinite(userIdNumber)) return;

        const fullUser: any = await childService.getUserById(userIdNumber);
        const locais = Array.isArray(fullUser?.locais_salvos) ? fullUser.locais_salvos : [];
        if (!locais.length) return;

        const local = locais[0];
        let lat: number | null = local.latitude ?? null;
        let lng: number | null = local.longitude ?? null;

        // Se lat/lng forem 0 ou inválidos, tenta geocodificar o endereço salvo
        if (!lat || !lng || (lat === 0 && lng === 0)) {
          const parts: string[] = [];
          if (local.logradouro) parts.push(local.logradouro);
          if (local.numero) parts.push(String(local.numero));
          const cityState = [local.cidade, local.estado].filter(Boolean).join(", ");
          if (cityState) parts.push(cityState);
          if (local.cep) parts.push(local.cep);
          const address = parts.join(", ");

          if (address) {
            const geocoder = new w.google.maps.Geocoder();
            const geocodeResult: { lat: number; lng: number } | null = await new Promise((resolve) => {
              geocoder.geocode({ address }, (results: any, status: any) => {
                if (status === "OK" && results && results[0]) {
                  const loc = results[0].geometry.location;
                  resolve({ lat: loc.lat(), lng: loc.lng() });
                } else {
                  resolve(null);
                }
              });
            });

            if (geocodeResult) {
              lat = geocodeResult.lat;
              lng = geocodeResult.lng;
            }
          }
        }

        // Se ainda não tiver coordenadas válidas, não desenha o marcador de casa
        if (lat == null || lng == null) {
          return;
        }

        // Remove marcador anterior, se existir
        if (homeMarkerRef.current) {
          homeMarkerRef.current.setMap(null);
          homeMarkerRef.current = null;
        }

        const homeIconSvg = `
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Mesmo gradient laranja do pin de localização -->
              <linearGradient id="homeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFA726" />
                <stop offset="100%" stop-color="#FB8C00" />
              </linearGradient>
            </defs>
            <!-- Casinha (sem fundo, só o desenho na mesma cor do pin) -->
            <path
              d="M6 17L16 8L26 17V26C26 26.5523 25.5523 27 25 27H19.5C18.9477 27 18.5 26.5523 18.5 26V20.5H13.5V26C13.5 26.5523 13.0523 27 12.5 27H7C6.44772 27 6 26.5523 6 26V17Z"
              fill="url(#homeGradient)"
              stroke="#FB8C00"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
            <!-- Pequena chaminé -->
            <path d="M19 9.5V6.5" stroke="#FB8C00" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        `;

        const marker = new w.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: "Seu local salvo",
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(homeIconSvg),
            scaledSize: new w.google.maps.Size(40, 40),
            anchor: new w.google.maps.Point(20, 32) // ancora próximo à base da casa
          },
          zIndex: 9999
        });

        homeMarkerRef.current = marker;
        homeCoordsRef.current = { lat, lng };

        // Ao clicar na casinha, abre a caixinha de info com o mesmo estilo dos pins
        marker.addListener("click", () => {
          const street = local.logradouro || "";
          const number = local.numero || "";
          const hasAddress = street || number;
          const addressLine = hasAddress ? `${street}${number ? ", " + number : ""}` : "";

          const content = `
            <div class="map-infowindow">
              <button type="button" class="map-infowindow-close" aria-label="Fechar">×</button>
              <div class="map-infowindow-name">Seu local salvo</div>
              ${addressLine ? `<div class="map-infowindow-address">${addressLine}</div>` : ""}
            </div>
          `;

          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(googleMapRef.current, marker);

          const w = window as any;
          if (w.google && w.google.maps && w.google.maps.event) {
            w.google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
              const popup = document.querySelector('.map-infowindow') as HTMLDivElement | null;
              const btn = document.querySelector('.map-infowindow-close') as HTMLButtonElement | null;
              if (btn) {
                btn.onclick = () => {
                  if (popup) {
                    popup.classList.add('map-infowindow-closing');
                    setTimeout(() => {
                      infoWindowRef.current.close();
                    }, 180);
                  } else {
                    infoWindowRef.current.close();
                  }
                };
              }
            });
          }
        });

        // Se nenhuma instituição estiver destacada, centraliza o mapa inicialmente na casa
        if (!highlightedInstitution) {
          googleMapRef.current.setCenter({ lat, lng });
          googleMapRef.current.setZoom(14);
        }
      } catch (error) {
        console.error('Erro ao adicionar marcador de casa do usuário:', error);
      }
    };

    addHomeMarker();
  }, [user, mapReady]);

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
        let lat: number | null = null;
        let lng: number | null = null;

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
          lat = coords?.lat ?? null;
          lng = coords?.lng ?? null;
        }

        // Se ainda não tiver coords válidas, tenta usar o local salvo do usuário
        if ((lat == null || lng == null) && homeCoordsRef.current) {
          lat = homeCoordsRef.current.lat;
          lng = homeCoordsRef.current.lng;
        }

        // Se mesmo assim não tivermos coords, usa o centro padrão de SP
        if (lat == null || lng == null) {
          lat = -23.5505;
          lng = -46.6333;
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
          const end = highlightedInstitution.endereco;
          const street = end?.logradouro || '';
          const number = end?.numero || '';
          const hasAddress = street || number;
          const addressLine = hasAddress ? `${street}${number ? ', ' + number : ''}` : '';

          const content = `
            <div class="map-infowindow">
              <button type="button" class="map-infowindow-close" aria-label="Fechar">×</button>
              <div class="map-infowindow-name">${highlightedInstitution.nome}</div>
              ${addressLine ? `<div class="map-infowindow-address">${addressLine}</div>` : ''}
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(googleMapRef.current, marker);

          // Garante que o botão X interno feche a caixinha com animação de saída
          const w = window as any;
          if (w.google && w.google.maps && w.google.maps.event) {
            w.google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
              const popup = document.querySelector('.map-infowindow') as HTMLDivElement | null;
              const btn = document.querySelector('.map-infowindow-close') as HTMLButtonElement | null;
              if (btn) {
                btn.onclick = () => {
                  if (popup) {
                    popup.classList.add('map-infowindow-closing');
                    setTimeout(() => {
                      infoWindowRef.current.close();
                    }, 180);
                  } else {
                    infoWindowRef.current.close();
                  }
                };
              }
            });
          }
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