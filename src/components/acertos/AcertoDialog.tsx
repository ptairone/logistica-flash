import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { acertoSchema, AcertoFormData, calcularAcerto, gerarCodigoAcerto, ViagemAcerto } from '@/lib/validations-acerto';
import { useMotoristasAtivos } from '@/hooks/useViagens';
import { useViagensDisponiveis, useVincularViagens } from '@/hooks/useAcertos';
import { formatDateBR } from '@/lib/validations';

interface AcertoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AcertoFormData, viagemIds: string[]) => void;
  acerto?: any;
  isLoading?: boolean;
}

export function AcertoDialog({ open, onOpenChange, onSubmit, acerto, isLoading }: AcertoDialogProps) {
  const { data: motoristas = [] } = useMotoristasAtivos();
  const [selectedViagens, setSelectedViagens] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AcertoFormData>({
    resolver: zodResolver(acertoSchema),
    defaultValues: {
      status: 'aberto',
      percentual_comissao: 0,
      total_adiantamentos: 0,
      total_descontos: 0,
    },
  });

  const motoristaId = watch('motorista_id');
  const periodoInicio = watch('periodo_inicio');
  const periodoFim = watch('periodo_fim');
  const percentualComissao = watch('percentual_comissao') || 0;
  const totalAdiantamentos = watch('total_adiantamentos') || 0;
  const totalDescontos = watch('total_descontos') || 0;

  const { data: viagensDisponiveis = [] } = useViagensDisponiveis(motoristaId);

  // Atualizar comissão padrão quando selecionar motorista
  useEffect(() => {
    if (motoristaId && motoristas.length > 0 && !acerto) {
      const motorista = motoristas.find(m => m.id === motoristaId);
      if (motorista?.comissao_padrao) {
        setValue('percentual_comissao', motorista.comissao_padrao);
      }
    }
  }, [motoristaId, motoristas, setValue, acerto]);


  // Calcular totais automaticamente
  useEffect(() => {
    if (selectedViagens.length > 0 && viagensDisponiveis.length > 0) {
      const viagensSelecionadas = viagensDisponiveis.filter(v => 
        selectedViagens.includes(v.id)
      ) as ViagemAcerto[];

      const calculos = calcularAcerto(
        viagensSelecionadas,
        percentualComissao,
        totalAdiantamentos,
        totalDescontos
      );

      setValue('base_comissao', calculos.baseComissao, { shouldValidate: false });
      setValue('valor_comissao', calculos.valorComissao, { shouldValidate: false });
      setValue('total_reembolsos', calculos.totalReembolsos, { shouldValidate: false });
      setValue('total_pagar', calculos.totalPagar, { shouldValidate: false });
    } else if (selectedViagens.length === 0) {
      setValue('base_comissao', 0, { shouldValidate: false });
      setValue('valor_comissao', 0, { shouldValidate: false });
      setValue('total_reembolsos', 0, { shouldValidate: false });
      setValue('total_pagar', 0, { shouldValidate: false });
    }
  }, [selectedViagens, viagensDisponiveis, percentualComissao, totalAdiantamentos, totalDescontos, setValue]);

  useEffect(() => {
    if (acerto) {
      reset({
        ...acerto,
      });
    } else {
      reset({
        status: 'aberto',
        percentual_comissao: 0,
        total_adiantamentos: 0,
        total_descontos: 0,
      });
      setSelectedViagens([]);
    }
  }, [acerto, reset]);

  const toggleViagem = (viagemId: string) => {
    setSelectedViagens(prev => 
      prev.includes(viagemId)
        ? prev.filter(id => id !== viagemId)
        : [...prev, viagemId]
    );
  };

  const handleFormSubmit = (data: AcertoFormData) => {
    // Gerar código automático se for novo acerto
    let finalData = { ...data };
    
    if (!acerto && motoristaId) {
      const motorista = motoristas.find(m => m.id === motoristaId);
      if (motorista) {
        const codigo = gerarCodigoAcerto(motorista.nome, new Date(data.periodo_fim));
        finalData.codigo = codigo;
      }
    }
    
    // Recalcular totais antes de submeter
    if (selectedViagens.length > 0 && viagensDisponiveis.length > 0) {
      const viagensSelecionadas = viagensDisponiveis.filter(v => 
        selectedViagens.includes(v.id)
      ) as ViagemAcerto[];

      const calculos = calcularAcerto(
        viagensSelecionadas,
        finalData.percentual_comissao || 0,
        finalData.total_adiantamentos || 0,
        finalData.total_descontos || 0
      );

      finalData = {
        ...finalData,
        base_comissao: calculos.baseComissao,
        valor_comissao: calculos.valorComissao,
        total_reembolsos: calculos.totalReembolsos,
        total_pagar: calculos.totalPagar,
      };
      
      onSubmit(finalData, selectedViagens);
    } else {
      onSubmit(finalData, selectedViagens);
    }
  };

  const baseComissao = watch('base_comissao') || 0;
  const valorComissao = watch('valor_comissao') || 0;
  const totalReembolsos = watch('total_reembolsos') || 0;
  const totalPagar = watch('total_pagar') || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{acerto ? 'Editar Acerto' : 'Novo Acerto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motorista_id">Motorista *</Label>
            <Select
              value={motoristaId || ""}
              onValueChange={(value) => setValue('motorista_id', value)}
              disabled={!!acerto}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodo_inicio">Período Início *</Label>
              <Input
                id="periodo_inicio"
                type="date"
                {...register('periodo_inicio')}
                disabled={!!acerto}
              />
              {errors.periodo_inicio && (
                <p className="text-sm text-destructive">{errors.periodo_inicio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodo_fim">Período Fim *</Label>
              <Input
                id="periodo_fim"
                type="date"
                {...register('periodo_fim')}
                disabled={!!acerto}
              />
              {errors.periodo_fim && (
                <p className="text-sm text-destructive">{errors.periodo_fim.message}</p>
              )}
            </div>
          </div>

          {!acerto && motoristaId && (
            <div className="space-y-2">
              <Label>Viagens Disponíveis ({selectedViagens.length} selecionadas)</Label>
              {viagensDisponiveis.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3">
                  {viagensDisponiveis.map((viagem: any) => {
                    const isSelected = selectedViagens.includes(viagem.id);
                    const valorFrete = viagem.frete?.valor_frete || 0;
                    const despesasReemb = viagem.despesas?.filter((d: any) => d.reembolsavel).reduce((sum: number, d: any) => sum + Number(d.valor), 0) || 0;
                    const despesasNaoReemb = viagem.despesas?.filter((d: any) => !d.reembolsavel).reduce((sum: number, d: any) => sum + Number(d.valor), 0) || 0;
                    const totalDespesas = despesasReemb + despesasNaoReemb;
                    const qtdDespesas = viagem.despesas?.length || 0;

                    return (
                      <Card 
                        key={viagem.id} 
                        className={isSelected ? 'border-primary bg-primary/5' : 'cursor-pointer hover:border-primary/50'}
                        onClick={() => toggleViagem(viagem.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleViagem(viagem.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{viagem.codigo}</p>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateBR(viagem.data_saida)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {viagem.origem} → {viagem.destino}
                              </p>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Frete:</span>
                                  <span className="text-green-600">
                                    R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Despesas:</span>
                                  <span className={totalDespesas > 0 ? "text-orange-600" : "text-muted-foreground"}>
                                    {qtdDespesas > 0 ? `${qtdDespesas} (R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : 'Nenhuma'}
                                  </span>
                                </div>
                                {despesasReemb > 0 && (
                                  <div className="flex items-center gap-1 col-span-2">
                                    <span className="font-medium">Reembolsáveis:</span>
                                    <span className="text-blue-600">
                                      R$ {despesasReemb.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}
                                {viagem.km_percorrido && (
                                  <div className="flex items-center gap-1 col-span-2">
                                    <span className="font-medium">KM percorrido:</span>
                                    <span className="text-muted-foreground">{viagem.km_percorrido} km</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                  Nenhuma viagem concluída disponível para este motorista.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentual_comissao">Comissão (%)</Label>
              <Input
                id="percentual_comissao"
                type="number"
                step="0.01"
                {...register('percentual_comissao', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_adiantamentos">Adiantamentos (R$)</Label>
              <Input
                id="total_adiantamentos"
                type="number"
                step="0.01"
                {...register('total_adiantamentos', { valueAsNumber: true })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_descontos">Descontos (R$)</Label>
              <Input
                id="total_descontos"
                type="number"
                step="0.01"
                {...register('total_descontos', { valueAsNumber: true })}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-muted-foreground">Base de Comissão</Label>
              <p className="text-xl font-bold">R$ {baseComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Valor Comissão</Label>
              <p className="text-xl font-bold text-primary">R$ {valorComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Reembolsos</Label>
              <p className="text-xl font-bold">R$ {totalReembolsos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total a Pagar</Label>
              <p className="text-2xl font-bold text-primary">R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais..."
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
            <Button type="submit" disabled={isLoading || (!acerto && selectedViagens.length === 0)}>
              {isLoading ? 'Salvando...' : acerto ? 'Atualizar' : 'Criar Acerto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
