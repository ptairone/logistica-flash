import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PneuCirculoProps {
  x: number;
  y: number;
  pneu?: any;
  onClick: () => void;
}

export function PneuCirculo({ x, y, pneu, onClick }: PneuCirculoProps) {
  const isEmpty = !pneu;
  
  // Calcular cor do indicador de status
  const getStatusColor = () => {
    if (!pneu) return 'hsl(var(--muted))';
    
    const profundidade = pneu.profundidade_sulco_mm || 0;
    const minima = pneu.profundidade_minima_mm || 1.6;
    
    if (profundidade <= minima) return 'hsl(0, 84%, 60%)'; // Vermelho crítico
    if (profundidade <= minima * 1.5) return 'hsl(48, 96%, 53%)'; // Amarelo atenção
    return 'hsl(142, 76%, 36%)'; // Verde OK
  };

  // Formatar número de série (primeiros 7 caracteres)
  const getDisplayText = () => {
    if (!pneu) return '';
    return pneu.numero_serie?.slice(0, 7) || pneu.codigo_interno?.slice(0, 7) || '';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g 
          onClick={onClick} 
          className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
        >
          {/* Pneu - Elipse preta simples (vista de cima) */}
          <ellipse
            cx={x}
            cy={y}
            rx={22}
            ry={10}
            fill={isEmpty ? "none" : "hsl(0, 0%, 15%)"}
            stroke={isEmpty ? "hsl(var(--border))" : "hsl(0, 0%, 30%)"}
            strokeWidth={isEmpty ? 1.5 : 1}
            strokeDasharray={isEmpty ? "3,2" : "0"}
          />
          
          {/* Número de série do pneu (texto branco centralizado) */}
          {pneu && (
            <text
              x={x}
              y={y + 3}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="white"
              pointerEvents="none"
            >
              {getDisplayText()}
            </text>
          )}
          
          {/* Indicador de status (pequeno círculo colorido) */}
          {pneu && (
            <circle
              cx={x + 18}
              cy={y - 7}
              r={3}
              fill={getStatusColor()}
              stroke="white"
              strokeWidth={1}
            />
          )}
        </g>
      </TooltipTrigger>
      
      {/* Tooltip Content */}
      <TooltipContent side="top" className="max-w-xs">
        {pneu ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getStatusColor() }}
              />
              <span className="font-semibold">{pneu.codigo_interno}</span>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Marca:</span> {pneu.marca}</p>
              <p><span className="text-muted-foreground">Modelo:</span> {pneu.modelo}</p>
              <p><span className="text-muted-foreground">Série:</span> {pneu.numero_serie}</p>
              <p><span className="text-muted-foreground">Sulco:</span> {pneu.profundidade_sulco_mm || 0}mm</p>
              {pneu.km_rodados && (
                <p><span className="text-muted-foreground">KM Rodados:</span> {pneu.km_rodados.toLocaleString()}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Posição vazia - Clique para instalar</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
