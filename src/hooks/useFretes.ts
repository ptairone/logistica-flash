import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FreteFormData } from '@/lib/validations-frete';
import { useToast } from '@/hooks/use-toast';
import { calcularCombustivelEstimado } from '@/lib/consumo-combustivel';
import { useAuth } from '@/lib/auth';

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
  const { empresaId } = useAuth();

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
      if (!empresaId) {
        throw new Error('Usuário não está vinculado a uma empresa');
      }

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
        empresa_id: empresaId,
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
      // Calcular rota com API Rotas Brasil (distância + pedágios + tempo em uma única chamada)
      const { data: rotaData, error: rotaError } = await supabase.functions.invoke('calcular-rota-brasil', {
        body: {
          origem_cep: params.origem_cep,
          destino_cep: params.destino_cep,
          tipo_veiculo: 'caminhao',
          numero_eixos: params.numero_eixos || 3,
          preco_combustivel: 6.50, // R$/litro
          tabela_frete: 'a',
        }
      });

      if (rotaError) throw rotaError;
      if (!rotaData) throw new Error('Erro ao calcular rota');

      console.log('✅ Rota calculada com Rotas Brasil:', rotaData);

      // Calcular combustível usando tabela de consumo por eixos (fallback se API não retornar)
      const precoDiesel = 6.50; // R$/l
      const retornoVazio = params.retorno_vazio || false;

      const dadosCombustivel = calcularCombustivelEstimado(
        rotaData.distancia_km,
        params.numero_eixos || 3,
        retornoVazio,
        precoDiesel
      );

      const { arredondarValor } = await import('@/lib/utils');

      return {
        distancia_km: arredondarValor(rotaData.distancia_km),
        pedagios_estimados: arredondarValor(rotaData.pedagios_valor || 0),
        pracas_pedagio: rotaData.pracas_pedagio || [],
        numero_pracas_pedagio: rotaData.numero_pracas_pedagio || 0,
        combustivel_estimado_litros: arredondarValor(dadosCombustivel.litros_estimados),
        combustivel_estimado_valor: arredondarValor(rotaData.combustivel_estimado_valor || dadosCombustivel.custo_estimado),
        consumo_real_km_l: arredondarValor(dadosCombustivel.consumo_km_l),
        custo_total_estimado: arredondarValor((rotaData.pedagios_valor || 0) + (rotaData.combustivel_estimado_valor || dadosCombustivel.custo_estimado)),
        tempo_estimado_horas: rotaData.tempo_estimado_horas 
          ? Math.round(rotaData.tempo_estimado_horas) 
          : null,
        valor_frete_minimo_antt: rotaData.valor_frete_minimo, // Piso mínimo calculado pela API (se disponível)
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
