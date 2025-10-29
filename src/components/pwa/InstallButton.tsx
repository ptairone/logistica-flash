import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function InstallButton({ 
  variant = 'default', 
  size = 'default',
  className,
  showLabel = true 
}: InstallButtonProps) {
  const { isInstalled, canInstall, promptInstall } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleClick = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    if (!success) {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <Button variant="ghost" size={size} className={cn("cursor-default", className)} disabled>
        <Check className="h-4 w-4 text-success" />
        {showLabel && <span className="ml-2">App Instalado</span>}
      </Button>
    );
  }

  if (!canInstall) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isInstalling}
      className={className}
    >
      <Download className="h-4 w-4" />
      {showLabel && (
        <span className="ml-2">
          {isInstalling ? 'Instalando...' : 'Instalar App'}
        </span>
      )}
    </Button>
  );
}
