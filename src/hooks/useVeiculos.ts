import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VeiculoFormData } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

export function useVeiculos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaId } = useAuth();

  const veiculosQuery = useQuery({
    queryKey: ['veiculos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createVeiculo = useMutation({
    mutationFn: async (data: VeiculoFormData) => {
      if (!empresaId) {
        throw new Error('Usuário não está vinculado a uma empresa');
      }

      const veiculoComEmpresa = {
        ...data,
        empresa_id: empresaId
      };

      const { data: result, error } = await supabase
        .from('veiculos')
        .insert([veiculoComEmpresa as any])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast({
        title: 'Sucesso',
        description: 'Veículo cadastrado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cadastrar veículo',
        variant: 'destructive',
      });
    },
  });

  const updateVeiculo = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VeiculoFormData> }) => {
      const { data: result, error } = await supabase
        .from('veiculos')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast({
        title: 'Sucesso',
        description: 'Veículo atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar veículo',
        variant: 'destructive',
      });
    },
  });

  const deleteVeiculo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast({
        title: 'Sucesso',
        description: 'Veículo excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir veículo',
        variant: 'destructive',
      });
    },
  });

  return {
    veiculos: veiculosQuery.data ?? [],
    isLoading: veiculosQuery.isLoading,
    error: veiculosQuery.error,
    createVeiculo,
    updateVeiculo,
    deleteVeiculo,
  };
}

export function useManutencoes(veiculoId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaId } = useAuth();

  const manutencoesQuery = useQuery({
    queryKey: ['manutencoes', veiculoId],
    queryFn: async () => {
      let query = supabase
        .from('manutencoes')
        .select('*')
        .order('data', { ascending: false });

      if (veiculoId) {
        query = query.eq('veiculo_id', veiculoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!veiculoId,
  });

  const createManutencao = useMutation({
    mutationFn: async (data: any) => {
      if (!empresaId) {
        throw new Error('Usuário não está vinculado a uma empresa');
      }

      const manutencaoComEmpresa = {
        ...data,
        empresa_id: empresaId
      };

      const { data: result, error } = await supabase
        .from('manutencoes')
        .insert([manutencaoComEmpresa])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      toast({
        title: 'Sucesso',
        description: 'Manutenção registrada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registrar manutenção',
        variant: 'destructive',
      });
    },
  });

  return {
    manutencoes: manutencoesQuery.data ?? [],
    isLoading: manutencoesQuery.isLoading,
    createManutencao,
  };
}

export function useDocumentosVeiculo(veiculoId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaId } = useAuth();

  const documentosQuery = useQuery({
    queryKey: ['documentos-veiculo', veiculoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('tipo_entidade', 'veiculo')
        .eq('entidade_id', veiculoId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!veiculoId,
  });

  const uploadDocumento = useMutation({
    mutationFn: async ({ file, tipoDocumento, veiculoId }: { file: File; tipoDocumento: string; veiculoId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${veiculoId}/${tipoDocumento}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName);

      if (!empresaId) {
        throw new Error('Usuário não está vinculado a uma empresa');
      }

      const { data, error } = await supabase
        .from('documentos')
        .insert([{
          tipo_entidade: 'veiculo',
          entidade_id: veiculoId,
          tipo_documento: tipoDocumento,
          nome: file.name,
          url: urlData.publicUrl,
          mime_type: file.type,
          tamanho: file.size,
          empresa_id: empresaId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos-veiculo'] });
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
