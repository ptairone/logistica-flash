import { User, Phone, CreditCard, AlertTriangle, CheckCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateBR } from '@/lib/validations';
import { verificarValidadeCNH } from '@/lib/validations-motorista';

interface MotoristaCardProps {
  motorista: any;
  onEdit: (motorista: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (motorista: any) => void;
}

export function MotoristaCard({ motorista, onEdit, onDelete, onViewDetails }: MotoristaCardProps) {
  const validadeCNH = verificarValidadeCNH(motorista.validade_cnh);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary'> = {
      ativo: 'default',
      inativo: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status === 'ativo' ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  return (
    <Card className={validadeCNH.vencida || validadeCNH.venceEmBreve ? 'border-warning' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{motorista.nome}</CardTitle>
              <p className="text-sm text-muted-foreground">
                CNH: {motorista.cnh}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(motorista)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(motorista)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(motorista.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{motorista.telefone}</span>
        </div>

        {motorista.email && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">E-mail:</span>
            <span className="truncate">{motorista.email}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(motorista.status)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Validade CNH:</span>
          <span className="text-sm">{formatDateBR(motorista.validade_cnh)}</span>
        </div>

        {validadeCNH.vencida && (
          <div className="flex items-center gap-2 text-xs text-destructive pt-2 border-t">
            <AlertTriangle className="h-3 w-3" />
            CNH vencida há {Math.abs(validadeCNH.diasRestantes)} dias
          </div>
        )}

        {validadeCNH.venceEmBreve && !validadeCNH.vencida && (
          <div className="flex items-center gap-2 text-xs text-warning pt-2 border-t">
            <AlertTriangle className="h-3 w-3" />
            CNH vence em {validadeCNH.diasRestantes} dias
          </div>
        )}

        {motorista.comissao_padrao && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Comissão:</span>
            <span className="font-medium">{motorista.comissao_padrao}%</span>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => onViewDetails(motorista)}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
