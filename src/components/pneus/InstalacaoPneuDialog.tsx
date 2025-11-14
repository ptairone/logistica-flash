import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { instalacaoPneuSchema, InstalacaoPneuFormData, posicoesPneu, gerarPosicoesPneu } from '@/lib/validations-pneu';
import { usePneus } from '@/hooks/usePneus';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useEffect, useMemo, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface InstalacaoPneuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pneu: any;
  veiculoIdProp?: string;
  posicaoProp?: string;
}

export function InstalacaoPneuDialog({ open, onOpenChange, pneu, veiculoIdProp, posicaoProp }: InstalacaoPneuDialogProps) {
  const { instalarPneu, pneus: todosPneus } = usePneus();
  const { veiculos } = useVeiculos();
  const [pneuSelecionado, setPneuSelecionado] = useState<any>(pneu);
  const [openCombobox, setOpenCombobox] = useState(false);
  
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

  const veiculoSelecionado = watch('veiculo_id');
  const veiculo = veiculos.find(v => v.id === veiculoSelecionado);

  // Modo de operação
  const modoEscolherPneu = !pneu;
  
  // Filtrar pneus disponíveis no estoque
  const pneusDisponiveis = useMemo(() => {
    return todosPneus.filter((p: any) => p.status === 'estoque');
  }, [todosPneus]);

  useEffect(() => {
    if (pneu) {
      setPneuSelecionado(pneu);
      reset({
        pneu_id: pneu.id,
        veiculo_id: veiculoIdProp || '',
        posicao_veiculo: posicaoProp || '',
        km_atual: 0,
        profundidade_sulco_mm: pneu.profundidade_sulco_mm || undefined,
      });
    } else {
      // Modo escolher pneu: pré-preencher veículo e posição
      reset({
        pneu_id: '',
        veiculo_id: veiculoIdProp || '',
        posicao_veiculo: posicaoProp || '',
        km_atual: 0,
      });
    }
  }, [pneu, veiculoIdProp, posicaoProp, reset]);

  // Gerar posições dinamicamente baseado no veículo selecionado
  const posicoesDisponiveis = useMemo(() => {
    if (!veiculo) return posicoesPneu;
    return gerarPosicoesPneu(veiculo.numero_eixos || 3);
  }, [veiculo]);

  const onSubmit = (data: any) => {
    instalarPneu.mutate({
      pneuId: data.pneu_id,
      veiculoId: data.veiculo_id,
      posicao: data.posicao_veiculo,
      kmVeiculo: data.km_atual,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {modoEscolherPneu ? 'Escolher Pneu para Instalar' : 'Instalar Pneu em Veículo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Modo: Escolher Pneu do Estoque */}
          {modoEscolherPneu && (
            <div className="space-y-2">
              <Label>Selecione o Pneu *</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {pneuSelecionado 
                      ? `${pneuSelecionado.numero_serie} - ${pneuSelecionado.marca}`
                      : "Selecione um pneu..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por número de série, marca..." />
                    <CommandList>
                      <CommandEmpty>
                        {pneusDisponiveis.length === 0 
                          ? "Nenhum pneu disponível no estoque"
                          : "Nenhum pneu encontrado"}
                      </CommandEmpty>
                      <CommandGroup>
                        {pneusDisponiveis.map((pneuItem: any) => (
                          <CommandItem
                            key={pneuItem.id}
                            value={`${pneuItem.numero_serie} ${pneuItem.marca} ${pneuItem.modelo} ${pneuItem.medida}`}
                            onSelect={() => {
                              setPneuSelecionado(pneuItem);
                              setValue('pneu_id', pneuItem.id);
                              setValue('profundidade_sulco_mm', pneuItem.profundidade_sulco_mm || undefined);
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                pneuSelecionado?.id === pneuItem.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-1 items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{pneuItem.numero_serie}</p>
                                <p className="text-xs text-muted-foreground">
                                  {pneuItem.marca} {pneuItem.modelo} - {pneuItem.medida}
                                </p>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {pneuItem.profundidade_sulco_mm || 0} mm
                              </Badge>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.pneu_id && (
                <p className="text-sm text-destructive">{errors.pneu_id.message}</p>
              )}
            </div>
          )}

          {/* Preview do Pneu Selecionado */}
          {pneuSelecionado && (
            <Card className="p-3 bg-muted">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-2xl">
                  🛞
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-bold">{pneuSelecionado.numero_serie}</p>
                  <p className="text-sm text-muted-foreground">
                    {pneuSelecionado.marca} {pneuSelecionado.modelo}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{pneuSelecionado.medida}</Badge>
                    <Badge variant="secondary">
                      {pneuSelecionado.profundidade_sulco_mm || 0} mm
                    </Badge>
                    <Badge variant="outline">{pneuSelecionado.tipo}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}

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
                {posicoesDisponiveis.map((posicao) => (
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
