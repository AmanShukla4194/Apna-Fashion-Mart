'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── custom icons (avoids webpack broken-image issue with default Leaflet icons) ──

const shopIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;border-radius:50%;
    background:#FF1493;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(255,20,147,0.55);
    cursor:pointer;
  "></div>`,
  iconSize:   [22, 22],
  iconAnchor: [11, 11],
  popupAnchor:[0, -14],
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#4285F4;border:3px solid #fff;
    box-shadow:0 2px 10px rgba(66,133,244,0.6);
  "></div>`,
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
});

// ── re-center helper ────────────────────────────────────────────────────────

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prev = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (prev.current?.lat === lat && prev.current?.lng === lng) return;
    prev.current = { lat, lng };
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [map, lat, lng]);

  return null;
}

// ── types ────────────────────────────────────────────────────────────────────

interface Shop {
  id:    string;
  name:  string;
  lat:   number;
  lng:   number;
  hours?: string | null;
  phone?: string | null;
}

interface Props {
  shops:      Shop[];
  centerLat?: number;
  centerLng?: number;
  onShopClick?: (shopId: string) => void;
}

// ── component ────────────────────────────────────────────────────────────────

export default function NearbyMap({
  shops,
  centerLat = 19.0596,
  centerLng = 72.8295,
  onShopClick,
}: Props) {
  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={14}
      style={{ width: '100%', height: '100%', minHeight: 420, borderRadius: 16 }}
      scrollWheelZoom
      zoomControl
    >
      {/* OpenStreetMap tiles — free, no API key */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <RecenterMap lat={centerLat} lng={centerLng} />

      {/* User location marker */}
      <Marker position={[centerLat, centerLng]} icon={userIcon}>
        <Popup>
          <strong>Your location</strong>
        </Popup>
      </Marker>

      {/* Shop markers */}
      {shops.map(shop => (
        <Marker
          key={shop.id}
          position={[shop.lat, shop.lng]}
          icon={shopIcon}
          eventHandlers={{ click: () => onShopClick?.(shop.id) }}
        >
          <Popup>
            <div style={{ fontFamily: 'Poppins, sans-serif', minWidth: 160 }}>
              <strong style={{ fontSize: 13, color: '#001F3F' }}>{shop.name}</strong>
              {shop.hours && (
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{shop.hours}</div>
              )}
              {shop.phone && (
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>📞 {shop.phone}</div>
              )}
              <a
                href={`/shop/${shop.id}?n=${encodeURIComponent(shop.name)}&lat=${shop.lat}&lng=${shop.lng}`}
                style={{ fontSize: 12, color: '#FF1493', display: 'block', marginTop: 6, fontWeight: 600 }}
              >
                View shop →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
