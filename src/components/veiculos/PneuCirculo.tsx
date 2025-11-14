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

  const isCritical = () => {
    if (!pneu) return false;
    const profundidade = pneu.profundidade_sulco_mm || 0;
    const minima = pneu.profundidade_minima_mm || 1.6;
    return profundidade <= minima;
  };

  // Formatar número de série (primeiros 7 caracteres)
  const getDisplayText = () => {
    if (!pneu) return '';
    return pneu.numero_serie?.slice(0, 7) || pneu.codigo_interno?.slice(0, 7) || '';
  };

  const gradientId = `tire-gradient-${x}-${y}`;
  const shadowId = `shadow-${x}-${y}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g 
          onClick={onClick} 
          className="cursor-pointer hover:opacity-90 transition-all duration-200 group"
        >
          {/* Definir gradiente radial para profundidade 3D */}
          <defs>
            <radialGradient id={gradientId}>
              <stop offset="0%" stopColor={isEmpty ? "hsl(var(--muted))" : "hsl(0, 0%, 20%)"} />
              <stop offset="70%" stopColor={isEmpty ? "hsl(var(--muted))" : "hsl(0, 0%, 12%)"} />
              <stop offset="100%" stopColor={isEmpty ? "hsl(var(--muted))" : "hsl(0, 0%, 8%)"} />
            </radialGradient>
            <filter id={shadowId}>
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="1" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Sombra do pneu */}
          {!isEmpty && (
            <ellipse
              cx={x + 1}
              cy={y + 2}
              rx={23}
              ry={11}
              fill="hsl(0, 0%, 0%)"
              opacity="0.2"
            />
          )}

          {/* Hover effect para posição vazia */}
          {isEmpty && (
            <>
              <ellipse
                cx={x}
                cy={y}
                rx={22}
                ry={10}
                fill="hsl(142, 76%, 36%)"
                opacity="0"
                className="group-hover:opacity-10 transition-opacity duration-200"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="20"
                fontWeight="700"
                fill="hsl(142, 76%, 36%)"
                opacity="0"
                className="group-hover:opacity-50 transition-opacity duration-200"
                pointerEvents="none"
              >
                +
              </text>
            </>
          )}
          
          {/* Pneu - Elipse com gradiente 3D */}
          <ellipse
            cx={x}
            cy={y}
            rx={22}
            ry={10}
            fill={isEmpty ? "none" : `url(#${gradientId})`}
            stroke={isEmpty ? "hsl(var(--border))" : "hsl(0, 0%, 25%)"}
            strokeWidth={isEmpty ? 2 : 1.5}
            strokeDasharray={isEmpty ? "4,3" : "0"}
            filter={isEmpty ? "" : `url(#${shadowId})`}
          />

          {/* Detalhes de banda de rodagem (linhas laterais) */}
          {!isEmpty && (
            <>
              <line x1={x - 18} y1={y - 2} x2={x - 18} y2={y + 2} stroke="hsl(0, 0%, 30%)" strokeWidth="0.5" opacity="0.6" />
              <line x1={x - 12} y1={y - 3} x2={x - 12} y2={y + 3} stroke="hsl(0, 0%, 30%)" strokeWidth="0.5" opacity="0.6" />
              <line x1={x - 6} y1={y - 3.5} x2={x - 6} y2={y + 3.5} stroke="hsl(0, 0%, 30%)" strokeWidth="0.5" opacity="0.6" />
              <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke="hsl(0, 0%, 30%)" strokeWidth="0.5" opacity="0.6" />
              <line x1={x + 6} y1={y - 3.5} x2={x + 6} y2={y + 3.5} stroke="hsl(0, 0%, 30%)" strokeWidth="0.5" opacity="0.6" />
              <line x1={x + 12} y1={y - 3} x2={x + 12} y2={y + 3} stroke="hsl(0, 0%, 30%)" strokeWidth="0.5" opacity="0.6" />
              <line x1={x + 18} y1={y - 2} x2={x + 18} y2={y + 2} stroke="hsl(0, 0%, 30%)" strokeWidth="0.5" opacity="0.6" />
            </>
          )}

          {/* Destaque sutil na lateral do pneu */}
          {!isEmpty && (
            <ellipse
              cx={x - 8}
              cy={y - 2}
              rx={8}
              ry={3}
              fill="white"
              opacity="0.15"
            />
          )}
          
          {/* Número de série do pneu (texto branco centralizado) */}
          {pneu && (
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="white"
              pointerEvents="none"
            >
              {getDisplayText()}
            </text>
          )}
          
          {/* Indicador de status (círculo colorido com sombra) */}
          {pneu && (
            <g className={isCritical() ? 'animate-pulse' : ''}>
              <circle
                cx={x + 19}
                cy={y - 8}
                r={4.5}
                fill={getStatusColor()}
                stroke="white"
                strokeWidth={1.5}
                filter={`url(#${shadowId})`}
              />
            </g>
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
