import { useQuery, useMutation, useQueryClient } from '@tantml:function_calls>
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMemo } from 'react';

type VeiculoComposicao = {
  id: string;
  veiculo_id: string;
  reboque_id: string;
  ordem: number;
  data_acoplamento: string;
  data_desacoplamento: string | null;
  ativo: boolean;
  created_at: string;
  reboques?: any;
};

export function useVeiculoComposicao(veiculoId: string | undefined) {
  const queryClient = useQueryClient();

  const composicao = useQuery({
    queryKey: ['veiculos-composicao', veiculoId],
    queryFn: async () => {
      if (!veiculoId) return [];

      const { data, error } = await supabase
        .from('veiculos_composicao')
        .select(`
          *,
          reboques:reboque_id (*)
        `)
        .eq('veiculo_id', veiculoId)
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      return data;
    },
    enabled: !!veiculoId,
  });

  const acoplarReboque = useMutation({
    mutationFn: async ({ veiculoId, reboqueId, ordem }: { veiculoId: string; reboqueId: string; ordem: number }) => {
      const { data, error } = await supabase
        .from('veiculos_composicao')
        .insert([{
          veiculo_id: veiculoId,
          reboque_id: reboqueId,
          ordem,
          ativo: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos-composicao'] });
      queryClient.invalidateQueries({ queryKey: ['reboques'] });
      toast.success('Reboque acoplado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao acoplar reboque:', error);
      if (error.message?.includes('mais de 2 reboques')) {
        toast.error('Um veículo não pode ter mais de 2 reboques acoplados');
      } else {
        toast.error('Erro ao acoplar reboque');
      }
    },
  });

  const desacoplarReboque = useMutation({
    mutationFn: async (composicaoId: string) => {
      const { error } = await supabase
        .from('veiculos_composicao')
        .update({ 
          ativo: false, 
          data_desacoplamento: new Date().toISOString() 
        })
        .eq('id', composicaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos-composicao'] });
      queryClient.invalidateQueries({ queryKey: ['reboques'] });
      toast.success('Reboque desacoplado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao desacoplar reboque:', error);
      toast.error('Erro ao desacoplar reboque');
    },
  });

  const totalEixos = useMemo(() => {
    if (!composicao.data) return 0;
    
    const eixosReboques = composicao.data.reduce((sum, comp: any) => {
      return sum + (comp.reboques?.numero_eixos || 0);
    }, 0);
    
    return eixosReboques;
  }, [composicao.data]);

  return {
    composicao: composicao.data || [],
    isLoading: composicao.isLoading,
    acoplarReboque,
    desacoplarReboque,
    totalEixos,
  };
}
