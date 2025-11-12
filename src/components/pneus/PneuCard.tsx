import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Activity, Wrench } from 'lucide-react';
import { statusPneuLabels, tipoPneuLabels, getPosicaoLabel, getProfundidadeColor } from '@/lib/validations-pneu';
import { format } from 'date-fns';

interface PneuCardProps {
  pneu: any;
  onEdit: (pneu: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (pneu: any) => void;
  onMedir: (pneu: any) => void;
  onInstalar: (pneu: any) => void;
}

export function PneuCard({ pneu, onEdit, onDelete, onViewDetails, onMedir, onInstalar }: PneuCardProps) {
  const isCritico = pneu.profundidade_sulco_mm && pneu.profundidade_sulco_mm <= (pneu.profundidade_minima_mm || 1.6);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'em_uso': return 'default';
      case 'estoque': return 'secondary';
      case 'recapagem': return 'outline';
      case 'descartado': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{pneu.numero_serie}</h3>
            <p className="text-sm text-muted-foreground">{pneu.codigo_interno}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant={getStatusBadgeVariant(pneu.status)}>
              {statusPneuLabels[pneu.status]}
            </Badge>
            {isCritico && (
              <Badge variant="destructive" className="text-xs">
                Crítico
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Marca/Modelo</p>
            <p className="font-medium">{pneu.marca} {pneu.modelo}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Medida</p>
            <p className="font-medium">{pneu.medida}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tipo</p>
            <p className="font-medium">{tipoPneuLabels[pneu.tipo]}</p>
          </div>
          {pneu.profundidade_sulco_mm && (
            <div>
              <p className="text-muted-foreground">Profundidade</p>
              <p className={`font-medium ${getProfundidadeColor(pneu.profundidade_sulco_mm, pneu.profundidade_minima_mm)}`}>
                {pneu.profundidade_sulco_mm.toFixed(2)} mm
              </p>
            </div>
          )}
        </div>

        {pneu.status === 'em_uso' && pneu.veiculo && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">Instalado em</p>
            <p className="font-medium text-sm">{pneu.veiculo.placa}</p>
            {pneu.posicao_veiculo && (
              <p className="text-xs text-muted-foreground">{getPosicaoLabel(pneu.posicao_veiculo)}</p>
            )}
            {pneu.km_rodados > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {pneu.km_rodados.toLocaleString()} km rodados
              </p>
            )}
          </div>
        )}

        {pneu.numero_recapagens > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {pneu.numero_recapagens} recapagen{pneu.numero_recapagens > 1 ? 's' : 's'}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(pneu)}>
            <Eye className="h-4 w-4" />
          </Button>
          {pneu.status === 'estoque' && (
            <Button variant="ghost" size="sm" onClick={() => onInstalar(pneu)}>
              <Wrench className="h-4 w-4" />
            </Button>
          )}
          {pneu.status === 'em_uso' && (
            <Button variant="ghost" size="sm" onClick={() => onMedir(pneu)}>
              <Activity className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(pneu)}>
            <Edit className="h-4 w-4" />
          </Button>
          {pneu.status === 'estoque' && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(pneu.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
