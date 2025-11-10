import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RegistroEmpresaData {
  nome: string;
  cnpj: string;
  email_contato: string;
  telefone?: string;
  nome_responsavel: string;
  senha: string;
}

export function useRegistroEmpresa() {
  const registrarEmpresa = useMutation({
    mutationFn: async (data: RegistroEmpresaData) => {
      const { data: result, error } = await supabase.functions.invoke('criar-empresa-trial', {
        body: data
      });
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Solicitação enviada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.message || 'Erro ao enviar solicitação';
      toast.error(message);
    },
  });

  return {
    registrarEmpresa,
    isLoading: registrarEmpresa.isPending,
  };
}
