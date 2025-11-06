import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, MapPin } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';

interface DriverFormPartidaProps {
  viagemId: string;
}

interface PartidaFormData {
  km_inicial: number;
  data_saida: string;
  checklist_pneus: boolean;
  checklist_luzes: boolean;
  checklist_documentos: boolean;
}

export function DriverFormPartida({ viagemId }: DriverFormPartidaProps) {
  const queryClient = useQueryClient();
  const [fotoPanel, setFotoPanel] = useState<File | null>(null);
  const [fotoAvaria, setFotoAvaria] = useState<File | null>(null);
  const [processandoKm, setProcessandoKm] = useState(false);
  const [kmDetectadoPorIA, setKmDetectadoPorIA] = useState(false);
  const { getCurrentLocation } = useGeolocation();

  const { data: viagem } = useQuery({
    queryKey: ['viagem-driver', viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viagens')
        .select('*, veiculo:veiculos(placa, status)')
        .eq('id', viagemId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { register, handleSubmit, setValue } = useForm<PartidaFormData>({
    defaultValues: {
      data_saida: new Date().toISOString().slice(0, 16),
    },
  });

  const handleFotoPanelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFotoPanel(file);
    
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
        setValue('km_inicial', data.km);
        setKmDetectadoPorIA(true);
        toast.success(`✨ KM detectado: ${data.km.toLocaleString('pt-BR')}`, {
          description: 'Confira se está correto e ajuste se necessário'
        });
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

  const registrarPartida = useMutation({
    mutationFn: async (data: PartidaFormData) => {
      // Capturar localização GPS
      const locationData = await getCurrentLocation();

      let partidaFotoUrl = null;

      // Upload da foto do painel
      if (fotoPanel) {
        const fileName = `${viagemId}-partida-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, fotoPanel);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(fileName);

        partidaFotoUrl = publicUrl;
      }

      // Atualizar viagem com localização
      const { error } = await supabase
        .from('viagens')
        .update({
          status: 'em_andamento',
          data_saida: data.data_saida,
          km_inicial: data.km_inicial,
          partida_foto_url: partidaFotoUrl,
          partida_latitude: locationData?.latitude,
          partida_longitude: locationData?.longitude,
          partida_localizacao_timestamp: locationData ? new Date(locationData.timestamp).toISOString() : null,
        })
        .eq('id', viagemId);

      if (error) throw error;

      // Atualizar veículo para ocupado
      if (viagem?.veiculo_id) {
        await supabase
          .from('veiculos')
          .update({ em_viagem: true })
          .eq('id', viagem.veiculo_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagem-driver', viagemId] });
      toast.success('Partida registrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar partida: ' + error.message);
    },
  });

  const onSubmit = (data: PartidaFormData) => {
    if (!data.checklist_pneus || !data.checklist_luzes || !data.checklist_documentos) {
      toast.error('Complete o checklist antes de iniciar');
      return;
    }
    registrarPartida.mutate(data);
  };

  const veiculo = viagem?.veiculo ? (Array.isArray(viagem.veiculo) ? viagem.veiculo[0] : viagem.veiculo) : null;
  const jaIniciada = viagem?.status === 'em_andamento' || viagem?.status === 'concluida';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      <div className="space-y-2">
        <Label>Veículo (Placa)</Label>
        <Input
          value={veiculo?.placa || 'Carregando...'}
          disabled
          className={veiculo?.status === 'inativo' ? 'bg-destructive/10' : ''}
        />
        {veiculo?.status === 'inativo' && (
          <p className="text-sm text-destructive">Veículo inativo - contate o operacional</p>
        )}
      </div>

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
          onChange={handleFotoPanelChange}
          disabled={jaIniciada || processandoKm}
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Quilometragem Inicial *
          {kmDetectadoPorIA && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">✨ IA</span>}
        </Label>
        <Input
          type="number"
          {...register('km_inicial', { required: true, valueAsNumber: true })}
          disabled={jaIniciada || processandoKm}
          onChange={(e) => {
            register('km_inicial').onChange(e);
            setKmDetectadoPorIA(false);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Data/Hora de Saída</Label>
        <Input
          type="datetime-local"
          {...register('data_saida')}
          disabled={jaIniciada}
        />
      </div>

      <div className="space-y-4">
        <Label>Checklist Rápido</Label>
        <div className="flex items-center space-x-2">
          <Checkbox id="pneus" {...register('checklist_pneus')} disabled={jaIniciada} />
          <label htmlFor="pneus" className="text-sm">Pneus OK</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="luzes" {...register('checklist_luzes')} disabled={jaIniciada} />
          <label htmlFor="luzes" className="text-sm">Luzes OK</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="docs" {...register('checklist_documentos')} disabled={jaIniciada} />
          <label htmlFor="docs" className="text-sm">Documentos OK</label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Foto de Avaria (se houver)</Label>
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFotoAvaria(e.target.files?.[0] || null)}
          disabled={jaIniciada}
        />
      </div>

      {!jaIniciada && (
        <Button
          type="submit"
          className="w-full"
          disabled={registrarPartida.isPending || veiculo?.status === 'inativo'}
        >
          <Upload className="w-4 h-4 mr-2" />
          Iniciar Viagem
        </Button>
      )}

      {jaIniciada && (
        <p className="text-center text-muted-foreground">Partida já registrada</p>
      )}
    </form>
  );
}
