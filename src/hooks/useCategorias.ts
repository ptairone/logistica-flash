import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriaFormData {
  nome: string;
  descricao?: string;
  cor?: string;
}

export function useCategorias() {
  const queryClient = useQueryClient();
  const { empresaId } = useAuth();

  const categoriasQuery = useQuery({
    queryKey: ['categorias-estoque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_estoque')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as Categoria[];
    },
  });

  const createCategoria = useMutation({
    mutationFn: async (formData: CategoriaFormData) => {
      if (!empresaId) {
        throw new Error('Usuário não está vinculado a uma empresa');
      }

      const categoriaComEmpresa = {
        ...formData,
        empresa_id: empresaId
      };

      const { data, error } = await supabase
        .from('categorias_estoque')
        .insert(categoriaComEmpresa)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-estoque'] });
      toast.success('Categoria criada com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar categoria');
    },
  });

  const updateCategoria = useMutation({
    mutationFn: async ({ id, ...formData }: CategoriaFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('categorias_estoque')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-estoque'] });
      toast.success('Categoria atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar categoria');
    },
  });

  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categorias_estoque')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-estoque'] });
      toast.success('Categoria excluída com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir categoria');
    },
  });

  return {
    categorias: categoriasQuery.data || [],
    isLoading: categoriasQuery.isLoading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  };
}
