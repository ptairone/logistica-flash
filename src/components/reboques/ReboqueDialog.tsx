import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { reboqueSchema, ReboqueFormData, formatPlacaMercosul } from '@/lib/validations-reboque';

interface ReboqueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReboqueFormData) => void;
  reboque?: any;
  isLoading?: boolean;
}

export function ReboqueDialog({ open, onOpenChange, onSubmit, reboque, isLoading }: ReboqueDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReboqueFormData>({
    resolver: zodResolver(reboqueSchema),
    defaultValues: {
      status: 'disponivel',
      numero_eixos: 3,
    },
  });

  useEffect(() => {
    if (reboque) {
      reset(reboque);
    } else {
      reset({
        status: 'disponivel',
        numero_eixos: 3,
      });
    }
  }, [reboque, reset]);

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlacaMercosul(e.target.value);
    setValue('placa', formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reboque ? 'Editar Reboque' : 'Novo Reboque'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo_interno">Código Interno *</Label>
              <Input
                id="codigo_interno"
                {...register('codigo_interno')}
                placeholder="Ex: SR-001"
              />
              {errors.codigo_interno && (
                <p className="text-sm text-destructive mt-1">{errors.codigo_interno.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                {...register('placa')}
                onChange={handlePlacaChange}
                placeholder="ABC1D23"
                maxLength={7}
              />
              {errors.placa && (
                <p className="text-sm text-destructive mt-1">{errors.placa.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={watch('tipo')}
                onValueChange={(value) => setValue('tipo', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semi_reboque">Semi-reboque</SelectItem>
                  <SelectItem value="reboque">Reboque</SelectItem>
                  <SelectItem value="dolly">Dolly</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-destructive mt-1">{errors.tipo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="numero_eixos">Número de Eixos *</Label>
              <Input
                id="numero_eixos"
                type="number"
                {...register('numero_eixos', { valueAsNumber: true })}
                min="1"
                max="3"
              />
              {errors.numero_eixos && (
                <p className="text-sm text-destructive mt-1">{errors.numero_eixos.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                {...register('marca')}
                placeholder="Ex: RANDON"
              />
              {errors.marca && (
                <p className="text-sm text-destructive mt-1">{errors.marca.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                {...register('modelo')}
                placeholder="Ex: RS"
              />
              {errors.modelo && (
                <p className="text-sm text-destructive mt-1">{errors.modelo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                {...register('ano', { valueAsNumber: true })}
                placeholder="2024"
              />
              {errors.ano && (
                <p className="text-sm text-destructive mt-1">{errors.ano.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chassi">Chassi</Label>
              <Input
                id="chassi"
                {...register('chassi')}
                placeholder="Ex: 9BR..."
              />
            </div>

            <div>
              <Label htmlFor="renavam">RENAVAM</Label>
              <Input
                id="renavam"
                {...register('renavam')}
                placeholder="Ex: 12345678901"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacidade_kg">Capacidade (kg)</Label>
              <Input
                id="capacidade_kg"
                type="number"
                step="0.01"
                {...register('capacidade_kg', { valueAsNumber: true })}
                placeholder="Ex: 25000"
              />
              {errors.capacidade_kg && (
                <p className="text-sm text-destructive mt-1">{errors.capacidade_kg.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="capacidade_m3">Capacidade (m³)</Label>
              <Input
                id="capacidade_m3"
                type="number"
                step="0.01"
                {...register('capacidade_m3', { valueAsNumber: true })}
                placeholder="Ex: 80"
              />
              {errors.capacidade_m3 && (
                <p className="text-sm text-destructive mt-1">{errors.capacidade_m3.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vencimento_licenciamento">Vencimento Licenciamento</Label>
              <Input
                id="vencimento_licenciamento"
                type="date"
                {...register('vencimento_licenciamento')}
              />
            </div>

            <div>
              <Label htmlFor="vencimento_seguro">Vencimento Seguro</Label>
              <Input
                id="vencimento_seguro"
                type="date"
                {...register('vencimento_seguro')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="acoplado">Acoplado</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              rows={3}
              placeholder="Observações adicionais sobre o reboque..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {reboque ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
