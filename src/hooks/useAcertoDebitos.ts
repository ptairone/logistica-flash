import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AcertoDebito {
  id: string;
  motorista_id: string;
  acerto_id?: string;
  tipo: 'vale_combustivel' | 'emprestimo' | 'dano' | 'multa' | 'outros';
  descricao: string;
  valor_original: number;
  valor_pago: number;
  saldo: number;
  parcelas: number;
  status: 'ativo' | 'quitado' | 'cancelado';
  data_vencimento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export function useDebitosMotorista(motoristaId: string | undefined, apenasAtivos = true) {
  return useQuery({
    queryKey: ['debitos-motorista', motoristaId, apenasAtivos],
    queryFn: async () => {
      if (!motoristaId) return [];
      
      let query = supabase
        .from('acerto_debitos')
        .select('*')
        .eq('motorista_id', motoristaId);

      if (apenasAtivos) {
        query = query.eq('status', 'ativo');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as AcertoDebito[];
    },
    enabled: !!motoristaId,
  });
}

export function useCreateDebito() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (debito: Omit<AcertoDebito, 'id' | 'valor_pago' | 'saldo' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('acerto_debitos')
        .insert({
          ...debito,
          valor_pago: 0,
          saldo: debito.valor_original,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['debitos-motorista', data.motorista_id] });
      toast({
        title: 'Débito criado',
        description: 'O débito foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar débito',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateDebito() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AcertoDebito> & { id: string }) => {
      const { data, error } = await supabase
        .from('acerto_debitos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['debitos-motorista', data.motorista_id] });
      queryClient.invalidateQueries({ queryKey: ['acertos'] });
      toast({
        title: 'Débito atualizado',
        description: 'O débito foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar débito',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
