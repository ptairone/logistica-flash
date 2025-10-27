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
import { Progress } from '@/components/ui/progress';
import { acertoSchema, AcertoFormData, calcularAcerto, gerarCodigoAcerto, ViagemAcerto } from '@/lib/validations-acerto';
import { useMotoristasAtivos } from '@/hooks/useViagens';
import { useViagensDisponiveis } from '@/hooks/useAcertos';
import { useDebitosMotorista } from '@/hooks/useAcertoDebitos';
import { formatDateBR } from '@/lib/validations';
import { AcertoPreview } from './AcertoPreview';
import { AcertoRevisaoDespesas } from './AcertoRevisaoDespesas';
import { AcertoAjustesAdmin } from './AcertoAjustesAdmin';
import { AcertoDebitosMotorista } from './AcertoDebitosMotorista';
import { AcertoCalculoDetalhado } from './AcertoCalculoDetalhado';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { AcertoAjuste } from '@/hooks/useAcertoAjustes';
import { Badge } from '@/components/ui/badge';

interface AcertoDialogWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AcertoFormData, viagemIds: string[], ajustes: AcertoAjuste[], debitosDescontados: any[], validacoes: any[]) => void;
  acerto?: any;
  isLoading?: boolean;
}

type WizardStep = 'viagens' | 'despesas' | 'ajustes' | 'debitos' | 'calculo' | 'preview';

const stepLabels: Record<WizardStep, string> = {
  viagens: 'Viagens',
  despesas: 'Despesas',
  ajustes: 'Ajustes',
  debitos: 'Débitos',
  calculo: 'Cálculo',
  preview: 'Revisão',
};

const stepOrder: WizardStep[] = ['viagens', 'despesas', 'ajustes', 'debitos', 'calculo', 'preview'];

export function AcertoDialogWizard({ open, onOpenChange, onSubmit, acerto, isLoading }: AcertoDialogWizardProps) {
  const { data: motoristas = [] } = useMotoristasAtivos();
  const [currentStep, setCurrentStep] = useState<WizardStep>('viagens');
  const [selectedViagens, setSelectedViagens] = useState<string[]>([]);
  const [validacoesDespesas, setValidacoesDespesas] = useState<Map<string, any>>(new Map());
  const [ajustes, setAjustes] = useState<AcertoAjuste[]>([]);
  const [debitosDescontados, setDebitosDescontados] = useState<any[]>([]);
  
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
      data_criacao: new Date().toISOString(),
      etapa_atual: 'viagens',
    },
  });

  const motoristaId = watch('motorista_id');
  const percentualComissao = watch('percentual_comissao') || 0;
  const totalAdiantamentos = watch('total_adiantamentos') || 0;
  const totalDescontos = watch('total_descontos') || 0;

  const { data: viagensDisponiveis = [] } = useViagensDisponiveis(motoristaId);
  const { data: debitos = [] } = useDebitosMotorista(motoristaId, true);

  const viagensSelecionadas = viagensDisponiveis.filter(v => 
    selectedViagens.includes(v.id)
  ) as ViagemAcerto[];

  // Atualizar comissão padrão quando selecionar motorista
  useEffect(() => {
    if (motoristaId && motoristas.length > 0 && !acerto) {
      const motorista = motoristas.find(m => m.id === motoristaId);
      if (motorista?.comissao_padrao) {
        setValue('percentual_comissao', motorista.comissao_padrao);
      }
    }
  }, [motoristaId, motoristas, setValue, acerto]);

  // Gerar código em tempo real
  useEffect(() => {
    if (motoristaId && selectedViagens.length > 0 && !acerto && motoristas.length > 0) {
      const motorista = motoristas.find(m => m.id === motoristaId);
      if (motorista) {
        const codigoGerado = gerarCodigoAcerto(motorista.nome, new Date(), selectedViagens.length);
        setValue('codigo', codigoGerado);
      }
    }
  }, [motoristaId, selectedViagens.length, motoristas, setValue, acerto]);

  // Calcular totais
  useEffect(() => {
    if (selectedViagens.length > 0 && viagensDisponiveis.length > 0) {
      const viagensSelecionadas = viagensDisponiveis.filter(v => 
        selectedViagens.includes(v.id)
      ) as ViagemAcerto[];

      // Calcular período
      const datas = viagensSelecionadas
        .map(v => new Date(v.data_saida))
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (datas.length > 0) {
        setValue('periodo_inicio', datas[0].toISOString().split('T')[0]);
        setValue('periodo_fim', datas[datas.length - 1].toISOString().split('T')[0]);
      }

      // Calcular valores com validações e ajustes
      let receitaTotal = 0;
      let despesasNaoReembolsaveis = 0;
      let totalReembolsos = 0;
      let despesasReprovadas = 0;

      viagensSelecionadas.forEach((viagem) => {
        if (viagem.frete?.valor_frete) {
          receitaTotal += viagem.frete.valor_frete;
        }

        viagem.despesas.forEach((despesa: any) => {
          const validacao = validacoesDespesas.get(despesa.id);
          const valorFinal = validacao?.valor_aprovado ?? despesa.valor;
          
          if (validacao?.status === 'reprovada') {
            despesasReprovadas += despesa.valor;
          } else if (despesa.reembolsavel) {
            totalReembolsos += valorFinal;
          } else {
            despesasNaoReembolsaveis += valorFinal;
          }
        });
      });

      const baseComissao = receitaTotal - despesasNaoReembolsaveis;
      const valorComissao = (baseComissao * percentualComissao) / 100;

      // Calcular ajustes
      const totalBonificacoes = ajustes
        .filter(a => a.tipo === 'bonificacao')
        .reduce((sum, a) => sum + a.valor, 0);
      
      const totalPenalidades = ajustes
        .filter(a => a.tipo === 'penalidade')
        .reduce((sum, a) => sum + a.valor, 0);

      // Calcular débitos
      const totalDebitosDescontados = debitosDescontados.reduce((sum, d) => sum + d.valorDescontar, 0);

      const totalPagar = valorComissao + totalReembolsos + totalBonificacoes 
        - totalAdiantamentos - totalDescontos - totalPenalidades - totalDebitosDescontados - despesasReprovadas;

      setValue('base_comissao', baseComissao);
      setValue('valor_comissao', valorComissao);
      setValue('total_reembolsos', totalReembolsos);
      setValue('total_bonificacoes', totalBonificacoes);
      setValue('total_penalidades', totalPenalidades);
      setValue('total_debitos_descontados', totalDebitosDescontados);
      setValue('total_pagar', totalPagar);
    }
  }, [
    selectedViagens, 
    viagensDisponiveis, 
    percentualComissao, 
    totalAdiantamentos, 
    totalDescontos,
    validacoesDespesas,
    ajustes,
    debitosDescontados,
    setValue
  ]);

  useEffect(() => {
    if (!open) {
      reset({
        status: 'aberto',
        percentual_comissao: 0,
        total_adiantamentos: 0,
        total_descontos: 0,
        data_criacao: new Date().toISOString(),
        etapa_atual: 'viagens',
      });
      setCurrentStep('viagens');
      setSelectedViagens([]);
      setValidacoesDespesas(new Map());
      setAjustes([]);
      setDebitosDescontados([]);
    }
  }, [open, reset]);

  const toggleViagem = (viagemId: string) => {
    setSelectedViagens(prev => 
      prev.includes(viagemId)
        ? prev.filter(id => id !== viagemId)
        : [...prev, viagemId]
    );
  };

  const handleNext = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleFinalSubmit = handleSubmit((data) => {
    const validacoesArray = Array.from(validacoesDespesas.values());
    onSubmit(data, selectedViagens, ajustes, debitosDescontados, validacoesArray);
  });

  const progress = ((stepOrder.indexOf(currentStep) + 1) / stepOrder.length) * 100;
  const motoristaSelecionado = motoristas.find(m => m.id === motoristaId);

  const canProceed = () => {
    switch (currentStep) {
      case 'viagens':
        return motoristaId && selectedViagens.length > 0;
      case 'despesas':
        return true;
      case 'ajustes':
        return true;
      case 'debitos':
        return true;
      case 'calculo':
        return true;
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{acerto ? 'Editar Acerto' : 'Novo Acerto'}</span>
            {motoristaSelecionado && (
              <Badge variant="outline" className="text-sm">
                {motoristaSelecionado.nome}
              </Badge>
            )}
          </DialogTitle>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Etapa {stepOrder.indexOf(currentStep) + 1} de {stepOrder.length}</span>
              <span>{stepLabels[currentStep]}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-1">
              {stepOrder.map((step, index) => (
                <div
                  key={step}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    index <= stepOrder.indexOf(currentStep) ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-[400px] py-4">
          {/* Etapa 1: Seleção de Viagens */}
          {currentStep === 'viagens' && (
            <div className="space-y-4">
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
              </div>

              {motoristaId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Viagens Concluídas</Label>
                    <Badge variant="secondary">{selectedViagens.length} selecionadas</Badge>
                  </div>
                  
                  {viagensDisponiveis.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto space-y-2 border rounded-md p-3">
                      {viagensDisponiveis.map((viagem: any) => {
                        const isSelected = selectedViagens.includes(viagem.id);
                        const valorFrete = viagem.frete?.valor_frete || 0;
                        const despesas = viagem.despesas || [];
                        const totalDespesas = despesas.reduce((sum: number, d: any) => sum + Number(d.valor), 0);

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
                                    <p className="font-semibold">{viagem.codigo}</p>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateBR(viagem.data_saida)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {viagem.origem} → {viagem.destino}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                    <div>
                                      <span className="font-medium">Frete: </span>
                                      <span className="text-green-600">R$ {valorFrete.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Despesas: </span>
                                      <span className="text-orange-600">
                                        {despesas.length} (R$ {totalDespesas.toFixed(2)})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8 border rounded-md">
                      Nenhuma viagem concluída disponível
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Comissão (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('percentual_comissao', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adiantamentos (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('total_adiantamentos', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descontos (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('total_descontos', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 2: Revisão de Despesas */}
          {currentStep === 'despesas' && (
            <AcertoRevisaoDespesas
              viagens={viagensSelecionadas}
              acertoId={acerto?.id || ''}
              onValidacoesChange={setValidacoesDespesas}
            />
          )}

          {/* Etapa 3: Ajustes Administrativos */}
          {currentStep === 'ajustes' && (
            <AcertoAjustesAdmin
              ajustes={ajustes}
              onAjustesChange={setAjustes}
            />
          )}

          {/* Etapa 4: Débitos do Motorista */}
          {currentStep === 'debitos' && (
            <AcertoDebitosMotorista
              debitos={debitos}
              onDebitosChange={setDebitosDescontados}
            />
          )}

          {/* Etapa 5: Cálculo Detalhado */}
          {currentStep === 'calculo' && (
            <div className="space-y-4">
              <AcertoCalculoDetalhado
                comissao={watch('valor_comissao') || 0}
                reembolsos={watch('total_reembolsos') || 0}
                bonificacoes={watch('total_bonificacoes') || 0}
                penalidades={watch('total_penalidades') || 0}
                adiantamentos={totalAdiantamentos}
                descontos={totalDescontos}
                debitosDescontados={watch('total_debitos_descontados') || 0}
                despesasReprovadas={0}
              />

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  {...register('observacoes')}
                  placeholder="Informações adicionais sobre este acerto..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Etapa 6: Preview Final */}
          {currentStep === 'preview' && motoristaSelecionado && (
            <AcertoPreview
              data={watch()}
              viagens={viagensSelecionadas}
              motoristaNome={motoristaSelecionado.nome}
            />
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 'viagens'}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep === 'preview' ? (
            <Button onClick={handleFinalSubmit} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Acerto'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
