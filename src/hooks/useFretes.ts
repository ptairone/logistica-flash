import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FreteFormData } from '@/lib/validations-frete';
import { useToast } from '@/hooks/use-toast';

// Helper para auto-preencher origem e destino com cidade/UF
const prepararDadosFrete = (data: FreteFormData | Partial<FreteFormData>) => {
  const origem = data.origem || 
    (data.origem_cidade && data.origem_uf 
      ? `${data.origem_cidade}/${data.origem_uf}` 
      : '');
  
  const destino = data.destino || 
    (data.destino_cidade && data.destino_uf 
      ? `${data.destino_cidade}/${data.destino_uf}` 
      : '');

  return {
    ...data,
    origem,
    destino,
  };
};

export function useFretes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fretesQuery = useQuery({
    queryKey: ['fretes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fretes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createFrete = useMutation({
    mutationFn: async (data: FreteFormData) => {
      const dadosPreparados = prepararDadosFrete(data);
      
      const { data: result, error } = await supabase
        .from('fretes')
        .insert([dadosPreparados as any])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretes'] });
      toast({
        title: 'Sucesso',
        description: 'Frete cadastrado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cadastrar frete',
        variant: 'destructive',
      });
    },
  });

  const updateFrete = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FreteFormData> }) => {
      const dadosPreparados = prepararDadosFrete(data);
      
      const { data: result, error } = await supabase
        .from('fretes')
        .update(dadosPreparados as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretes'] });
      toast({
        title: 'Sucesso',
        description: 'Frete atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar frete',
        variant: 'destructive',
      });
    },
  });

  const deleteFrete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fretes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretes'] });
      toast({
        title: 'Sucesso',
        description: 'Frete excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir frete',
        variant: 'destructive',
      });
    },
  });

  const calcularCustosEstimados = useMutation({
    mutationFn: async (params: {
      origem_cep: string;
      destino_cep: string;
      origem_cidade?: string;
      origem_uf?: string;
      destino_cidade?: string;
      destino_uf?: string;
      numero_eixos?: number;
    }) => {
      // 1. Calcular distância
      const { data: distData, error: distError } = await supabase.functions.invoke('calcular-distancia', {
        body: {
          origem_cep: params.origem_cep,
          destino_cep: params.destino_cep,
          origem_cidade: params.origem_cidade,
          origem_uf: params.origem_uf,
          destino_cidade: params.destino_cidade,
          destino_uf: params.destino_uf,
        }
      });

      if (distError) throw distError;
      if (!distData) throw new Error('Erro ao calcular distância');

      // 2. Calcular pedágios
      const { data: pedagioData, error: pedagioError } = await supabase.functions.invoke('calcular-pedagios', {
        body: {
          origem: distData.origem,
          destino: distData.destino,
          numero_eixos: params.numero_eixos || 3,
        }
      });

      if (pedagioError) throw pedagioError;

      // 3. Calcular combustível
      const mediaConsumo = 2.5; // km/l
      const precoDiesel = 6.50; // R$/l
      const litrosEstimados = distData.distancia_km / mediaConsumo;
      const custoEstimadoCombustivel = litrosEstimados * precoDiesel;

      return {
        distancia_km: distData.distancia_km,
        pedagios_estimados: pedagioData?.valor_total || 0,
        pracas_pedagio: pedagioData?.pracas || [],
        numero_pracas_pedagio: pedagioData?.pracas?.length || 0,
        combustivel_estimado_litros: Math.round(litrosEstimados),
        combustivel_estimado_valor: custoEstimadoCombustivel,
        custo_total_estimado: (pedagioData?.valor_total || 0) + custoEstimadoCombustivel,
        tempo_estimado_horas: pedagioData?.tempo_estimado_minutos 
          ? Math.round(pedagioData.tempo_estimado_minutos / 60) 
          : null,
      };
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao calcular custos',
        description: error.message || 'Não foi possível calcular os custos estimados',
        variant: 'destructive',
      });
    },
  });

  return {
    fretes: fretesQuery.data ?? [],
    isLoading: fretesQuery.isLoading,
    error: fretesQuery.error,
    createFrete,
    updateFrete,
    deleteFrete,
    calcularCustosEstimados,
  };
}

export function useViagensVinculadasFrete(freteId?: string) {
  return useQuery({
    queryKey: ['viagens-frete', freteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viagens')
        .select(`
          *,
          veiculo:veiculos(placa, marca, modelo),
          motorista:motoristas(nome)
        `)
        .eq('frete_id', freteId!)
        .order('data_saida', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!freteId,
  });
}
