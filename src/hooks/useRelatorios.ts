import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  motoristaId?: string;
  veiculoId?: string;
  clienteNome?: string;
  status?: string;
}

export function useDadosOperacionais(filtros: FiltrosRelatorio) {
  return useQuery({
    queryKey: ['relatorio-operacional', filtros],
    queryFn: async () => {
      let query = supabase
        .from('viagens')
        .select(`
          *,
          motorista:motoristas(nome, cpf),
          veiculo:veiculos(placa, modelo),
          frete:fretes(valor_frete, cliente_nome),
          despesas(valor, reembolsavel)
        `);

      if (filtros.dataInicio) {
        query = query.gte('data_saida', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte('data_saida', filtros.dataFim);
      }
      if (filtros.motoristaId) {
        query = query.eq('motorista_id', filtros.motoristaId);
      }
      if (filtros.veiculoId) {
        query = query.eq('veiculo_id', filtros.veiculoId);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status as any);
      }

      const { data, error } = await query.order('data_saida', { ascending: false });

      if (error) throw error;

      // Calcular KPIs
      const viagens = data || [];
      const viagensConcluidas = viagens.filter(v => v.status === 'concluida');
      
      const totalViagens = viagensConcluidas.length;
      const kmTotal = viagensConcluidas.reduce((sum, v) => sum + (v.km_percorrido || 0), 0);
      const receitaTotal = viagensConcluidas.reduce((sum, v) => sum + (v.frete?.valor_frete || 0), 0);
      
      const custoTotal = viagensConcluidas.reduce((sum, v) => {
        const despesas = v.despesas?.reduce((s: number, d: any) => s + Number(d.valor), 0) || 0;
        return sum + despesas;
      }, 0);

      const custoMedioKm = kmTotal > 0 ? custoTotal / kmTotal : 0;
      const receitaPorKm = kmTotal > 0 ? receitaTotal / kmTotal : 0;
      const margemMedia = receitaTotal > 0 ? ((receitaTotal - custoTotal) / receitaTotal) * 100 : 0;

      return {
        viagens,
        kpis: {
          totalViagens,
          kmTotal,
          custoTotal,
          receitaTotal,
          custoMedioKm,
          receitaPorKm,
          margemMedia,
        },
      };
    },
  });
}

export function useDadosFinanceiros(filtros: FiltrosRelatorio) {
  return useQuery({
    queryKey: ['relatorio-financeiro', filtros],
    queryFn: async () => {
      let query = supabase
        .from('acertos')
        .select(`
          *,
          motorista:motoristas(nome, cpf)
        `);

      if (filtros.dataInicio) {
        query = query.gte('periodo_inicio', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte('periodo_fim', filtros.dataFim);
      }
      if (filtros.motoristaId) {
        query = query.eq('motorista_id', filtros.motoristaId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const acertos = data || [];
      
      const receitaTotal = acertos.reduce((sum, a) => sum + (a.base_comissao || 0), 0);
      const despesasReembolsadas = acertos.reduce((sum, a) => sum + (a.total_reembolsos || 0), 0);
      const comissoesPagas = acertos.reduce((sum, a) => sum + (a.valor_comissao || 0), 0);
      const adiantamentos = acertos.reduce((sum, a) => sum + (a.total_adiantamentos || 0), 0);
      const descontos = acertos.reduce((sum, a) => sum + (a.total_descontos || 0), 0);
      const totalLiquidoPago = acertos.reduce((sum, a) => sum + (a.total_pagar || 0), 0);
      const margemConsolidada = receitaTotal - (despesasReembolsadas + comissoesPagas);

      return {
        acertos,
        kpis: {
          receitaTotal,
          despesasReembolsadas,
          comissoesPagas,
          adiantamentos,
          descontos,
          totalLiquidoPago,
          margemConsolidada,
        },
      };
    },
  });
}

export function useDadosFrota(filtros: FiltrosRelatorio) {
  return useQuery({
    queryKey: ['relatorio-frota', filtros],
    queryFn: async () => {
      let queryManutencoes = supabase
        .from('manutencoes')
        .select(`
          *,
          veiculo:veiculos(placa, modelo)
        `);

      let queryMovimentacoes = supabase
        .from('movimentacoes_estoque')
        .select(`
          *,
          item:itens_estoque(descricao, categoria, unidade)
        `);

      if (filtros.dataInicio) {
        queryManutencoes = queryManutencoes.gte('data', filtros.dataInicio);
        queryMovimentacoes = queryMovimentacoes.gte('data', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        queryManutencoes = queryManutencoes.lte('data', filtros.dataFim);
        queryMovimentacoes = queryMovimentacoes.lte('data', filtros.dataFim);
      }
      if (filtros.veiculoId) {
        queryManutencoes = queryManutencoes.eq('veiculo_id', filtros.veiculoId);
      }

      const [manutencoes, movimentacoes] = await Promise.all([
        queryManutencoes,
        queryMovimentacoes,
      ]);

      if (manutencoes.error) throw manutencoes.error;
      if (movimentacoes.error) throw movimentacoes.error;

      const custoManutencao = manutencoes.data?.reduce((sum, m) => sum + (m.custo || 0), 0) || 0;
      const consumoEstoque = movimentacoes.data?.reduce((sum, m) => {
        if (m.tipo === 'saida') {
          return sum + ((m.quantidade || 0) * (m.custo_unitario || 0));
        }
        return sum;
      }, 0) || 0;

      return {
        manutencoes: manutencoes.data || [],
        movimentacoes: movimentacoes.data || [],
        kpis: {
          custoManutencao,
          consumoEstoque,
        },
      };
    },
  });
}

export function useDadosMotoristas(filtros: FiltrosRelatorio) {
  return useQuery({
    queryKey: ['relatorio-motoristas', filtros],
    queryFn: async () => {
      let query = supabase
        .from('viagens')
        .select(`
          *,
          motorista:motoristas(nome, cpf),
          frete:fretes(valor_frete),
          despesas(tipo, valor, reembolsavel)
        `)
        .eq('status', 'concluida');

      if (filtros.dataInicio) {
        query = query.gte('data_saida', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte('data_saida', filtros.dataFim);
      }
      if (filtros.motoristaId) {
        query = query.eq('motorista_id', filtros.motoristaId);
      }

      const { data, error } = await query.order('data_saida', { ascending: false });

      if (error) throw error;

      const viagens = data || [];
      const totalViagens = viagens.length;
      const kmTotal = viagens.reduce((sum, v) => sum + (v.km_percorrido || 0), 0);
      const receitaTotal = viagens.reduce((sum, v) => sum + (v.frete?.valor_frete || 0), 0);
      
      const despesasReembolsaveis = viagens.reduce((sum, v) => {
        const reemb = v.despesas?.filter((d: any) => d.reembolsavel).reduce((s: number, d: any) => s + Number(d.valor), 0) || 0;
        return sum + reemb;
      }, 0);

      return {
        viagens,
        kpis: {
          totalViagens,
          kmTotal,
          receitaTotal,
          despesasReembolsaveis,
        },
      };
    },
  });
}
