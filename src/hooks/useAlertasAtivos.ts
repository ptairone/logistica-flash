import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAlertasAtivos() {
  return useQuery({
    queryKey: ['alertas-ativos'],
    queryFn: async () => {
      // Buscar alertas ativos
      const { data: alertas, error } = await supabase
        .from('alertas_manutencao')
        .select(`
          *,
          veiculo:veiculos(id, codigo_interno, placa, km_atual)
        `)
        .eq('ativo', true);

      if (error) throw error;

      // Filtrar alertas que já foram ativados
      const hoje = new Date();
      const alertasAtivados = (alertas || []).filter((alerta: any) => {
        // Alerta por KM
        if (alerta.tipo === 'km' && alerta.km_alerta && alerta.veiculo?.km_atual) {
          return alerta.veiculo.km_atual >= alerta.km_alerta;
        }

        // Alerta por data
        if (alerta.tipo === 'data' && alerta.data_alerta) {
          const dataAlerta = new Date(alerta.data_alerta);
          return hoje >= dataAlerta;
        }

        // Alerta por ambos (KM E data)
        if (alerta.tipo === 'ambos') {
          const alertaKm = alerta.km_alerta && alerta.veiculo?.km_atual 
            ? alerta.veiculo.km_atual >= alerta.km_alerta 
            : false;
          const alertaData = alerta.data_alerta 
            ? hoje >= new Date(alerta.data_alerta) 
            : false;
          
          return alertaKm || alertaData;
        }

        return false;
      });

      return alertasAtivados;
    },
    refetchInterval: 60000, // Refetch a cada 1 minuto
  });
}
