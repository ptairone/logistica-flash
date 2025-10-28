import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Gauge, DollarSign, User, Truck, Package, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prioridadeLabels, statusManutencaoLabels } from "@/lib/validations-manutencao";
import { useManutencoesItens } from "@/hooks/useManutencoes";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEstoque } from "@/hooks/useEstoque";
import { toast } from "sonner";

interface ManutencaoDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manutencao: any;
}

export function ManutencaoDetailsDialog({
  open,
  onOpenChange,
  manutencao,
}: ManutencaoDetailsDialogProps) {
  const { itens, addItem, removeItem } = useManutencoesItens(manutencao?.id);
  const { itens: itensEstoque } = useEstoque();
  const [selectedItem, setSelectedItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [custoUnitario, setCustoUnitario] = useState("");

  if (!manutencao) return null;

  const handleAddItem = async () => {
    if (!selectedItem || !quantidade) {
      toast.error("Selecione um item e informe a quantidade");
      return;
    }

    const itemEstoque = itensEstoque.find(i => i.id === selectedItem);
    if (!itemEstoque) return;

    try {
      await addItem.mutateAsync({
        manutencao_id: manutencao.id,
        item_id: selectedItem,
        quantidade: Number(quantidade),
        custo_unitario: custoUnitario ? Number(custoUnitario) : itemEstoque.custo_medio || 0,
      });
      setSelectedItem("");
      setQuantidade("");
      setCustoUnitario("");
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem.mutateAsync(itemId);
    } catch (error) {
      console.error("Erro ao remover item:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes da Manutenção</span>
            <div className="flex gap-2">
              <Badge variant="outline">
                {statusManutencaoLabels[manutencao.status]}
              </Badge>
              <Badge variant="outline">
                {prioridadeLabels[manutencao.prioridade]}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="detalhes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="itens">Itens Utilizados</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Tipo</div>
                <div className="font-medium">{manutencao.tipo}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Data</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(manutencao.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Veículo</div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {manutencao.veiculo?.codigo_interno} - {manutencao.veiculo?.placa}
                  </span>
                </div>
              </div>

              {manutencao.mecanico && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Mecânico</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{manutencao.mecanico.nome}</span>
                  </div>
                </div>
              )}

              {manutencao.km_veiculo && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">KM do Veículo</div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span>{manutencao.km_veiculo.toLocaleString('pt-BR')} km</span>
                  </div>
                </div>
              )}

              {manutencao.custo && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Custo</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(manutencao.custo)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {manutencao.descricao && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Descrição</div>
                <div className="text-sm">{manutencao.descricao}</div>
              </div>
            )}

            {manutencao.fornecedor && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Fornecedor</div>
                <div className="text-sm">{manutencao.fornecedor}</div>
              </div>
            )}

            {manutencao.observacoes && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Observações</div>
                <div className="text-sm">{manutencao.observacoes}</div>
              </div>
            )}

            {(manutencao.proxima_manutencao_km || manutencao.proxima_manutencao_data) && (
              <div className="border-t pt-4 space-y-2">
                <div className="text-sm font-medium">Próxima Manutenção</div>
                {manutencao.proxima_manutencao_km && (
                  <div className="text-sm text-muted-foreground">
                    KM: {manutencao.proxima_manutencao_km.toLocaleString('pt-BR')}
                  </div>
                )}
                {manutencao.proxima_manutencao_data && (
                  <div className="text-sm text-muted-foreground">
                    Data: {format(new Date(manutencao.proxima_manutencao_data), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="itens" className="space-y-4 mt-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Adicionar Item do Estoque
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Selecione o item" />
                  </SelectTrigger>
                  <SelectContent>
                    {itensEstoque.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.codigo} - {item.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Qtd"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
                <Button onClick={handleAddItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {itens.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum item utilizado nesta manutenção
                </div>
              ) : (
                itens.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.item?.codigo} - {item.item?.descricao}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantidade: {item.quantidade} {item.item?.unidade}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Custo Unit.</div>
                        <div className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(item.custo_unitario)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <div className="text-center text-muted-foreground py-8">
              Histórico de alterações em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
