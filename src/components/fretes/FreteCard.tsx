import { Package, MapPin, DollarSign, Edit, Trash2, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      aberto: 'secondary',
      faturado: 'default',
      cancelado: 'destructive',
    };
    
    const labels: Record<string, string> = {
      aberto: 'Aberto',
      faturado: 'Faturado',
      cancelado: 'Cancelado',
    };

    const icons: Record<string, any> = {
      aberto: AlertTriangle,
      faturado: CheckCircle,
      cancelado: null,
    };

    const Icon = icons[status];

    return (
      <Badge variant={variants[status] || 'default'} className="gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{frete.codigo}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {frete.cliente_nome}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(frete)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(frete)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(frete.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">{frete.origem}</p>
            <p className="text-muted-foreground">→ {frete.destino}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(frete.status)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Valor:</span>
          <span className="text-lg font-bold text-primary">
            R$ {frete.valor_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </span>
        </div>

        {frete.data_coleta && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coleta:</span>
            <span>{formatDateBR(frete.data_coleta)}</span>
          </div>
        )}

        {frete.status === 'faturado' && frete.numero_fatura && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <CheckCircle className="h-3 w-3 text-primary" />
            Fatura: {frete.numero_fatura}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => onViewDetails(frete)}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
