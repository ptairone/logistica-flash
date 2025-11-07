import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UpdateButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function UpdateButton({ 
  variant = 'ghost', 
  size = 'default',
  className,
  showLabel = true 
}: UpdateButtonProps) {
  const { updateAvailable, updateApp } = useServiceWorkerUpdate();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    toast.loading('Atualizando aplicativo...', { id: 'app-update' });
    
    try {
      await updateApp();
      toast.success('Aplicativo atualizado com sucesso!', { id: 'app-update' });
    } catch (error) {
      toast.error('Erro ao atualizar. Tente novamente.', { id: 'app-update' });
      setIsUpdating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleUpdate}
      disabled={isUpdating}
      className={cn(
        updateAvailable && "relative after:absolute after:top-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-primary after:animate-pulse",
        className
      )}
      title={updateAvailable ? "Nova versão disponível!" : "Verificar atualizações"}
    >
      <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
      {showLabel && (
        <span className="ml-2">
          {isUpdating ? 'Atualizando...' : updateAvailable ? 'Atualizar App' : 'Verificar Atualizações'}
        </span>
      )}
    </Button>
  );
}
