import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Truck } from "lucide-react";

interface ElementoVeiculoTooltipProps {
  children: React.ReactNode;
  placa: string;
  tipo: string;
  eixos: number;
  capacidade?: number;
  status?: string;
}

export const ElementoVeiculoTooltip = ({
  children,
  placa,
  tipo,
  eixos,
  capacidade,
  status
}: ElementoVeiculoTooltipProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'disponivel': return 'text-success';
      case 'em_viagem': return 'text-primary';
      case 'manutencao': return 'text-warning';
      case 'inativo': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'em_viagem': return 'Em Viagem';
      case 'manutencao': return 'Manutenção';
      case 'inativo': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <p className="font-bold text-sm">{placa}</p>
            </div>
            <p className="text-xs text-muted-foreground">{tipo}</p>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span>Eixos: {eixos}</span>
              {capacidade && <span>Cap: {capacidade.toLocaleString('pt-BR')} kg</span>}
            </div>
            {status && (
              <p className={`text-xs font-medium ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
