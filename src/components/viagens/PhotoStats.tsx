import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Sparkles, Image } from 'lucide-react';

interface PhotoStatsProps {
  startDate?: string;
  endDate?: string;
}

export function PhotoStats({ startDate, endDate }: PhotoStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ['photo-stats', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('documentos')
        .select('categoria, metadata, latitude, longitude, created_at')
        .eq('tipo_entidade', 'viagem')
        .eq('tipo_documento', 'foto');
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Calcular estatísticas
      const total = data?.length || 0;
      const comGPS = data?.filter(d => d.latitude && d.longitude).length || 0;
      const processadasIA = data?.filter(d => {
        const metadata = d.metadata as any;
        return metadata?.confianca_ia;
      }).length || 0;
      
      const porCategoria = data?.reduce((acc: any, item) => {
        const cat = item.categoria || 'outro';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      
      const categoriasMaisUsadas = Object.entries(porCategoria || {})
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3)
        .map(([categoria, count]) => ({ categoria, count }));
      
      return {
        total,
        comGPS,
        processadasIA,
        taxaGPS: total > 0 ? ((comGPS / total) * 100).toFixed(1) : 0,
        taxaIA: total > 0 ? ((processadasIA / total) * 100).toFixed(1) : 0,
        categoriasMaisUsadas,
      };
    },
  });

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      'partida_painel': 'Painel Partida',
      'chegada_painel': 'Painel Chegada',
      'despesa': 'Despesas',
      'adiantamento': 'Adiantamentos',
      'recebimento_frete': 'Recebimentos',
      'checkpoint': 'Checkpoints',
      'outro': 'Outros',
    };
    return labels[categoria] || categoria;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Fotos
          </CardTitle>
          <Camera className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            Registradas no período
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Com GPS
          </CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.comGPS || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.taxaGPS}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Processadas por IA
          </CardTitle>
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.processadasIA || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.taxaIA}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Categorias Mais Usadas
          </CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats?.categoriasMaisUsadas && stats.categoriasMaisUsadas.length > 0 ? (
            <div className="space-y-1">
              {stats.categoriasMaisUsadas.map((item: any) => (
                <div key={item.categoria} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {getCategoriaLabel(item.categoria)}
                  </span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum dado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
