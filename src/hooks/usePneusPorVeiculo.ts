import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePneusPorVeiculo(veiculoId?: string) {
  return useQuery({
    queryKey: ['pneus', 'veiculo', veiculoId],
    queryFn: async () => {
      if (!veiculoId) return [];
      
      const { data, error } = await supabase
        .from('pneus')
        .select('*')
        .eq('veiculo_id', veiculoId)
        .eq('status', 'em_uso')
        .order('posicao_veiculo');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!veiculoId,
  });
}
