'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── icons ─────────────────────────────────────────────────────────────────────

const shopIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#FF1493;border:3px solid #fff;box-shadow:0 2px 10px rgba(255,20,147,0.55);display:flex;align-items:center;justify-content:center;">
    <span style="font-size:11px">🏪</span>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#4285F4;border:3px solid #fff;box-shadow:0 2px 10px rgba(66,133,244,0.55);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ── auto-fit bounds ────────────────────────────────────────────────────────────

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length < 2) return;
    const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [map, positions]);
  return null;
}

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  shopLat:   number;
  shopLng:   number;
  shopName:  string;
  userLat?:  number | null;
  userLng?:  number | null;
}

export default function MiniMap({ shopLat, shopLng, shopName, userLat, userLng }: Props) {
  const hasUser = userLat != null && userLng != null;
  const centerLat = hasUser ? (shopLat + userLat!) / 2 : shopLat;
  const centerLng = hasUser ? (shopLng + userLng!) / 2 : shopLng;

  const positions: [number, number][] = hasUser
    ? [[userLat!, userLng!], [shopLat, shopLng]]
    : [[shopLat, shopLng]];

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={14}
      style={{ width: '100%', height: '100%', borderRadius: 16 }}
      scrollWheelZoom={false}
      zoomControl
      dragging
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {hasUser && <FitBounds positions={positions} />}

      {/* Shop marker */}
      <Marker position={[shopLat, shopLng]} icon={shopIcon}>
        <Popup>
          <strong style={{ fontSize: 13, color: '#001F3F' }}>{shopName}</strong>
        </Popup>
      </Marker>

      {/* User location + dashed line */}
      {hasUser && (
        <>
          <Marker position={[userLat!, userLng!]} icon={userIcon}>
            <Popup><strong style={{ fontSize: 12 }}>Your location</strong></Popup>
          </Marker>
          <Polyline
            positions={positions}
            pathOptions={{ color: '#FF1493', weight: 2, dashArray: '8, 8', opacity: 0.7 }}
          />
        </>
      )}
    </MapContainer>
  );
}
