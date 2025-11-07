import { useState } from 'react';
import { toast } from 'sonner';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = (): Promise<GeolocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocalização não é suportada pelo navegador';
        setError(errorMsg);
        toast.warning(errorMsg);
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);

      // Timeout de 10 segundos
      const timeoutId = setTimeout(() => {
        setLoading(false);
        const timeoutMsg = 'Timeout ao capturar GPS. Continuando sem localização.';
        setError(timeoutMsg);
        toast.warning(timeoutMsg);
        resolve(null);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          setLoading(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          setLoading(false);
          setError(error.message);
          console.warn('Erro ao obter localização:', error);
          toast.warning('Não foi possível capturar GPS. Continuando sem localização.');
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 segundos
          maximumAge: 0,
        }
      );
    });
  };

  return { getCurrentLocation, loading, error };
}
