import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar } from 'lucide-react';

interface PhotoCardProps {
  foto: {
    id: string;
    nome: string;
    url: string;
    thumbnail_url?: string;
    categoria: string;
    created_at: string;
    metadata?: any;
    latitude?: number;
    longitude?: number;
    localizacao_timestamp?: string;
  };
}

export function PhotoCard({ foto }: PhotoCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      'partida_painel': 'Painel Partida',
      'chegada_painel': 'Painel Chegada',
      'despesa': 'Despesa',
      'adiantamento': 'Adiantamento',
      'recebimento_frete': 'Recebimento',
      'checkpoint': 'Checkpoint',
      'outro': 'Outro',
    };
    return labels[categoria] || categoria;
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:scale-105 transition-transform overflow-hidden relative group"
        onClick={() => setLightboxOpen(true)}
      >
        <div className="relative">
          <img
            src={foto.thumbnail_url || foto.url}
            alt={foto.nome}
            className="w-full h-32 object-cover"
            loading="lazy"
          />
          
          {/* Overlay com info adicional no hover */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs p-2">
            <p className="font-semibold">{getCategoriaLabel(foto.categoria)}</p>
            {foto.metadata?.valor && (
              <p className="mt-1">R$ {foto.metadata.valor}</p>
            )}
            {foto.metadata?.km_detectado && (
              <p className="mt-1">KM: {foto.metadata.km_detectado}</p>
            )}
          </div>
          
          {/* Badge de valor (se existir) */}
          {foto.metadata?.valor && (
            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold">
              R$ {foto.metadata.valor}
            </div>
          )}
          
          {/* Badge de KM (se existir) */}
          {foto.metadata?.km_detectado && (
            <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
              {foto.metadata.km_detectado} km
            </div>
          )}
        </div>
        
        {/* Footer com data */}
        <div className="p-2 text-xs text-muted-foreground truncate flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(foto.created_at)}
        </div>
      </Card>
      
      {/* Lightbox para visualização em tela cheia */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <img 
            src={foto.url} 
            alt={foto.nome} 
            className="w-full rounded-lg"
          />
          
          {/* Metadata completa */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getCategoriaLabel(foto.categoria)}</Badge>
              {foto.metadata?.confianca_ia && (
                <Badge variant="secondary">
                  IA: {foto.metadata.confianca_ia}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-semibold">{formatDate(foto.created_at)}</p>
              </div>
              
              {foto.metadata?.valor && (
                <div>
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-semibold">R$ {foto.metadata.valor}</p>
                </div>
              )}
              
              {foto.metadata?.km_detectado && (
                <div>
                  <p className="text-muted-foreground">KM Detectado</p>
                  <p className="font-semibold">{foto.metadata.km_detectado}</p>
                </div>
              )}
              
              {foto.metadata?.tipo_ia && (
                <div>
                  <p className="text-muted-foreground">Tipo (IA)</p>
                  <p className="font-semibold">{foto.metadata.tipo_ia}</p>
                </div>
              )}
            </div>
            
            {(foto.latitude && foto.longitude) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Localização GPS</p>
                  <p className="font-mono text-xs">
                    {foto.latitude.toFixed(6)}, {foto.longitude.toFixed(6)}
                  </p>
                  {foto.localizacao_timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Capturado em: {formatDate(foto.localizacao_timestamp)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
