import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Info, Route, Loader2 } from 'lucide-react';
import { viagemSchema, ViagemFormData, formatCEP } from '@/lib/validations-viagem';
import { useVeiculosAtivos, useMotoristasAtivos, useFretesDisponiveis } from '@/hooks/useViagens';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ViagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ViagemFormData) => void;
  viagem?: any;
  isLoading?: boolean;
}

export function ViagemDialog({ open, onOpenChange, onSubmit, viagem, isLoading }: ViagemDialogProps) {
  const { data: veiculos = [] } = useVeiculosAtivos();
  const { data: motoristas = [] } = useMotoristasAtivos();
  const { data: fretes = [] } = useFretesDisponiveis();
  const [calculandoDistancia, setCalculandoDistancia] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ViagemFormData>({
    resolver: zodResolver(viagemSchema),
    defaultValues: {
      status: 'planejada',
    },
  });

  useEffect(() => {
    if (viagem) {
      reset({
        ...viagem,
        km_estimado: viagem.km_estimado || undefined,
        km_inicial: viagem.km_inicial || undefined,
        km_final: viagem.km_final || undefined,
        frete_id: viagem.frete_id || undefined,
      });
    } else {
      reset({
        status: 'planejada',
      });
    }
  }, [viagem, reset]);

  const status = watch('status');
  const veiculoId = watch('veiculo_id');
  const motoristaId = watch('motorista_id');
  const freteId = watch('frete_id');

  // Auto-preencher endereços do frete quando selecionado
  useEffect(() => {
    if (freteId && freteId !== 'none') {
      const freteSelecionado = fretes.find(f => f.id === freteId);
      if (freteSelecionado) {
        // Preencher com os dados detalhados se disponíveis
        setValue('origem', freteSelecionado.origem_cidade 
          ? `${freteSelecionado.origem_cidade}/${freteSelecionado.origem_uf}` 
          : freteSelecionado.origem
        );
        setValue('origem_cep', freteSelecionado.origem_cep || '');
        setValue('destino', freteSelecionado.destino_cidade 
          ? `${freteSelecionado.destino_cidade}/${freteSelecionado.destino_uf}` 
          : freteSelecionado.destino
        );
        setValue('destino_cep', freteSelecionado.destino_cep || '');
      }
    }
  }, [freteId, fretes, setValue]);

  const camposDesabilitados = !!freteId && freteId !== 'none';

  const calcularDistanciaAutomatica = async () => {
    const origemCep = watch('origem_cep');
    const destinoCep = watch('destino_cep');
    const origem = watch('origem');
    const destino = watch('destino');

    if (!origemCep || !destinoCep || origemCep.replace(/\D/g, '').length !== 8 || destinoCep.replace(/\D/g, '').length !== 8) {
      return;
    }

    setCalculandoDistancia(true);
    try {
      // Extrair cidade e UF do campo origem/destino (formato: "Cidade, UF")
      const origemParts = origem?.split(',').map(p => p.trim()) || [];
      const destinoParts = destino?.split(',').map(p => p.trim()) || [];

      const { data, error } = await supabase.functions.invoke('calcular-distancia', {
        body: { 
          origem_cep: origemCep,
          destino_cep: destinoCep,
          origem_cidade: origemParts[0],
          origem_uf: origemParts[1],
          destino_cidade: destinoParts[0],
          destino_uf: destinoParts[1],
        }
      });

      if (error) throw error;

      if (data && data.distancia_km) {
        setValue('km_estimado', data.distancia_km);
        toast.success(`Distância estimada: ${data.distancia_km} km`);
      }
    } catch (error) {
      console.error('Erro ao calcular distância:', error);
    } finally {
      setCalculandoDistancia(false);
    }
  };

  const handleCEPChange = (field: 'origem_cep' | 'destino_cep') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setValue(field, formatted);
    
    // Calcular distância quando ambos os CEPs estiverem preenchidos
    if (formatted.length === 9) {
      setTimeout(() => calcularDistanciaAutomatica(), 500);
    }
  };

  const handleFreteChange = (value: string) => {
    if (freteId && freteId !== 'none' && value === 'none') {
      if (!confirm('Remover vínculo com frete? Os endereços precisarão ser preenchidos manualmente.')) {
        return;
      }
    }
    setValue('frete_id', value === 'none' ? undefined : value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{viagem ? 'Editar Viagem' : 'Nova Viagem'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                {...register('codigo')}
                placeholder="VG001"
              />
              {errors.codigo && (
                <p className="text-sm text-destructive">{errors.codigo.message}</p>
              )}
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
                  <SelectItem value="planejada">Planejada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veiculo_id">Veículo *</Label>
              <Select
                value={veiculoId}
                onValueChange={(value) => setValue('veiculo_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa} - {v.marca} {v.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.veiculo_id && (
                <p className="text-sm text-destructive">{errors.veiculo_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motorista_id">Motorista *</Label>
              <Select
                value={motoristaId}
                onValueChange={(value) => setValue('motorista_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motorista" />
                </SelectTrigger>
                <SelectContent>
                  {motoristas.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.motorista_id && (
                <p className="text-sm text-destructive">{errors.motorista_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frete_id">Frete Vinculado (Opcional)</Label>
            <Select
              value={freteId || 'none'}
              onValueChange={handleFreteChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum frete vinculado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {fretes.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{f.codigo} - {f.cliente_nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {f.origem_cidade || f.origem}
                        {f.origem_uf && ` - ${f.origem_uf}`}
                        {' → '}
                        {f.destino_cidade || f.destino}
                        {f.destino_uf && ` - ${f.destino_uf}`}
                        {' • R$ '}
                        {f.valor_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {camposDesabilitados && (
              <Badge variant="secondary" className="mt-2">
                <Info className="h-3 w-3 mr-1" />
                Endereços herdados do frete
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origem">Origem *</Label>
              <Input
                id="origem"
                {...register('origem')}
                placeholder="São Paulo, SP"
                disabled={camposDesabilitados}
                className={camposDesabilitados ? 'bg-muted cursor-not-allowed' : ''}
              />
              {errors.origem && (
                <p className="text-sm text-destructive">{errors.origem.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="origem_cep">CEP Origem</Label>
              <Input
                id="origem_cep"
                {...register('origem_cep')}
                onChange={handleCEPChange('origem_cep')}
                placeholder="01310-100"
                maxLength={9}
                disabled={camposDesabilitados}
                className={camposDesabilitados ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                {...register('destino')}
                placeholder="Rio de Janeiro, RJ"
                disabled={camposDesabilitados}
                className={camposDesabilitados ? 'bg-muted cursor-not-allowed' : ''}
              />
              {errors.destino && (
                <p className="text-sm text-destructive">{errors.destino.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino_cep">CEP Destino</Label>
              <Input
                id="destino_cep"
                {...register('destino_cep')}
                onChange={handleCEPChange('destino_cep')}
                placeholder="20040-020"
                maxLength={9}
                disabled={camposDesabilitados}
                className={camposDesabilitados ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_saida">Data/Hora Saída</Label>
              <Input
                id="data_saida"
                type="datetime-local"
                {...register('data_saida')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_chegada">Data/Hora Chegada</Label>
              <Input
                id="data_chegada"
                type="datetime-local"
                {...register('data_chegada')}
              />
              {errors.data_chegada && (
                <p className="text-sm text-destructive">{errors.data_chegada.message}</p>
              )}
            </div>
          </div>

          {/* KM - Visibilidade conforme status */}
          {status === 'planejada' && (
            <div className="space-y-2">
              <Label htmlFor="km_estimado">KM Estimado (Planejamento)</Label>
              <div className="flex gap-2">
                <Input
                  id="km_estimado"
                  type="number"
                  step="0.01"
                  {...register('km_estimado', { valueAsNumber: true })}
                  placeholder="450"
                  disabled={calculandoDistancia}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={calcularDistanciaAutomatica}
                  disabled={calculandoDistancia || !watch('origem_cep') || !watch('destino_cep')}
                  className="whitespace-nowrap"
                >
                  {calculandoDistancia ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Route className="h-4 w-4 mr-2" />
                      Calcular
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {!watch('origem_cep') || !watch('destino_cep')
                  ? 'Preencha os CEPs de origem e destino para calcular automaticamente'
                  : 'Clique em "Calcular" ou os CEPs já preenchem automaticamente'}
              </p>
              {errors.km_estimado && (
                <p className="text-sm text-destructive">{errors.km_estimado.message}</p>
              )}
            </div>
          )}

          {(status === 'em_andamento' || status === 'concluida') && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Controle de Quilometragem</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="km_inicial">KM Inicial do Veículo</Label>
                  <Input
                    id="km_inicial"
                    type="number"
                    step="0.01"
                    {...register('km_inicial', { valueAsNumber: true })}
                    placeholder="10000"
                    disabled={status === 'em_andamento'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Registrado na partida
                  </p>
                </div>

                {status === 'concluida' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="km_final">KM Final do Veículo</Label>
                      <Input
                        id="km_final"
                        type="number"
                        step="0.01"
                        {...register('km_final', { valueAsNumber: true })}
                        placeholder="10450"
                      />
                      {errors.km_final && (
                        <p className="text-sm text-destructive">{errors.km_final.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Registrado na chegada
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>KM Percorrido (Calculado)</Label>
                      <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center">
                        <span className="font-medium">
                          {(() => {
                            const inicial = watch('km_inicial');
                            const final = watch('km_final');
                            if (inicial && final) {
                              return `${(final - inicial).toLocaleString('pt-BR')} km`;
                            }
                            return '-';
                          })()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Calculado automaticamente
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              {...register('notas')}
              placeholder="Observações sobre a viagem..."
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
              {isLoading ? 'Salvando...' : viagem ? 'Atualizar' : 'Criar Viagem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
