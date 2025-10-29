import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    // Detectar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);

    // Contador de visitas
    const visits = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    setVisitCount(visits + 1);
    localStorage.setItem('pwa-visit-count', String(visits + 1));

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt apenas após 2ª visita ou depois de 30s
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      if (visits >= 1 && (!dismissed || daysSinceDismiss > 7)) {
        setTimeout(() => setShowPrompt(true), 10000); // 10s após carregamento
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.removeItem('pwa-prompt-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
        return true;
      }
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
    
    return false;
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', String(Date.now()));
  };

  return {
    isInstalled,
    canInstall: !!deferredPrompt,
    showPrompt,
    promptInstall,
    dismissPrompt,
    visitCount,
  };
}
