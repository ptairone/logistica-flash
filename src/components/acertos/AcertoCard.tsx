import { DollarSign, User, Calendar, CheckCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateBR } from '@/lib/validations';

interface AcertoCardProps {
  acerto: any;
  onEdit: (acerto: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (acerto: any) => void;
}

export function AcertoCard({ acerto, onEdit, onDelete, onViewDetails }: AcertoCardProps) {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; class?: string }> = {
      aberto: { variant: 'outline', label: 'Aberto', class: 'border-yellow-500 text-yellow-700' },
      fechado: { variant: 'default', label: 'Fechado', class: 'bg-blue-500' },
      pago: { variant: 'default', label: 'Pago', class: 'bg-green-500' },
    };
    
    const { variant, label, class: className } = config[status] || { variant: 'default', label: status };

    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{acerto.codigo}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <User className="h-3 w-3" />
              {acerto.motorista?.nome}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(acerto)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {acerto.status === 'aberto' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(acerto)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {(acerto.status === 'aberto' || acerto.status === 'fechado') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(acerto.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatDateBR(acerto.periodo_inicio)} até {formatDateBR(acerto.periodo_fim)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(acerto.status)}
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Comissão:</span>
            <span className="font-medium">
              R$ {acerto.valor_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reembolsos:</span>
            <span className="font-medium">
              R$ {acerto.total_reembolsos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground">Total a Pagar:</span>
            <span className="text-lg font-bold text-primary">
              R$ {acerto.total_pagar?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
        </div>

        {acerto.status === 'pago' && acerto.data_pagamento && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <CheckCircle className="h-3 w-3 text-primary" />
            Pago em {formatDateBR(acerto.data_pagamento)}
            {acerto.forma_pagamento && ` via ${acerto.forma_pagamento}`}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => onViewDetails(acerto)}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
