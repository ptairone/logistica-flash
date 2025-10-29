import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { freteSchema, FreteFormData, formatCPFCNPJ } from '@/lib/validations-frete';
import { formatCEP } from '@/lib/validations-viagem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Calculator, TrendingUp, ChevronDown, Fuel, Navigation, Info } from 'lucide-react';
import { useFretes } from '@/hooks/useFretes';
import { cn } from '@/lib/utils';
import { calcularPisoMinimoANTT, TIPOS_CARGA } from '@/lib/calculadora-antt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface FreteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FreteFormData) => void;
  frete?: any;
  isLoading?: boolean;
}

export function FreteDialog({ open, onOpenChange, onSubmit, frete, isLoading }: FreteDialogProps) {
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [buscandoCEPOrigem, setBuscandoCEPOrigem] = useState(false);
  const [buscandoCEPDestino, setBuscandoCEPDestino] = useState(false);
  const [estimativas, setEstimativas] = useState<any>(null);
  const [calculandoEstimativas, setCalculandoEstimativas] = useState(false);
  
  const { calcularCustosEstimados } = useFretes();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FreteFormData>({
    resolver: zodResolver(freteSchema),
    defaultValues: {
      status: 'aberto',
    },
  });

  useEffect(() => {
    if (frete) {
      reset({
        ...frete,
        peso: frete.peso || undefined,
        volume: frete.volume || undefined,
      });
    } else {
      reset({
        status: 'aberto',
      });
    }
  }, [frete, reset]);

  const status = watch('status');

  const handleCPFCNPJChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFCNPJ(e.target.value);
    setValue('cliente_cnpj_cpf', formatted);

    // Se for CNPJ completo (18 caracteres com formatação)
    if (formatted.length === 18) {
      setBuscandoCNPJ(true);
      try {
        const { data, error } = await supabase.functions.invoke('consultar-cnpj', {
          body: { cnpj: formatted }
        });

        if (error) throw error;

        if (data) {
          setValue('cliente_nome', data.razao_social || data.nome_fantasia);
          if (data.telefone) {
            setValue('cliente_contato', data.telefone);
          }
          toast.success('Dados do CNPJ carregados com sucesso!');
        }
      } catch (error: any) {
        console.error('Erro ao buscar CNPJ:', error);
        toast.error('Não foi possível buscar os dados do CNPJ');
      } finally {
        setBuscandoCNPJ(false);
      }
    }
  };

  const handleCalcularEstimativas = async () => {
    const origemCep = watch('origem_cep');
    const destinoCep = watch('destino_cep');
    const numeroEixos = watch('numero_eixos');
    const tipoCarga = watch('tipo_carga');
    
    if (!origemCep || !destinoCep || origemCep.replace(/\D/g, '').length !== 8 || destinoCep.replace(/\D/g, '').length !== 8) {
      toast.error('Preencha os CEPs de origem e destino');
      return;
    }
    
    if (!numeroEixos) {
      toast.error('Selecione o número de eixos');
      return;
    }
    
    if (!tipoCarga) {
      toast.error('Selecione o tipo de carga');
      return;
    }
    
    setCalculandoEstimativas(true);
    
    try {
      // 1. CALCULAR DISTÂNCIA, PEDÁGIOS, COMBUSTÍVEL
      const resultado = await calcularCustosEstimados.mutateAsync({
        origem_cep: origemCep,
        destino_cep: destinoCep,
        origem_cidade: watch('origem_cidade'),
        origem_uf: watch('origem_uf'),
        destino_cidade: watch('destino_cidade'),
        destino_uf: watch('destino_uf'),
        numero_eixos: numeroEixos,
      });
      
      setEstimativas(resultado);
      
      // Auto-preencher campos de estimativa
      setValue('distancia_estimada_km', resultado.distancia_km);
      setValue('pedagios_estimados', resultado.pedagios_estimados);
      setValue('combustivel_estimado_litros', resultado.combustivel_estimado_litros);
      setValue('combustivel_estimado_valor', resultado.combustivel_estimado_valor);
      setValue('numero_pracas_pedagio', resultado.numero_pracas_pedagio);
      setValue('pracas_pedagio', resultado.pracas_pedagio);
      setValue('tempo_estimado_horas', resultado.tempo_estimado_horas);
      
      // 2. CALCULAR PISO MÍNIMO ANTT
      const resultadoANTT = calcularPisoMinimoANTT({
        tipo_carga: tipoCarga,
        numero_eixos: numeroEixos,
        distancia_km: resultado.distancia_km,
        composicao_veicular: watch('composicao_veicular') || false,
        alto_desempenho: watch('alto_desempenho') || false,
        retorno_vazio: watch('retorno_vazio') || false,
      });
      
      // 3. AUTO-PREENCHER VALOR DO FRETE COM PISO MÍNIMO ANTT
      setValue('piso_minimo_antt', resultadoANTT.valor_com_acrescimos);
      setValue('valor_frete', resultadoANTT.valor_com_acrescimos);
      
      toast.success(
        `Piso ANTT: R$ ${resultadoANTT.valor_com_acrescimos.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2 
        })}`,
        { duration: 5000 }
      );
      
    } catch (error) {
      console.error('Erro ao calcular:', error);
      toast.error('Erro ao calcular custos e piso ANTT');
    } finally {
      setCalculandoEstimativas(false);
    }
  };

  const handleCEPChange = (field: 'origem_cep' | 'destino_cep') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setValue(field, formatted);

    // Se CEP completo (9 caracteres com formatação)
    if (formatted.length === 9) {
      const setBuscando = field === 'origem_cep' ? setBuscandoCEPOrigem : setBuscandoCEPDestino;
      setBuscando(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('consultar-cep', {
          body: { cep: formatted }
        });

        if (error) throw error;

        if (data && data.error) {
          // CEP inválido ou não encontrado
          toast.error(data.error === 'CEP inválido' ? 'CEP não encontrado na base de dados' : data.error);
        } else if (data) {
          const prefix = field === 'origem_cep' ? 'origem' : 'destino';
          setValue(`${prefix}_logradouro` as any, data.logradouro || '');
          setValue(`${prefix}_cidade` as any, data.localidade || '');
          setValue(`${prefix}_uf` as any, data.uf || '');
          toast.success('Endereço carregado com sucesso!');
        }
      } catch (error: any) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao consultar CEP. Tente novamente.');
      } finally {
        setBuscando(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{frete ? 'Editar Frete' : 'Novo Frete'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                {...register('codigo')}
                placeholder="Gerado automaticamente"
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para gerar automaticamente
              </p>
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
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="faturado">Faturado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
              <Input
                id="cliente_nome"
                {...register('cliente_nome')}
                placeholder="Empresa LTDA"
              />
              {errors.cliente_nome && (
                <p className="text-sm text-destructive">{errors.cliente_nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_cnpj_cpf">CPF/CNPJ *</Label>
              <div className="relative">
                <Input
                  id="cliente_cnpj_cpf"
                  {...register('cliente_cnpj_cpf')}
                  onChange={handleCPFCNPJChange}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  disabled={buscandoCNPJ}
                />
                {buscandoCNPJ && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {errors.cliente_cnpj_cpf && (
                <p className="text-sm text-destructive">{errors.cliente_cnpj_cpf.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_contato">Contato</Label>
            <Input
              id="cliente_contato"
              {...register('cliente_contato')}
              placeholder="(11) 98765-4321"
            />
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-accent/30">
            <h3 className="font-semibold">Endereço de Origem</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem_cep">CEP *</Label>
                <div className="relative">
                  <Input
                    id="origem_cep"
                    {...register('origem_cep')}
                    onChange={handleCEPChange('origem_cep')}
                    placeholder="01310-100"
                    maxLength={9}
                    disabled={buscandoCEPOrigem}
                  />
                  {buscandoCEPOrigem && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origem_logradouro">Logradouro</Label>
                <Input
                  id="origem_logradouro"
                  {...register('origem_logradouro')}
                  placeholder="Av. Paulista"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem_numero">Número</Label>
                <Input
                  id="origem_numero"
                  {...register('origem_numero')}
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origem_cidade">Cidade *</Label>
                <Input
                  id="origem_cidade"
                  {...register('origem_cidade')}
                  placeholder="São Paulo"
                />
                {errors.origem_cidade && (
                  <p className="text-sm text-destructive">{errors.origem_cidade.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="origem_uf">UF</Label>
                <Input
                  id="origem_uf"
                  {...register('origem_uf')}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="origem_ponto_referencia">Ponto de Referência</Label>
              <Input
                id="origem_ponto_referencia"
                {...register('origem_ponto_referencia')}
                placeholder="Próximo ao Shopping..."
              />
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-accent/30">
            <h3 className="font-semibold">Endereço de Destino</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destino_cep">CEP *</Label>
                <div className="relative">
                  <Input
                    id="destino_cep"
                    {...register('destino_cep')}
                    onChange={handleCEPChange('destino_cep')}
                    placeholder="20040-020"
                    maxLength={9}
                    disabled={buscandoCEPDestino}
                  />
                  {buscandoCEPDestino && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino_logradouro">Logradouro</Label>
                <Input
                  id="destino_logradouro"
                  {...register('destino_logradouro')}
                  placeholder="Rua das Flores"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destino_numero">Número</Label>
                <Input
                  id="destino_numero"
                  {...register('destino_numero')}
                  placeholder="500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino_cidade">Cidade *</Label>
                <Input
                  id="destino_cidade"
                  {...register('destino_cidade')}
                  placeholder="Rio de Janeiro"
                />
                {errors.destino_cidade && (
                  <p className="text-sm text-destructive">{errors.destino_cidade.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino_uf">UF</Label>
                <Input
                  id="destino_uf"
                  {...register('destino_uf')}
                  placeholder="RJ"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino_ponto_referencia">Ponto de Referência</Label>
              <Input
                id="destino_ponto_referencia"
                {...register('destino_ponto_referencia')}
                placeholder="Em frente ao mercado..."
              />
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-accent/30">
            <h3 className="font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Parâmetros do Veículo e Carga
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_carga">Tipo de Carga *</Label>
                <Select
                  value={watch('tipo_carga')}
                  onValueChange={(value) => setValue('tipo_carga', value)}
                >
                  <SelectTrigger id="tipo_carga">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CARGA.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo_carga && (
                  <p className="text-sm text-destructive">{errors.tipo_carga.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_eixos">Número de Eixos *</Label>
                <Select
                  value={watch('numero_eixos')?.toString()}
                  onValueChange={(value) => setValue('numero_eixos', parseInt(value))}
                >
                  <SelectTrigger id="numero_eixos">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 9].map((eixos) => (
                      <SelectItem key={eixos} value={eixos.toString()}>
                        {eixos} eixos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.numero_eixos && (
                  <p className="text-sm text-destructive">{errors.numero_eixos.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 border rounded-lg p-3 bg-background">
              <Label className="text-sm font-medium">Características do Veículo</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="composicao_veicular"
                  checked={watch('composicao_veicular') || false}
                  onCheckedChange={(checked) => setValue('composicao_veicular', checked as boolean)}
                />
                <label htmlFor="composicao_veicular" className="text-sm cursor-pointer">
                  Composição veicular (caminhão + reboque) <span className="text-muted-foreground">+15%</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alto_desempenho"
                  checked={watch('alto_desempenho') || false}
                  onCheckedChange={(checked) => setValue('alto_desempenho', checked as boolean)}
                />
                <label htmlFor="alto_desempenho" className="text-sm cursor-pointer">
                  Veículo de alto desempenho <span className="text-muted-foreground">+10%</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="retorno_vazio"
                  checked={watch('retorno_vazio') || false}
                  onCheckedChange={(checked) => setValue('retorno_vazio', checked as boolean)}
                />
                <label htmlFor="retorno_vazio" className="text-sm cursor-pointer">
                  Retorno vazio <span className="text-muted-foreground">+20%</span>
                </label>
              </div>
            </div>
          </div>
          
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
                  <Label className="text-xs text-muted-foreground">Pedágios</Label>
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
                    R$ {watch('piso_minimo_antt')?.toLocaleString('pt-BR', { 
                      minimumFractionDigits: 2 
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aplicado ao frete
                  </p>
                </div>
              </div>
              
              <Alert className="mt-3 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  O valor do frete foi preenchido com o Piso Mínimo ANTT calculado. Você pode ajustá-lo manualmente se necessário.
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_coleta">Data de Coleta</Label>
              <Input
                id="data_coleta"
                type="date"
                {...register('data_coleta')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_entrega">Data de Entrega</Label>
              <Input
                id="data_entrega"
                type="date"
                {...register('data_entrega')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Input
                id="produto"
                {...register('produto')}
                placeholder="Mercadorias diversas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_carga">Tipo de Carga</Label>
              <Input
                id="tipo_carga"
                {...register('tipo_carga')}
                placeholder="Carga seca"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.01"
                {...register('peso', { valueAsNumber: true })}
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume (m³)</Label>
              <Input
                id="volume"
                type="number"
                step="0.01"
                {...register('volume', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_eixos">Número de Eixos *</Label>
              <Select
                value={watch('numero_eixos')?.toString()}
                onValueChange={(value) => setValue('numero_eixos', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Eixos</SelectItem>
                  <SelectItem value="3">3 Eixos</SelectItem>
                  <SelectItem value="4">4 Eixos</SelectItem>
                  <SelectItem value="5">5 Eixos</SelectItem>
                  <SelectItem value="6">6 Eixos</SelectItem>
                  <SelectItem value="7">7 Eixos</SelectItem>
                  <SelectItem value="8">8 Eixos</SelectItem>
                  <SelectItem value="9">9 Eixos</SelectItem>
                </SelectContent>
              </Select>
              {errors.numero_eixos && (
                <p className="text-sm text-destructive">{errors.numero_eixos.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condicao_pagamento">Condição de Pagamento</Label>
              <Input
                id="condicao_pagamento"
                {...register('condicao_pagamento')}
                placeholder="À vista / 30 dias"
              />
            </div>

            {status === 'faturado' && (
              <div className="space-y-2">
                <Label htmlFor="numero_fatura">Número da Fatura/Nota</Label>
                <Input
                  id="numero_fatura"
                  {...register('numero_fatura')}
                  placeholder="NF-12345"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais sobre o frete..."
              rows={3}
            />
          </div>

          <Separator className="my-4" />

          <Button 
            type="button" 
            onClick={handleCalcularEstimativas}
            disabled={calculandoEstimativas || !watch('numero_eixos') || !watch('tipo_carga')}
            className="w-full"
            variant="secondary"
          >
            {calculandoEstimativas ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando custos e piso ANTT...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calcular Custos e Piso Mínimo ANTT
                {(!watch('numero_eixos') || !watch('tipo_carga')) && (
                  <span className="ml-2 text-xs opacity-70">(preencha tipo de carga e nº de eixos)</span>
                )}
              </>
            )}
          </Button>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : frete ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
