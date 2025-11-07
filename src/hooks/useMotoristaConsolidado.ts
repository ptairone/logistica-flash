import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMotoristaConsolidado(motoristaId?: string, anoReferencia?: number) {
  return useQuery({
    queryKey: ['motorista-consolidado', motoristaId, anoReferencia],
    queryFn: async () => {
      if (!motoristaId) return null;

      const ano = anoReferencia || new Date().getFullYear();
      const dataInicio = `${ano}-01-01`;
      const dataFim = `${ano}-12-31`;

      // Buscar todas as informações consolidadas
      const [viagens, acertos, debitos, abastecimentos] = await Promise.all([
        // Viagens concluídas no ano
        supabase
          .from('viagens')
          .select(`
            *,
            frete:fretes(valor_frete, data_entrega),
            despesas(valor, reembolsavel)
          `)
          .eq('motorista_id', motoristaId)
          .eq('status', 'concluida')
          .gte('data_saida', dataInicio)
          .lte('data_saida', dataFim),

        // Acertos do ano
        supabase
          .from('acertos')
          .select('*')
          .eq('motorista_id', motoristaId)
          .gte('periodo_inicio', dataInicio)
          .lte('periodo_fim', dataFim),

        // Débitos ativos
        supabase
          .from('acerto_debitos')
          .select('*')
          .eq('motorista_id', motoristaId)
          .neq('status', 'quitado'),

        // Abastecimentos do ano
        supabase
          .from('abastecimentos')
          .select('*')
          .eq('motorista_id', motoristaId)
          .gte('data_abastecimento', dataInicio)
          .lte('data_abastecimento', dataFim),
      ]);

      if (viagens.error) throw viagens.error;
      if (acertos.error) throw acertos.error;
      if (debitos.error) throw debitos.error;
      if (abastecimentos.error) throw abastecimentos.error;

      // Calcular KPIs avançados
      const totalViagens = viagens.data?.length || 0;
      const totalKm = viagens.data?.reduce((sum, v) => sum + (v.km_percorrido || 0), 0) || 0;
      const totalReceita = viagens.data?.reduce((sum, v) => sum + (v.frete?.valor_frete || 0), 0) || 0;
      
      const totalDespesas = viagens.data?.reduce((sum, v) => {
        const despesas = v.despesas?.reduce((s: number, d: any) => s + Number(d.valor), 0) || 0;
        return sum + despesas;
      }, 0) || 0;

      const totalCombustivel = abastecimentos.data?.reduce((sum, a) => sum + (a.valor_total || 0), 0) || 0;
      const totalPago = acertos.data?.reduce((sum, a) => sum + (a.total_pagar || 0), 0) || 0;
      const totalDebitosAtivos = debitos.data?.reduce((sum, d) => sum + (d.saldo || 0), 0) || 0;

      const mediaMensal = totalPago / 12;
      const custoKm = totalKm > 0 ? (totalDespesas + totalCombustivel) / totalKm : 0;
      const eficiencia = totalReceita > 0 ? ((totalReceita - totalDespesas - totalCombustivel) / totalReceita) * 100 : 0;

      // Calcular pontualidade
      const viagensNoPrazo = viagens.data?.filter(v => {
        if (!v.data_chegada || !v.frete) return false;
        const chegada = new Date(v.data_chegada);
        const prazo = new Date(v.frete.data_entrega);
        return chegada <= prazo;
      }).length || 0;

      const pontualidade = totalViagens > 0 ? (viagensNoPrazo / totalViagens) * 100 : 0;

      // Agrupar acertos por mês para gráfico
      const acertosPorMes = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const mesString = mes.toString().padStart(2, '0');
        const acertosDoMes = acertos.data?.filter(a => {
          const periodoInicio = a.periodo_inicio.substring(5, 7);
          return periodoInicio === mesString;
        }) || [];

        return {
          mes: mesString,
          totalPago: acertosDoMes.reduce((sum, a) => sum + (a.total_pagar || 0), 0),
          totalViagens: acertosDoMes.length,
        };
      });

      return {
        viagens: viagens.data || [],
        acertos: acertos.data || [],
        debitos: debitos.data || [],
        abastecimentos: abastecimentos.data || [],
        kpis: {
          totalViagens,
          totalKm,
          totalReceita,
          totalDespesas,
          totalCombustivel,
          totalPago,
          totalDebitosAtivos,
          mediaMensal,
          custoKm,
          eficiencia,
          pontualidade,
        },
        evolucao: acertosPorMes,
      };
    },
    enabled: !!motoristaId,
  });
}
