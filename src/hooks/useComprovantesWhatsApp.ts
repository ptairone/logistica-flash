import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ComprovanteWhatsApp {
  id: string;
  motorista_id: string;
  viagem_id: string | null;
  telefone: string;
  imagem_url: string;
  tipo_identificado: string | null;
  confianca: string | null;
  dados_extraidos: any;
  status: string;
  erro_mensagem: string | null;
  created_at: string;
  updated_at: string;
  motorista?: {
    nome: string;
  };
  viagem?: {
    codigo: string;
  };
}

export function useComprovantesWhatsApp(motoristaId?: string, viagemId?: string) {
  const queryClient = useQueryClient();

  const { data: comprovantes = [], isLoading } = useQuery({
    queryKey: ['comprovantes-whatsapp', motoristaId, viagemId],
    queryFn: async () => {
      let query = supabase
        .from('comprovantes_whatsapp')
        .select(`
          *,
          motorista:motoristas(nome),
          viagem:viagens(codigo)
        `)
        .order('created_at', { ascending: false });

      if (motoristaId) {
        query = query.eq('motorista_id', motoristaId);
      }
      if (viagemId) {
        query = query.eq('viagem_id', viagemId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ComprovanteWhatsApp[];
    },
  });

  const confirmarComprovante = useMutation({
    mutationFn: async (comprovanteId: string) => {
      const { error } = await supabase
        .from('comprovantes_whatsapp')
        .update({ status: 'confirmado' })
        .eq('id', comprovanteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprovantes-whatsapp'] });
      toast.success('Comprovante confirmado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao confirmar comprovante: ' + error.message);
    },
  });

  const rejeitarComprovante = useMutation({
    mutationFn: async ({ comprovanteId, motivo }: { comprovanteId: string; motivo: string }) => {
      const { error } = await supabase
        .from('comprovantes_whatsapp')
        .update({
          status: 'rejeitado',
          erro_mensagem: motivo
        })
        .eq('id', comprovanteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprovantes-whatsapp'] });
      toast.success('Comprovante rejeitado');
    },
    onError: (error: any) => {
      toast.error('Erro ao rejeitar comprovante: ' + error.message);
    },
  });

  const reprocessarComprovante = useMutation({
    mutationFn: async (comprovanteId: string) => {
      const { error } = await supabase
        .from('comprovantes_whatsapp')
        .update({ status: 'processando' })
        .eq('id', comprovanteId);

      if (error) throw error;

      // Aqui você poderia chamar novamente a edge function para reprocessar
      // Mas isso requer a imagem original, então por enquanto apenas mudamos o status
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprovantes-whatsapp'] });
      toast.success('Comprovante marcado para reprocessamento');
    },
    onError: (error: any) => {
      toast.error('Erro ao reprocessar: ' + error.message);
    },
  });

  return {
    comprovantes,
    isLoading,
    confirmarComprovante,
    rejeitarComprovante,
    reprocessarComprovante,
  };
}

export function useComprovantesPendentes() {
  const { data: pendentes = [], isLoading } = useQuery({
    queryKey: ['comprovantes-whatsapp-pendentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comprovantes_whatsapp')
        .select(`
          *,
          motorista:motoristas(nome),
          viagem:viagens(codigo)
        `)
        .eq('status', 'processando')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ComprovanteWhatsApp[];
    },
    refetchInterval: 10000, // Recarregar a cada 10 segundos
  });

  return {
    pendentes,
    isLoading,
  };
}
