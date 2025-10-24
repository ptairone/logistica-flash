import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { categoriaLabels } from '@/lib/validations-estoque';

interface ItemEstoqueCardProps {
  item: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemEstoqueCard({ item, onView, onEdit, onDelete }: ItemEstoqueCardProps) {
  const isCritico = item.estoque_atual <= item.estoque_minimo;
  const percentualEstoque = item.estoque_minimo > 0 
    ? (item.estoque_atual / item.estoque_minimo) * 100 
    : 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{item.codigo}</h3>
              {isCritico && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Crítico
                </Badge>
              )}
              <Badge variant="outline">
                {categoriaLabels[item.categoria as keyof typeof categoriaLabels] || item.categoria}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.descricao}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <span className="text-muted-foreground">Estoque Atual:</span>
            <p className="font-semibold">
              {item.estoque_atual} {item.unidade}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Estoque Mínimo:</span>
            <p className="font-semibold">
              {item.estoque_minimo} {item.unidade}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Custo Médio:</span>
            <p className="font-semibold">
              R$ {item.custo_medio?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Local:</span>
            <p className="font-semibold truncate">
              {item.local || '-'}
            </p>
          </div>
        </div>

        {item.fornecedor && (
          <p className="text-xs text-muted-foreground mb-3">
            Fornecedor: {item.fornecedor}
          </p>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onView} className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Detalhes
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
