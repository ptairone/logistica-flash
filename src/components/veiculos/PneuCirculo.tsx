import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PneuCirculoProps {
  x: number;
  y: number;
  posicao: string;
  pneu?: any;
  onClick: () => void;
}

export function PneuCirculo({ x, y, posicao, pneu, onClick }: PneuCirculoProps) {
  // Determinar cor baseado no status do pneu
  const getColor = () => {
    if (!pneu) return 'hsl(var(--muted))';
    
    const prof = pneu.profundidade_sulco_mm || 0;
    const min = pneu.profundidade_minima_mm || 1.6;
    
    if (prof <= min) return 'hsl(0, 84%, 60%)'; // Vermelho crítico
    if (prof <= min + 1.5) return 'hsl(48, 96%, 53%)'; // Amarelo atenção
    return 'hsl(142, 71%, 45%)'; // Verde OK
  };
  
  const getDarkerColor = () => {
    if (!pneu) return 'hsl(var(--muted-foreground))';
    
    const prof = pneu.profundidade_sulco_mm || 0;
    const min = pneu.profundidade_minima_mm || 1.6;
    
    if (prof <= min) return 'hsl(0, 84%, 40%)';
    if (prof <= min + 1.5) return 'hsl(48, 96%, 33%)';
    return 'hsl(142, 71%, 25%)';
  };
  
  const color = getColor();
  const darkerColor = getDarkerColor();
  const isEmpty = !pneu;
  
  // Dimensões isométricas
  const tireWidth = 24;
  const tireHeight = 16;
  const depth = 8;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g 
          onClick={onClick}
          className="cursor-pointer transition-all hover:brightness-110"
          style={{ 
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Pneu isométrico 3D */}
          <defs>
            <radialGradient id={`tire-gradient-${posicao}`}>
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="70%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={darkerColor} stopOpacity="1" />
            </radialGradient>
            <linearGradient id={`depth-gradient-${posicao}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={darkerColor} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Lado inferior (profundidade) - isométrico */}
          <ellipse
            cx={x}
            cy={y + depth / 2}
            rx={tireWidth / 2}
            ry={tireHeight / 2}
            fill={darkerColor}
            opacity="0.6"
          />
          
          {/* Corpo lateral do pneu */}
          <path
            d={`
              M ${x - tireWidth / 2} ${y}
              L ${x - tireWidth / 2} ${y + depth}
              A ${tireWidth / 2} ${tireHeight / 2} 0 0 0 ${x + tireWidth / 2} ${y + depth}
              L ${x + tireWidth / 2} ${y}
              A ${tireWidth / 2} ${tireHeight / 2} 0 0 1 ${x - tireWidth / 2} ${y}
            `}
            fill={`url(#depth-gradient-${posicao})`}
            stroke={isEmpty ? 'hsl(var(--border))' : 'hsl(var(--foreground))'}
            strokeWidth={isEmpty ? 1.5 : 0.8}
            strokeDasharray={isEmpty ? '4,2' : '0'}
            opacity={isEmpty ? 0.5 : 1}
          />
          
          {/* Topo do pneu (face frontal) */}
          <ellipse
            cx={x}
            cy={y}
            rx={tireWidth / 2}
            ry={tireHeight / 2}
            fill={`url(#tire-gradient-${posicao})`}
            stroke={isEmpty ? 'hsl(var(--border))' : 'hsl(var(--foreground))'}
            strokeWidth={isEmpty ? 1.5 : 0.8}
            strokeDasharray={isEmpty ? '4,2' : '0'}
            opacity={isEmpty ? 0.6 : 1}
          />
          
          {/* Aro interno (buraco central) */}
          <ellipse
            cx={x}
            cy={y}
            rx={tireWidth / 5}
            ry={tireHeight / 5}
            fill={isEmpty ? 'hsl(var(--background))' : 'hsl(var(--foreground))'}
            opacity={isEmpty ? 0.3 : 0.4}
          />
          
          {pneu && (
            <>
              {/* Sulcos realistas 3D */}
              <g opacity="0.6">
                {/* Sulco esquerdo */}
                <ellipse
                  cx={x - 8}
                  cy={y - 2}
                  rx="1.5"
                  ry="5"
                  fill="hsl(var(--foreground))"
                  opacity="0.3"
                />
                <ellipse
                  cx={x - 8}
                  cy={y + 2}
                  rx="1.5"
                  ry="5"
                  fill="hsl(var(--foreground))"
                  opacity="0.2"
                />
                
                {/* Sulco central */}
                <ellipse
                  cx={x}
                  cy={y - 2}
                  rx="1.5"
                  ry="5"
                  fill="hsl(var(--foreground))"
                  opacity="0.3"
                />
                <ellipse
                  cx={x}
                  cy={y + 2}
                  rx="1.5"
                  ry="5"
                  fill="hsl(var(--foreground))"
                  opacity="0.2"
                />
                
                {/* Sulco direito */}
                <ellipse
                  cx={x + 8}
                  cy={y - 2}
                  rx="1.5"
                  ry="5"
                  fill="hsl(var(--foreground))"
                  opacity="0.3"
                />
                <ellipse
                  cx={x + 8}
                  cy={y + 2}
                  rx="1.5"
                  ry="5"
                  fill="hsl(var(--foreground))"
                  opacity="0.2"
                />
              </g>
              
              {/* Detalhe de brilho/reflexo */}
              <ellipse
                cx={x - 6}
                cy={y - 4}
                rx="4"
                ry="2"
                fill="white"
                opacity="0.2"
              />
            </>
          )}
          
          {/* Indicador de status no canto */}
          {pneu && (
            <circle
              cx={x + tireWidth / 2 - 3}
              cy={y - tireHeight / 2 + 3}
              r="3"
              fill={color}
              stroke="hsl(var(--background))"
              strokeWidth="1"
            />
          )}
        </g>
      </TooltipTrigger>
      
      <TooltipContent>
        {pneu ? (
          <div className="space-y-1">
            <p className="font-bold text-sm">{pneu.numero_serie}</p>
            <p className="text-xs">{pneu.marca} {pneu.modelo}</p>
            <p className="text-xs">{pneu.medida}</p>
            <p className="text-xs">Profundidade: {pneu.profundidade_sulco_mm} mm</p>
            {pneu.km_rodados && (
              <p className="text-xs">KM: {pneu.km_rodados.toLocaleString()}</p>
            )}
          </div>
        ) : (
          <p className="text-xs">Posição vazia - Clique para instalar</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
