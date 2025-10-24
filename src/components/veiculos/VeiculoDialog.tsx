import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { veiculoSchema, VeiculoFormData, formatPlacaMercosul } from '@/lib/validations';

interface VeiculoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VeiculoFormData) => void;
  veiculo?: any;
  isLoading?: boolean;
}

export function VeiculoDialog({ open, onOpenChange, onSubmit, veiculo, isLoading }: VeiculoDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<VeiculoFormData>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: {
      status: 'ativo',
      tipo: 'caminhao',
    },
  });

  useEffect(() => {
    if (veiculo) {
      reset({
        ...veiculo,
        ano: veiculo.ano || undefined,
        capacidade_kg: veiculo.capacidade_kg || undefined,
        capacidade_m3: veiculo.capacidade_m3 || undefined,
        km_atual: veiculo.km_atual || undefined,
        proxima_manutencao_km: veiculo.proxima_manutencao_km || undefined,
      });
    } else {
      reset({
        status: 'ativo',
        tipo: 'caminhao',
      });
    }
  }, [veiculo, reset]);

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlacaMercosul(e.target.value);
    setValue('placa', formatted);
  };

  const tipo = watch('tipo');
  const status = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{veiculo ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo_interno">Código Interno *</Label>
              <Input
                id="codigo_interno"
                {...register('codigo_interno')}
                placeholder="V001"
              />
              {errors.codigo_interno && (
                <p className="text-sm text-destructive">{errors.codigo_interno.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa">Placa (Mercosul) *</Label>
              <Input
                id="placa"
                {...register('placa')}
                onChange={handlePlacaChange}
                placeholder="ABC1D23"
                maxLength={7}
                className="uppercase"
              />
              {errors.placa && (
                <p className="text-sm text-destructive">{errors.placa.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                {...register('marca')}
                placeholder="Mercedes-Benz"
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
                placeholder="Actros 2651"
              />
              {errors.modelo && (
                <p className="text-sm text-destructive">{errors.modelo.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                {...register('ano', { valueAsNumber: true })}
                placeholder="2024"
              />
              {errors.ano && (
                <p className="text-sm text-destructive">{errors.ano.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="renavam">RENAVAM</Label>
              <Input
                id="renavam"
                {...register('renavam')}
                placeholder="00123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={tipo}
                onValueChange={(value) => setValue('tipo', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                  <SelectItem value="carreta">Carreta</SelectItem>
                  <SelectItem value="utilitario">Utilitário</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacidade_kg">Capacidade (kg)</Label>
              <Input
                id="capacidade_kg"
                type="number"
                step="0.01"
                {...register('capacidade_kg', { valueAsNumber: true })}
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidade_m3">Capacidade (m³)</Label>
              <Input
                id="capacidade_m3"
                type="number"
                step="0.01"
                {...register('capacidade_m3', { valueAsNumber: true })}
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="km_atual">KM Atual</Label>
              <Input
                id="km_atual"
                type="number"
                {...register('km_atual', { valueAsNumber: true })}
                placeholder="150000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proxima_manutencao_km">Próxima Manutenção (KM)</Label>
              <Input
                id="proxima_manutencao_km"
                type="number"
                {...register('proxima_manutencao_km', { valueAsNumber: true })}
                placeholder="160000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proxima_manutencao_data">Próxima Manutenção (Data)</Label>
              <Input
                id="proxima_manutencao_data"
                type="date"
                {...register('proxima_manutencao_data')}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vencimento_ipva">Vencimento IPVA</Label>
              <Input
                id="vencimento_ipva"
                type="date"
                {...register('vencimento_ipva')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vencimento_licenciamento">Vencimento Licenciamento</Label>
              <Input
                id="vencimento_licenciamento"
                type="date"
                {...register('vencimento_licenciamento')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vencimento_seguro">Vencimento Seguro</Label>
              <Input
                id="vencimento_seguro"
                type="date"
                {...register('vencimento_seguro')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais sobre o veículo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : veiculo ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
