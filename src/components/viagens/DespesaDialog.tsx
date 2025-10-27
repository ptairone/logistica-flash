import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { despesaSchema, DespesaFormData } from '@/lib/validations-viagem';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';

interface DespesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DespesaFormData) => void;
  viagemId: string;
  isLoading?: boolean;
  initialData?: Partial<DespesaFormData>;
}

export function DespesaDialog({ open, onOpenChange, onSubmit, viagemId, isLoading, initialData }: DespesaDialogProps) {
  const { getCurrentLocation } = useGeolocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DespesaFormData>({
    resolver: zodResolver(despesaSchema),
    defaultValues: {
      viagem_id: viagemId,
      reembolsavel: true,
      data: new Date().toISOString().split('T')[0],
      ...initialData,
    },
  });

  const tipo = watch('tipo');
  const reembolsavel = watch('reembolsavel');

  // Atualizar form quando initialData mudar
  React.useEffect(() => {
    if (initialData && open) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
  }, [initialData, open, setValue]);

  const handleClose = () => {
    reset({
      viagem_id: viagemId,
      reembolsavel: true,
      data: new Date().toISOString().split('T')[0],
    });
    onOpenChange(false);
  };

  const handleFormSubmit = async (data: DespesaFormData) => {
    toast.info('📍 Capturando localização...');
    const locationData = await getCurrentLocation();
    
    const dataWithLocation = {
      ...data,
      latitude: locationData?.latitude,
      longitude: locationData?.longitude,
      localizacao_timestamp: locationData ? new Date(locationData.timestamp).toISOString() : null,
    };
    
    onSubmit(dataWithLocation as any);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Despesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Despesa *</Label>
            <Select
              value={tipo}
              onValueChange={(value) => setValue('tipo', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="combustivel">Combustível</SelectItem>
                <SelectItem value="pedagio">Pedágio</SelectItem>
                <SelectItem value="alimentacao">Alimentação</SelectItem>
                <SelectItem value="hospedagem">Hospedagem</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                {...register('valor', { valueAsNumber: true })}
                placeholder="0,00"
              />
              {errors.valor && (
                <p className="text-sm text-destructive">{errors.valor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                {...register('data')}
              />
              {errors.data && (
                <p className="text-sm text-destructive">{errors.data.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="reembolsavel"
              checked={reembolsavel}
              onCheckedChange={(checked) => setValue('reembolsavel', checked as boolean)}
            />
            <label
              htmlFor="reembolsavel"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Despesa reembolsável
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
