import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function useViagensMotorista() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['viagens-motorista', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Buscar motorista pelo user_id
      const { data: motorista, error: motoristaError } = await supabase
        .from('motoristas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (motoristaError) throw motoristaError;
      if (!motorista) throw new Error('Motorista não encontrado');

      // Buscar viagens do motorista
      const { data, error } = await supabase
        .from('viagens')
        .select(`
          *,
          veiculo:veiculos!veiculo_id(placa, modelo, marca),
          frete:fretes!frete_id(codigo, cliente_nome, destino)
        `)
        .eq('motorista_id', motorista.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}
