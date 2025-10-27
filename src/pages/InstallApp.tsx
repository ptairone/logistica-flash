import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listener para o evento de instalação
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listener para verificar se foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Instalar Aplicativo</h2>
          <p className="text-muted-foreground">
            Use o Logística Flash como um aplicativo nativo
          </p>
        </div>

        {isInstalled && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              ✅ O aplicativo já está instalado no seu dispositivo!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Instalar no Celular</CardTitle>
                  <CardDescription>iOS e Android</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInstallable ? (
                <Button onClick={handleInstallClick} className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar Agora
                </Button>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="font-semibold">📱 iPhone/iPad (Safari):</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Toque no botão "Compartilhar" (ícone de quadrado com seta)</li>
                    <li>Role para baixo e toque em "Adicionar à Tela Inicial"</li>
                    <li>Toque em "Adicionar" no canto superior direito</li>
                  </ol>

                  <p className="font-semibold pt-4">🤖 Android (Chrome):</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Toque no menu (três pontos) no canto superior direito</li>
                    <li>Toque em "Instalar app" ou "Adicionar à tela inicial"</li>
                    <li>Confirme a instalação</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Monitor className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Instalar no Computador</CardTitle>
                  <CardDescription>Windows, Mac e Linux</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInstallable ? (
                <Button onClick={handleInstallClick} className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar Agora
                </Button>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="font-semibold">💻 Chrome/Edge:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Clique no ícone de instalação (➕) na barra de endereços</li>
                    <li>Ou vá no menu (três pontos) → "Instalar Logística Flash"</li>
                    <li>Confirme a instalação</li>
                  </ol>

                  <p className="font-semibold pt-4">🦊 Firefox:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Clique no ícone de casa com um "+" na barra de endereços</li>
                    <li>Ou pressione Ctrl+Shift+A (Windows/Linux) ou Cmd+Shift+A (Mac)</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Benefícios do App Instalado</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 md:grid-cols-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Acesso rápido direto da tela inicial</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Funciona offline após primeiro acesso</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Carregamento mais rápido</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Experiência igual a um app nativo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Modo tela cheia (sem barra do navegador)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Atualizações automáticas</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
