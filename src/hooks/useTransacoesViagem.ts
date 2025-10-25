import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TransacaoFormData {
  tipo: 'adiantamento' | 'recebimento_frete';
  valor: number;
  data: string;
  descricao?: string;
}

export interface TransacaoCreateData extends TransacaoFormData {
  viagem_id: string;
}

export function useTransacoesViagem(viagemId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transacoesQuery = useQuery({
    queryKey: ['transacoes-viagem', viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacoes_viagem')
        .select('*')
        .eq('viagem_id', viagemId!)
        .order('data', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!viagemId,
  });

  const createTransacao = useMutation({
    mutationFn: async (data: TransacaoCreateData) => {
      const { data: result, error } = await supabase
        .from('transacoes_viagem')
        .insert([data as any])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes-viagem'] });
      toast({
        title: 'Sucesso',
        description: 'Transação adicionada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar transação',
        variant: 'destructive',
      });
    },
  });

  const deleteTransacao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transacoes_viagem')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes-viagem'] });
      toast({
        title: 'Sucesso',
        description: 'Transação excluída com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir transação',
        variant: 'destructive',
      });
    },
  });

  // Calcular totais
  const totais = {
    adiantamentos: transacoesQuery.data
      ?.filter(t => t.tipo === 'adiantamento')
      .reduce((acc, t) => acc + Number(t.valor), 0) || 0,
    recebimentos: transacoesQuery.data
      ?.filter(t => t.tipo === 'recebimento_frete')
      .reduce((acc, t) => acc + Number(t.valor), 0) || 0,
  };

  return {
    transacoes: transacoesQuery.data ?? [],
    isLoading: transacoesQuery.isLoading,
    createTransacao,
    deleteTransacao,
    totais,
  };
}
