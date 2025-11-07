import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { compressImage } from '@/lib/image-compression';

interface EtapaChegadaProps {
  viagem: any;
  onChegadaRegistrada: () => void;
  onCancelar: () => void;
}

export function EtapaChegada({ viagem, onChegadaRegistrada, onCancelar }: EtapaChegadaProps) {
  const [kmFinal, setKmFinal] = useState('');
  const [fotoChegada, setFotoChegada] = useState<File | null>(null);
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
      
      setFotoChegada(compressedFile);
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
          const kmInicialNum = parseFloat(viagem.km_inicial || 0);
          if (data.km > kmInicialNum) {
            setKmFinal(String(data.km));
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
    }
  };

  const handleFinalizarViagem = async () => {
    if (!kmFinal) {
      toast.error('Informe o KM final');
      return;
    }

    const kmFinalNum = parseFloat(kmFinal);
    const kmInicialNum = parseFloat(viagem.km_inicial || 0);

    // Validações de negócio
    if (kmFinalNum <= kmInicialNum) {
      toast.error('KM final deve ser maior que o KM inicial');
      return;
    }

    const kmPercorrido = kmFinalNum - kmInicialNum;
    
    if (kmPercorrido < 10) {
      toast.error('KM percorrido muito baixo. Mínimo de 10 km para viagens.');
      return;
    }

    if (viagem.km_estimado && kmPercorrido > viagem.km_estimado * 2) {
      toast.warning('KM percorrido muito superior ao estimado. Confira se está correto.');
    }

    setLoading(true);
    try {
      // Capturar localização GPS
      toast.info('📍 Capturando localização...');
      const locationData = await getCurrentLocation();

      let fotoUrl = null;

      // Upload da foto se houver
      if (fotoChegada) {
        const fileExt = fotoChegada.name.split('.').pop();
        const fileName = `${viagem.id}-chegada-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, fotoChegada);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(fileName);

        fotoUrl = publicUrl;
        
        // Salvar também em documentos com categoria
        await uploadPhoto({
          file: fotoChegada,
          viagemId: viagem.id,
          categoria: 'chegada_painel',
          metadata: {
            km_detectado: kmFinal,
            confianca_ia: kmDetectadoPorIA ? 'alta' : 'manual',
          },
          captureLocation: false, // Já capturamos GPS acima
        });
      }

      const kmPercorrido = kmFinalNum - kmInicialNum;

      // Atualizar viagem com localização
      const { error } = await supabase
        .from('viagens')
        .update({
          status: 'concluida',
          data_chegada: new Date().toISOString(),
          km_final: kmFinalNum,
          km_percorrido: kmPercorrido,
          chegada_foto_url: fotoUrl,
          chegada_latitude: locationData?.latitude,
          chegada_longitude: locationData?.longitude,
          chegada_localizacao_timestamp: locationData ? new Date(locationData.timestamp).toISOString() : null,
        })
        .eq('id', viagem.id);

      if (error) throw error;

      toast.success('Viagem finalizada com sucesso!');
      onChegadaRegistrada();
    } catch (error: any) {
      toast.error('Erro ao finalizar viagem: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Finalizar Viagem</h2>

      {/* KM Inicial (info) */}
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">KM Inicial</p>
        <p className="text-2xl font-bold">{viagem.km_inicial || 0} km</p>
      </div>

      {/* KM Final */}
      <div className="space-y-2">
        <Label htmlFor="km-final" className="text-lg flex items-center gap-2">
          KM Final do Veículo
          {kmDetectadoPorIA && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">✨ IA</span>}
        </Label>
        <Input
          id="km-final"
          type="number"
          inputMode="numeric"
          placeholder="Ex: 151200"
          value={kmFinal}
          onChange={(e) => {
            setKmFinal(e.target.value);
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
        {kmFinal && viagem.km_inicial && (
          <p className="text-sm text-muted-foreground">
            KM percorrido: {(parseFloat(kmFinal) - parseFloat(viagem.km_inicial)).toFixed(0)} km
          </p>
        )}
      </div>

      {/* Foto do Painel */}
      <div className="space-y-2">
        <Label htmlFor="foto-chegada" className="text-lg">Foto do Painel (opcional)</Label>
        <label
          htmlFor="foto-chegada"
          className="flex items-center justify-center gap-3 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
        >
          <Camera className="h-8 w-8" />
          <span className="text-lg font-medium">
            {fotoChegada ? 'Foto capturada ✓' : 'Tirar Foto do Painel'}
          </span>
        </label>
        <input
          id="foto-chegada"
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
                setFotoChegada(null);
                setPreviewUrl(null);
              }}
            >
              Tirar Outra Foto
            </Button>
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="space-y-3">
        <Button
          onClick={handleFinalizarViagem}
          disabled={loading || gpsLoading || !kmFinal}
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
              <CheckCircle className="mr-2 h-6 w-6" />
              Finalizando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-6 w-6" />
              Finalizar Viagem
            </>
          )}
        </Button>

        <Button
          onClick={onCancelar}
          variant="outline"
          className="w-full h-14 text-lg"
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
