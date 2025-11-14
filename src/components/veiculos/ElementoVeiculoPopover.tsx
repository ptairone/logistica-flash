import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Unplug, AlertCircle, Calendar, Truck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ElementoVeiculoPopoverProps {
  children: React.ReactNode;
  elemento: {
    id: string;
    placa: string;
    tipo: string;
    marca?: string;
    modelo?: string;
    eixos: number;
    capacidade?: number;
    status?: string;
    vencimento_licenciamento?: string;
    vencimento_seguro?: string;
    observacoes?: string;
  };
  isReboque?: boolean;
  onDesacoplar?: () => void;
  onVerDetalhes?: () => void;
}

export const ElementoVeiculoPopover = ({
  children,
  elemento,
  isReboque = false,
  onDesacoplar,
  onVerDetalhes
}: ElementoVeiculoPopoverProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'disponivel': return 'bg-success/10 text-success border-success/20';
      case 'acoplado': return 'bg-primary/10 text-primary border-primary/20';
      case 'em_viagem': return 'bg-primary/10 text-primary border-primary/20';
      case 'manutencao': return 'bg-warning/10 text-warning border-warning/20';
      case 'inativo': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'acoplado': return 'Acoplado';
      case 'em_viagem': return 'Em Viagem';
      case 'manutencao': return 'Manutenção';
      case 'inativo': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const isVencido = (data?: string) => {
    if (!data) return false;
    return new Date(data) < new Date();
  };

  const hasAlerta = isVencido(elemento.vencimento_licenciamento) || isVencido(elemento.vencimento_seguro);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-base">{elemento.placa}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {elemento.marca} {elemento.modelo}
              </p>
            </div>
            <Badge variant="outline" className={getStatusColor(elemento.status)}>
              {getStatusLabel(elemento.status)}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Tipo</p>
              <p className="font-medium">{elemento.tipo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Eixos</p>
              <p className="font-medium">{elemento.eixos}</p>
            </div>
            {elemento.capacidade && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Capacidade</p>
                <p className="font-medium">{elemento.capacidade.toLocaleString('pt-BR')} kg</p>
              </div>
            )}
          </div>

          {(elemento.vencimento_licenciamento || elemento.vencimento_seguro) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Vencimentos
                </p>
                {elemento.vencimento_licenciamento && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Licenciamento</span>
                    <span className={isVencido(elemento.vencimento_licenciamento) ? 'text-destructive font-medium' : ''}>
                      {format(new Date(elemento.vencimento_licenciamento), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
                {elemento.vencimento_seguro && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Seguro</span>
                    <span className={isVencido(elemento.vencimento_seguro) ? 'text-destructive font-medium' : ''}>
                      {format(new Date(elemento.vencimento_seguro), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {hasAlerta && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-xs text-destructive">
                Documentos vencidos
              </p>
            </div>
          )}

          {elemento.observacoes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Observações</p>
                <p className="text-xs text-muted-foreground">{elemento.observacoes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            {isReboque && onDesacoplar && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onDesacoplar}
              >
                <Unplug className="h-4 w-4 mr-2" />
                Desacoplar
              </Button>
            )}
            {onVerDetalhes && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={onVerDetalhes}
              >
                Ver Detalhes
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
