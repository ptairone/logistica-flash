import { Package, AlertTriangle, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVerificarDivergenciaPneus } from "@/hooks/useEstoque";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ItemEstoquePneuCardProps {
  item: any;
  onCadastrarLote: (itemId: string) => void;
}

export function ItemEstoquePneuCard({ item, onCadastrarLote }: ItemEstoquePneuCardProps) {
  const navigate = useNavigate();
  const { hasDivergencia, diferenca, qtdEstoque, qtdPneusCadastrados } = 
    useVerificarDivergenciaPneus(item.id);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">{item.descricao}</h3>
              <p className="text-sm text-muted-foreground">Código: {item.codigo}</p>
            </div>
          </div>
          {item.estoque_atual <= (item.estoque_minimo || 0) && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Crítico
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Estoque Atual</p>
            <p className="font-semibold text-lg">{qtdEstoque}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pneus Cadastrados</p>
            <p className="font-semibold text-lg">{qtdPneusCadastrados}</p>
          </div>
        </div>

        {hasDivergencia && (
          <Alert variant={diferenca > 0 ? "default" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {diferenca > 0 
                ? `${diferenca} pneu(s) no estoque sem cadastro individual`
                : `${Math.abs(diferenca)} pneu(s) cadastrado(s) a mais que o estoque`
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Estoque Mínimo</p>
            <p className="font-medium">{item.estoque_minimo || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Custo Médio</p>
            <p className="font-medium">
              {item.custo_medio 
                ? `R$ ${parseFloat(item.custo_medio).toFixed(2)}`
                : '-'
              }
            </p>
          </div>
        </div>

        {item.local && (
          <div className="text-sm">
            <p className="text-muted-foreground">Localização</p>
            <p className="font-medium">{item.local}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/pneus?item_estoque_id=${item.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Pneus
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onCadastrarLote(item.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Pneus
        </Button>
      </CardFooter>
    </Card>
  );
}
