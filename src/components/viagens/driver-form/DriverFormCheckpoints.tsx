import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

interface DriverFormCheckpointsProps {
  viagemId: string;
}

export function DriverFormCheckpoints({ viagemId }: DriverFormCheckpointsProps) {
  const [ocorrencia, setOcorrencia] = useState('');
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const [foto, setFoto] = useState<File | null>(null);

  const capturarLocalizacao = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacao({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success('Localização capturada');
        },
        (error) => {
          toast.error('Erro ao capturar localização: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocalização não suportada');
    }
  };

  const registrarCheckpoint = () => {
    // Implementar lógica de salvamento
    toast.success('Checkpoint registrado');
    setOcorrencia('');
    setFoto(null);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label>Ocorrência</Label>
        <Textarea
          placeholder="Descreva o que aconteceu (atraso, avaria, fiscalização, etc.)"
          value={ocorrencia}
          onChange={(e) => setOcorrencia(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Foto (opcional)</Label>
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-2">
        <Label>Localização</Label>
        <Button
          type="button"
          variant="outline"
          onClick={capturarLocalizacao}
          className="w-full"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {localizacao ? `Lat: ${localizacao.lat.toFixed(6)}, Lng: ${localizacao.lng.toFixed(6)}` : 'Capturar Localização'}
        </Button>
      </div>

      <Button
        onClick={registrarCheckpoint}
        className="w-full"
        disabled={!ocorrencia.trim()}
      >
        Registrar Checkpoint
      </Button>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Checkpoints Registrados</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum checkpoint registrado
        </p>
      </div>
    </div>
  );
}
