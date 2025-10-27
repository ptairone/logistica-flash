import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DespesaValidacao {
  id: string;
  despesa_id: string;
  acerto_id: string;
  status: 'pendente' | 'aprovada' | 'reprovada' | 'ajustada';
  valor_original: number;
  valor_aprovado?: number;
  justificativa?: string;
  validado_por?: string;
  validado_em?: string;
  observacoes?: string;
  created_at: string;
}

export function useDespesasValidacao(acertoId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['despesas-validacao', acertoId],
    queryFn: async () => {
      if (!acertoId) return [];
      
      const { data, error } = await supabase
        .from('despesas_validacao')
        .select('*')
        .eq('acerto_id', acertoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DespesaValidacao[];
    },
    enabled: enabled && !!acertoId,
  });
}

export function useValidarDespesa() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (validacao: Omit<DespesaValidacao, 'id' | 'created_at' | 'validado_por' | 'validado_em'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('despesas_validacao')
        .upsert({
          ...validacao,
          validado_por: user?.id,
          validado_em: new Date().toISOString(),
        }, {
          onConflict: 'despesa_id,acerto_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['despesas-validacao', variables.acerto_id] });
      toast({
        title: 'Despesa validada',
        description: 'A validação foi registrada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao validar despesa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
