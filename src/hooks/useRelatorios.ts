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

      // Buscar abastecimentos do período
      let abastecimentosQuery = supabase
        .from('abastecimentos')
        .select('valor_total, veiculo_id, viagem_id, status');
      
      if (filtros.dataInicio) {
        abastecimentosQuery = abastecimentosQuery.gte('data_abastecimento', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        abastecimentosQuery = abastecimentosQuery.lte('data_abastecimento', filtros.dataFim);
      }
      if (filtros.veiculoId) {
        abastecimentosQuery = abastecimentosQuery.eq('veiculo_id', filtros.veiculoId);
      }

      const { data: abastecimentos, error: abastecimentosError } = await abastecimentosQuery;
      if (abastecimentosError) throw abastecimentosError;

      // Calcular KPIs
      const viagens = data || [];
      const viagensConcluidas = viagens.filter(v => v.status === 'concluida');
      
      const totalViagens = viagensConcluidas.length;
      const kmTotal = viagensConcluidas.reduce((sum, v) => sum + (v.km_percorrido || 0), 0);
      const receitaTotal = viagensConcluidas.reduce((sum, v) => sum + (v.frete?.valor_frete || 0), 0);
      
      const custoDespesas = viagensConcluidas.reduce((sum, v) => {
        const despesas = v.despesas?.reduce((s: number, d: any) => s + Number(d.valor), 0) || 0;
        return sum + despesas;
      }, 0);

      // Incluir custo de combustível
      const custoCombustivel = (abastecimentos || [])
        .filter((a: any) => a.status === 'validado')
        .reduce((sum: number, a: any) => sum + (a.valor_total || 0), 0);

      // Buscar manutenções do período para calcular custo
      let manutencoesQuery = supabase
        .from('manutencoes')
        .select('custo, status, veiculo_id');
      
      if (filtros.dataInicio) {
        manutencoesQuery = manutencoesQuery.gte('data', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        manutencoesQuery = manutencoesQuery.lte('data', filtros.dataFim);
      }
      if (filtros.veiculoId) {
        manutencoesQuery = manutencoesQuery.eq('veiculo_id', filtros.veiculoId);
      }

      const { data: manutencoes, error: manutencoesError } = await manutencoesQuery;
      if (manutencoesError) throw manutencoesError;

      // Calcular custo de manutenções concluídas
      const custoManutencao = (manutencoes || [])
        .filter((m: any) => m.status === 'concluida')
        .reduce((sum: number, m: any) => sum + (m.custo || 0), 0);

      const custoTotal = custoDespesas + custoCombustivel + custoManutencao;

      const custoMedioKm = kmTotal > 0 ? custoTotal / kmTotal : 0;
      const receitaPorKm = kmTotal > 0 ? receitaTotal / kmTotal : 0;
      const margemMedia = receitaTotal > 0 ? ((receitaTotal - custoTotal) / receitaTotal) * 100 : 0;

      return {
        viagens,
        kpis: {
          totalViagens,
          kmTotal,
          custoTotal,
          custoDespesas,
          custoCombustivel,
          custoManutencao,
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

      let queryAbastecimentos = supabase
        .from('abastecimentos')
        .select(`
          *,
          veiculo:veiculos(placa, modelo)
        `);

      if (filtros.dataInicio) {
        queryManutencoes = queryManutencoes.gte('data', filtros.dataInicio);
        queryMovimentacoes = queryMovimentacoes.gte('data', filtros.dataInicio);
        queryAbastecimentos = queryAbastecimentos.gte('data_abastecimento', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        queryManutencoes = queryManutencoes.lte('data', filtros.dataFim);
        queryMovimentacoes = queryMovimentacoes.lte('data', filtros.dataFim);
        queryAbastecimentos = queryAbastecimentos.lte('data_abastecimento', filtros.dataFim);
      }
      if (filtros.veiculoId) {
        queryManutencoes = queryManutencoes.eq('veiculo_id', filtros.veiculoId);
        queryAbastecimentos = queryAbastecimentos.eq('veiculo_id', filtros.veiculoId);
      }

      const [manutencoes, movimentacoes, abastecimentos] = await Promise.all([
        queryManutencoes,
        queryMovimentacoes,
        queryAbastecimentos,
      ]);

      if (manutencoes.error) throw manutencoes.error;
      if (movimentacoes.error) throw movimentacoes.error;
      if (abastecimentos.error) throw abastecimentos.error;

      const custoManutencao = manutencoes.data?.reduce((sum, m) => sum + (m.custo || 0), 0) || 0;
      const consumoEstoque = movimentacoes.data?.reduce((sum, m) => {
        if (m.tipo === 'saida') {
          return sum + ((m.quantidade || 0) * (m.custo_unitario || 0));
        }
        return sum;
      }, 0) || 0;

      const custoCombustivel = abastecimentos.data?.reduce((sum, a) => sum + (a.valor_total || 0), 0) || 0;
      const mediaConsumo = abastecimentos.data?.filter((a: any) => a.media_calculada).reduce((sum, a) => sum + (a.media_calculada || 0), 0) / 
        (abastecimentos.data?.filter((a: any) => a.media_calculada).length || 1) || 0;

      return {
        manutencoes: manutencoes.data || [],
        movimentacoes: movimentacoes.data || [],
        abastecimentos: abastecimentos.data || [],
        kpis: {
          custoManutencao,
          consumoEstoque,
          custoCombustivel,
          mediaConsumo,
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
