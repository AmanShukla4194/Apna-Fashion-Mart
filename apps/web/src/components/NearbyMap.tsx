'use client';

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface Shop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isVerified?: boolean;
}

interface Props {
  shops: Shop[];
  centerLat?: number;
  centerLng?: number;
  onShopClick?: (shopId: string) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default function NearbyMap({ shops, centerLat = 19.0596, centerLng = 72.8295, onShopClick }: Props) {
  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={{ lat: centerLat, lng: centerLng }}
        defaultZoom={14}
        mapId="afm-nearby-map"
        colorScheme="DARK"
        disableDefaultUI
        gestureHandling="greedy"
      >
        {shops.map((shop) => (
          <AdvancedMarker
            key={shop.id}
            position={{ lat: shop.lat, lng: shop.lng }}
            onClick={() => onShopClick?.(shop.id)}
            title={shop.name}
          >
            <Pin
              background={shop.isVerified ? '#1DA1F2' : '#FF1493'}
              borderColor={shop.isVerified ? '#0E72C6' : '#CC1377'}
              glyphColor="#fff"
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
