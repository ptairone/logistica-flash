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

  const { register, handleSubmit } = useForm<ChegadaFormData>({
    defaultValues: {
      data_chegada: new Date().toISOString().slice(0, 16),
    },
  });

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

      // Atualizar veículo
      if (viagem?.veiculo_id) {
        await supabase
          .from('veiculos')
          .update({
            em_viagem: false,
            km_atual: data.km_final,
          })
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
        <Label>Quilometragem Final *</Label>
        <Input
          type="number"
          {...register('km_final', { required: true, valueAsNumber: true })}
          disabled={jaConcluida}
        />
        {viagem?.km_inicial && (
          <p className="text-sm text-muted-foreground">
            KM Inicial: {viagem.km_inicial}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Foto do Painel *</Label>
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFotoPainel(e.target.files?.[0] || null)}
          disabled={jaConcluida}
        />
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
