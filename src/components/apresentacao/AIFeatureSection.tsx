import { Card } from "@/components/ui/card";
import { Camera, FileText, Package, Brain } from "lucide-react";
import { ProcessFlow } from "./ProcessFlow";
import { Badge } from "@/components/ui/badge";

export function AIFeatureSection() {
  const aiFeatures = [
    {
      icon: Camera,
      title: "📸 Captura Inteligente",
      description: "Tire foto do comprovante, a IA extrai valor, data e categoria automaticamente",
      timeSaved: "90% mais rápido",
      flow: [
        { icon: Camera, label: "Foto" },
        { icon: Brain, label: "IA Processa" },
        { icon: FileText, label: "Dados Prontos" }
      ]
    },
    {
      icon: FileText,
      title: "📊 Relatórios Automáticos",
      description: "Envie screenshot do rastreador, receba planilha de horas extras pronta em segundos",
      timeSaved: "99% de economia",
      flow: [
        { icon: Camera, label: "Screenshot" },
        { icon: Brain, label: "IA Analisa" },
        { icon: FileText, label: "Relatório" }
      ]
    },
    {
      icon: Package,
      title: "📦 Importação Fiscal",
      description: "Tire foto da NF-e, estoque atualizado automaticamente com todos os itens",
      timeSaved: "97% menos tempo",
      flow: [
        { icon: Camera, label: "Foto NF-e" },
        { icon: Brain, label: "IA Extrai" },
        { icon: Package, label: "Estoque OK" }
      ]
    }
  ];

  return (
    <section id="ia" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/20 mb-4">
            <Brain className="h-5 w-5 text-purple-500 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            🤖 Inteligência Artificial que{" "}
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Trabalha por Você
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Automatize tarefas repetitivas e economize até 99% do tempo com nossa IA integrada
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group relative overflow-hidden p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-border/50 hover:border-purple-500/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Badge de economia */}
                  <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                    ⚡ {feature.timeSaved}
                  </Badge>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Process Flow */}
                  <div className="pt-4 border-t border-border/50">
                    <ProcessFlow steps={feature.flow} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
