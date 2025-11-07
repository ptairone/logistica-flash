import { Package, MapPin, Edit, Trash2, CheckCircle, AlertTriangle, Building2, ArrowRight, Clock, Fuel } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateBR } from '@/lib/validations';

interface FreteCardProps {
  frete: any;
  onEdit: (frete: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (frete: any) => void;
}

export function FreteCard({ frete, onEdit, onDelete, onViewDetails }: FreteCardProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: 'default' | 'secondary' | 'destructive', label: string, icon: any, cardColor: any }> = {
      aberto: { 
        variant: 'secondary', 
        label: 'Aberto', 
        icon: AlertTriangle,
        cardColor: { variant: 'gradient', colorScheme: 'warning' }
      },
      faturado: { 
        variant: 'default', 
        label: 'Faturado', 
        icon: CheckCircle,
        cardColor: { variant: 'gradient', colorScheme: 'success' }
      },
      cancelado: { 
        variant: 'destructive', 
        label: 'Cancelado', 
        icon: null,
        cardColor: { variant: 'default', colorScheme: 'default' }
      },
    };
    
    return configs[status] || configs.aberto;
  };

  const statusConfig = getStatusConfig(frete.status);
  const StatusIcon = statusConfig.icon;
  
  // Calcula se tem margem positiva ou negativa
  const temMargem = frete.margem_estimada !== null && frete.margem_estimada !== undefined;
  const margemPositiva = temMargem && frete.margem_estimada > 0;

  return (
    <Card 
      {...statusConfig.cardColor}
      className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-primary flex-shrink-0" />
              <h3 className="text-xl font-bold truncate">{frete.codigo}</h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{frete.cliente_nome}</span>
            </div>
          </div>
          <Badge variant={statusConfig.variant} className="gap-1 flex-shrink-0">
            {StatusIcon && <StatusIcon className="h-3 w-3" />}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Rota */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">
                {frete.origem_cidade || frete.origem}
                {frete.origem_uf && <span className="text-muted-foreground ml-1">- {frete.origem_uf}</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pl-6">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            {frete.distancia_estimada_km && (
              <span className="text-xs font-medium text-primary">
                {frete.distancia_estimada_km} km
              </span>
            )}
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">
                {frete.destino_cidade || frete.destino}
                {frete.destino_uf && <span className="text-muted-foreground ml-1">- {frete.destino_uf}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Financeiro - Destaque */}
        <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor do Frete</span>
            <span className="text-2xl font-bold text-primary">
              R$ {frete.valor_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
          
          {temMargem && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground">Margem</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-bold ${margemPositiva ? 'text-success' : 'text-destructive'}`}>
                  {margemPositiva ? '+' : ''}R$ {frete.margem_estimada.toFixed(2)}
                </span>
                {frete.percentual_margem && (
                  <span className={`text-xs font-medium ${margemPositiva ? 'text-success/70' : 'text-destructive/70'}`}>
                    ({frete.percentual_margem > 0 ? '+' : ''}{frete.percentual_margem.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Estimativas Compactas */}
        {(frete.pedagios_estimados > 0 || frete.combustivel_estimado_litros || frete.tempo_estimado_horas) && (
          <div className="flex flex-wrap gap-2">
            {frete.pedagios_estimados > 0 && (
              <Badge variant="outline" className="gap-1.5 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                <span className="text-sm">🛣️</span>
                <span className="text-xs font-semibold">R$ {frete.pedagios_estimados.toFixed(2)}</span>
              </Badge>
            )}
            
            {frete.combustivel_estimado_litros && (
              <Badge variant="outline" className="gap-1.5 bg-success/10 border-success/20">
                <Fuel className="h-3 w-3" />
                <span className="text-xs font-semibold">{frete.combustivel_estimado_litros}L</span>
              </Badge>
            )}
            
            {frete.tempo_estimado_horas && (
              <Badge variant="outline" className="gap-1.5">
                <Clock className="h-3 w-3" />
                <span className="text-xs font-semibold">{frete.tempo_estimado_horas}h</span>
              </Badge>
            )}
          </div>
        )}

        {/* Informações Adicionais */}
        {(frete.data_coleta || (frete.status === 'faturado' && frete.numero_fatura)) && (
          <div className="space-y-1.5 pt-2 border-t text-xs">
            {frete.data_coleta && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Coleta:</span>
                <span className="font-medium">{formatDateBR(frete.data_coleta)}</span>
              </div>
            )}
            
            {frete.status === 'faturado' && frete.numero_fatura && (
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle className="h-3 w-3" />
                <span>Fatura: {frete.numero_fatura}</span>
              </div>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onViewDetails(frete)}
          >
            Ver Detalhes
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(frete)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(frete.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
