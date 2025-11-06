import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AbastecimentoFormData } from '@/lib/validations-abastecimento';

export function useAbastecimentos(veiculoId?: string, viagemId?: string) {
  const queryClient = useQueryClient();

  // Listar abastecimentos
  const abastecimentosQuery = useQuery({
    queryKey: ['abastecimentos', veiculoId, viagemId],
    queryFn: async () => {
      let query = supabase
        .from('abastecimentos')
        .select(`
          *,
          veiculo:veiculos!veiculo_id(placa, modelo, marca),
          motorista:motoristas!motorista_id(nome),
          viagem:viagens!viagem_id(codigo)
        `)
        .order('data_abastecimento', { ascending: false });

      if (veiculoId) {
        query = query.eq('veiculo_id', veiculoId);
      }

      if (viagemId) {
        query = query.eq('viagem_id', viagemId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: true, // Sempre habilitado, filtros são opcionais
  });

  // Criar abastecimento
  const createAbastecimento = useMutation({
    mutationFn: async (data: AbastecimentoFormData) => {
      const insertData: any = {
        veiculo_id: data.veiculo_id,
        viagem_id: data.viagem_id,
        motorista_id: data.motorista_id,
        km_veiculo: data.km_veiculo,
        litros: data.litros,
        valor_total: data.valor_total,
        posto_nome: data.posto_nome,
        posto_cidade: data.posto_cidade,
        posto_uf: data.posto_uf,
        data_abastecimento: data.data_abastecimento,
        comprovante_url: data.comprovante_url,
        observacoes: data.observacoes,
        latitude: data.latitude,
        longitude: data.longitude,
        localizacao_timestamp: data.localizacao_timestamp,
      };

      const { data: abastecimento, error } = await supabase
        .from('abastecimentos')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return abastecimento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast.success('Abastecimento registrado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao criar abastecimento:', error);
      toast.error('Erro ao registrar abastecimento');
    },
  });

  // Validar abastecimento
  const validarAbastecimento = useMutation({
    mutationFn: async ({ id, observacoes }: { id: string; observacoes?: string }) => {
      const { data, error } = await supabase
        .from('abastecimentos')
        .update({
          status: 'validado',
          validado_em: new Date().toISOString(),
          observacoes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast.success('Abastecimento validado!');
    },
    onError: (error: Error) => {
      console.error('Erro ao validar abastecimento:', error);
      toast.error('Erro ao validar abastecimento');
    },
  });

  // Deletar abastecimento
  const deleteAbastecimento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('abastecimentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast.success('Abastecimento removido');
    },
    onError: (error: Error) => {
      console.error('Erro ao deletar abastecimento:', error);
      toast.error('Erro ao remover abastecimento');
    },
  });

  // Estatísticas do veículo
  const estatisticasQuery = useQuery({
    queryKey: ['abastecimentos-estatisticas', veiculoId],
    queryFn: async () => {
      if (!veiculoId) return null;

      const { data, error } = await supabase
        .from('veiculos')
        .select(`
          media_consumo_geral,
          ultimo_abastecimento_km,
          ultimo_abastecimento_data,
          total_abastecimentos,
          total_litros_abastecidos,
          total_km_rodados
        `)
        .eq('id', veiculoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!veiculoId,
  });

  return {
    abastecimentos: abastecimentosQuery.data,
    isLoading: abastecimentosQuery.isLoading,
    estatisticas: estatisticasQuery.data,
    createAbastecimento,
    validarAbastecimento,
    deleteAbastecimento,
  };
}
