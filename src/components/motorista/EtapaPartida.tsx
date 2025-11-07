import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Play, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { compressImage } from '@/lib/image-compression';

interface EtapaPartidaProps {
  viagem: any;
  onPartidaRegistrada: () => void;
}

export function EtapaPartida({ viagem, onPartidaRegistrada }: EtapaPartidaProps) {
  const [kmInicial, setKmInicial] = useState('');
  const [fotoPartida, setFotoPartida] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processandoKm, setProcessandoKm] = useState(false);
  const [kmDetectadoPorIA, setKmDetectadoPorIA] = useState(false);
  const { getCurrentLocation, loading: gpsLoading } = useGeolocation();
  const { uploadPhoto } = usePhotoUpload();

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      // Comprimir imagem antes de processar
      toast.info('📸 Comprimindo imagem...');
      const compressedFile = await compressImage(file, 1024, 0.85);
      
      setFotoPartida(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile));
      
      // Processar com IA para extrair KM
      setProcessandoKm(true);
      setKmDetectadoPorIA(false);
      
      try {
        toast.info('🤖 Lendo hodômetro...');
        
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('tipo', 'odometro');
        
        const { data, error } = await supabase.functions.invoke('processar-comprovante', {
          body: formData
        });
        
        if (error) throw error;
        
        if (data?.km) {
          setKmInicial(String(data.km));
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
    }
  };

  const handleIniciarViagem = async () => {
    if (!kmInicial) {
      toast.error('Informe o KM inicial');
      return;
    }

    const kmInicialNum = parseFloat(kmInicial);
    
    // Validações de negócio
    if (kmInicialNum <= 0) {
      toast.error('KM inicial deve ser maior que zero');
      return;
    }

    if (viagem.km_inicial && kmInicialNum < parseFloat(viagem.km_inicial)) {
      toast.error('KM inicial não pode ser menor que o KM anterior da viagem');
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
        
        // Salvar também em documentos com categoria
        await uploadPhoto({
          file: fotoPartida,
          viagemId: viagem.id,
          categoria: 'partida_painel',
          metadata: {
            km_detectado: kmInicial,
            confianca_ia: kmDetectadoPorIA ? 'alta' : 'manual',
          },
          captureLocation: false, // Já capturamos GPS acima
        });
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
        <Label htmlFor="km-inicial" className="text-lg flex items-center gap-2">
          KM Inicial do Veículo
          {kmDetectadoPorIA && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">✨ IA</span>}
        </Label>
        <Input
          id="km-inicial"
          type="number"
          inputMode="numeric"
          placeholder="Ex: 150000"
          value={kmInicial}
          onChange={(e) => {
            setKmInicial(e.target.value);
            setKmDetectadoPorIA(false);
          }}
          className="h-14 text-lg"
          disabled={processandoKm}
        />
        {processandoKm && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="animate-spin">⚙️</span> Processando foto...
          </p>
        )}
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
