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

  return {
    fretes: fretesQuery.data ?? [],
    isLoading: fretesQuery.isLoading,
    error: fretesQuery.error,
    createFrete,
    updateFrete,
    deleteFrete,
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
