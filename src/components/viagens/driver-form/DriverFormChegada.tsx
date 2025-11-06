import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, MapPin } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface DriverFormChegadaProps {
  viagemId: string;
}

interface ChegadaFormData {
  km_final: number;
  data_chegada: string;
}

export function DriverFormChegada({ viagemId }: DriverFormChegadaProps) {
  const queryClient = useQueryClient();
  const [fotoPainel, setFotoPainel] = useState<File | null>(null);
  const [fotoComprovante, setFotoComprovante] = useState<File | null>(null);
  const [processandoKm, setProcessandoKm] = useState(false);
  const [kmDetectadoPorIA, setKmDetectadoPorIA] = useState(false);
  const { getCurrentLocation } = useGeolocation();

  const { data: viagem } = useQuery({
    queryKey: ['viagem-driver', viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viagens')
        .select('*')
        .eq('id', viagemId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { register, handleSubmit, setValue } = useForm<ChegadaFormData>({
    defaultValues: {
      data_chegada: new Date().toISOString().slice(0, 16),
    },
  });

  const handleFotoPainelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFotoPainel(file);
    
    // Processar com IA para extrair KM
    setProcessandoKm(true);
    setKmDetectadoPorIA(false);
    
    try {
      toast.info('🤖 Lendo hodômetro...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', 'odometro');
      
      const { data, error } = await supabase.functions.invoke('processar-comprovante', {
        body: formData
      });
      
      if (error) throw error;
      
      if (data?.km) {
        const kmInicialNum = viagem?.km_inicial || 0;
        if (data.km > kmInicialNum) {
          setValue('km_final', data.km);
          setKmDetectadoPorIA(true);
          toast.success(`✨ KM detectado: ${data.km.toLocaleString('pt-BR')}`, {
            description: 'Confira se está correto e ajuste se necessário'
          });
        } else {
          toast.error(`KM detectado (${data.km}) é menor que KM inicial (${kmInicialNum})`);
        }
      } else if (data?.erro) {
        toast.warning(data.erro, {
          description: 'Tire uma foto mais nítida ou digite manualmente'
        });
      } else {
        toast.warning('Não foi possível ler o KM. Digite manualmente.');
      }
    } catch (err: any) {
      console.error('Erro ao processar KM:', err);
      if (err.message?.includes('429')) {
        toast.error('Muitas requisições. Aguarde um momento.');
      } else if (err.message?.includes('402')) {
        toast.error('Serviço temporariamente indisponível.');
      } else {
        toast.warning('Erro ao processar. Digite o KM manualmente.');
      }
    } finally {
      setProcessandoKm(false);
    }
  };

  const registrarChegada = useMutation({
    mutationFn: async (data: ChegadaFormData) => {
      if (!viagem?.data_saida) {
        throw new Error('Partida não registrada');
      }

      if (data.km_final < (viagem.km_inicial || 0)) {
        throw new Error('KM final deve ser maior ou igual ao KM inicial');
      }

      // Capturar localização GPS
      const locationData = await getCurrentLocation();

      let chegadaFotoUrl = null;

      if (fotoPainel) {
        const fileName = `${viagemId}-chegada-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, fotoPainel);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(fileName);

        chegadaFotoUrl = publicUrl;
      }

      const kmPercorrido = data.km_final - (viagem.km_inicial || 0);

      // Atualizar viagem com localização
      const { error } = await supabase
        .from('viagens')
        .update({
          status: 'concluida',
          data_chegada: data.data_chegada,
          km_final: data.km_final,
          km_percorrido: kmPercorrido,
          chegada_foto_url: chegadaFotoUrl,
          chegada_latitude: locationData?.latitude,
          chegada_longitude: locationData?.longitude,
          chegada_localizacao_timestamp: locationData ? new Date(locationData.timestamp).toISOString() : null,
        })
        .eq('id', viagemId);

      if (error) throw error;

      // Atualizar status do veículo para não estar mais em viagem
      // km_atual é atualizado automaticamente pelo trigger do banco
      if (viagem?.veiculo_id) {
        await supabase
          .from('veiculos')
          .update({ em_viagem: false })
          .eq('id', viagem.veiculo_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagem-driver', viagemId] });
      toast.success('Viagem concluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar chegada: ' + error.message);
    },
  });

  const onSubmit = (data: ChegadaFormData) => {
    registrarChegada.mutate(data);
  };

  const jaConcluida = viagem?.status === 'concluida';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Foto do Painel *
          {processandoKm && <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="animate-spin">⚙️</span> Processando...
          </span>}
        </Label>
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFotoPainelChange}
          disabled={jaConcluida || processandoKm}
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Quilometragem Final *
          {kmDetectadoPorIA && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">✨ IA</span>}
        </Label>
        <Input
          type="number"
          {...register('km_final', { required: true, valueAsNumber: true })}
          disabled={jaConcluida || processandoKm}
          onChange={(e) => {
            register('km_final').onChange(e);
            setKmDetectadoPorIA(false);
          }}
        />
        {viagem?.km_inicial && (
          <p className="text-sm text-muted-foreground">
            KM Inicial: {viagem.km_inicial}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Data/Hora de Chegada</Label>
        <Input
          type="datetime-local"
          {...register('data_chegada')}
          disabled={jaConcluida}
        />
      </div>

      <div className="space-y-2">
        <Label>Comprovante de Entrega *</Label>
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFotoComprovante(e.target.files?.[0] || null)}
          disabled={jaConcluida}
        />
      </div>

      {!jaConcluida && (
        <Button
          type="submit"
          className="w-full"
          disabled={registrarChegada.isPending || !fotoPainel || !fotoComprovante}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Encerrar Viagem
        </Button>
      )}

      {jaConcluida && (
        <p className="text-center text-muted-foreground">Viagem já concluída</p>
      )}
    </form>
  );
}
