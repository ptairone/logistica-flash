import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function InstallPrompt() {
  const { showPrompt, promptInstall, dismissPrompt } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    if (!success) {
      setIsInstalling(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50",
        "animate-in slide-in-from-bottom-5 duration-500"
      )}
    >
      <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl shadow-2xl p-4 backdrop-blur-xl border border-white/20">
        <button
          onClick={dismissPrompt}
          className="absolute -top-2 -right-2 bg-background text-foreground rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 shrink-0">
            <Smartphone className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Instalar Logística Flash
            </h3>
            <p className="text-xs opacity-90 mb-3">
              Acesso rápido, trabalhe offline e receba notificações
            </p>
            
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              size="sm"
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold shadow-md"
            >
              <Download className="h-4 w-4 mr-2" />
              {isInstalling ? 'Instalando...' : 'Instalar Agora'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
