import { useVeiculoComposicao } from '@/hooks/useVeiculoComposicao';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VeiculoReboquesInfoProps {
  veiculoId: string;
  numeroEixosCavalo?: number;
  compact?: boolean;
}

export function VeiculoReboquesInfo({ veiculoId, numeroEixosCavalo = 0, compact = false }: VeiculoReboquesInfoProps) {
  const { composicao, totalEixos } = useVeiculoComposicao(veiculoId);

  const quantidadeReboques = composicao.length;
  const totalEixosCompleto = numeroEixosCavalo + totalEixos;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={quantidadeReboques > 0 ? "default" : "secondary"} className="gap-1">
              🔗 {quantidadeReboques}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {quantidadeReboques > 0 ? (
              <div className="space-y-1">
                <p className="font-semibold">{quantidadeReboques} reboque(s) acoplado(s)</p>
                {composicao.map((comp) => (
                  <p key={comp.id} className="text-xs">
                    • {comp.reboques?.placa}
                  </p>
                ))}
              </div>
            ) : (
              <p>Sem reboques acoplados</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={quantidadeReboques > 0 ? "default" : "secondary"}>
          {quantidadeReboques > 0 ? `🔗 ${quantidadeReboques} Reboque${quantidadeReboques > 1 ? 's' : ''}` : 'Sem reboques'}
        </Badge>
        {totalEixosCompleto > 0 && (
          <span className="text-sm text-muted-foreground">
            {totalEixosCompleto} eixos {numeroEixosCavalo > 0 && `(${numeroEixosCavalo} cavalo + ${totalEixos} reboques)`}
          </span>
        )}
      </div>
      
      {quantidadeReboques > 0 && (
        <div className="flex flex-wrap gap-1">
          {composicao.slice(0, 2).map((comp) => (
            <Badge key={comp.id} variant="outline" className="text-xs">
              {comp.reboques?.placa}
            </Badge>
          ))}
          {quantidadeReboques > 2 && (
            <Badge variant="outline" className="text-xs">
              +{quantidadeReboques - 2}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
