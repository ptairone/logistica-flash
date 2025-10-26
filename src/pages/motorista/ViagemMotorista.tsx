import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EtapaPartida } from '@/components/motorista/EtapaPartida';
import { EtapaAndamento } from '@/components/motorista/EtapaAndamento';
import { EtapaChegada } from '@/components/motorista/EtapaChegada';
import { Card } from '@/components/ui/card';

export default function ViagemMotorista() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mostrarEncerramento, setMostrarEncerramento] = useState(false);

  const { data: viagem, isLoading, refetch } = useQuery({
    queryKey: ['viagem-motorista', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viagens')
        .select(`
          *,
          veiculo:veiculos!veiculo_id(placa, modelo, marca),
          frete:fretes!frete_id(codigo, cliente_nome, destino)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Viagem não encontrada</div>
      </div>
    );
  }

  const handlePartidaRegistrada = () => {
    refetch();
  };

  const handleChegadaRegistrada = () => {
    navigate('/motorista/viagens');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/motorista/viagens')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{viagem.codigo}</h1>
            <p className="text-sm opacity-90">{viagem.origem} → {viagem.destino}</p>
          </div>
        </div>
      </div>

      {/* Conteúdo baseado no status */}
      <div className="max-w-2xl mx-auto">
        {viagem.status === 'planejada' && (
          <EtapaPartida viagem={viagem} onPartidaRegistrada={handlePartidaRegistrada} />
        )}

        {viagem.status === 'em_andamento' && !mostrarEncerramento && (
          <EtapaAndamento 
            viagem={viagem} 
            onEncerrar={() => setMostrarEncerramento(true)} 
          />
        )}

        {viagem.status === 'em_andamento' && mostrarEncerramento && (
          <EtapaChegada 
            viagem={viagem} 
            onChegadaRegistrada={handleChegadaRegistrada}
            onCancelar={() => setMostrarEncerramento(false)}
          />
        )}

        {viagem.status === 'concluida' && (
          <div className="p-6">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Viagem Concluída ✓</h2>
              <p className="text-muted-foreground mb-4">
                Esta viagem já foi finalizada.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KM Inicial:</span>
                  <span className="font-semibold">{viagem.km_inicial} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KM Final:</span>
                  <span className="font-semibold">{viagem.km_final} km</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">KM Percorrido:</span>
                  <span className="font-bold text-lg">{viagem.km_percorrido} km</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
