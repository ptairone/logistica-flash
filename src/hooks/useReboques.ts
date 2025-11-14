import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Reboque = {
  id: string;
  empresa_id: string;
  codigo_interno: string;
  placa: string;
  chassi: string | null;
  renavam: string | null;
  tipo: string;
  marca: string;
  modelo: string;
  ano: number | null;
  numero_eixos: number;
  capacidade_kg: number | null;
  capacidade_m3: number | null;
  vencimento_licenciamento: string | null;
  vencimento_seguro: string | null;
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export function useReboques() {
  const queryClient = useQueryClient();

  const reboques = useQuery({
    queryKey: ['reboques'] as const,
    queryFn: async (): Promise<Reboque[]> => {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('empresa_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      const { data, error } = await supabase
        .from('reboques')
        .select('*')
        .eq('empresa_id', userRole?.empresa_id || '')
        .order('codigo_interno');

      if (error) throw error;
      return data;
    },
  });

  const createReboque = useMutation({
    mutationFn: async (newReboque: any) => {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('empresa_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      // Converter strings vazias em null para campos opcionais
      const cleanedData = {
        ...newReboque,
        empresa_id: userRole?.empresa_id,
        vencimento_licenciamento: newReboque.vencimento_licenciamento || null,
        vencimento_seguro: newReboque.vencimento_seguro || null,
        chassi: newReboque.chassi || null,
        renavam: newReboque.renavam || null,
        observacoes: newReboque.observacoes || null,
        ano: newReboque.ano || null,
        capacidade_kg: newReboque.capacidade_kg || null,
        capacidade_m3: newReboque.capacidade_m3 || null,
      };

      const { data, error } = await supabase
        .from('reboques')
        .insert([cleanedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reboques'] });
      toast.success('Reboque cadastrado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao criar reboque:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('Já existe um reboque com este código ou placa');
      } else {
        toast.error('Erro ao cadastrar reboque');
      }
    },
  });

  const updateReboque = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Converter strings vazias em null para campos opcionais
      const cleanedData = {
        ...data,
        vencimento_licenciamento: data.vencimento_licenciamento || null,
        vencimento_seguro: data.vencimento_seguro || null,
        chassi: data.chassi || null,
        renavam: data.renavam || null,
        observacoes: data.observacoes || null,
        ano: data.ano || null,
        capacidade_kg: data.capacidade_kg || null,
        capacidade_m3: data.capacidade_m3 || null,
      };

      const { data: updated, error } = await supabase
        .from('reboques')
        .update(cleanedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reboques'] });
      toast.success('Reboque atualizado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar reboque:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('Já existe um reboque com este código ou placa');
      } else {
        toast.error('Erro ao atualizar reboque');
      }
    },
  });

  const deleteReboque = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reboques').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reboques'] });
      toast.success('Reboque excluído com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir reboque:', error);
      toast.error('Erro ao excluir reboque');
    },
  });

  return {
    reboques: reboques.data || [],
    isLoading: reboques.isLoading,
    createReboque,
    updateReboque,
    deleteReboque,
  };
}
