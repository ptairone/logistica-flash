import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

interface PermissionsState {
  camera: PermissionStatus;
  geolocation: PermissionStatus;
}

interface PermissionsContextType {
  permissions: PermissionsState;
  requestPermissions: () => Promise<void>;
  isPermissionsModalOpen: boolean;
  setIsPermissionsModalOpen: (open: boolean) => void;
  permissionsRequested: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const PERMISSIONS_STORAGE_KEY = 'motorista_permissions_requested';

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<PermissionsState>({
    camera: 'unknown',
    geolocation: 'unknown',
  });
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionsRequested, setPermissionsRequested] = useState(false);

  // Verificar se já solicitou permissões antes
  useEffect(() => {
    const alreadyRequested = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    setPermissionsRequested(!!alreadyRequested);
  }, []);

  const checkPermissions = async () => {
    // Verificar permissão de geolocalização
    if ('geolocation' in navigator) {
      try {
        // No iOS/Safari, Permissions API não funciona para geolocation
        // Apenas marcamos como 'prompt' para solicitar depois
        setPermissions(prev => ({
          ...prev,
          geolocation: 'prompt',
        }));
      } catch (error) {
        console.log('Permissions API não disponível para geolocation');
      }
    }

    // Verificar permissão de câmera
    if ('mediaDevices' in navigator) {
      try {
        // Tentar usar Permissions API (não funciona em iOS)
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissions(prev => ({
            ...prev,
            camera: result.state as PermissionStatus,
          }));
        } else {
          setPermissions(prev => ({
            ...prev,
            camera: 'prompt',
          }));
        }
      } catch (error) {
        console.log('Permissions API não disponível para câmera');
        setPermissions(prev => ({
          ...prev,
          camera: 'prompt',
        }));
      }
    }
  };

  const requestPermissions = async () => {
    try {
      // Solicitar geolocalização
      if ('geolocation' in navigator) {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermissions(prev => ({ ...prev, geolocation: 'granted' }));
              resolve();
            },
            (error) => {
              setPermissions(prev => ({ ...prev, geolocation: 'denied' }));
              reject(error);
            },
            { enableHighAccuracy: false, timeout: 5000 }
          );
        });
      }

      // Solicitar câmera (em iOS, isso só funciona quando o usuário interage)
      if ('mediaDevices' in navigator) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Parar o stream imediatamente após obter permissão
          stream.getTracks().forEach(track => track.stop());
          setPermissions(prev => ({ ...prev, camera: 'granted' }));
        } catch (error) {
          console.log('Erro ao solicitar permissão de câmera:', error);
          setPermissions(prev => ({ ...prev, camera: 'denied' }));
        }
      }

      // Marcar que já solicitou permissões
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, 'true');
      setPermissionsRequested(true);
      setIsPermissionsModalOpen(false);
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      // Mesmo com erro, marcar como solicitado para não ficar perguntando sempre
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, 'true');
      setPermissionsRequested(true);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        requestPermissions,
        isPermissionsModalOpen,
        setIsPermissionsModalOpen,
        permissionsRequested,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}
