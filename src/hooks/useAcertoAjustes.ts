import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AcertoAjuste {
  id: string;
  acerto_id: string;
  tipo: 'bonificacao' | 'penalidade' | 'correcao' | 'outros';
  categoria: string;
  descricao: string;
  valor: number;
  justificativa?: string;
  comprovante_url?: string;
  created_by?: string;
  created_at: string;
}

export function useAcertoAjustes(acertoId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['acerto-ajustes', acertoId],
    queryFn: async () => {
      if (!acertoId) return [];
      
      const { data, error } = await supabase
        .from('acerto_ajustes')
        .select('*')
        .eq('acerto_id', acertoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AcertoAjuste[];
    },
    enabled: enabled && !!acertoId,
  });
}

export function useCreateAjuste() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ajuste: Omit<AcertoAjuste, 'id' | 'created_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('acerto_ajustes')
        .insert({
          ...ajuste,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acerto-ajustes', variables.acerto_id] });
      queryClient.invalidateQueries({ queryKey: ['acertos'] });
      toast({
        title: 'Ajuste adicionado',
        description: 'O ajuste foi adicionado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar ajuste',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAjuste() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, acerto_id }: { id: string; acerto_id: string }) => {
      const { error } = await supabase
        .from('acerto_ajustes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { acerto_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['acerto-ajustes', data.acerto_id] });
      queryClient.invalidateQueries({ queryKey: ['acertos'] });
      toast({
        title: 'Ajuste removido',
        description: 'O ajuste foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover ajuste',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
