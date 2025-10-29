import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Zap, Wifi, Bell, X } from 'lucide-react';

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Mostrar apenas na primeira vez que o PWA é aberto
    const hasSeenWelcome = localStorage.getItem('pwa-welcome-seen');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone && !hasSeenWelcome) {
      setTimeout(() => setOpen(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('pwa-welcome-seen', 'true');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            🎉 Bem-vindo ao Logística Flash!
          </DialogTitle>
          <DialogDescription className="text-center">
            Você instalou o app com sucesso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="bg-primary/10 rounded-lg p-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Acesso Instantâneo</h4>
              <p className="text-xs text-muted-foreground">Abra direto da tela inicial</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="bg-success/10 rounded-lg p-2">
              <Wifi className="h-5 w-5 text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Funciona Offline</h4>
              <p className="text-xs text-muted-foreground">Continue trabalhando sem internet</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="bg-accent/10 rounded-lg p-2">
              <Bell className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Notificações</h4>
              <p className="text-xs text-muted-foreground">Receba alertas importantes</p>
            </div>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Começar a Usar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
