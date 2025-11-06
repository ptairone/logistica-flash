import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhotoCard } from './PhotoCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PhotoGalleryProps {
  viagemId: string;
}

export function PhotoGallery({ viagemId }: PhotoGalleryProps) {
  const { data: fotos, isLoading } = useQuery({
    queryKey: ['fotos-viagem', viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('tipo_entidade', 'viagem')
        .eq('entidade_id', viagemId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Agrupar por categoria
  const fotosPorCategoria = useMemo(() => {
    if (!fotos) return null;
    
    return {
      partida: fotos.filter(f => f.categoria === 'partida_painel'),
      chegada: fotos.filter(f => f.categoria === 'chegada_painel'),
      despesas: fotos.filter(f => f.categoria === 'despesa'),
      adiantamentos: fotos.filter(f => f.categoria === 'adiantamento'),
      recebimentos: fotos.filter(f => f.categoria === 'recebimento_frete'),
      checkpoints: fotos.filter(f => f.categoria === 'checkpoint'),
      outros: fotos.filter(f => !f.categoria || f.categoria === 'outro'),
    };
  }, [fotos]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!fotos || fotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma foto registrada nesta viagem</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section 
        titulo="📸 Partida" 
        emoji="📸"
        fotos={fotosPorCategoria?.partida || []} 
      />
      
      <Section 
        titulo="🏁 Chegada" 
        emoji="🏁"
        fotos={fotosPorCategoria?.chegada || []} 
      />
      
      <Section 
        titulo="💳 Despesas" 
        emoji="💳"
        fotos={fotosPorCategoria?.despesas || []} 
      />
      
      <Section 
        titulo="💵 Adiantamentos" 
        emoji="💵"
        fotos={fotosPorCategoria?.adiantamentos || []} 
      />
      
      <Section 
        titulo="💰 Recebimentos" 
        emoji="💰"
        fotos={fotosPorCategoria?.recebimentos || []} 
      />
      
      <Section 
        titulo="📍 Checkpoints" 
        emoji="📍"
        fotos={fotosPorCategoria?.checkpoints || []} 
      />
      
      <Section 
        titulo="📋 Outros" 
        emoji="📋"
        fotos={fotosPorCategoria?.outros || []} 
      />
    </div>
  );
}

interface SectionProps {
  titulo: string;
  emoji: string;
  fotos: any[];
}

function Section({ titulo, fotos }: SectionProps) {
  if (fotos.length === 0) return null;
  
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {titulo}
        <Badge variant="secondary">{fotos.length}</Badge>
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {fotos.map(foto => (
          <PhotoCard key={foto.id} foto={foto} />
        ))}
      </div>
    </div>
  );
}
