import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Key } from 'lucide-react';
import { statusMecanicoLabels } from '@/lib/validations-manutencao';

interface MecanicoCardProps {
  mecanico: any;
  onEdit: () => void;
  onDelete: () => void;
  onCriarLogin: () => void;
}

export function MecanicoCard({ mecanico, onEdit, onDelete, onCriarLogin }: MecanicoCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'default';
      case 'ferias':
        return 'secondary';
      case 'inativo':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{mecanico.nome}</h3>
              <p className="text-sm text-muted-foreground">CPF: {mecanico.cpf}</p>
            </div>
          </div>
          <Badge variant={getStatusVariant(mecanico.status)}>
            {statusMecanicoLabels[mecanico.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {mecanico.telefone && (
          <div className="text-sm">
            <span className="text-muted-foreground">Telefone:</span> {mecanico.telefone}
          </div>
        )}

        {mecanico.email && (
          <div className="text-sm">
            <span className="text-muted-foreground">Email:</span> {mecanico.email}
          </div>
        )}

        {mecanico.especialidades && mecanico.especialidades.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Especialidades:</p>
            <div className="flex flex-wrap gap-1">
              {mecanico.especialidades.map((esp: string) => (
                <Badge key={esp} variant="outline" className="text-xs">
                  {esp}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!mecanico.user_id && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCriarLogin}
              className="flex-1"
            >
              <Key className="h-4 w-4 mr-1" />
              Criar Login
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
