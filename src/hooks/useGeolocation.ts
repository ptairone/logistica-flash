import { useState } from 'react';
import { toast } from 'sonner';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<GeolocationData | null> => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocalização não suportada neste dispositivo';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setLocation(data);
          setLoading(false);
          resolve(data);
        },
        (err) => {
          let errorMsg = 'Erro ao obter localização';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = 'Permissão de localização negada. Ative nas configurações.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = 'Localização indisponível no momento';
              break;
            case err.TIMEOUT:
              errorMsg = 'Tempo esgotado ao buscar localização';
              break;
          }
          
          setError(errorMsg);
          setLoading(false);
          toast.warning(errorMsg + ' - Continuando sem localização.');
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
}
