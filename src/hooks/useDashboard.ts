import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';

export function useDashboard() {
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  const ultimos7Dias = subDays(hoje, 7);

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      // Viagens do mês
      const { data: viagensMes, error: viagensError } = await supabase
        .from('viagens')
        .select('*, despesas(*)')
        .gte('created_at', inicioMes.toISOString())
        .lte('created_at', fimMes.toISOString());

      if (viagensError) throw viagensError;

      // Viagens em andamento
      const { data: viagensAndamento } = await supabase
        .from('viagens')
        .select('id')
        .eq('status', 'em_andamento');

      // Viagens concluídas no mês
      const viagensConcluidas = viagensMes?.filter(v => v.status === 'concluida') || [];

      // Cálculo de custos e KM
      const totalKm = viagensConcluidas.reduce((sum, v) => sum + (v.km_percorrido || 0), 0);
      const totalDespesas = viagensConcluidas.reduce((sum, v) => {
        const despesasViagem = Array.isArray(v.despesas) 
          ? v.despesas.reduce((s, d) => s + Number(d.valor), 0)
          : 0;
        return sum + despesasViagem;
      }, 0);
      const custoKm = totalKm > 0 ? totalDespesas / totalKm : 0;

      // Fretes em aberto
      const { data: fretesAberto } = await supabase
        .from('fretes')
        .select('id')
        .eq('status', 'aberto');

      // Estoque baixo
      const { data: estoqueBaixo } = await supabase
        .from('itens_estoque')
        .select('id, codigo, descricao, estoque_atual, estoque_minimo');

      const itensBaixo = estoqueBaixo?.filter(
        item => item.estoque_atual < item.estoque_minimo
      ) || [];

      // Motoristas com CNH vencendo em 30 dias
      const { data: cnhVencendo } = await supabase
        .from('motoristas')
        .select('id, nome, validade_cnh')
        .eq('status', 'ativo')
        .lte('validade_cnh', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

      // Veículos com manutenção atrasada
      const { data: manutencaoAtrasada } = await supabase
        .from('veiculos')
        .select('id, placa, proxima_manutencao_data, proxima_manutencao_km, km_atual')
        .eq('status', 'ativo');

      const veiculosAtrasados = manutencaoAtrasada?.filter(v => {
        const dataVencida = v.proxima_manutencao_data && new Date(v.proxima_manutencao_data) < hoje;
        const kmVencido = v.proxima_manutencao_km && v.km_atual >= v.proxima_manutencao_km;
        return dataVencida || kmVencido;
      }) || [];

      // Receita vs Despesas (últimos 7 dias)
      const { data: viagensRecentes } = await supabase
        .from('viagens')
        .select('*, despesas(*), frete:fretes(valor_frete)')
        .gte('created_at', ultimos7Dias.toISOString())
        .eq('status', 'concluida');

      const receitaRecente = viagensRecentes?.reduce((sum, v) => {
        const frete = Array.isArray(v.frete) ? v.frete[0] : v.frete;
        return sum + (frete?.valor_frete || 0);
      }, 0) || 0;

      const despesasRecentes = viagensRecentes?.reduce((sum, v) => {
        const despesas = Array.isArray(v.despesas)
          ? v.despesas.reduce((s, d) => s + Number(d.valor), 0)
          : 0;
        return sum + despesas;
      }, 0) || 0;

      return {
        viagensConcluidas: viagensConcluidas.length,
        viagensEmAndamento: viagensAndamento?.length || 0,
        custoKm,
        fretesAberto: fretesAberto?.length || 0,
        estoqueBaixo: itensBaixo.length,
        cnhVencendo: cnhVencendo?.length || 0,
        manutencaoAtrasada: veiculosAtrasados.length,
        receitaRecente,
        despesasRecentes,
        margemRecente: receitaRecente - despesasRecentes,
        alertas: {
          cnhVencendo: cnhVencendo || [],
          estoqueBaixo: itensBaixo,
          manutencaoAtrasada: veiculosAtrasados,
        },
      };
    },
  });

  return { kpis, isLoading };
}
