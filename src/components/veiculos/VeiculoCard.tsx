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
    <Card className={hasAlerts ? 'border-warning' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{veiculo.placa}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {veiculo.marca} {veiculo.modelo}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(veiculo)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(veiculo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Código:</span>
          <span className="text-sm font-medium">{veiculo.codigo_interno}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tipo:</span>
          <span className="text-sm">{getTipoLabel(veiculo.tipo)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(veiculo.status)}
        </div>

        {veiculo.km_atual && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">KM Atual:</span>
            <span className="text-sm font-medium">{veiculo.km_atual.toLocaleString('pt-BR')}</span>
          </div>
        )}

        {hasAlerts && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Alertas</span>
            </div>
            <div className="mt-2 space-y-1">
              {isDateExpired(veiculo.vencimento_ipva) && (
                <p className="text-xs text-destructive">IPVA vencido</p>
              )}
              {isDateExpiringSoon(veiculo.vencimento_ipva) && !isDateExpired(veiculo.vencimento_ipva) && (
                <p className="text-xs text-warning">IPVA vence em breve</p>
              )}
              {isDateExpired(veiculo.vencimento_licenciamento) && (
                <p className="text-xs text-destructive">Licenciamento vencido</p>
              )}
              {isDateExpiringSoon(veiculo.vencimento_licenciamento) && !isDateExpired(veiculo.vencimento_licenciamento) && (
                <p className="text-xs text-warning">Licenciamento vence em breve</p>
              )}
              {isDateExpired(veiculo.vencimento_seguro) && (
                <p className="text-xs text-destructive">Seguro vencido</p>
              )}
              {isDateExpiringSoon(veiculo.vencimento_seguro) && !isDateExpired(veiculo.vencimento_seguro) && (
                <p className="text-xs text-warning">Seguro vence em breve</p>
              )}
              {veiculo.km_atual && veiculo.proxima_manutencao_km && veiculo.km_atual >= veiculo.proxima_manutencao_km && (
                <p className="text-xs text-warning">Manutenção necessária</p>
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
