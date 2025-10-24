import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, ArrowUp, ArrowDown, Edit3, AlertTriangle } from 'lucide-react';
import { useMovimentacoesEstoque } from '@/hooks/useEstoque';
import { categoriaLabels, tipoMovimentacaoLabels } from '@/lib/validations-estoque';
import { MovimentacaoDialog } from './MovimentacaoDialog';

interface ItemEstoqueDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
}

export function ItemEstoqueDetailsDialog({
  open,
  onOpenChange,
  item,
}: ItemEstoqueDetailsDialogProps) {
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  const [tipoMov, setTipoMov] = useState<'entrada' | 'saida' | 'ajuste'>('entrada');
  const { movimentacoes, isLoading, createMovimentacao } = useMovimentacoesEstoque(item?.id);

  const isCritico = item && item.estoque_atual <= item.estoque_minimo;

  const handleNovaMovimentacao = (tipo: 'entrada' | 'saida' | 'ajuste') => {
    setTipoMov(tipo);
    setMovDialogOpen(true);
  };

  const handleSubmitMovimentacao = (data: any) => {
    createMovimentacao.mutate({
      ...data,
      item_id: item.id,
    });
  };

  if (!item) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {item.codigo} - {item.descricao}
              {isCritico && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Estoque Crítico
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Estoque Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {item.estoque_atual} {item.unidade}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Estoque Mínimo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {item.estoque_minimo} {item.unidade}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Custo Médio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      R$ {item.custo_medio?.toFixed(2) || '0.00'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoria:</span>
                  <p className="font-semibold">
                    {categoriaLabels[item.categoria as keyof typeof categoriaLabels]}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Unidade:</span>
                  <p className="font-semibold">{item.unidade}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Local:</span>
                  <p className="font-semibold">{item.local || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fornecedor:</span>
                  <p className="font-semibold">{item.fornecedor || '-'}</p>
                </div>
              </div>

              {item.observacoes && (
                <div>
                  <span className="text-sm text-muted-foreground">Observações:</span>
                  <p className="text-sm mt-1">{item.observacoes}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="movimentacoes" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleNovaMovimentacao('entrada')}
                  className="flex items-center gap-1"
                >
                  <ArrowUp className="h-4 w-4" />
                  Entrada
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNovaMovimentacao('saida')}
                  className="flex items-center gap-1"
                >
                  <ArrowDown className="h-4 w-4" />
                  Saída
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNovaMovimentacao('ajuste')}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="h-4 w-4" />
                  Ajuste
                </Button>
              </div>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : movimentacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma movimentação registrada
                </p>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Custo Unit.</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Usuário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoes.map((mov: any) => (
                        <TableRow key={mov.id}>
                          <TableCell>
                            {new Date(mov.data).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                mov.tipo === 'entrada' 
                                  ? 'default' 
                                  : mov.tipo === 'saida' 
                                  ? 'secondary' 
                                  : 'outline'
                              }
                            >
                              {tipoMovimentacaoLabels[mov.tipo as keyof typeof tipoMovimentacaoLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {mov.quantidade} {item.unidade}
                          </TableCell>
                          <TableCell>
                            {mov.custo_unitario 
                              ? `R$ ${mov.custo_unitario.toFixed(2)}` 
                              : '-'}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {mov.motivo || '-'}
                          </TableCell>
                          <TableCell>
                            {mov.usuario?.nome || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Consumo - Últimos 30 dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Relatório em desenvolvimento
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <MovimentacaoDialog
        open={movDialogOpen}
        onOpenChange={setMovDialogOpen}
        onSubmit={handleSubmitMovimentacao}
        item={item}
        tipo={tipoMov}
      />
    </>
  );
}
