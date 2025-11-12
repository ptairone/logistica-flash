import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { freteSchema, FreteFormData, formatCPFCNPJ } from '@/lib/validations-frete';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useFormUnsavedWarning } from '@/hooks/useFormUnsavedWarning';
import { formatCEP } from '@/lib/validations-viagem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Truck, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { useFretes } from '@/hooks/useFretes';
import { calcularPisoMinimoANTT } from '@/lib/calculadora-antt';
import { ClienteTab } from './tabs/ClienteTab';
import { RotaTab } from './tabs/RotaTab';
import { VeiculoCargaTab } from './tabs/VeiculoCargaTab';
import { ValoresTab } from './tabs/ValoresTab';
import { ExtrasTab } from './tabs/ExtrasTab';
import { Badge } from '@/components/ui/badge';
import { getTabCompleteness } from '@/lib/frete-validation-helpers';

interface FreteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FreteFormData) => void;
  frete?: any;
  isLoading?: boolean;
}

export function FreteDialog({ open, onOpenChange, onSubmit, frete, isLoading }: FreteDialogProps) {
  const [activeTab, setActiveTab] = useState('cliente');
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [buscandoCEPOrigem, setBuscandoCEPOrigem] = useState(false);
  const [buscandoCEPDestino, setBuscandoCEPDestino] = useState(false);
  const [estimativas, setEstimativas] = useState<any>(null);
  const [calculandoEstimativas, setCalculandoEstimativas] = useState(false);
  
  const { calcularCustosEstimados } = useFretes();

  const form = useForm<FreteFormData>({
    resolver: zodResolver(freteSchema),
    defaultValues: {
      status: 'aberto',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  // Persistência e avisos
  const { clearPersistedData } = useFormPersistence('frete-form', form, open);
  useFormUnsavedWarning(form, open);

  const handleFormSubmit = (data: FreteFormData) => {
    onSubmit(data);
    clearPersistedData();
  };

  useEffect(() => {
    if (frete) {
      reset({
        ...frete,
        peso: frete.peso || undefined,
        volume: frete.volume || undefined,
        composicao_veicular: frete.composicao_veicular || false,
        alto_desempenho: frete.alto_desempenho || false,
        retorno_vazio: frete.retorno_vazio || false,
      });
      
      if (frete.distancia_estimada_km) {
        setEstimativas({
          distancia_km: frete.distancia_estimada_km,
          pedagios_estimados: frete.pedagios_estimados,
          combustivel_estimado_litros: frete.combustivel_estimado_litros,
          combustivel_estimado_valor: frete.combustivel_estimado_valor,
          numero_pracas_pedagio: frete.numero_pracas_pedagio,
          tempo_estimado_horas: frete.tempo_estimado_horas,
          custo_total_estimado: frete.custo_total_estimado,
          pracas_pedagio: frete.pracas_pedagio,
        });
      }
    } else {
      reset({
        status: 'aberto',
        composicao_veicular: false,
        alto_desempenho: false,
        retorno_vazio: false,
      });
      setEstimativas(null);
    }
    setActiveTab('cliente');
  }, [frete, reset, open]);

  const status = watch('status');
  const formData = watch();

  const handleCPFCNPJChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFCNPJ(e.target.value);
    setValue('cliente_cnpj_cpf', formatted);

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
    const origemCidade = watch('origem_cidade');
    const destinoCidade = watch('destino_cidade');
    const numeroEixos = watch('numero_eixos');
    const tipoCarga = watch('tipo_carga');
    
    if (!origemCep || !destinoCep || 
        origemCep.replace(/\D/g, '').length !== 8 || 
        destinoCep.replace(/\D/g, '').length !== 8) {
      toast.error('Preencha os CEPs completos de origem e destino');
      return;
    }
    
    if (!origemCidade || !destinoCidade) {
      toast.error('Os endereços de origem e destino devem ser carregados antes do cálculo');
      return;
    }
    
    if (!numeroEixos) {
      toast.error('Selecione o número de eixos do veículo');
      return;
    }
    
    if (!tipoCarga) {
      toast.error('Selecione o tipo de carga ANTT');
      return;
    }
    
    setCalculandoEstimativas(true);
    
    try {
      const retornoVazio = watch('retorno_vazio') || false;
      
      const resultado = await calcularCustosEstimados.mutateAsync({
        origem_cep: origemCep,
        destino_cep: destinoCep,
        origem_cidade: watch('origem_cidade'),
        origem_uf: watch('origem_uf'),
        destino_cidade: watch('destino_cidade'),
        destino_uf: watch('destino_uf'),
        numero_eixos: numeroEixos,
        retorno_vazio: retornoVazio,
      });
      
      if (!resultado.distancia_km || resultado.distancia_km === 0) {
        toast.error(
          'Não foi possível calcular a rota automaticamente. Por favor, preencha a distância manualmente.',
          { duration: 6000 }
        );
        setCalculandoEstimativas(false);
        return;
      }
      
      setEstimativas(resultado);
      
      setValue('distancia_estimada_km', resultado.distancia_km);
      setValue('pedagios_estimados', resultado.pedagios_estimados);
      setValue('combustivel_estimado_litros', resultado.combustivel_estimado_litros);
      setValue('combustivel_estimado_valor', resultado.combustivel_estimado_valor);
      setValue('numero_pracas_pedagio', resultado.numero_pracas_pedagio);
      setValue('pracas_pedagio', resultado.pracas_pedagio);
      setValue('tempo_estimado_horas', resultado.tempo_estimado_horas);
      
      const resultadoANTT = calcularPisoMinimoANTT({
        tipo_carga: tipoCarga,
        numero_eixos: numeroEixos,
        distancia_km: resultado.distancia_km,
        composicao_veicular: watch('composicao_veicular') || false,
        alto_desempenho: watch('alto_desempenho') || false,
        retorno_vazio: watch('retorno_vazio') || false,
      });
      
      setValue('piso_minimo_antt', resultadoANTT.valor_com_acrescimos);
      setValue('valor_frete', resultadoANTT.valor_com_acrescimos);
      
      toast.success(
        `Estimativas calculadas! Piso ANTT: R$ ${resultadoANTT.valor_com_acrescimos.toLocaleString('pt-BR', { 
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

    if (formatted.length === 9) {
      const setBuscando = field === 'origem_cep' ? setBuscandoCEPOrigem : setBuscandoCEPDestino;
      setBuscando(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('consultar-cep', {
          body: { cep: formatted }
        });

        if (error) throw error;

        if (data && data.error) {
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

  const tabCompleteness = getTabCompleteness(formData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {frete ? 'Editar Frete' : 'Novo Frete'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="cliente" className="flex items-center gap-1 text-xs">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Cliente</span>
                {tabCompleteness.cliente === 100 && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="rota" className="flex items-center gap-1 text-xs">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Rota</span>
                {tabCompleteness.rota === 100 && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="veiculo" className="flex items-center gap-1 text-xs">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Veículo</span>
                {tabCompleteness.veiculo === 100 && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="valores" className="flex items-center gap-1 text-xs">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Valores</span>
                {tabCompleteness.valores === 100 && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="extras" className="flex items-center gap-1 text-xs">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Extras</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1">
              <TabsContent value="cliente" className="mt-0">
                <ClienteTab
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  status={status}
                  buscandoCNPJ={buscandoCNPJ}
                  handleCPFCNPJChange={handleCPFCNPJChange}
                />
              </TabsContent>

              <TabsContent value="rota" className="mt-0">
                <RotaTab
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  buscandoCEPOrigem={buscandoCEPOrigem}
                  buscandoCEPDestino={buscandoCEPDestino}
                  handleCEPChange={handleCEPChange}
                />
              </TabsContent>

              <TabsContent value="veiculo" className="mt-0">
                <VeiculoCargaTab
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
              </TabsContent>

              <TabsContent value="valores" className="mt-0">
                <ValoresTab
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                  status={status}
                  estimativas={estimativas}
                  calculandoEstimativas={calculandoEstimativas}
                  handleCalcularEstimativas={handleCalcularEstimativas}
                />
              </TabsContent>

              <TabsContent value="extras" className="mt-0">
                <ExtrasTab register={register} />
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {frete ? 'Atualizar Frete' : 'Criar Frete'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
