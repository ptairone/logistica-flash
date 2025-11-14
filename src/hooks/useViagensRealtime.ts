import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseViagensRealtimeProps {
  motoristaId?: string;
  onViagemUpdate?: (viagem: any) => void;
  showNotifications?: boolean;
}

export function useViagensRealtime({ 
  motoristaId, 
  onViagemUpdate,
  showNotifications = true 
}: UseViagensRealtimeProps = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!motoristaId) return;

    console.log('🔄 Iniciando listener realtime para viagens do motorista:', motoristaId);

    const channel = supabase
      .channel('viagens-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'viagens',
          filter: `motorista_id=eq.${motoristaId}`
        },
        (payload) => {
          console.log('📡 Mudança detectada em viagem:', payload);

          // Invalidar queries relacionadas para recarregar dados
          queryClient.invalidateQueries({ queryKey: ['viagens'] });
          queryClient.invalidateQueries({ queryKey: ['viagens-motorista'] });

          // Callback customizado se fornecido
          if (onViagemUpdate) {
            onViagemUpdate(payload.new);
          }

          // Mostrar notificações baseadas no tipo de evento
          if (showNotifications) {
            if (payload.eventType === 'INSERT') {
              toast.success('Nova viagem atribuída!', {
                description: `Viagem ${payload.new.codigo} foi adicionada às suas viagens.`,
                duration: 5000,
              });
            } else if (payload.eventType === 'UPDATE') {
              const statusChanged = payload.old?.status !== payload.new?.status;
              
              if (statusChanged) {
                const statusLabels: Record<string, string> = {
                  planejada: 'Planejada',
                  em_andamento: 'Em Andamento',
                  concluida: 'Concluída',
                  cancelada: 'Cancelada'
                };

                toast.info('Status da viagem atualizado', {
                  description: `Viagem ${payload.new.codigo}: ${statusLabels[payload.new.status] || payload.new.status}`,
                  duration: 5000,
                });
              } else {
                toast.info('Viagem atualizada', {
                  description: `A viagem ${payload.new.codigo} foi modificada.`,
                  duration: 3000,
                });
              }
            } else if (payload.eventType === 'DELETE') {
              toast.warning('Viagem removida', {
                description: `A viagem ${payload.old.codigo} foi removida.`,
                duration: 4000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📊 Status da conexão realtime:', status);
      });

    return () => {
      console.log('🔌 Desconectando listener realtime');
      supabase.removeChannel(channel);
    };
  }, [motoristaId, queryClient, onViagemUpdate, showNotifications]);
}
