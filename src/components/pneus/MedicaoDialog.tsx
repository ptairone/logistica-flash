import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicaoPneuSchema, MedicaoPneuFormData, verificarDesgasteIrregular } from '@/lib/validations-pneu';
import { usePneusMedicoes } from '@/hooks/usePneus';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MedicaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pneu: any;
}

export function MedicaoDialog({ open, onOpenChange, pneu }: MedicaoDialogProps) {
  const { createMedicao } = usePneusMedicoes(pneu?.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<MedicaoPneuFormData>({
    resolver: zodResolver(medicaoPneuSchema),
  });

  useEffect(() => {
    if (pneu) {
      reset({
        pneu_id: pneu.id,
        veiculo_id: pneu.veiculo_id || undefined,
        km_veiculo: pneu.km_atual || undefined,
        profundidade_interna_mm: pneu.profundidade_sulco_mm || undefined,
        profundidade_central_mm: pneu.profundidade_sulco_mm || undefined,
        profundidade_externa_mm: pneu.profundidade_sulco_mm || undefined,
        pressao_psi: 100,
        desgaste_irregular: false,
        danos_visiveis: false,
        necessita_atencao: false,
      });
    }
  }, [pneu, reset]);

  const profInterna = watch('profundidade_interna_mm');
  const profCentral = watch('profundidade_central_mm');
  const profExterna = watch('profundidade_externa_mm');

  const desgasteIrregular = profInterna && profCentral && profExterna 
    ? verificarDesgasteIrregular(profInterna, profCentral, profExterna)
    : false;

  const profundidadeMedia = profInterna && profCentral && profExterna
    ? (profInterna + profCentral + profExterna) / 3
    : 0;

  const isCritico = profundidadeMedia > 0 && profundidadeMedia <= (pneu?.profundidade_minima_mm || 1.6);

  const onSubmit = (data: MedicaoPneuFormData) => {
    createMedicao.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  if (!pneu) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Medição de Pneu</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{pneu.numero_serie}</p>
            <p className="text-sm text-muted-foreground">
              {pneu.marca} {pneu.modelo} - {pneu.medida}
            </p>
            {pneu.veiculo && (
              <p className="text-sm text-muted-foreground">
                Veículo: {pneu.veiculo.placa}
              </p>
            )}
          </div>

          {(desgasteIrregular || isCritico) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isCritico && <p>⚠️ Profundidade crítica detectada! Substituição necessária.</p>}
                {desgasteIrregular && <p>⚠️ Desgaste irregular detectado! Verificar alinhamento e balanceamento.</p>}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="km_veiculo">KM do Veículo</Label>
            <Input
              id="km_veiculo"
              type="number"
              {...register('km_veiculo', { valueAsNumber: true })}
            />
            {errors.km_veiculo && (
              <p className="text-sm text-destructive">{errors.km_veiculo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profundidade_interna_mm">Interna (mm) *</Label>
              <Input
                id="profundidade_interna_mm"
                type="number"
                step="0.01"
                {...register('profundidade_interna_mm', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.profundidade_interna_mm && (
                <p className="text-sm text-destructive">{errors.profundidade_interna_mm.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profundidade_central_mm">Central (mm) *</Label>
              <Input
                id="profundidade_central_mm"
                type="number"
                step="0.01"
                {...register('profundidade_central_mm', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.profundidade_central_mm && (
                <p className="text-sm text-destructive">{errors.profundidade_central_mm.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profundidade_externa_mm">Externa (mm) *</Label>
              <Input
                id="profundidade_externa_mm"
                type="number"
                step="0.01"
                {...register('profundidade_externa_mm', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.profundidade_externa_mm && (
                <p className="text-sm text-destructive">{errors.profundidade_externa_mm.message}</p>
              )}
            </div>
          </div>

          {profundidadeMedia > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Profundidade Média</p>
              <p className="text-2xl font-bold">{profundidadeMedia.toFixed(2)} mm</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pressao_psi">Pressão (PSI) *</Label>
              <Input
                id="pressao_psi"
                type="number"
                step="0.1"
                {...register('pressao_psi', { valueAsNumber: true })}
                placeholder="100"
              />
              {errors.pressao_psi && (
                <p className="text-sm text-destructive">{errors.pressao_psi.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperatura_celsius">Temperatura (°C)</Label>
              <Input
                id="temperatura_celsius"
                type="number"
                step="0.1"
                {...register('temperatura_celsius', { valueAsNumber: true })}
                placeholder="25"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="desgaste_irregular">Desgaste Irregular</Label>
              <Switch
                id="desgaste_irregular"
                checked={watch('desgaste_irregular')}
                onCheckedChange={(checked) => setValue('desgaste_irregular', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="danos_visiveis">Danos Visíveis</Label>
              <Switch
                id="danos_visiveis"
                checked={watch('danos_visiveis')}
                onCheckedChange={(checked) => setValue('danos_visiveis', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="necessita_atencao">Necessita Atenção</Label>
              <Switch
                id="necessita_atencao"
                checked={watch('necessita_atencao')}
                onCheckedChange={(checked) => setValue('necessita_atencao', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais sobre a medição"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMedicao.isPending}>
              {createMedicao.isPending ? 'Salvando...' : 'Registrar Medição'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
