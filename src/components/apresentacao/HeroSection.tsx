import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/version";
import { ArrowRight, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-background -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
      
      {/* Animated circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow delay-1000" />

      <div className="container mx-auto max-w-6xl text-center relative z-10">
        {/* Logo/Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/20 mb-8 animate-fade-in">
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            🤖 Powered by AI | 📱 100% Mobile
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
          <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 animate-fade-in delay-100">
          <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            IA que Trabalha por Você,
          </span>
          <span className="text-foreground/90"> Gestão que Funciona</span>
        </p>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in delay-200">
          Sistema inteligente para empresas de transporte que precisam de controle total sobre 
          <span className="text-primary font-semibold"> viagens</span>, 
          <span className="text-primary font-semibold"> motoristas</span>, 
          <span className="text-primary font-semibold"> manutenções</span> e 
          <span className="text-primary font-semibold"> financeiro</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-300">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all group"
            onClick={() => window.location.href = '/login'}
          >
            Começar Agora
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => {
              document.querySelector('#funcionalidades')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Conhecer Funcionalidades
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto animate-fade-in delay-500">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Mobile & PWA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Acesso Online</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">∞</div>
            <div className="text-sm text-muted-foreground">Usuários</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">🔒</div>
            <div className="text-sm text-muted-foreground">Seguro</div>
          </div>
        </div>
      </div>
    </section>
  );
}
