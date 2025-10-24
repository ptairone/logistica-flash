import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ViagemFormData, DespesaFormData, gerarCodigoViagem } from '@/lib/validations-viagem';
import { useToast } from '@/hooks/use-toast';

export function useViagens() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const viagensQuery = useQuery({
    queryKey: ['viagens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viagens')
        .select(`
          *,
          veiculo:veiculos(placa, marca, modelo),
          motorista:motoristas(nome, cpf),
          frete:fretes(codigo, valor_frete, cliente_nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createViagem = useMutation({
    mutationFn: async (data: ViagemFormData) => {
      // Gerar código automático se não foi fornecido
      let codigo = data.codigo;
      if (!codigo || codigo.trim() === '') {
        const { count } = await supabase
          .from('viagens')
          .select('*', { count: 'exact', head: true });
        codigo = gerarCodigoViagem((count || 0) + 1);
      }

      const { data: result, error } = await supabase
        .from('viagens')
        .insert([{ ...data, codigo } as any])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      toast({
        title: 'Sucesso',
        description: 'Viagem criada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar viagem',
        variant: 'destructive',
      });
    },
  });

  const updateViagem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ViagemFormData> }) => {
      const { data: result, error } = await supabase
        .from('viagens')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      toast({
        title: 'Sucesso',
        description: 'Viagem atualizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar viagem',
        variant: 'destructive',
      });
    },
  });

  const deleteViagem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('viagens')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      toast({
        title: 'Sucesso',
        description: 'Viagem excluída com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir viagem',
        variant: 'destructive',
      });
    },
  });

  // Ação de registrar partida
  const registrarPartida = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('viagens')
        .update({
          data_saida: new Date().toISOString(),
          status: 'em_andamento'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      toast({
        title: 'Partida registrada',
        description: 'A viagem está agora em andamento',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registrar partida',
        variant: 'destructive',
      });
    },
  });

  // Ação de registrar chegada
  const registrarChegada = useMutation({
    mutationFn: async ({ id, kmPercorrido }: { id: string; kmPercorrido?: number }) => {
      const updateData: any = {
        data_chegada: new Date().toISOString(),
        status: 'concluida'
      };

      if (kmPercorrido !== undefined) {
        updateData.km_percorrido = kmPercorrido;
      }

      const { data: result, error } = await supabase
        .from('viagens')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar km do veículo se km foi fornecido
      if (kmPercorrido && result.veiculo_id) {
        await supabase
          .from('veiculos')
          .update({ km_atual: kmPercorrido })
          .eq('id', result.veiculo_id);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast({
        title: 'Chegada registrada',
        description: 'Viagem concluída com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registrar chegada',
        variant: 'destructive',
      });
    },
  });

  // Cancelar viagem
  const cancelarViagem = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('viagens')
        .update({ status: 'cancelada' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      toast({
        title: 'Viagem cancelada',
        description: 'Motorista e veículo foram liberados',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cancelar viagem',
        variant: 'destructive',
      });
    },
  });

  return {
    viagens: viagensQuery.data ?? [],
    isLoading: viagensQuery.isLoading,
    error: viagensQuery.error,
    createViagem,
    updateViagem,
    deleteViagem,
    registrarPartida,
    registrarChegada,
    cancelarViagem,
  };
}

export function useDespesas(viagemId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const despesasQuery = useQuery({
    queryKey: ['despesas', viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('viagem_id', viagemId!)
        .order('data', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!viagemId,
  });

  const createDespesa = useMutation({
    mutationFn: async (data: DespesaFormData) => {
      const { data: result, error } = await supabase
        .from('despesas')
        .insert([data as any])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: 'Sucesso',
        description: 'Despesa adicionada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar despesa',
        variant: 'destructive',
      });
    },
  });

  const deleteDespesa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: 'Sucesso',
        description: 'Despesa excluída com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir despesa',
        variant: 'destructive',
      });
    },
  });

  return {
    despesas: despesasQuery.data ?? [],
    isLoading: despesasQuery.isLoading,
    createDespesa,
    deleteDespesa,
  };
}

export function useVeiculosAtivos() {
  return useQuery({
    queryKey: ['veiculos-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veiculos')
        .select('id, placa, marca, modelo')
        .eq('status', 'ativo')
        .order('placa');

      if (error) throw error;
      return data;
    },
  });
}

export function useMotoristasAtivos() {
  return useQuery({
    queryKey: ['motoristas-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motoristas')
        .select('id, nome, cpf, comissao_padrao')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      return data;
    },
  });
}

export function useFretesDisponiveis() {
  return useQuery({
    queryKey: ['fretes-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fretes')
        .select('id, codigo, cliente_nome, origem, destino, valor_frete')
        .eq('status', 'aberto')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useComprovantesViagem(viagemId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const comprovantesQuery = useQuery({
    queryKey: ['comprovantes-viagem', viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('tipo_entidade', 'viagem')
        .eq('entidade_id', viagemId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!viagemId,
  });

  const uploadComprovante = useMutation({
    mutationFn: async ({ file, viagemId, descricao }: { file: File; viagemId: string; descricao?: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${viagemId}/comprovante_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('documentos')
        .insert([{
          tipo_entidade: 'viagem',
          entidade_id: viagemId,
          tipo_documento: 'comprovante',
          nome: file.name,
          url: urlData.publicUrl,
          mime_type: file.type,
          tamanho: file.size,
          descricao,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprovantes-viagem'] });
      toast({
        title: 'Sucesso',
        description: 'Comprovante enviado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar comprovante',
        variant: 'destructive',
      });
    },
  });

  return {
    comprovantes: comprovantesQuery.data ?? [],
    isLoading: comprovantesQuery.isLoading,
    uploadComprovante,
  };
}
