import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Truck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ViagemCardProps {
  viagem: any;
}

export function ViagemCard({ viagem }: ViagemCardProps) {
  const navigate = useNavigate();

  const statusConfig = {
    planejada: { label: 'Planejada', color: 'bg-blue-500', textColor: 'text-blue-500', action: 'Iniciar Viagem' },
    em_andamento: { label: 'Em Andamento', color: 'bg-green-500', textColor: 'text-green-500', action: 'Gerenciar' },
    concluida: { label: 'Concluída', color: 'bg-gray-500', textColor: 'text-gray-500', action: 'Ver Detalhes' },
    cancelada: { label: 'Cancelada', color: 'bg-red-500', textColor: 'text-red-500', action: 'Ver Detalhes' },
  };

  const config = statusConfig[viagem.status as keyof typeof statusConfig] || statusConfig.planejada;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold">{viagem.codigo}</h3>
              <Badge className={config.color}>{config.label}</Badge>
            </div>
            {viagem.veiculo && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span className="text-sm">{viagem.veiculo.placa} - {viagem.veiculo.marca} {viagem.veiculo.modelo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rota */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Origem</p>
              <p className="font-semibold">{viagem.origem}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Destino</p>
              <p className="font-semibold">{viagem.destino}</p>
            </div>
          </div>
        </div>

        {/* Ação */}
        <Button 
          className="w-full h-14 text-lg font-semibold"
          onClick={() => navigate(`/motorista/viagem/${viagem.id}`)}
        >
          {config.action}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
