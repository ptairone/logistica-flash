import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, TruckIcon } from 'lucide-react';
import { getTipoReboqueLabel, getStatusReboqueLabel } from '@/lib/validations-reboque';

interface ReboqueCardProps {
  reboque: any;
  onEdit: (reboque: any) => void;
  onDelete: (id: string) => void;
}

export function ReboqueCard({ reboque, onEdit, onDelete }: ReboqueCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'acoplado':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'manutencao':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'inativo':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">{reboque.placa}</h3>
              <p className="text-sm text-muted-foreground">{reboque.codigo_interno}</p>
            </div>
          </div>
          <Badge className={getStatusColor(reboque.status)}>
            {getStatusReboqueLabel(reboque.status)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium">{getTipoReboqueLabel(reboque.tipo)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marca/Modelo:</span>
            <span className="font-medium">{reboque.marca} {reboque.modelo}</span>
          </div>
          {reboque.ano && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ano:</span>
              <span className="font-medium">{reboque.ano}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eixos:</span>
            <span className="font-medium">{reboque.numero_eixos}</span>
          </div>
          {reboque.capacidade_kg && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacidade:</span>
              <span className="font-medium">{reboque.capacidade_kg.toLocaleString()} kg</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(reboque)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(reboque.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
