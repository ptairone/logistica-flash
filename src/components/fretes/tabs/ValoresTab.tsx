import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { FreteFormData } from '@/lib/validations-frete';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, TrendingUp, ChevronDown, Info, DollarSign, CreditCard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TIPOS_CARGA } from '@/lib/calculadora-antt';

interface ValoresTabProps {
  register: UseFormRegister<FreteFormData>;
  setValue: UseFormSetValue<FreteFormData>;
  watch: UseFormWatch<FreteFormData>;
  errors: FieldErrors<FreteFormData>;
  status: string;
  estimativas: any;
  calculandoEstimativas: boolean;
  handleCalcularEstimativas: () => void;
}

export function ValoresTab({ 
  register, 
  setValue,
  watch,
  errors, 
  status,
  estimativas,
  calculandoEstimativas,
  handleCalcularEstimativas 
}: ValoresTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <Button 
          type="button" 
          onClick={handleCalcularEstimativas}
          disabled={calculandoEstimativas || !watch('numero_eixos') || !watch('tipo_carga')}
          className="w-full"
          size="lg"
        >
          <Calculator className="h-5 w-5 mr-2" />
          {calculandoEstimativas ? 'Calculando...' : 'Calcular Custos & Piso ANTT'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Preencha a rota e parâmetros do veículo antes de calcular
        </p>
      </Card>

      {estimativas && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            Resultados do Cálculo
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-xs text-muted-foreground">Distância</Label>
              <p className="text-lg font-bold">{estimativas.distancia_km} km</p>
              {estimativas.tempo_estimado_horas && (
                <p className="text-xs text-muted-foreground">
                  ~{estimativas.tempo_estimado_horas}h de viagem
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                Pedágios
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Valores calculados com API Calcular Pedágio, especializada em rodovias brasileiras.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <p className="text-lg font-bold text-amber-600">
                R$ {estimativas.pedagios_estimados?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {estimativas.numero_pracas_pedagio || 0} praças
              </p>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Combustível</Label>
              <p className="text-lg font-bold text-green-600">
                R$ {estimativas.combustivel_estimado_valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                ~{estimativas.combustivel_estimado_litros}L
              </p>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <Label className="text-xs text-muted-foreground">Piso Mínimo ANTT</Label>
              <p className="text-2xl font-bold text-primary">
                R$ {watch('piso_minimo_antt')?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <Alert className="mt-3 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              O campo "Valor do Frete" foi preenchido automaticamente com o Piso Mínimo ANTT. Você pode editá-lo abaixo.
            </AlertDescription>
          </Alert>
          
          <Collapsible className="mt-3">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-4 w-4" />
              Ver detalhes do cálculo ANTT
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 text-xs space-y-1 p-3 bg-background rounded border">
              <p><strong>Tipo de carga:</strong> {TIPOS_CARGA.find(t => t.value === watch('tipo_carga'))?.label}</p>
              <p><strong>Número de eixos:</strong> {watch('numero_eixos')}</p>
              <p><strong>Distância:</strong> {watch('distancia_estimada_km')} km</p>
              {watch('composicao_veicular') && <p>✓ Composição veicular (+15%)</p>}
              {watch('alto_desempenho') && <p>✓ Alto desempenho (+10%)</p>}
              {watch('retorno_vazio') && <p>✓ Retorno vazio (+20%)</p>}
            </CollapsibleContent>
          </Collapsible>
          
          <Separator className="my-3" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Custo Total Estimado</Label>
              <p className="text-xl font-bold text-destructive">
                R$ {estimativas.custo_total_estimado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Margem Estimada</Label>
              <p className={cn(
                "text-xl font-bold",
                (watch('valor_frete') - estimativas.custo_total_estimado) > 0 
                  ? "text-green-600" 
                  : "text-destructive"
              )}>
                R$ {((watch('valor_frete') || 0) - estimativas.custo_total_estimado)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {watch('valor_frete') > 0 ? ((((watch('valor_frete') || 0) - estimativas.custo_total_estimado) / watch('valor_frete')) * 100).toFixed(1) : '0'}% do frete
              </p>
            </div>
          </div>

          {estimativas.pracas_pedagio && estimativas.pracas_pedagio.length > 0 && (
            <Collapsible className="mt-4">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
                <ChevronDown className="h-4 w-4" />
                Ver {estimativas.pracas_pedagio.length} praças de pedágio
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-1">
                {estimativas.pracas_pedagio.map((praca: any, idx: number) => (
                  <div key={idx} className="text-sm flex justify-between items-center py-1 border-b last:border-0">
                    <span className="text-muted-foreground">{praca.nome}</span>
                    <span className="font-medium">R$ {praca.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </Card>
      )}

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valor_frete" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Valor do Frete (R$)
            <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
          </Label>
          <Input
            id="valor_frete"
            type="number"
            step="0.01"
            {...register('valor_frete', { valueAsNumber: true })}
            placeholder="5000.00"
            className="font-semibold text-lg"
          />
          {errors.valor_frete && (
            <p className="text-sm text-destructive">{errors.valor_frete.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="condicao_pagamento" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Condição de Pagamento
          </Label>
          <Input
            id="condicao_pagamento"
            {...register('condicao_pagamento')}
            placeholder="À vista / 30 dias"
          />
        </div>
      </div>

      {status === 'faturado' && (
        <div className="space-y-2">
          <Label htmlFor="numero_fatura" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Número da Fatura/Nota Fiscal
          </Label>
          <Input
            id="numero_fatura"
            {...register('numero_fatura')}
            placeholder="NF-12345"
          />
        </div>
      )}
    </div>
  );
}
