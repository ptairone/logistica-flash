import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { z } from 'zod';

const localEstoqueSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().optional(),
  responsavel: z.string().optional(),
  endereco: z.string().optional(),
  capacidade_m3: z.number().optional(),
  ativo: z.boolean().optional(),
});

export type LocalEstoqueFormData = z.infer<typeof localEstoqueSchema>;

export function useLocaisEstoque() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaId } = useAuth();

  // Buscar todos os locais
  const locaisQuery = useQuery({
    queryKey: ['locais-estoque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locais_estoque')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Criar local
  const createLocal = useMutation({
    mutationFn: async (localData: LocalEstoqueFormData) => {
      if (!empresaId) {
        throw new Error('Usuário não está vinculado a uma empresa');
      }

      const localComEmpresa = {
        ...localData,
        empresa_id: empresaId,
        ativo: localData.ativo ?? true,
      };

      const { data, error } = await supabase
        .from('locais_estoque')
        .insert([localComEmpresa as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais-estoque'] });
      toast({
        title: 'Local criado',
        description: 'Local de estoque criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar local',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Atualizar local
  const updateLocal = useMutation({
    mutationFn: async ({ id, ...localData }: LocalEstoqueFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('locais_estoque')
        .update(localData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais-estoque'] });
      toast({
        title: 'Local atualizado',
        description: 'Local de estoque atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar local',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deletar local
  const deleteLocal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('locais_estoque')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais-estoque'] });
      toast({
        title: 'Local excluído',
        description: 'Local de estoque excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir local',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    locais: locaisQuery.data || [],
    isLoading: locaisQuery.isLoading,
    createLocal,
    updateLocal,
    deleteLocal,
  };
}
