import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pneuSchema, PneuFormData, tiposPneu, statusPneuOptions } from '@/lib/validations-pneu';
import { useEstoque } from '@/hooks/useEstoque';
import { useEffect } from 'react';

interface PneuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PneuFormData) => void;
  pneu?: any;
  isLoading?: boolean;
}

export function PneuDialog({ open, onOpenChange, onSubmit, pneu, isLoading }: PneuDialogProps) {
  const { itens: itensEstoque } = useEstoque();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PneuFormData>({
    resolver: zodResolver(pneuSchema),
    defaultValues: {
      profundidade_minima_mm: 1.6,
      tipo: 'traseiro',
    },
  });

  

  useEffect(() => {
    if (pneu) {
      reset({
        numero_serie: pneu.numero_serie,
        codigo_interno: pneu.codigo_interno,
        marca: pneu.marca,
        modelo: pneu.modelo,
        medida: pneu.medida,
        tipo: pneu.tipo,
        item_estoque_id: pneu.item_estoque_id || undefined,
        data_compra: pneu.data_compra || undefined,
        fornecedor: pneu.fornecedor || undefined,
        valor_compra: pneu.valor_compra || undefined,
        profundidade_sulco_mm: pneu.profundidade_sulco_mm || undefined,
        profundidade_minima_mm: pneu.profundidade_minima_mm || 1.6,
        observacoes: pneu.observacoes || undefined,
      });
    } else {
      reset({
        profundidade_minima_mm: 1.6,
        tipo: 'traseiro',
      });
    }
  }, [pneu, reset]);

  const handleFormSubmit = (data: PneuFormData) => {
    const submitData = {
      ...data,
      status: pneu?.status || 'estoque',
    };
    onSubmit(submitData);
  };

  const itensEstoquePneus = itensEstoque.filter((item: any) => 
    item.categoria?.toLowerCase().includes('pneu') || 
    item.descricao?.toLowerCase().includes('pneu')
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pneu ? 'Editar Pneu' : 'Novo Pneu'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série *</Label>
              <Input
                id="numero_serie"
                {...register('numero_serie')}
                placeholder="Ex: DOT4521ABC123"
              />
              {errors.numero_serie && (
                <p className="text-sm text-destructive">{errors.numero_serie.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo_interno">Código Interno *</Label>
              <Input
                id="codigo_interno"
                {...register('codigo_interno')}
                placeholder="Ex: PNE001"
              />
              {errors.codigo_interno && (
                <p className="text-sm text-destructive">{errors.codigo_interno.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                {...register('marca')}
                placeholder="Ex: Michelin, Pirelli"
              />
              {errors.marca && (
                <p className="text-sm text-destructive">{errors.marca.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                {...register('modelo')}
                placeholder="Ex: XZE, Formula"
              />
              {errors.modelo && (
                <p className="text-sm text-destructive">{errors.modelo.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medida">Medida *</Label>
              <Input
                id="medida"
                {...register('medida')}
                placeholder="Ex: 295/80R22.5"
              />
              {errors.medida && (
                <p className="text-sm text-destructive">{errors.medida.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={watch('tipo')}
                onValueChange={(value) => setValue('tipo', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposPneu.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-destructive">{errors.tipo.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                {...register('fornecedor')}
                placeholder="Nome do fornecedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_compra">Valor de Compra</Label>
              <Input
                id="valor_compra"
                type="number"
                step="0.01"
                {...register('valor_compra', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_compra">Data de Compra</Label>
              <Input
                id="data_compra"
                type="date"
                {...register('data_compra')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_estoque_id">Item do Estoque</Label>
              <Select
                value={watch('item_estoque_id')}
                onValueChange={(value) => setValue('item_estoque_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {itensEstoquePneus.map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.codigo} - {item.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profundidade_sulco_mm">Profundidade Atual (mm)</Label>
              <Input
                id="profundidade_sulco_mm"
                type="number"
                step="0.01"
                {...register('profundidade_sulco_mm', { valueAsNumber: true })}
                placeholder="Ex: 16.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profundidade_minima_mm">Profundidade Mínima (mm)</Label>
              <Input
                id="profundidade_minima_mm"
                type="number"
                step="0.01"
                {...register('profundidade_minima_mm', { valueAsNumber: true })}
                placeholder="1.6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais sobre o pneu"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : pneu ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
