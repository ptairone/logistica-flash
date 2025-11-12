import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePneusPorItemEstoque(itemEstoqueId?: string) {
  const pneusQuery = useQuery({
    queryKey: ['pneus-por-item-estoque', itemEstoqueId],
    queryFn: async () => {
      if (!itemEstoqueId) return [];
      
      const { data, error } = await supabase
        .from('pneus' as any)
        .select('*')
        .eq('item_estoque_id', itemEstoqueId)
        .order('created_at', { ascending: false});
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!itemEstoqueId
  });
  
  return {
    pneus: pneusQuery.data || [],
    isLoading: pneusQuery.isLoading
  };
}

export function usePneus(filters?: {
  status?: string;
  veiculoId?: string;
  tipo?: string;
  critico?: boolean;
  item_estoque_id?: string;
}) {
  const queryClient = useQueryClient();

  const pneusQuery = useQuery({
    queryKey: ['pneus', filters],
    queryFn: async () => {
      let query = supabase
        .from('pneus' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.veiculoId) {
        query = query.eq('veiculo_id', filters.veiculoId);
      }
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const createPneu = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const userRolesResponse = await supabase
        .from('user_roles' as any)
        .select('empresa_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userRolesResponse.error) throw userRolesResponse.error;
      if (!userRolesResponse.data) throw new Error('Usuário sem empresa vinculada');

      const empresaId = (userRolesResponse.data as any).empresa_id;

      const { data: result, error } = await supabase
        .from('pneus' as any)
        .insert({ ...data, empresa_id: empresaId })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      queryClient.invalidateQueries({ queryKey: ['itens_estoque'] });
      toast.success('Pneu cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cadastrar pneu');
    },
  });

  const updatePneu = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from('pneus' as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar pneu');
    },
  });

  const deletePneu = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pneus' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir pneu');
    },
  });

  const instalarPneu = useMutation({
    mutationFn: async ({ 
      pneuId, 
      veiculoId, 
      posicao, 
      kmVeiculo,
      dataInstalacao 
    }: {
      pneuId: string;
      veiculoId: string;
      posicao: string;
      kmVeiculo: number;
      dataInstalacao?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('pneus' as any)
        .update({
          status: 'em_uso' as any,
          veiculo_id: veiculoId,
          posicao_veiculo: posicao,
          km_instalacao: kmVeiculo,
          km_atual: kmVeiculo,
          data_instalacao: dataInstalacao || new Date().toISOString(),
        })
        .eq('id', pneuId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      queryClient.invalidateQueries({ queryKey: ['itens_estoque'] });
      toast.success('Pneu instalado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao instalar pneu');
    },
  });

  const removerPneu = useMutation({
    mutationFn: async ({ pneuId, kmVeiculo }: { pneuId: string; kmVeiculo: number }) => {
      const { data: result, error } = await supabase
        .from('pneus' as any)
        .update({
          status: 'estoque' as any,
          veiculo_id: null,
          posicao_veiculo: null,
          km_atual: kmVeiculo,
          data_remocao: new Date().toISOString(),
        })
        .eq('id', pneuId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      queryClient.invalidateQueries({ queryKey: ['itens_estoque'] });
      toast.success('Pneu removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover pneu');
    },
  });

  const descartarPneu = useMutation({
    mutationFn: async ({ 
      pneuId, 
      motivo,
      kmVeiculo 
    }: { 
      pneuId: string; 
      motivo: string;
      kmVeiculo?: number;
    }) => {
      const { data: result, error } = await supabase
        .from('pneus' as any)
        .update({
          status: 'descartado' as any,
          motivo_descarte: motivo,
          km_atual: kmVeiculo,
          veiculo_id: null,
          posicao_veiculo: null,
        })
        .eq('id', pneuId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu descartado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao descartar pneu');
    },
  });

  const createPneusLote = useMutation({
    mutationFn: async ({ 
      itemEstoqueId, 
      pneus 
    }: { 
      itemEstoqueId: string; 
      pneus: any[] 
    }) => {
      const { data: itemEstoque, error: fetchError } = await supabase
        .from('itens_estoque' as any)
        .select('*')
        .eq('id', itemEstoqueId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!itemEstoque) throw new Error('Item de estoque não encontrado');
      
      const pneusComEmpresa = pneus.map(p => ({
        ...p,
        item_estoque_id: itemEstoqueId,
        empresa_id: (itemEstoque as any).empresa_id,
        status: 'estoque'
      }));
      
      const { data, error } = await supabase
        .from('pneus' as any)
        .insert(pneusComEmpresa)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['pneus-por-item-estoque'] });
      toast.success('Pneus cadastrados com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cadastrar pneus em lote');
    }
  });

  return {
    pneus: pneusQuery.data || [],
    isLoading: pneusQuery.isLoading,
    createPneu,
    updatePneu,
    deletePneu,
    instalarPneu,
    removerPneu,
    descartarPneu,
    createPneusLote
  };
}

export function usePneusHistorico(pneuId?: string) {
  const historicoQuery = useQuery({
    queryKey: ['pneus-historico', pneuId],
    queryFn: async () => {
      if (!pneuId) return [];
      
      const { data, error } = await supabase
        .from('pneus_historico' as any)
        .select('*')
        .eq('pneu_id', pneuId)
        .order('data_evento', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!pneuId,
  });

  return {
    historico: historicoQuery.data || [],
    isLoading: historicoQuery.isLoading,
  };
}

export function usePneusMedicoes(pneuId?: string) {
  const queryClient = useQueryClient();

  const medicoesQuery = useQuery({
    queryKey: ['pneus-medicoes', pneuId],
    queryFn: async () => {
      if (!pneuId) return [];
      
      const { data, error } = await supabase
        .from('pneus_medicoes' as any)
        .select('*')
        .eq('pneu_id', pneuId)
        .order('data_medicao', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!pneuId,
  });

  const createMedicao = useMutation({
    mutationFn: async (medicao: any) => {
      const { data, error } = await supabase
        .from('pneus_medicoes' as any)
        .insert(medicao)
        .select()
        .single();

      if (error) throw error;

      // Calcular média das 3 medições
      const profundidadeMedia = (
        (medicao.profundidade_interna_mm || 0) +
        (medicao.profundidade_central_mm || 0) +
        (medicao.profundidade_externa_mm || 0)
      ) / 3;

      // Atualizar profundidade no pneu
      await supabase
        .from('pneus' as any)
        .update({ 
          profundidade_sulco_mm: profundidadeMedia,
          km_atual: medicao.km_veiculo 
        })
        .eq('id', medicao.pneu_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus-medicoes'] });
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Medição registrada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao registrar medição');
    },
  });

  return {
    medicoes: medicoesQuery.data || [],
    isLoading: medicoesQuery.isLoading,
    createMedicao,
  };
}

export function usePneusRelatorios() {
  const relatoriosQuery = useQuery({
    queryKey: ['pneus-relatorios'],
    queryFn: async () => {
      const { data: pneus, error } = await supabase
        .from('pneus' as any)
        .select('*');

      if (error) throw error;

      const pneusArray = pneus as any[];
      const totalPneus = pneusArray.length;
      const emUso = pneusArray.filter(p => p.status === 'em_uso').length;
      const emEstoque = pneusArray.filter(p => p.status === 'estoque').length;
      const criticos = pneusArray.filter(p => p.status === 'em_uso' && 
        p.profundidade_sulco_mm && p.profundidade_sulco_mm <= (p.profundidade_minima_mm || 1.6)
      ).length;

      const custoTotal = pneusArray.reduce((sum, p) => sum + (p.valor_compra || 0), 0);
      const kmTotal = pneusArray.reduce((sum, p) => sum + (p.km_rodados || 0), 0);
      const custoPorKm = kmTotal > 0 ? custoTotal / kmTotal : 0;

      return {
        totalPneus,
        emUso,
        emEstoque,
        criticos,
        custoTotal,
        kmTotal,
        custoPorKm,
      };
    },
  });

  return {
    relatorios: relatoriosQuery.data,
    isLoading: relatoriosQuery.isLoading,
  };
}
