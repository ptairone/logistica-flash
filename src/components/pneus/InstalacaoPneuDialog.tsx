import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { instalacaoPneuSchema, InstalacaoPneuFormData, posicoesPneu } from '@/lib/validations-pneu';
import { usePneus } from '@/hooks/usePneus';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useEffect } from 'react';

interface InstalacaoPneuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pneu: any;
}

export function InstalacaoPneuDialog({ open, onOpenChange, pneu }: InstalacaoPneuDialogProps) {
  const { instalarPneu } = usePneus();
  const { veiculos } = useVeiculos();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InstalacaoPneuFormData>({
    resolver: zodResolver(instalacaoPneuSchema),
  });

  useEffect(() => {
    if (pneu) {
      reset({
        pneu_id: pneu.id,
        veiculo_id: '',
        posicao_veiculo: '',
        km_atual: 0,
        profundidade_sulco_mm: pneu.profundidade_sulco_mm || undefined,
      });
    }
  }, [pneu, reset]);

  const onSubmit = (data: any) => {
    instalarPneu.mutate({
      pneu_id: data.pneu_id,
      veiculo_id: data.veiculo_id,
      posicao_veiculo: data.posicao_veiculo,
      km_atual: data.km_atual,
      profundidade_sulco_mm: data.profundidade_sulco_mm,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  if (!pneu) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Instalar Pneu em Veículo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{pneu.numero_serie}</p>
            <p className="text-sm text-muted-foreground">
              {pneu.marca} {pneu.modelo} - {pneu.medida}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="veiculo_id">Veículo *</Label>
            <Select
              value={watch('veiculo_id')}
              onValueChange={(value) => setValue('veiculo_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {veiculos
                  .filter((v: any) => v.status === 'ativo')
                  .map((veiculo: any) => (
                    <SelectItem key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.codigo_interno}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.veiculo_id && (
              <p className="text-sm text-destructive">{errors.veiculo_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="posicao_veiculo">Posição no Veículo *</Label>
            <Select
              value={watch('posicao_veiculo')}
              onValueChange={(value) => setValue('posicao_veiculo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a posição" />
              </SelectTrigger>
              <SelectContent>
                {posicoesPneu.map((posicao) => (
                  <SelectItem key={posicao.value} value={posicao.value}>
                    {posicao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.posicao_veiculo && (
              <p className="text-sm text-destructive">{errors.posicao_veiculo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="km_atual">KM Atual do Veículo *</Label>
            <Input
              id="km_atual"
              type="number"
              {...register('km_atual', { valueAsNumber: true })}
              placeholder="Digite o KM atual"
            />
            {errors.km_atual && (
              <p className="text-sm text-destructive">{errors.km_atual.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profundidade_sulco_mm">Profundidade do Sulco (mm)</Label>
            <Input
              id="profundidade_sulco_mm"
              type="number"
              step="0.01"
              {...register('profundidade_sulco_mm', { valueAsNumber: true })}
              placeholder="Ex: 16.5"
            />
            {errors.profundidade_sulco_mm && (
              <p className="text-sm text-destructive">{errors.profundidade_sulco_mm.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={instalarPneu.isPending}>
              {instalarPneu.isPending ? 'Instalando...' : 'Instalar Pneu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
