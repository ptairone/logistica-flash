import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Gauge, 
  DollarSign, 
  User, 
  Truck,
  Eye,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prioridadeLabels, statusManutencaoLabels } from "@/lib/validations-manutencao";

interface ManutencaoCardProps {
  manutencao: any;
  onView: () => void;
  onEdit: () => void;
  onStatusChange?: (newStatus: string) => void;
  onDelete?: () => void;
}

const statusColors = {
  agendada: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  em_andamento: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  concluida: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelada: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const prioridadeColors = {
  baixa: "text-muted-foreground",
  media: "text-blue-600",
  alta: "text-orange-600",
  urgente: "text-red-600",
};

export function ManutencaoCard({ 
  manutencao, 
  onView, 
  onEdit,
  onStatusChange,
  onDelete 
}: ManutencaoCardProps) {
  const statusColor = statusColors[manutencao.status as keyof typeof statusColors] || statusColors.agendada;
  const prioridadeColor = prioridadeColors[manutencao.prioridade as keyof typeof prioridadeColors] || prioridadeColors.media;

  const canStart = manutencao.status === 'agendada';
  const canConclude = manutencao.status === 'em_andamento';
  const canCancel = manutencao.status !== 'concluida' && manutencao.status !== 'cancelada';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusColor}>
                {statusManutencaoLabels[manutencao.status] || manutencao.status}
              </Badge>
              <div className={`flex items-center gap-1 ${prioridadeColor}`}>
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {prioridadeLabels[manutencao.prioridade] || manutencao.prioridade}
                </span>
              </div>
            </div>
            <h3 className="font-semibold text-lg truncate">{manutencao.tipo}</h3>
            {manutencao.descricao && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {manutencao.descricao}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-3">
        <div className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {manutencao.veiculo?.codigo_interno || 'N/A'}
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="text-muted-foreground">
            {manutencao.veiculo?.placa || 'N/A'}
          </span>
        </div>

        {manutencao.mecanico && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{manutencao.mecanico.nome}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(manutencao.data), "dd/MM/yyyy", { locale: ptBR })}</span>
        </div>

        {manutencao.km_veiculo && (
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span>{manutencao.km_veiculo.toLocaleString('pt-BR')} km</span>
          </div>
        )}

        {manutencao.custo && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(manutencao.custo)}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
        {canStart && onStatusChange && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onStatusChange('em_andamento')}
          >
            <Play className="h-4 w-4 mr-1" />
            Iniciar
          </Button>
        )}
        {canConclude && onStatusChange && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onStatusChange('concluida')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluir
          </Button>
        )}
        {canCancel && onStatusChange && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onStatusChange('cancelada')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
