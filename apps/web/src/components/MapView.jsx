
import React from 'react';
import { MapPin } from 'lucide-react';

const MapView = ({ shops = [] }) => {
  return (
    <div className="w-full h-96 bg-muted rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Map view with {shops.length} nearby shops</p>
        <p className="text-sm text-muted-foreground mt-2">Interactive map integration available</p>
      </div>
    </div>
  );
};

export default MapView;
