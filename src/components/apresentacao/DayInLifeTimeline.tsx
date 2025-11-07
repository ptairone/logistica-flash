import { Card } from "@/components/ui/card";
import { Sunrise, Truck, UtensilsCrossed, Sunset, TrendingUp, Camera, Zap, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DayInLifeTimeline() {
  const events = [
    {
      time: "07:00",
      icon: Sunrise,
      title: "Motorista inicia viagem",
      description: "Registra partida com foto do hodômetro",
      aiFeature: "IA lê KM automaticamente",
      timeSaved: "10 seg",
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      time: "09:30",
      icon: Truck,
      title: "Abastecimento",
      description: "Foto do cupom fiscal",
      aiFeature: "IA extrai valor e litros",
      timeSaved: "30 seg",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      time: "12:15",
      icon: UtensilsCrossed,
      title: "Almoço",
      description: "Quick capture da nota",
      aiFeature: "IA categoriza despesa",
      timeSaved: "20 seg",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      time: "18:00",
      icon: Sunset,
      title: "Chegada no destino",
      description: "Foto do hodômetro final",
      aiFeature: "IA calcula distância percorrida",
      timeSaved: "15 seg",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      time: "19:00",
      icon: TrendingUp,
      title: "Gestão no escritório",
      description: "Dashboard atualizado em tempo real",
      aiFeature: "Relatório automático do dia pronto",
      timeSaved: "0 seg",
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Camera className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Praticidade no Dia a Dia</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            📅 Um Dia na Vida com{" "}
            <span className="text-primary">Logística Flash</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Veja como nossa IA simplifica cada etapa do dia de trabalho
          </p>
        </div>

        <div className="relative">
          {/* Timeline line - hidden on mobile */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 transform -translate-x-1/2" />

          <div className="space-y-8 lg:space-y-12">
            {events.map((event, index) => {
              const Icon = event.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={index}
                  className={`relative flex items-center gap-8 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } flex-col lg:gap-16`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card */}
                  <Card className={`flex-1 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50 ${
                    isEven ? 'lg:text-right' : 'lg:text-left'
                  }`}>
                    <div className="flex items-start gap-4 lg:gap-0 lg:block">
                      <div className={`lg:inline-block ${isEven ? 'lg:float-right lg:ml-4' : 'lg:float-left lg:mr-4'}`}>
                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${event.gradient} flex items-center justify-center mb-2`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {event.time}
                        </Badge>
                        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                        <p className="text-muted-foreground mb-3">{event.description}</p>
                        
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${event.gradient} bg-opacity-10 border border-primary/20`}>
                          <Zap className="h-4 w-4" />
                          <span className="text-sm font-medium">{event.aiFeature}</span>
                        </div>
                        
                        <div className="mt-3">
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Target className="h-3 w-3 mr-1" />
                            Economiza: {event.timeSaved}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Timeline dot */}
                  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Total time saved */}
        <div className="mt-16 text-center">
          <Card className="inline-block p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="text-5xl font-bold text-green-500 mb-2">
              4+ horas
            </div>
            <p className="text-xl text-muted-foreground">
              Economizadas por dia com automação por IA
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
