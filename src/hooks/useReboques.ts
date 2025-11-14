import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Reboque = Tables<'reboques'>;

export function useReboques() {
  const queryClient = useQueryClient();

  const reboques = useQuery<Reboque[]>({
    queryKey: ['reboques'],
    queryFn: async () => {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('empresa_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      const { data, error } = await supabase
        .from('reboques')
        .select('*')
        .eq('empresa_id', userRole?.empresa_id || '')
        .order('codigo_interno');

      if (error) throw error;
      return data;
    },
  });

  const createReboque = useMutation({
    mutationFn: async (newReboque: any) => {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('empresa_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      const { data, error } = await supabase
        .from('reboques')
        .insert([{ ...newReboque, empresa_id: userRole?.empresa_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reboques'] });
      toast.success('Reboque cadastrado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao criar reboque:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('Já existe um reboque com este código ou placa');
      } else {
        toast.error('Erro ao cadastrar reboque');
      }
    },
  });

  const updateReboque = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: updated, error } = await supabase
        .from('reboques')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reboques'] });
      toast.success('Reboque atualizado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar reboque:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('Já existe um reboque com este código ou placa');
      } else {
        toast.error('Erro ao atualizar reboque');
      }
    },
  });

  const deleteReboque = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reboques').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reboques'] });
      toast.success('Reboque excluído com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir reboque:', error);
      toast.error('Erro ao excluir reboque');
    },
  });

  return {
    reboques: reboques.data || [],
    isLoading: reboques.isLoading,
    createReboque,
    updateReboque,
    deleteReboque,
  };
}
