import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, DollarSign, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

interface AcertoCLTCardProps {
  acerto: any;
  onView: (acerto: any) => void;
  onEdit: (acerto: any) => void;
  onDelete: (acerto: any) => void;
}

export function AcertoCLTCard({ acerto, onView, onEdit, onDelete }: AcertoCLTCardProps) {
  const statusColors: Record<string, string> = {
    aberto: "bg-yellow-500",
    aprovado: "bg-blue-500",
    pago: "bg-green-500",
    cancelado: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    aberto: "Aberto",
    aprovado: "Aprovado",
    pago: "Pago",
    cancelado: "Cancelado",
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{acerto.codigo}</h3>
            <Badge className={statusColors[acerto.status || "aberto"]}>
              {statusLabels[acerto.status || "aberto"]}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(acerto)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{acerto.motorista?.nome}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(acerto.periodo_inicio), "dd/MM/yyyy")} -{" "}
            {format(new Date(acerto.periodo_fim), "dd/MM/yyyy")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{acerto.dias_trabalhados || 0} dias trabalhados</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>HE: {acerto.total_horas_extras?.toFixed(1) || 0}h</span>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(acerto.total_liquido || 0)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1" onClick={() => onView(acerto)}>
          <Eye className="h-4 w-4 mr-2" />
          Detalhes
        </Button>
        <Button variant="default" className="flex-1" onClick={() => onEdit(acerto)}>
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
}
