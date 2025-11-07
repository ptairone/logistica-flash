import { HeroSection } from "@/components/apresentacao/HeroSection";
import { FeatureCard } from "@/components/apresentacao/FeatureCard";
import { BenefitCard } from "@/components/apresentacao/BenefitCard";
import { BeforeAfterCard } from "@/components/apresentacao/BeforeAfterCard";
import { ScreenshotCard } from "@/components/apresentacao/ScreenshotCard";
import { AIFeatureSection } from "@/components/apresentacao/AIFeatureSection";
import { DayInLifeTimeline } from "@/components/apresentacao/DayInLifeTimeline";
import { Button } from "@/components/ui/button";
import {
  Truck, 
  DollarSign, 
  Users, 
  Wrench, 
  Package, 
  BarChart3,
  Smartphone,
  WifiOff,
  Bell,
  Shield,
  Camera,
  TrendingUp,
  Clock,
  Eye,
  Wallet,
  Brain,
  Zap,
  Target
} from "lucide-react";

export default function Apresentacao() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <HeroSection />

      {/* IA que Trabalha por Você */}
      <AIFeatureSection />

      {/* Funcionalidades Principais */}
      <section id="funcionalidades" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Funcionalidades Completas
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua frota em um só lugar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={Truck}
              title="Gestão de Viagens"
              description="Controle completo de rotas, status em tempo real e acompanhamento detalhado de cada viagem."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={DollarSign}
              title="Fretes Inteligentes"
              description="Calculadora ANTT integrada com cálculo automático de pedágios e distâncias."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={Users}
              title="Gestão de Motoristas"
              description="Controle de CNH, acertos, pagamentos e alertas automáticos de vencimento."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={Wrench}
              title="Manutenções"
              description="Alertas inteligentes por data e quilometragem, histórico completo por veículo."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={Package}
              title="Controle de Estoque"
              description="Gestão de peças, categorias e movimentações com importação automática de documentos."
              gradient="from-indigo-500 to-purple-500"
            />
            <FeatureCard
              icon={BarChart3}
              title="Relatórios Financeiros"
              description="KPIs em tempo real, análise de lucro/prejuízo e relatórios detalhados por período."
              gradient="from-pink-500 to-rose-500"
            />
          </div>
        </div>
      </section>

      {/* Um Dia na Vida */}
      <DayInLifeTimeline />

      {/* Por que Logística Flash? */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Por que <span className="text-primary">Logística Flash?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Veja como transformamos tarefas complexas em simples
            </p>
          </div>

          {/* Casos Antes vs Agora */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <BeforeAfterCard
              title="🚗 Motorista em Viagem"
              scenario="Acabou de abastecer o caminhão"
              before="Guardar nota fiscal e preencher planilha depois (5 minutos)"
              after="Tirar foto → IA extrai tudo automaticamente (30 segundos)"
            />
            <BeforeAfterCard
              title="⏰ Acerto CLT Mensal"
              scenario="Calcular horas extras de 30 dias"
              before="4 horas somando manualmente em planilhas"
              after="Upload de PDF do rastreador → IA calcula tudo (2 minutos)"
            />
            <BeforeAfterCard
              title="📦 Entrada de Estoque"
              scenario="Registrar 50 itens da nota fiscal"
              before="Digitar item por item manualmente (1 hora)"
              after="Foto da NF-e → IA cadastra todos os itens (30 segundos)"
            />
          </div>

          {/* Diferenciais */}
          <h3 className="text-3xl font-bold text-center mb-12">Outros Diferenciais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="p-3 rounded-lg bg-primary/10">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">100% Mobile</h3>
                <p className="text-sm text-muted-foreground">
                  PWA instalável que funciona como app nativo em qualquer dispositivo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="p-3 rounded-lg bg-purple/10">
                <WifiOff className="h-6 w-6 text-purple" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Offline First</h3>
                <p className="text-sm text-muted-foreground">
                  Continue trabalhando sem internet, sincroniza automaticamente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="p-3 rounded-lg bg-cyan/10">
                <Bell className="h-6 w-6 text-cyan" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Alertas Inteligentes</h3>
                <p className="text-sm text-muted-foreground">
                  CNH vencendo, manutenções atrasadas e estoque baixo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="p-3 rounded-lg bg-lime/10">
                <Shield className="h-6 w-6 text-lime" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Seguro e Confiável</h3>
                <p className="text-sm text-muted-foreground">
                  Autenticação robusta com controle de acesso por perfil
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="p-3 rounded-lg bg-pink/10">
                <Camera className="h-6 w-6 text-pink" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Captura Rápida</h3>
                <p className="text-sm text-muted-foreground">
                  Tire fotos de comprovantes direto do celular com geolocalização
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="p-3 rounded-lg bg-orange/10">
                <BarChart3 className="h-6 w-6 text-orange" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Relatórios Visuais</h3>
                <p className="text-sm text-muted-foreground">
                  Dashboards interativos e gráficos em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots/Demonstração */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Interface Moderna e Intuitiva
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Design pensado para facilitar seu trabalho
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <ScreenshotCard
              title="Dashboard Completo"
              description="KPIs, alertas e métricas importantes à primeira vista"
              icon={BarChart3}
            />
            <ScreenshotCard
              title="App do Motorista"
              description="Interface simplificada para registros em viagem"
              icon={Users}
            />
            <ScreenshotCard
              title="Relatórios Detalhados"
              description="Análises financeiras e operacionais completas"
              icon={TrendingUp}
            />
          </div>
        </div>
      </section>

      {/* Benefícios Quantificáveis */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Resultados que <span className="text-primary">Importam</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Economia real de tempo com automação por IA
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <BenefitCard
              icon={Brain}
              value="90%"
              label="Menos Digitação"
              description="IA extrai dados automaticamente de fotos"
              badge="🤖 IA"
              gradient="from-purple-500 to-blue-500"
            />
            <BenefitCard
              icon={Zap}
              value="30 seg"
              label="Por Comprovante"
              description="Vs 5 minutos digitando manualmente"
              badge="⚡ Velocidade"
              gradient="from-yellow-500 to-orange-500"
            />
            <BenefitCard
              icon={Clock}
              value="2 min"
              label="Acerto CLT"
              description="Vs 4 horas de cálculos manuais"
              badge="⏰ Economia"
              gradient="from-green-500 to-emerald-500"
            />
            <BenefitCard
              icon={Target}
              value="Zero"
              label="Erros de Digitação"
              description="IA não erra ao extrair números"
              badge="🎯 Precisão"
              gradient="from-red-500 to-pink-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 sm:p-12 border border-primary/20 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Pronto para Transformar sua Gestão?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Solicite uma demonstração personalizada e veja como o Logística Flash pode otimizar sua operação
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.location.href = '/login'}
              >
                Acessar Sistema
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8"
                onClick={() => window.open('https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Logística%20Flash', '_blank')}
              >
                Falar com Vendas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground">
            © 2024 Logística Flash. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
