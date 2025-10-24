import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AcertoFormData } from '@/lib/validations-acerto';
import { useToast } from '@/hooks/use-toast';

export function useAcertos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acertosQuery = useQuery({
    queryKey: ['acertos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acertos')
        .select(`
          *,
          motorista:motoristas(nome, cpf, comissao_padrao)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createAcerto = useMutation({
    mutationFn: async (data: AcertoFormData) => {
      const { data: result, error } = await supabase
        .from('acertos')
        .insert([data as any])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acertos'] });
      toast({
        title: 'Sucesso',
        description: 'Acerto criado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar acerto',
        variant: 'destructive',
      });
    },
  });

  const updateAcerto = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AcertoFormData> }) => {
      const { data: result, error } = await supabase
        .from('acertos')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acertos'] });
      toast({
        title: 'Sucesso',
        description: 'Acerto atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar acerto',
        variant: 'destructive',
      });
    },
  });

  const deleteAcerto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('acertos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acertos'] });
      toast({
        title: 'Sucesso',
        description: 'Acerto excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir acerto',
        variant: 'destructive',
      });
    },
  });

  return {
    acertos: acertosQuery.data ?? [],
    isLoading: acertosQuery.isLoading,
    error: acertosQuery.error,
    createAcerto,
    updateAcerto,
    deleteAcerto,
  };
}

export function useViagensDisponiveis(motoristaId?: string, periodoInicio?: string, periodoFim?: string) {
  return useQuery({
    queryKey: ['viagens-disponiveis', motoristaId, periodoInicio, periodoFim],
    queryFn: async () => {
      let query = supabase
        .from('viagens')
        .select(`
          *,
          frete:fretes(valor_frete, codigo, cliente_nome),
          despesas(id, tipo, valor, reembolsavel, descricao, data)
        `)
        .eq('status', 'concluida')
        .is('acerto_id', null);

      if (motoristaId) {
        query = query.eq('motorista_id', motoristaId);
      }

      if (periodoInicio) {
        query = query.gte('data_chegada', periodoInicio);
      }

      if (periodoFim) {
        query = query.lte('data_chegada', periodoFim);
      }

      const { data, error } = await query.order('data_chegada', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!motoristaId && !!periodoInicio && !!periodoFim,
  });
}

export function useViagensAcerto(acertoId?: string) {
  return useQuery({
    queryKey: ['viagens-acerto', acertoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viagens')
        .select(`
          *,
          frete:fretes(codigo, valor_frete, cliente_nome),
          despesas(tipo, valor, reembolsavel, descricao)
        `)
        .eq('acerto_id', acertoId!)
        .order('data_saida', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!acertoId,
  });
}

export function useVincularViagens() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ viagemIds, acertoId }: { viagemIds: string[]; acertoId: string }) => {
      // Vincular viagens ao acerto
      const { error } = await supabase
        .from('viagens')
        .update({ acerto_id: acertoId })
        .in('id', viagemIds);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      queryClient.invalidateQueries({ queryKey: ['viagens-disponiveis'] });
      queryClient.invalidateQueries({ queryKey: ['viagens-acerto'] });
      queryClient.invalidateQueries({ queryKey: ['acertos'] });
      toast({
        title: 'Sucesso',
        description: `${variables.viagemIds.length} viagem(ns) vinculada(s) ao acerto com todas as despesas`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao vincular viagens',
        variant: 'destructive',
      });
    },
  });
}
