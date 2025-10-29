import { Truck, AlertTriangle, Calendar, Wrench, FileText, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateBR, isDateExpired, isDateExpiringSoon } from '@/lib/validations';

interface VeiculoCardProps {
  veiculo: any;
  onEdit: (veiculo: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (veiculo: any) => void;
}

export function VeiculoCard({ veiculo, onEdit, onDelete, onViewDetails }: VeiculoCardProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ativo: 'default',
      inativo: 'secondary',
      manutencao: 'destructive',
    };
    
    const labels: Record<string, string> = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      manutencao: 'Em Manutenção',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      caminhao: 'Caminhão',
      carreta: 'Carreta',
      utilitario: 'Utilitário',
      van: 'Van',
      outros: 'Outros',
    };
    return labels[tipo] || tipo;
  };

  const hasAlerts = 
    isDateExpired(veiculo.vencimento_ipva) ||
    isDateExpired(veiculo.vencimento_licenciamento) ||
    isDateExpired(veiculo.vencimento_seguro) ||
    isDateExpiringSoon(veiculo.vencimento_ipva) ||
    isDateExpiringSoon(veiculo.vencimento_licenciamento) ||
    isDateExpiringSoon(veiculo.vencimento_seguro) ||
    (veiculo.km_atual && veiculo.proxima_manutencao_km && veiculo.km_atual >= veiculo.proxima_manutencao_km);

  return (
    <Card 
      variant="premium" 
      className={hasAlerts ? 'border-warning/40' : 'hover:shadow-xl'}
    >
      {/* Header com Gradiente */}
      <div className="bg-gradient-to-r from-primary to-cyan p-4 rounded-t-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white font-display">{veiculo.placa}</CardTitle>
              <p className="text-sm text-white/90">
                {veiculo.marca} {veiculo.modelo}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(veiculo)}
              className="text-white hover:bg-white/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(veiculo.id)}
              className="text-white hover:bg-white/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none rounded-lg" />
      <CardContent className="space-y-3 relative pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Código:</span>
          <span className="text-sm font-medium">{veiculo.codigo_interno}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tipo:</span>
          <span className="text-sm font-medium">{getTipoLabel(veiculo.tipo)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge 
            variant={veiculo.status === 'ativo' ? 'default' : veiculo.status === 'manutencao' ? 'destructive' : 'secondary'}
            className={
              veiculo.status === 'ativo' 
                ? 'bg-gradient-success border-0 text-white' 
                : veiculo.status === 'manutencao'
                ? 'bg-gradient-warning border-0 text-white'
                : ''
            }
          >
            {veiculo.status === 'ativo' ? 'Ativo' : veiculo.status === 'manutencao' ? 'Em Manutenção' : 'Inativo'}
          </Badge>
        </div>

        {veiculo.km_atual && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">KM Atual:</span>
            <span className="text-sm font-medium">{veiculo.km_atual.toLocaleString('pt-BR')}</span>
          </div>
        )}

        {hasAlerts && (
          <div className="pt-3 border-t border-warning/20 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-warning to-destructive">
                <AlertTriangle className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-warning bg-clip-text text-transparent">Alertas</span>
            </div>
            <div className="space-y-1.5 bg-warning/5 rounded-lg p-2.5">
              {isDateExpired(veiculo.vencimento_ipva) && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                  <p className="text-xs font-medium text-destructive">IPVA vencido</p>
                </div>
              )}
              {isDateExpiringSoon(veiculo.vencimento_ipva) && !isDateExpired(veiculo.vencimento_ipva) && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                  <p className="text-xs font-medium text-warning">IPVA vence em breve</p>
                </div>
              )}
              {isDateExpired(veiculo.vencimento_licenciamento) && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                  <p className="text-xs font-medium text-destructive">Licenciamento vencido</p>
                </div>
              )}
              {isDateExpiringSoon(veiculo.vencimento_licenciamento) && !isDateExpired(veiculo.vencimento_licenciamento) && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                  <p className="text-xs font-medium text-warning">Licenciamento vence em breve</p>
                </div>
              )}
              {isDateExpired(veiculo.vencimento_seguro) && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                  <p className="text-xs font-medium text-destructive">Seguro vencido</p>
                </div>
              )}
              {isDateExpiringSoon(veiculo.vencimento_seguro) && !isDateExpired(veiculo.vencimento_seguro) && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                  <p className="text-xs font-medium text-warning">Seguro vence em breve</p>
                </div>
              )}
              {veiculo.km_atual && veiculo.proxima_manutencao_km && veiculo.km_atual >= veiculo.proxima_manutencao_km && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                  <p className="text-xs font-medium text-warning">Manutenção necessária</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => onViewDetails(veiculo)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
