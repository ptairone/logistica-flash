import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  email_contato: string;
  telefone?: string;
  dominio_email?: string;
  status: 'ativo' | 'suspenso' | 'trial' | 'bloqueado';
  data_inicio_trial?: string;
  data_fim_trial?: string;
  created_at: string;
  logo_url?: string;
  cor_primaria?: string;
  observacoes?: string;
}

export interface EmpresaPendente {
  id: string;
  nome: string;
  cnpj: string;
  email_contato: string;
  telefone?: string;
  nome_responsavel: string;
  status: 'aguardando_aprovacao' | 'aprovada' | 'rejeitada';
  created_at: string;
  motivo_rejeicao?: string;
}

export function useEmpresas() {
  const queryClient = useQueryClient();

  const empresasQuery = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Empresa[];
    },
  });

  const empresasPendentesQuery = useQuery({
    queryKey: ['empresas-pendentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas_pendentes' as any)
        .select('*')
        .eq('status', 'aguardando_aprovacao')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmpresaPendente[];
    },
  });

  const createEmpresa = useMutation({
    mutationFn: async (empresa: Partial<Empresa>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('empresas' as any)
        .insert([{
          ...empresa,
          created_by: user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast.success('Empresa criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar empresa: ${error.message}`);
    },
  });

  const updateEmpresa = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Empresa> }) => {
      const { error } = await supabase
        .from('empresas' as any)
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast.success('Empresa atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar empresa: ${error.message}`);
    },
  });

  const aprovarEmpresa = useMutation({
    mutationFn: async (empresaPendenteId: string) => {
      const { data, error } = await supabase.functions.invoke('aprovar-empresa', {
        body: { empresa_pendente_id: empresaPendenteId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      queryClient.invalidateQueries({ queryKey: ['empresas-pendentes'] });
      toast.success('Empresa aprovada com sucesso! Email enviado ao responsável.');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aprovar empresa: ${error.message}`);
    },
  });

  const rejeitarEmpresa = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('empresas_pendentes' as any)
        .update({
          status: 'rejeitada',
          motivo_rejeicao: motivo,
          analisado_por: user?.id,
          analisado_em: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-pendentes'] });
      toast.success('Empresa rejeitada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao rejeitar empresa: ${error.message}`);
    },
  });

  return {
    empresas: empresasQuery.data || [],
    empresasPendentes: empresasPendentesQuery.data || [],
    isLoading: empresasQuery.isLoading || empresasPendentesQuery.isLoading,
    createEmpresa,
    updateEmpresa,
    aprovarEmpresa,
    rejeitarEmpresa,
  };
}
