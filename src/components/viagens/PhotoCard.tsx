import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

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
        className="cursor-pointer hover:scale-105 active:scale-95 transition-transform overflow-hidden relative group"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLightboxOpen(true);
        }}
      >
        <div className="relative aspect-square">
          <img
            src={foto.thumbnail_url || foto.url}
            alt={foto.nome}
            className="object-cover aspect-square h-full bg-muted"
            loading="lazy"
            crossOrigin="anonymous"
            decoding="async"
            onLoad={(e) => {
              // Se a imagem carregou mas está "branca" (dimensões zeradas), tenta a original
              if (e.currentTarget.naturalWidth === 0 || e.currentTarget.naturalHeight === 0) {
                if (foto.thumbnail_url && e.currentTarget.src.includes('thumb_')) {
                  e.currentTarget.src = foto.url;
                }
              }
            }}
            onError={(e) => {
              console.warn('Erro ao carregar foto:', e.currentTarget.src);
              if (foto.thumbnail_url && e.currentTarget.src === foto.thumbnail_url) {
                e.currentTarget.src = foto.url;
              }
            }}
          />
          
          {/* Badge de categoria sempre visível no mobile */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
            <p className="text-white text-xs font-semibold truncate">
              {getCategoriaLabel(foto.categoria)}
            </p>
          </div>
          
          {/* Badge de confiança IA */}
          {foto.metadata?.confianca_ia && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 shadow-lg">
                IA: {foto.metadata.confianca_ia}
              </Badge>
            </div>
          )}
          
          {/* Badge de KM (se existir) */}
          {foto.metadata?.km_detectado && (
            <div className="absolute top-2 left-2">
              <Badge className="text-xs px-1.5 py-0.5 shadow-lg bg-primary/90">
                {foto.metadata.km_detectado} km
              </Badge>
            </div>
          )}
        </div>
        
        {/* Footer compacto com data */}
        <div className="p-1.5 text-[10px] md:text-xs text-muted-foreground truncate flex items-center justify-center gap-1 bg-muted/50">
          <Calendar className="h-3 w-3" />
          <span className="hidden sm:inline">{formatDate(foto.created_at)}</span>
          <span className="sm:hidden">{format(new Date(foto.created_at), "dd/MM HH:mm", { locale: ptBR })}</span>
        </div>
      </Card>
      
      {/* Lightbox para visualização em tela cheia */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-4 md:p-6 z-[60]">
          <DialogHeader>
            <DialogTitle>Foto - {getCategoriaLabel(foto.categoria || 'outro')}</DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={foto.url}
              alt={foto.nome}
              className="w-full h-auto object-contain max-h-[80vh]"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Erro ao carregar imagem original:', foto.url);
                toast.error('Não foi possível carregar a foto');
              }}
            />
          </div>
          
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-semibold text-sm">{formatDate(foto.created_at)}</p>
              </div>
              
              {foto.metadata?.valor && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-semibold text-sm">R$ {foto.metadata.valor}</p>
                </div>
              )}
              
              {foto.metadata?.km_detectado && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">KM Detectado</p>
                  <p className="font-semibold text-sm">{foto.metadata.km_detectado}</p>
                </div>
              )}
              
              {foto.metadata?.tipo_ia && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tipo (IA)</p>
                  <p className="font-semibold text-sm">{foto.metadata.tipo_ia}</p>
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
