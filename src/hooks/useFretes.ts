import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FreteFormData } from '@/lib/validations-frete';
import { useToast } from '@/hooks/use-toast';
import { calcularCombustivelEstimado } from '@/lib/consumo-combustivel';

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
      // Gerar código automático se não foi fornecido
      let codigo = data.codigo;
      if (!codigo || codigo.trim() === '') {
        const { count } = await supabase
          .from('fretes')
          .select('*', { count: 'exact', head: true });
        
        const { gerarCodigoFrete } = await import('@/lib/validations-frete');
        codigo = gerarCodigoFrete((count || 0) + 1);
      }
      
      const dadosPreparados = prepararDadosFrete({
        ...data,
        codigo,
        // Garantir que campos ANTT sejam salvos
        tipo_carga: data.tipo_carga,
        numero_eixos: data.numero_eixos,
        composicao_veicular: data.composicao_veicular || false,
        alto_desempenho: data.alto_desempenho || false,
        retorno_vazio: data.retorno_vazio || false,
        piso_minimo_antt: data.piso_minimo_antt,
      });
      
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
      retorno_vazio?: boolean;
    }) => {
      // Calcular rota unificada (distância + pedágios) com Google Maps
      const { data: rotaData, error: rotaError } = await supabase.functions.invoke('calcular-rota-google', {
        body: {
          origem_cep: params.origem_cep,
          destino_cep: params.destino_cep,
          origem_cidade: params.origem_cidade,
          origem_uf: params.origem_uf,
          destino_cidade: params.destino_cidade,
          destino_uf: params.destino_uf,
          numero_eixos: params.numero_eixos || 3,
        }
      });

      if (rotaError) throw rotaError;
      if (!rotaData) throw new Error('Erro ao calcular rota');

      console.log('Rota calculada com Google Maps:', rotaData);

      // Calcular combustível usando tabela de consumo por eixos
      const precoDiesel = 6.50; // R$/l
      const retornoVazio = params.retorno_vazio || false;

      const dadosCombustivel = calcularCombustivelEstimado(
        rotaData.distancia_km,
        params.numero_eixos || 3,
        retornoVazio,
        precoDiesel
      );

      return {
        distancia_km: rotaData.distancia_km,
        pedagios_estimados: rotaData.pedagios_valor || 0,
        pracas_pedagio: [],
        numero_pracas_pedagio: rotaData.numero_pracas_pedagio || 0,
        combustivel_estimado_litros: dadosCombustivel.litros_estimados,
        combustivel_estimado_valor: dadosCombustivel.custo_estimado,
        consumo_real_km_l: dadosCombustivel.consumo_km_l,
        custo_total_estimado: (rotaData.pedagios_valor || 0) + dadosCombustivel.custo_estimado,
        tempo_estimado_horas: rotaData.tempo_estimado_horas 
          ? Math.round(rotaData.tempo_estimado_horas) 
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
