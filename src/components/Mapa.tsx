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
  institutions?: Instituicao[] | null;
  onInstitutionPinClick?: (institution: Instituicao) => void;
  centerPosition?: { lat: number; lng: number } | null;
  goToHomeTimestamp?: number | null;
}

export default function Mapa({ highlightedInstitution, institutions, onInstitutionPinClick, centerPosition, goToHomeTimestamp }: MapaProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markersByIdRef = useRef<Record<string, any>>({});
  const geocodeCacheRef = useRef<Record<string, { lat: number; lng: number }>>({});
  const infoWindowRef = useRef<any>(null);
  const homeMarkerRef = useRef<any | null>(null);
  const homeCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const [mapReady, setMapReady] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const lightStyles: any[] = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ];

  const darkStyles: any[] = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
  ];

  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Carrega a API do Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;
      const w = window as any;
      if (!w.google || !w.google.maps) return;

      // Verifica o tema atual diretamente do DOM
      const currentIsDark = document.body.classList.contains('dark');

      // Cria o mapa
      googleMapRef.current = new w.google.maps.Map(mapRef.current, {
        center: { lat: -23.55052, lng: -46.633308 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        clickableIcons: false,
        styles: currentIsDark ? darkStyles : lightStyles
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

  useEffect(() => {
    if (!googleMapRef.current) return;
    const w = window as any;
    if (!w.google || !w.google.maps) return;
    googleMapRef.current.setOptions({ styles: isDark ? darkStyles : lightStyles });
  }, [isDark]);

  // Centraliza o mapa quando centerPosition mudar
  useEffect(() => {
    if (!googleMapRef.current || !centerPosition) return;
    if (!centerPosition.lat || !centerPosition.lng) return;
    
    googleMapRef.current.setCenter({ lat: centerPosition.lat, lng: centerPosition.lng });
    googleMapRef.current.setZoom(15);
  }, [centerPosition]);

  // Centraliza no pin vermelho (casa) quando goToHomeTimestamp mudar
  useEffect(() => {
    if (!googleMapRef.current || !goToHomeTimestamp) return;
    
    const coords = homeCoordsRef.current;
    if (coords && coords.lat && coords.lng) {
      googleMapRef.current.setCenter({ lat: coords.lat, lng: coords.lng });
      googleMapRef.current.setZoom(15);
    }
  }, [goToHomeTimestamp]);

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
          <svg width="40" height="54" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="homePinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#EF5350" />
                <stop offset="100%" stop-color="#E53935" />
              </linearGradient>
            </defs>
            <path d="M12 0C5.373 0 0 5.6 0 12.5C0 20 12 32 12 32S24 20 24 12.5C24 5.6 18.627 0 12 0Z"
                  fill="url(#homePinGradient)"
                  stroke="#FFFFFF"
                  stroke-width="1.5"/>
            <circle cx="12" cy="12" r="4.2" fill="#FFFFFF" opacity="0.92"/>
            <circle cx="12" cy="12" r="2.2" fill="#E53935"/>
          </svg>
        `;

        const marker = new w.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: "Seu local salvo",
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(homeIconSvg),
            scaledSize: new w.google.maps.Size(40, 54),
            anchor: new w.google.maps.Point(20, 54) // ancora na base do pin vermelho
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
            <div class="map-infowindow home">
              <button type="button" class="map-infowindow-close" aria-label="Fechar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
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
                btn.onclick = (e) => {
                  e.stopPropagation();
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

  // Sincroniza marcadores com a lista de instituições recebida via props
  useEffect(() => {
    if (!googleMapRef.current || !mapReady) return;
    const w = window as any;
    if (!w.google || !w.google.maps) return;

    const getId = (inst: Instituicao) => String(inst.instituicao_id ?? inst.id ?? '');

    const syncMarkers = async () => {
      const list = Array.isArray(institutions) ? institutions : [];
      const toKeep = new Set<string>();

      // Adiciona marcadores novos
      for (const inst of list) {
        const id = getId(inst);
        if (!id) continue;
        toKeep.add(id);
        if (markersByIdRef.current[id]) continue;

        let lat: number | null = inst.endereco?.latitude ?? null;
        let lng: number | null = inst.endereco?.longitude ?? null;
        if (lat === 0) lat = null;
        if (lng === 0) lng = null;

        if (lat == null || lng == null) {
          const cached = geocodeCacheRef.current[id];
          if (cached) {
            lat = cached.lat; lng = cached.lng;
          } else {
            try {
              const coords = await geocodeAddress(inst);
              if (coords) {
                lat = coords.lat; lng = coords.lng;
                geocodeCacheRef.current[id] = { lat, lng };
              }
            } catch {}
          }
        }

        if (lat == null || lng == null) continue;

        const orangePinSvg = `
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
        `;

        const marker = new w.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: inst.nome,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(orangePinSvg),
            scaledSize: new w.google.maps.Size(32, 44),
            anchor: new w.google.maps.Point(16, 44)
          },
          animation: w.google.maps.Animation.DROP
        });

        marker.addListener('click', () => {
          if (onInstitutionPinClick) {
            onInstitutionPinClick(inst);
          }

          const end = inst.endereco;
          const street = end?.logradouro || '';
          const number = end?.numero || '';
          const hasAddress = street || number;
          const addressLine = hasAddress ? `${street}${number ? ', ' + number : ''}` : '';

          const content = `
            <div class="map-infowindow">
              <button type="button" class="map-infowindow-close" aria-label="Fechar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div class="map-infowindow-name">${inst.nome}</div>
              ${addressLine ? `<div class="map-infowindow-address">${addressLine}</div>` : ''}
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
                btn.onclick = (e) => {
                  e.stopPropagation();
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

        markersByIdRef.current[id] = marker;
      }

      // Remove marcadores que não estão mais na lista
      Object.keys(markersByIdRef.current).forEach((id) => {
        if (!toKeep.has(id)) {
          const m = markersByIdRef.current[id];
          if (m) m.setMap(null);
          delete markersByIdRef.current[id];
        }
      });

      // Atualiza a lista auxiliar
      markersRef.current = Object.values(markersByIdRef.current);
    };

    syncMarkers();
  }, [institutions, mapReady]);

  // Quando uma instituição for destacada, centraliza no marcador existente (sem recriar)
  useEffect(() => {
    if (!googleMapRef.current || !highlightedInstitution) return;
    const getId = (inst: Instituicao) => String(inst.instituicao_id ?? inst.id ?? '');
    const id = getId(highlightedInstitution);
    const marker = id ? markersByIdRef.current[id] : null;

    const centerOn = async () => {
      if (marker && marker.getPosition) {
        const pos = marker.getPosition();
        googleMapRef.current.setCenter(pos);
        googleMapRef.current.setZoom(15);
        // Abre InfoWindow no pin selecionado
        const end = highlightedInstitution.endereco;
        const street = end?.logradouro || '';
        const number = end?.numero || '';
        const hasAddress = street || number;
        const addressLine = hasAddress ? `${street}${number ? ', ' + number : ''}` : '';
        const content = `
          <div class="map-infowindow">
            <button type="button" class="map-infowindow-close" aria-label="Fechar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div class="map-infowindow-name">${highlightedInstitution.nome}</div>
            ${addressLine ? `<div class=\"map-infowindow-address\">${addressLine}</div>` : ''}
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(googleMapRef.current, marker);

        // Adiciona listener para o botão de fechar
        const w = window as any;
        if (w.google && w.google.maps && w.google.maps.event) {
          w.google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
            const popup = document.querySelector('.map-infowindow') as HTMLDivElement | null;
            const btn = document.querySelector('.map-infowindow-close') as HTMLButtonElement | null;
            if (btn) {
              btn.onclick = (e) => {
                e.stopPropagation();
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
        return;
      }

      // Fallback: centraliza por coordenadas conhecidas/geocodificadas, sem recriar marcadores
      let lat: number | null = highlightedInstitution.endereco?.latitude ?? null;
      let lng: number | null = highlightedInstitution.endereco?.longitude ?? null;
      if (lat === 0) lat = null; if (lng === 0) lng = null;
      const cached = id ? geocodeCacheRef.current[id] : null;
      if ((lat == null || lng == null) && cached) { lat = cached.lat; lng = cached.lng; }
      if (lat == null || lng == null) {
        try {
          const coords = await geocodeAddress(highlightedInstitution);
          if (coords) { lat = coords.lat; lng = coords.lng; if (id) geocodeCacheRef.current[id] = coords; }
        } catch {}
      }
      if (lat != null && lng != null) {
        googleMapRef.current.setCenter({ lat, lng });
        googleMapRef.current.setZoom(15);
      }
    };

    centerOn();
  }, [highlightedInstitution]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "500px" }} />;
}