import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePneus(filters?: {
  status?: string;
  veiculoId?: string;
  tipo?: string;
  criticos?: boolean;
}) {
  const queryClient = useQueryClient();

  const pneusQuery = useQuery({
    queryKey: ['pneus', filters],
    queryFn: async () => {
      let query = supabase
        .from('pneus')
        .select(`
          *,
          veiculo:veiculos(id, placa, codigo_interno),
          item_estoque:itens_estoque(id, codigo, descricao)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.veiculoId) {
        query = query.eq('veiculo_id', filters.veiculoId);
      }

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar pneus críticos
      if (filters?.criticos) {
        return data?.filter((pneu: any) => 
          pneu.profundidade_sulco_mm && 
          pneu.profundidade_sulco_mm <= (pneu.profundidade_minima_mm || 1.6)
        ) || [];
      }

      return data || [];
    },
  });

  const createPneu = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('pneus')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cadastrar pneu');
    },
  });

  const updatePneu = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from('pneus')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar pneu');
    },
  });

  const deletePneu = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pneus').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir pneu');
    },
  });

  const instalarPneu = useMutation({
    mutationFn: async (data: {
      pneu_id: string;
      veiculo_id: string;
      posicao_veiculo: string;
      km_atual: number;
      profundidade_sulco_mm?: number;
    }) => {
      const updateData = {
        status: 'em_uso',
        veiculo_id: data.veiculo_id,
        posicao_veiculo: data.posicao_veiculo,
        km_instalacao: data.km_atual,
        km_atual: data.km_atual,
        data_instalacao: new Date().toISOString(),
        ...(data.profundidade_sulco_mm && { profundidade_sulco_mm: data.profundidade_sulco_mm }),
      };

      const { error } = await supabase
        .from('pneus')
        .update(updateData)
        .eq('id', data.pneu_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu instalado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao instalar pneu');
    },
  });

  const removerPneu = useMutation({
    mutationFn: async (data: { pneu_id: string; km_atual: number; motivo?: string }) => {
      const { error } = await supabase
        .from('pneus')
        .update({
          status: 'estoque',
          veiculo_id: null,
          posicao_veiculo: null,
          km_atual: data.km_atual,
          data_remocao: new Date().toISOString(),
          ...(data.motivo && { observacoes: data.motivo }),
        })
        .eq('id', data.pneu_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover pneu');
    },
  });

  const descartarPneu = useMutation({
    mutationFn: async (data: { pneu_id: string; motivo: string }) => {
      const { error } = await supabase
        .from('pneus')
        .update({
          status: 'descartado',
          motivo_descarte: data.motivo,
          veiculo_id: null,
          posicao_veiculo: null,
        })
        .eq('id', data.pneu_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Pneu descartado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao descartar pneu');
    },
  });

  return {
    pneus: pneusQuery.data || [],
    isLoading: pneusQuery.isLoading,
    createPneu,
    updatePneu,
    deletePneu,
    instalarPneu,
    removerPneu,
    descartarPneu,
  };
}

export function usePneusHistorico(pneuId?: string) {
  return useQuery({
    queryKey: ['pneus-historico', pneuId],
    queryFn: async () => {
      let query = supabase
        .from('pneus_historico')
        .select(`
          *,
          veiculo:veiculos(id, placa, codigo_interno),
          manutencao:manutencoes(id, tipo, descricao)
        `)
        .order('data_evento', { ascending: false });

      if (pneuId) {
        query = query.eq('pneu_id', pneuId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!pneuId,
  });
}

export function usePneusMedicoes(pneuId?: string) {
  const queryClient = useQueryClient();

  const medicoesQuery = useQuery({
    queryKey: ['pneus-medicoes', pneuId],
    queryFn: async () => {
      let query = supabase
        .from('pneus_medicoes')
        .select(`
          *,
          pneu:pneus(id, numero_serie, codigo_interno),
          veiculo:veiculos(id, placa, codigo_interno)
        `)
        .order('data_medicao', { ascending: false });

      if (pneuId) {
        query = query.eq('pneu_id', pneuId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!pneuId,
  });

  const createMedicao = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('pneus_medicoes')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Atualizar profundidade média no pneu
      const profundidadeMedia = (
        data.profundidade_interna_mm +
        data.profundidade_central_mm +
        data.profundidade_externa_mm
      ) / 3;

      await supabase
        .from('pneus')
        .update({ profundidade_sulco_mm: profundidadeMedia })
        .eq('id', data.pneu_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pneus-medicoes'] });
      queryClient.invalidateQueries({ queryKey: ['pneus'] });
      toast.success('Medição registrada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao registrar medição');
    },
  });

  return {
    medicoes: medicoesQuery.data || [],
    isLoading: medicoesQuery.isLoading,
    createMedicao,
  };
}

export function usePneusRelatorios() {
  return useQuery({
    queryKey: ['pneus-relatorios'],
    queryFn: async () => {
      const { data: pneus, error } = await supabase
        .from('pneus')
        .select('*');

      if (error) throw error;

      const total = pneus?.length || 0;
      const emEstoque = pneus?.filter(p => p.status === 'estoque').length || 0;
      const emUso = pneus?.filter(p => p.status === 'em_uso').length || 0;
      const emRecapagem = pneus?.filter(p => p.status === 'recapagem').length || 0;
      const descartados = pneus?.filter(p => p.status === 'descartado').length || 0;
      const criticos = pneus?.filter(p => 
        p.profundidade_sulco_mm && 
        p.profundidade_sulco_mm <= (p.profundidade_minima_mm || 1.6)
      ).length || 0;

      const custoTotal = pneus?.reduce((acc, p) => acc + (p.valor_compra || 0), 0) || 0;
      const kmTotal = pneus?.reduce((acc, p) => acc + (p.km_rodados || 0), 0) || 0;
      const custoPorKm = kmTotal > 0 ? custoTotal / kmTotal : 0;

      return {
        total,
        emEstoque,
        emUso,
        emRecapagem,
        descartados,
        criticos,
        custoTotal,
        kmTotal,
        custoPorKm,
      };
    },
  });
}
