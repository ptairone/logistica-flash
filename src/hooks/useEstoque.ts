import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ItemEstoqueFormData, MovimentacaoEstoqueFormData, calcularCustoMedio } from '@/lib/validations-estoque';

// Hook para gerenciar itens de estoque
export function useEstoque() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os itens
  const itensQuery = useQuery({
    queryKey: ['itens-estoque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itens_estoque')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Criar item
  const createItem = useMutation({
    mutationFn: async (itemData: ItemEstoqueFormData) => {
      const { data, error } = await supabase
        .from('itens_estoque')
        .insert([itemData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      toast({
        title: 'Item criado',
        description: 'Item de estoque criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Atualizar item
  const updateItem = useMutation({
    mutationFn: async ({ id, ...itemData }: ItemEstoqueFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('itens_estoque')
        .update(itemData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      toast({
        title: 'Item atualizado',
        description: 'Item de estoque atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deletar item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('itens_estoque')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      toast({
        title: 'Item excluído',
        description: 'Item de estoque excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    itens: itensQuery.data || [],
    isLoading: itensQuery.isLoading,
    createItem,
    updateItem,
    deleteItem,
  };
}

// Hook para movimentações de estoque
export function useMovimentacoesEstoque(itemId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar movimentações
  const movimentacoesQuery = useQuery({
    queryKey: ['movimentacoes-estoque', itemId],
    queryFn: async () => {
      let query = supabase
        .from('movimentacoes_estoque')
        .select(`
          *,
          item:itens_estoque(codigo, descricao, unidade),
          usuario:profiles(nome)
        `)
        .order('data', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Criar movimentação
  const createMovimentacao = useMutation({
    mutationFn: async (movData: MovimentacaoEstoqueFormData) => {
      // 1. Buscar item atual
      const { data: item, error: itemError } = await supabase
        .from('itens_estoque')
        .select('*')
        .eq('id', movData.item_id)
        .single();

      if (itemError) throw itemError;

      // 2. Calcular novo estoque e custo médio
      let novoEstoque = item.estoque_atual;
      let novoCustoMedio = item.custo_medio;

      if (movData.tipo === 'entrada') {
        novoEstoque += movData.quantidade;
        if (movData.custo_unitario) {
          novoCustoMedio = calcularCustoMedio(
            item.estoque_atual,
            item.custo_medio,
            movData.quantidade,
            movData.custo_unitario
          );
        }
      } else if (movData.tipo === 'saida') {
        if (item.estoque_atual < movData.quantidade) {
          throw new Error('Estoque insuficiente para esta operação');
        }
        novoEstoque -= movData.quantidade;
      } else if (movData.tipo === 'ajuste') {
        // Ajuste pode ser positivo ou negativo
        novoEstoque = movData.quantidade;
        if (movData.custo_unitario && movData.quantidade > item.estoque_atual) {
          // Ajuste positivo com custo
          const qtdEntrada = movData.quantidade - item.estoque_atual;
          novoCustoMedio = calcularCustoMedio(
            item.estoque_atual,
            item.custo_medio,
            qtdEntrada,
            movData.custo_unitario
          );
        }
      }

      // 3. Criar movimentação
      const { data: auth } = await supabase.auth.getUser();
      const { data: movimentacao, error: movError } = await supabase
        .from('movimentacoes_estoque')
        .insert([{
          ...movData,
          usuario_id: auth.user?.id,
          data: new Date().toISOString(),
        } as any])
        .select()
        .single();

      if (movError) throw movError;

      // 4. Atualizar estoque do item
      const { error: updateError } = await supabase
        .from('itens_estoque')
        .update({
          estoque_atual: novoEstoque,
          custo_medio: novoCustoMedio,
        })
        .eq('id', movData.item_id);

      if (updateError) throw updateError;

      return movimentacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      toast({
        title: 'Movimentação registrada',
        description: 'Movimentação de estoque registrada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao registrar movimentação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    movimentacoes: movimentacoesQuery.data || [],
    isLoading: movimentacoesQuery.isLoading,
    createMovimentacao,
  };
}

// Hook para relatórios de estoque
export function useRelatoriosEstoque() {
  // Relatório de consumo por período
  const getRelatorioConsumo = async (params: {
    startDate?: string;
    endDate?: string;
    itemId?: string;
    categoria?: string;
  }) => {
    let query = supabase
      .from('movimentacoes_estoque')
      .select(`
        *,
        item:itens_estoque(codigo, descricao, categoria, unidade, custo_medio)
      `)
      .eq('tipo', 'saida');

    if (params.startDate) {
      query = query.gte('data', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('data', params.endDate);
    }
    if (params.itemId) {
      query = query.eq('item_id', params.itemId);
    }

    const { data, error } = await query.order('data', { ascending: false });

    if (error) throw error;

    // Filtrar por categoria se necessário
    let filteredData = data;
    if (params.categoria) {
      filteredData = data.filter(mov => mov.item?.categoria === params.categoria);
    }

    return filteredData;
  };

  // Itens críticos (abaixo do mínimo)
  const getItensCriticos = async () => {
    const { data, error } = await supabase
      .from('itens_estoque')
      .select('*')
      .order('estoque_atual', { ascending: true });

    if (error) throw error;
    // Filtrar no cliente itens críticos
    return data.filter(item => item.estoque_atual <= item.estoque_minimo);
  };

  return {
    getRelatorioConsumo,
    getItensCriticos,
  };
}
