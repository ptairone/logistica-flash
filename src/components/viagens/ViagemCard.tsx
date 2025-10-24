import { MapPin, Calendar, DollarSign, Edit, Trash2, Eye, PlayCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateBR } from '@/lib/validations';
import { useViagens } from '@/hooks/useViagens';

interface ViagemCardProps {
  viagem: any;
  onEdit: (viagem: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (viagem: any) => void;
}

export function ViagemCard({ viagem, onEdit, onDelete, onViewDetails }: ViagemCardProps) {
  const { registrarPartida, registrarChegada } = useViagens();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      planejada: 'secondary',
      em_andamento: 'default',
      concluida: 'outline',
      cancelada: 'destructive',
    };
    
    const labels: Record<string, string> = {
      planejada: 'Planejada',
      em_andamento: 'Em Andamento',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const handlePartida = (e: React.MouseEvent) => {
    e.stopPropagation();
    registrarPartida.mutate(viagem.id);
  };

  const handleChegada = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Aqui você pode adicionar um dialog para pedir o KM percorrido
    registrarChegada.mutate({ id: viagem.id });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{viagem.codigo}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {viagem.veiculo?.placa} • {viagem.motorista?.nome}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(viagem)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(viagem)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(viagem.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
          <div className="flex-1 space-y-1">
            <p className="font-medium">{viagem.origem}</p>
            <p className="text-muted-foreground">→ {viagem.destino}</p>
          </div>
        </div>

        {viagem.frete && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Frete: {viagem.frete.codigo}</p>
              <p className="text-muted-foreground">
                R$ {viagem.frete.valor_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(viagem.status)}
        </div>

        {viagem.data_saida && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-muted-foreground">Saída: </span>
              <span className="font-medium">{formatDateBR(viagem.data_saida)}</span>
            </div>
          </div>
        )}

        {viagem.data_chegada && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-muted-foreground">Chegada: </span>
              <span className="font-medium">{formatDateBR(viagem.data_chegada)}</span>
            </div>
          </div>
        )}

        {viagem.km_percorrido && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">KM Percorrido:</span>
            <span className="font-medium">{viagem.km_percorrido.toLocaleString('pt-BR')} km</span>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="flex gap-2 pt-2">
          {viagem.status === 'planejada' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={handlePartida}
              disabled={registrarPartida.isPending}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Iniciar Viagem
            </Button>
          )}

          {viagem.status === 'em_andamento' && (
            <Button
              size="sm"
              className="flex-1"
              variant="outline"
              onClick={handleChegada}
              disabled={registrarChegada.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Registrar Chegada
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(viagem)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
