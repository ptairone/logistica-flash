import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Play, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGeolocation } from '@/hooks/useGeolocation';

interface EtapaPartidaProps {
  viagem: any;
  onPartidaRegistrada: () => void;
}

export function EtapaPartida({ viagem, onPartidaRegistrada }: EtapaPartidaProps) {
  const [kmInicial, setKmInicial] = useState('');
  const [fotoPartida, setFotoPartida] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { getCurrentLocation, loading: gpsLoading } = useGeolocation();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFotoPartida(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleIniciarViagem = async () => {
    if (!kmInicial) {
      toast.error('Informe o KM inicial');
      return;
    }

    setLoading(true);
    try {
      // Capturar localização GPS
      toast.info('📍 Capturando localização...');
      const locationData = await getCurrentLocation();

      let fotoUrl = null;

      // Upload da foto se houver
      if (fotoPartida) {
        const fileExt = fotoPartida.name.split('.').pop();
        const fileName = `${viagem.id}-partida-${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, fotoPartida);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(fileName);

        fotoUrl = publicUrl;
      }

      // Atualizar viagem com localização
      const { error } = await supabase
        .from('viagens')
        .update({
          status: 'em_andamento',
          data_saida: new Date().toISOString(),
          km_inicial: parseFloat(kmInicial),
          partida_foto_url: fotoUrl,
          partida_latitude: locationData?.latitude,
          partida_longitude: locationData?.longitude,
          partida_localizacao_timestamp: locationData ? new Date(locationData.timestamp).toISOString() : null,
        })
        .eq('id', viagem.id);

      if (error) throw error;

      toast.success('Viagem iniciada com sucesso!');
      onPartidaRegistrada();
    } catch (error: any) {
      toast.error('Erro ao iniciar viagem: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Iniciar Viagem</h2>

      {/* KM Inicial */}
      <div className="space-y-2">
        <Label htmlFor="km-inicial" className="text-lg">KM Inicial do Veículo</Label>
        <Input
          id="km-inicial"
          type="number"
          inputMode="numeric"
          placeholder="Ex: 150000"
          value={kmInicial}
          onChange={(e) => setKmInicial(e.target.value)}
          className="h-14 text-lg"
        />
      </div>

      {/* Foto do Painel */}
      <div className="space-y-2">
        <Label htmlFor="foto-partida" className="text-lg">Foto do Painel (opcional)</Label>
        <label
          htmlFor="foto-partida"
          className="flex items-center justify-center gap-3 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
        >
          <Camera className="h-8 w-8" />
          <span className="text-lg font-medium">
            {fotoPartida ? 'Foto capturada ✓' : 'Tirar Foto do Painel'}
          </span>
        </label>
        <input
          id="foto-partida"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFotoChange}
          className="hidden"
        />
        {previewUrl && (
          <div className="space-y-2">
            <img src={previewUrl} alt="Preview" className="w-full max-w-xs rounded-lg border" />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setFotoPartida(null);
                setPreviewUrl(null);
              }}
            >
              Tirar Outra Foto
            </Button>
          </div>
        )}
      </div>

      {/* Botão Iniciar */}
      <Button
        onClick={handleIniciarViagem}
        disabled={loading || gpsLoading || !kmInicial}
        className="w-full h-16 text-xl font-bold"
        size="lg"
      >
        {gpsLoading ? (
          <>
            <MapPin className="mr-2 h-6 w-6 animate-pulse" />
            Capturando GPS...
          </>
        ) : loading ? (
          <>
            <Play className="mr-2 h-6 w-6" />
            Iniciando...
          </>
        ) : (
          <>
            <Play className="mr-2 h-6 w-6" />
            Iniciar Viagem
          </>
        )}
      </Button>
    </div>
  );
}
