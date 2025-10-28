import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MecanicoFormData } from '@/lib/validations-manutencao';

export function useMecanicos() {
  const queryClient = useQueryClient();

  const mecanicosQuery = useQuery({
    queryKey: ['mecanicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mecanicos' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMecanico = useMutation({
    mutationFn: async (mecanico: MecanicoFormData) => {
      const { data, error } = await supabase
        .from('mecanicos' as any)
        .insert([mecanico as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mecanicos'] });
      toast.success('Mecânico cadastrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar mecânico: ${error.message}`);
    },
  });

  const updateMecanico = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MecanicoFormData> }) => {
      const { error } = await supabase
        .from('mecanicos' as any)
        .update(data as any)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mecanicos'] });
      toast.success('Mecânico atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar mecânico: ${error.message}`);
    },
  });

  const deleteMecanico = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mecanicos' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mecanicos'] });
      toast.success('Mecânico excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir mecânico: ${error.message}`);
    },
  });

  return {
    mecanicos: mecanicosQuery.data || [],
    isLoading: mecanicosQuery.isLoading,
    createMecanico,
    updateMecanico,
    deleteMecanico,
  };
}
