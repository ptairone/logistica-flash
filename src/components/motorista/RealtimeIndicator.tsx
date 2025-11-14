import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function RealtimeIndicator() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Verificar status da conexão realtime
    const checkConnection = () => {
      const channels = supabase.getChannels();
      const hasActiveChannels = channels.some(
        (channel) => channel.state === 'joined'
      );
      setIsConnected(hasActiveChannels);
    };

    // Verificar inicialmente
    checkConnection();

    // Verificar periodicamente
    const interval = setInterval(checkConnection, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge 
      variant={isConnected ? "default" : "secondary"}
      className="flex items-center gap-1.5 px-2 py-1"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span className="text-xs">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span className="text-xs">Offline</span>
        </>
      )}
    </Badge>
  );
}
