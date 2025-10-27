import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, FileImage } from 'lucide-react';

interface QuickCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagens: Array<{
    id: string;
    frete?: {
      codigo: string;
      cliente_nome?: string;
      destino?: string;
    };
  }>;
}

export function QuickCaptureModal({ open, onOpenChange, viagens }: QuickCaptureModalProps) {
  const navigate = useNavigate();
  const [viagemSelecionada, setViagemSelecionada] = useState<string>('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const viagemId = viagens.length === 1 ? viagens[0].id : viagemSelecionada;
    
    if (!viagemId) return;

    // Navegar para AdicionarDespesa com a foto no state
    navigate(`/motorista/viagem/${viagemId}/adicionar-despesa`, {
      state: { foto: file, source }
    });
    
    onOpenChange(false);
  };

  const handleCameraClick = () => {
    const viagemId = viagens.length === 1 ? viagens[0].id : viagemSelecionada;
    if (!viagemId) return;
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    const viagemId = viagens.length === 1 ? viagens[0].id : viagemSelecionada;
    if (!viagemId) return;
    galleryInputRef.current?.click();
  };

  const mostrarSeletor = viagens.length > 1;
  const podeAbrirCamera = viagens.length === 1 || viagemSelecionada;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="📸 Registrar Comprovante"
      description="Tire foto ou escolha da galeria"
    >
      <div className="space-y-4">
        {/* Seletor de Viagem */}
        {mostrarSeletor && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecione a viagem:</label>
            <Select value={viagemSelecionada} onValueChange={setViagemSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma viagem..." />
              </SelectTrigger>
              <SelectContent>
                {viagens.map((viagem) => (
                  <SelectItem key={viagem.id} value={viagem.id}>
                    {viagem.frete?.codigo || 'Sem código'} - {viagem.frete?.destino || 'Sem destino'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Botões de Captura */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleCameraClick}
            disabled={!podeAbrirCamera}
            className="w-full h-16 text-lg font-semibold gap-3"
            size="lg"
          >
            <Camera className="h-6 w-6" />
            Tirar Foto
          </Button>

          <Button
            onClick={handleGalleryClick}
            disabled={!podeAbrirCamera}
            variant="outline"
            className="w-full h-16 text-lg font-semibold gap-3"
            size="lg"
          >
            <FileImage className="h-6 w-6" />
            Escolher da Galeria
          </Button>
        </div>

        {/* Inputs ocultos */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleImageSelect(e, 'camera')}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageSelect(e, 'gallery')}
          className="hidden"
        />
      </div>
    </BottomSheet>
  );
}
