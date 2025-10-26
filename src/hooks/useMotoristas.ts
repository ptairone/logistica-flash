import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MotoristaFormData } from '@/lib/validations-motorista';
import { useToast } from '@/hooks/use-toast';

export function useMotoristas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const motoristasQuery = useQuery({
    queryKey: ['motoristas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motoristas')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data;
    },
  });

  const createMotorista = useMutation({
    mutationFn: async (data: MotoristaFormData) => {
      // Verificar duplicidade de CPF
      if (data.cpf) {
        const { data: existing } = await supabase
          .from('motoristas')
          .select('id')
          .eq('cpf', data.cpf)
          .single();

        if (existing) {
          throw new Error('Já existe um motorista cadastrado com este CPF');
        }
      }

      // Verificar duplicidade de CNH
      const { data: existingCNH } = await supabase
        .from('motoristas')
        .select('id')
        .eq('cnh', data.cnh)
        .single();

      if (existingCNH) {
        throw new Error('Já existe um motorista cadastrado com esta CNH');
      }

      // Remover campos de senha antes de inserir
      const { criarLogin, senha, confirmarSenha, ...motoristaData } = data;

      const { data: result, error } = await supabase
        .from('motoristas')
        .insert([motoristaData as any])
        .select()
        .single();

      if (error) throw error;

      // Se solicitado criar login, chamar edge function
      if (criarLogin && senha && data.email) {
        const { error: loginError } = await supabase.functions.invoke('criar-usuario-motorista', {
          body: {
            email: data.email,
            password: senha,
            nome: data.nome,
            motoristaId: result.id,
          },
        });

        if (loginError) {
          // Se falhar ao criar login, ainda retornar sucesso do motorista
          console.error('Erro ao criar login:', loginError);
          throw new Error(`Motorista criado, mas erro ao criar login: ${loginError.message}`);
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast({
        title: 'Sucesso',
        description: 'Motorista cadastrado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cadastrar motorista',
        variant: 'destructive',
      });
    },
  });

  const updateMotorista = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MotoristaFormData> }) => {
      const { data: result, error } = await supabase
        .from('motoristas')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast({
        title: 'Sucesso',
        description: 'Motorista atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar motorista',
        variant: 'destructive',
      });
    },
  });

  const deleteMotorista = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('motoristas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast({
        title: 'Sucesso',
        description: 'Motorista excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir motorista',
        variant: 'destructive',
      });
    },
  });

  return {
    motoristas: motoristasQuery.data ?? [],
    isLoading: motoristasQuery.isLoading,
    error: motoristasQuery.error,
    createMotorista,
    updateMotorista,
    deleteMotorista,
  };
}

export function useMotoristaDetalhes(motoristaId?: string) {
  return useQuery({
    queryKey: ['motorista-detalhes', motoristaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motoristas')
        .select('*')
        .eq('id', motoristaId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!motoristaId,
  });
}

export function useViagensMotorista(motoristaId?: string, periodoInicio?: string, periodoFim?: string) {
  return useQuery({
    queryKey: ['viagens-motorista', motoristaId, periodoInicio, periodoFim],
    queryFn: async () => {
      let query = supabase
        .from('viagens')
        .select(`
          *,
          veiculo:veiculos(placa, marca, modelo),
          frete:fretes(codigo, valor_frete, cliente_nome, data_entrega),
          despesas(tipo, valor, reembolsavel)
        `)
        .eq('motorista_id', motoristaId!)
        .order('data_saida', { ascending: false });

      if (periodoInicio) {
        query = query.gte('data_saida', periodoInicio);
      }

      if (periodoFim) {
        query = query.lte('data_saida', periodoFim);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!motoristaId,
  });
}

export function useDespesasMotorista(motoristaId?: string, periodoInicio?: string, periodoFim?: string) {
  return useQuery({
    queryKey: ['despesas-motorista', motoristaId, periodoInicio, periodoFim],
    queryFn: async () => {
      // Primeiro, buscar as viagens do motorista
      const { data: viagensData, error: viagensError } = await supabase
        .from('viagens')
        .select('id')
        .eq('motorista_id', motoristaId!);

      if (viagensError) throw viagensError;
      
      const viagemIds = viagensData?.map(v => v.id) || [];
      
      if (viagemIds.length === 0) {
        return [];
      }

      // Depois buscar as despesas dessas viagens
      let query = supabase
        .from('despesas')
        .select(`
          *,
          viagem:viagens(codigo, origem, destino)
        `)
        .in('viagem_id', viagemIds)
        .order('data', { ascending: false });

      if (periodoInicio) {
        query = query.gte('data', periodoInicio);
      }

      if (periodoFim) {
        query = query.lte('data', periodoFim);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!motoristaId,
  });
}

export function useAcertosMotorista(motoristaId?: string) {
  return useQuery({
    queryKey: ['acertos-motorista', motoristaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acertos')
        .select('*')
        .eq('motorista_id', motoristaId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!motoristaId,
  });
}

export function useDocumentosMotorista(motoristaId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const documentosQuery = useQuery({
    queryKey: ['documentos-motorista', motoristaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('tipo_entidade', 'motorista')
        .eq('entidade_id', motoristaId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!motoristaId,
  });

  const uploadDocumento = useMutation({
    mutationFn: async ({ file, tipoDocumento, motoristaId }: { file: File; tipoDocumento: string; motoristaId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${motoristaId}/${tipoDocumento}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('documentos')
        .insert([{
          tipo_entidade: 'motorista',
          entidade_id: motoristaId,
          tipo_documento: tipoDocumento,
          nome: file.name,
          url: urlData.publicUrl,
          mime_type: file.type,
          tamanho: file.size,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos-motorista'] });
      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar documento',
        variant: 'destructive',
      });
    },
  });

  return {
    documentos: documentosQuery.data ?? [],
    isLoading: documentosQuery.isLoading,
    uploadDocumento,
  };
}
