
import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const LocationSelector = ({ onLocationSelect }) => {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState('');

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success('Location detected');
          onLocationSelect?.({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setOpen(false);
        },
        () => {
          toast.error('Unable to detect location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleManualEntry = () => {
    if (city.trim()) {
      onLocationSelect?.({ city });
      setOpen(false);
      toast.success(`Location set to ${city}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Select Location
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button 
            className="w-full btn-primary flex items-center justify-center gap-2"
            onClick={handleDetectLocation}
          >
            <Navigation className="w-4 h-4" />
            Detect Current Location
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-premium"
            />
            <Button 
              className="w-full btn-secondary"
              onClick={handleManualEntry}
            >
              Set Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
