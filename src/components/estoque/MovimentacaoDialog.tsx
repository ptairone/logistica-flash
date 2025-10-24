import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { movimentacaoEstoqueSchema, MovimentacaoEstoqueFormData, tipoMovimentacaoLabels } from '@/lib/validations-estoque';

interface MovimentacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MovimentacaoEstoqueFormData) => void;
  item: any;
  tipo: 'entrada' | 'saida' | 'ajuste';
}

export function MovimentacaoDialog({
  open,
  onOpenChange,
  onSubmit,
  item,
  tipo,
}: MovimentacaoDialogProps) {
  const form = useForm<MovimentacaoEstoqueFormData>({
    resolver: zodResolver(movimentacaoEstoqueSchema),
    defaultValues: {
      item_id: item?.id || '',
      tipo: tipo,
      quantidade: 0,
      custo_unitario: 0,
      motivo: '',
    },
  });

  const handleSubmit = (data: MovimentacaoEstoqueFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const quantidade = form.watch('quantidade');
  const estoqueInsuficiente = tipo === 'saida' && quantidade > item?.estoque_atual;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tipoMovimentacaoLabels[tipo]} - {item?.descricao}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="text-muted-foreground">Estoque atual:</p>
              <p className="font-semibold text-lg">
                {item?.estoque_atual} {item?.unidade}
              </p>
            </div>

            <FormField
              control={form.control}
              name="quantidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quantidade ({item?.unidade}) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder={tipo === 'ajuste' ? 'Novo valor do estoque' : 'Quantidade'}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {estoqueInsuficiente && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Estoque insuficiente. Disponível: {item?.estoque_atual} {item?.unidade}
                </AlertDescription>
              </Alert>
            )}

            {(tipo === 'entrada' || tipo === 'ajuste') && (
              <FormField
                control={form.control}
                name="custo_unitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Motivo {tipo === 'ajuste' && '*'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o motivo da movimentação"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={estoqueInsuficiente}>
                Confirmar {tipoMovimentacaoLabels[tipo]}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
