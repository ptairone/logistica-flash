import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Zap, 
  Wifi, 
  Bell, 
  Shield, 
  Smartphone, 
  Monitor,
  Check,
  ChevronDown
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useState } from 'react';

export default function InstallApp() {
  const { isInstalled, canInstall, promptInstall } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const [showDesktopInstructions, setShowDesktopInstructions] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    if (!success) {
      setIsInstalling(false);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: 'Acesso Instantâneo',
      description: 'Abra direto da tela inicial do seu dispositivo, sem precisar do navegador',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Wifi,
      title: 'Funciona Offline',
      description: 'Continue trabalhando mesmo sem conexão com a internet',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Bell,
      title: 'Notificações em Tempo Real',
      description: 'Receba alertas importantes sobre viagens, manutenções e mais',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: '100% Seguro',
      description: 'Seus dados ficam protegidos com criptografia de ponta',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const comparison = [
    { feature: 'Acesso rápido', web: false, app: true },
    { feature: 'Funciona offline', web: false, app: true },
    { feature: 'Notificações push', web: false, app: true },
    { feature: 'Instalação na tela inicial', web: false, app: true },
    { feature: 'Atualizações automáticas', web: true, app: true },
    { feature: 'Sem ocupar espaço', web: true, app: true },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section Premium */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8 text-white">
          {/* Gradiente Animado de Fundo */}
          <div className="absolute inset-0 bg-gradient-hero animate-gradient" />
          
          {/* Orbs Flutuantes */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          
          {/* Padrão Geométrico Sobreposto */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm font-medium">Progressive Web App</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
              Transforme sua experiência com o <br/>
              <span className="bg-gradient-to-r from-cyan via-white to-purple bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Logística Flash ⚡
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Instale nosso app e tenha acesso instantâneo, trabalhe offline e receba notificações em tempo real
            </p>

            {isInstalled ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                <div className="p-2 rounded-full bg-success/20">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">App já instalado! 🎉</p>
                  <p className="text-sm text-white/80">Você pode acessá-lo pela tela inicial</p>
                </div>
              </div>
            ) : canInstall ? (
              <Button
                size="lg"
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-xl transition-all hover:scale-105 animate-pulse-glow"
              >
                <Download className="h-5 w-5 mr-2" />
                {isInstalling ? 'Instalando...' : 'Instalar App Grátis'}
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm opacity-90">
                  Veja como instalar no seu dispositivo:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowMobileInstructions(!showMobileInstructions)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile (iOS/Android)
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showMobileInstructions ? 'rotate-180' : ''}`} />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDesktopInstructions(!showDesktopInstructions)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop (Chrome/Edge)
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showDesktopInstructions ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instruções Mobile */}
        {showMobileInstructions && (
          <Card className="mb-8 animate-in slide-in-from-top-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Instalação no Mobile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">📱 iOS (iPhone/iPad):</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Abra este site no Safari</li>
                  <li>Toque no botão de compartilhar (quadrado com seta)</li>
                  <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                  <li>Toque em "Adicionar"</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🤖 Android:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Abra este site no Chrome</li>
                  <li>Toque no menu (três pontos) no canto superior direito</li>
                  <li>Toque em "Instalar app" ou "Adicionar à tela inicial"</li>
                  <li>Confirme a instalação</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções Desktop */}
        {showDesktopInstructions && (
          <Card className="mb-8 animate-in slide-in-from-top-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Instalação no Desktop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">💻 Chrome/Edge:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Clique no ícone de instalação na barra de endereço (ou menu)</li>
                  <li>Clique em "Instalar"</li>
                  <li>O app abrirá em uma janela própria</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefícios */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2 text-center">Por que instalar?</h2>
          <p className="text-muted-foreground text-center mb-8">
            Veja todos os benefícios que você terá
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                variant="premium"
                className="border-2 hover:border-primary/50 transition-all group overflow-hidden"
              >
                <CardHeader>
                  <div className={`inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-gradient-to-br ${benefit.gradient} mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <benefit.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-display">{benefit.title}</CardTitle>
                  <CardDescription className="text-base">{benefit.description}</CardDescription>
                </CardHeader>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>

        {/* Comparação */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">App vs Navegador</CardTitle>
            <CardDescription className="text-center">
              Veja a diferença entre usar no navegador e o app instalado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Recurso</th>
                    <th className="text-center py-3 px-4">Navegador</th>
                    <th className="text-center py-3 px-4 bg-primary/5">App Instalado</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{item.feature}</td>
                      <td className="text-center py-3 px-4">
                        {item.web ? (
                          <Check className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 bg-primary/5">
                        {item.app ? (
                          <Check className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">O app ocupa muito espaço?</h4>
              <p className="text-sm text-muted-foreground">
                Não! O app é apenas um atalho inteligente que usa tecnologia PWA, ocupando menos de 5MB.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Preciso atualizar manualmente?</h4>
              <p className="text-sm text-muted-foreground">
                Não! O app se atualiza automaticamente quando você o abre e há uma nova versão disponível.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Funciona sem internet?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode visualizar dados já carregados e fazer algumas ações offline. Quando voltar online, tudo sincroniza automaticamente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">É seguro?</h4>
              <p className="text-sm text-muted-foreground">
                100%! O app usa a mesma tecnologia de segurança do site, com criptografia HTTPS e dados protegidos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
