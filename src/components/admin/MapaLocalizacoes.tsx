import { MapPin, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocalizacaoData {
  latitude: number;
  longitude: number;
  timestamp: string;
  tipo: string;
  descricao?: string;
}

interface MapaLocalizacoesProps {
  localizacoes: LocalizacaoData[];
}

export function MapaLocalizacoes({ localizacoes }: MapaLocalizacoesProps) {
  const abrirNoMapa = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Localizações Registradas
      </h3>

      {localizacoes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma localização registrada</p>
      ) : (
        <div className="space-y-3">
          {localizacoes.map((loc, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      loc.tipo === 'partida' ? 'default' :
                      loc.tipo === 'chegada' ? 'secondary' :
                      loc.tipo === 'despesa' ? 'destructive' : 'outline'
                    }>
                      {loc.tipo}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(loc.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {loc.descricao && (
                    <p className="text-sm">{loc.descricao}</p>
                  )}
                  <p className="text-xs font-mono text-muted-foreground">
                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => abrirNoMapa(loc.latitude, loc.longitude)}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Ver no Mapa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
