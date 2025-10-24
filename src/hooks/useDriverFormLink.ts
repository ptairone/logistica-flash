import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenerateLinkParams {
  viagemId: string;
  canal?: 'whatsapp' | 'sms' | 'email' | 'copiar';
  telefone?: string;
  email?: string;
}

export function useDriverFormLink(viagemId?: string) {
  const queryClient = useQueryClient();

  // Buscar status do link
  const { data: linkStatus, isLoading } = useQuery({
    queryKey: ['driver-form-link', viagemId],
    queryFn: async () => {
      if (!viagemId) return null;
      
      const { data, error } = await supabase
        .from('viagens')
        .select('driver_form_token, driver_form_url, link_expires_at, link_status, ultimo_acesso_em')
        .eq('id', viagemId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!viagemId,
  });

  // Gerar novo link
  const generateLink = useMutation({
    mutationFn: async ({ viagemId, canal, telefone, email }: GenerateLinkParams) => {
      const token = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const driverFormUrl = `${baseUrl}/p/viagem/${viagemId}?token=${token}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // +7 dias

      // Atualizar viagem com o link
      const { error } = await supabase
        .from('viagens')
        .update({
          driver_form_token: token,
          driver_form_url: driverFormUrl,
          link_expires_at: expiresAt.toISOString(),
          link_status: 'ativo',
        })
        .eq('id', viagemId);

      if (error) throw error;

      // Buscar dados da viagem e motorista para a mensagem
      const { data: viagem } = await supabase
        .from('viagens')
        .select('codigo, origem, destino, motorista:motoristas(nome, telefone, email)')
        .eq('id', viagemId)
        .single();

      // Enviar por canal escolhido
      if (canal && viagem?.motorista) {
        const motorista = Array.isArray(viagem.motorista) ? viagem.motorista[0] : viagem.motorista;
        const mensagem = `Olá, ${motorista.nome}! Detalhes da viagem ${viagem.codigo} (${viagem.origem}→${viagem.destino}).\nAcesse para iniciar/atualizar: ${driverFormUrl}\nLink válido até ${expiresAt.toLocaleDateString('pt-BR')}.`;

        if (canal === 'whatsapp' && (telefone || motorista.telefone)) {
          const tel = (telefone || motorista.telefone).replace(/\D/g, '');
          window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(mensagem)}`, '_blank');
        } else if (canal === 'copiar') {
          await navigator.clipboard.writeText(driverFormUrl);
          toast.success('Link copiado para a área de transferência');
        }
        // SMS e email requerem integração com serviços externos
      }

      return { driverFormUrl, expiresAt, token };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-form-link', viagemId] });
      toast.success('Link gerado com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao gerar link: ' + error.message);
    },
  });

  // Revogar link
  const revokeLink = useMutation({
    mutationFn: async (viagemId: string) => {
      const { error } = await supabase
        .from('viagens')
        .update({
          link_status: 'revogado',
        })
        .eq('id', viagemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-form-link', viagemId] });
      toast.success('Link revogado');
    },
  });

  // Renovar validade
  const renewLink = useMutation({
    mutationFn: async (viagemId: string) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('viagens')
        .update({
          link_expires_at: expiresAt.toISOString(),
          link_status: 'ativo',
        })
        .eq('id', viagemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-form-link', viagemId] });
      toast.success('Validade renovada por +7 dias');
    },
  });

  return {
    linkStatus,
    isLoading,
    generateLink,
    revokeLink,
    renewLink,
  };
}

// Hook para validar token no formulário público
export function useValidateDriverToken(viagemId: string, token: string) {
  return useQuery({
    queryKey: ['validate-driver-token', viagemId, token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viagens')
        .select('id, codigo, status, driver_form_token, link_expires_at, link_status, motorista_id')
        .eq('id', viagemId)
        .single();

      if (error) throw error;

      // Validações
      if (data.driver_form_token !== token) {
        throw new Error('Token inválido');
      }
      if (data.link_status !== 'ativo') {
        throw new Error('Link revogado ou expirado');
      }
      if (new Date(data.link_expires_at) < new Date()) {
        throw new Error('Link expirado');
      }
      if (!['planejada', 'em_andamento'].includes(data.status)) {
        throw new Error('Viagem já concluída ou cancelada');
      }

      return data;
    },
    retry: false,
  });
}
