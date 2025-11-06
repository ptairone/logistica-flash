import { useEffect } from 'react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { toast } from 'sonner';
import { APP_VERSION, APP_NAME } from '@/lib/version';
import { RefreshCw } from 'lucide-react';

export function UpdateNotification() {
  const { updateAvailable, updateApp, dismissUpdate } = useServiceWorkerUpdate();

  useEffect(() => {
    if (updateAvailable) {
      toast.info(
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Nova versão disponível!</p>
            <p className="text-sm text-muted-foreground">
              {APP_NAME} v{APP_VERSION} está pronto para atualizar
            </p>
          </div>
        </div>,
        {
          duration: Infinity,
          action: {
            label: 'Atualizar Agora',
            onClick: updateApp,
          },
          cancel: {
            label: 'Depois',
            onClick: dismissUpdate,
          },
        }
      );
    }
  }, [updateAvailable, updateApp, dismissUpdate]);

  return null;
}
