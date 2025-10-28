import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ManutencaoFormData, AlertaManutencaoFormData, ManutencaoItemFormData } from '@/lib/validations-manutencao';

export function useManutencoes(veiculoId?: string) {
  const queryClient = useQueryClient();

  const manutencoesQuery = useQuery({
    queryKey: ['manutencoes', veiculoId],
    queryFn: async () => {
      let query = supabase
        .from('manutencoes' as any)
        .select(`
          *,
          veiculo:veiculos(codigo_interno, placa, marca, modelo),
          mecanico:mecanicos(nome)
        `)
        .order('data', { ascending: false });

      if (veiculoId) {
        query = query.eq('veiculo_id', veiculoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createManutencao = useMutation({
    mutationFn: async (manutencao: ManutencaoFormData) => {
      const { data, error } = await supabase
        .from('manutencoes' as any)
        .insert([manutencao as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      toast.success('Manutenção cadastrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar manutenção: ${error.message}`);
    },
  });

  const updateManutencao = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ManutencaoFormData> }) => {
      const { error } = await supabase
        .from('manutencoes' as any)
        .update(data as any)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      toast.success('Manutenção atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar manutenção: ${error.message}`);
    },
  });

  const deleteManutencao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('manutencoes' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      toast.success('Manutenção excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir manutenção: ${error.message}`);
    },
  });

  return {
    manutencoes: manutencoesQuery.data || [],
    isLoading: manutencoesQuery.isLoading,
    createManutencao,
    updateManutencao,
    deleteManutencao,
  };
}

export function useAlertasManutencao(veiculoId?: string) {
  const queryClient = useQueryClient();

  const alertasQuery = useQuery({
    queryKey: ['alertas-manutencao', veiculoId],
    queryFn: async () => {
      let query = supabase
        .from('alertas_manutencao' as any)
        .select(`
          *,
          veiculo:veiculos(codigo_interno, placa, marca, modelo, km_atual)
        `)
        .order('created_at', { ascending: false });

      if (veiculoId) {
        query = query.eq('veiculo_id', veiculoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createAlerta = useMutation({
    mutationFn: async (alerta: AlertaManutencaoFormData) => {
      const { data, error } = await supabase
        .from('alertas_manutencao' as any)
        .insert([alerta as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-manutencao'] });
      toast.success('Alerta criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar alerta: ${error.message}`);
    },
  });

  const updateAlerta = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AlertaManutencaoFormData> }) => {
      const { error } = await supabase
        .from('alertas_manutencao' as any)
        .update(data as any)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-manutencao'] });
      toast.success('Alerta atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar alerta: ${error.message}`);
    },
  });

  const deleteAlerta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alertas_manutencao' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-manutencao'] });
      toast.success('Alerta excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir alerta: ${error.message}`);
    },
  });

  return {
    alertas: alertasQuery.data || [],
    isLoading: alertasQuery.isLoading,
    createAlerta,
    updateAlerta,
    deleteAlerta,
  };
}

export function useManutencoesItens(manutencaoId?: string) {
  const queryClient = useQueryClient();

  const itensQuery = useQuery({
    queryKey: ['manutencoes-itens', manutencaoId],
    queryFn: async () => {
      if (!manutencaoId) return [];

      const { data, error } = await supabase
        .from('manutencoes_itens' as any)
        .select(`
          *,
          item:itens_estoque(codigo, descricao, unidade)
        `)
        .eq('manutencao_id', manutencaoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!manutencaoId,
  });

  const addItem = useMutation({
    mutationFn: async (item: ManutencaoItemFormData & { created_by?: string }) => {
      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('manutencoes_itens' as any)
        .insert([{ ...item, created_by: session.session?.user.id } as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes-itens'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      toast.success('Item adicionado com sucesso! Estoque atualizado.');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar item: ${error.message}`);
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('manutencoes_itens' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes-itens'] });
      toast.success('Item removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover item: ${error.message}`);
    },
  });

  return {
    itens: itensQuery.data || [],
    isLoading: itensQuery.isLoading,
    addItem,
    removeItem,
  };
}
