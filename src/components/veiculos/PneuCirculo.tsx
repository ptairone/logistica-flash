import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PneuCirculoProps {
  x: number;
  y: number;
  posicao: string;
  pneu?: any;
  onClick: () => void;
}

export function PneuCirculo({ x, y, posicao, pneu, onClick }: PneuCirculoProps) {
  // Determinar cor baseado no status do pneu com degradê realista
  const getColor = () => {
    if (!pneu) return 'hsl(var(--muted))';
    
    const prof = pneu.profundidade_sulco_mm || 0;
    const min = pneu.profundidade_minima_mm || 1.6;
    
    if (prof <= min) return 'hsl(0, 70%, 50%)'; // Vermelho crítico
    if (prof <= min + 1.5) return 'hsl(45, 90%, 55%)'; // Amarelo atenção
    return 'hsl(145, 65%, 45%)'; // Verde OK
  };
  
  const getDarkerColor = () => {
    if (!pneu) return 'hsl(var(--muted-foreground))';
    
    const prof = pneu.profundidade_sulco_mm || 0;
    const min = pneu.profundidade_minima_mm || 1.6;
    
    if (prof <= min) return 'hsl(0, 70%, 25%)';
    if (prof <= min + 1.5) return 'hsl(45, 90%, 30%)';
    return 'hsl(145, 65%, 20%)';
  };
  
  const getRubberColor = () => {
    if (!pneu) return 'hsl(0, 0%, 50%)';
    return 'hsl(0, 0%, 15%)'; // Borracha preta realista
  };
  
  const getRubberHighlight = () => {
    if (!pneu) return 'hsl(0, 0%, 70%)';
    return 'hsl(0, 0%, 35%)'; // Brilho da borracha
  };
  
  // Calcular desgaste para efeitos visuais
  const calculateWear = () => {
    if (!pneu) return 0;
    const prof = pneu.profundidade_sulco_mm || 0;
    const min = pneu.profundidade_minima_mm || 1.6;
    const max = 10; // Profundidade máxima assumida
    return Math.max(0, Math.min(1, (max - prof) / (max - min)));
  };
  
  const wear = calculateWear();
  
  const color = getColor();
  const darkerColor = getDarkerColor();
  const rubberColor = getRubberColor();
  const rubberHighlight = getRubberHighlight();
  const isEmpty = !pneu;
  
  // Dimensões isométricas ultra-realistas
  const tireWidth = 28;
  const tireHeight = 18;
  const depth = 10;
  const sidewallThickness = 3;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g 
          onClick={onClick}
          className="cursor-pointer transition-all duration-300 ease-out hover:scale-110"
          style={{ 
            filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))',
            transformOrigin: `${x}px ${y}px`,
          }}
        >
          {/* Gradientes ultra-realistas */}
          <defs>
            {/* Gradiente radial da borracha */}
            <radialGradient id={`rubber-gradient-${posicao}`}>
              <stop offset="0%" stopColor={rubberHighlight} />
              <stop offset="50%" stopColor={rubberColor} />
              <stop offset="100%" stopColor="hsl(0, 0%, 8%)" />
            </radialGradient>
            
            {/* Gradiente de status (verde/amarelo/vermelho) */}
            <radialGradient id={`status-gradient-${posicao}`}>
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="70%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={darkerColor} stopOpacity="1" />
            </radialGradient>
            
            {/* Gradiente lateral (profundidade) */}
            <linearGradient id={`depth-gradient-${posicao}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(0, 0%, 10%)" />
              <stop offset="50%" stopColor="hsl(0, 0%, 20%)" />
              <stop offset="100%" stopColor="hsl(0, 0%, 5%)" />
            </linearGradient>
            
            {/* Gradiente de reflexo especular */}
            <radialGradient id={`specular-${posicao}`}>
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="50%" stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            
            {/* Gradiente da parede lateral */}
            <linearGradient id={`sidewall-gradient-${posicao}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 0%, 12%)" />
              <stop offset="50%" stopColor="hsl(0, 0%, 18%)" />
              <stop offset="100%" stopColor="hsl(0, 0%, 12%)" />
            </linearGradient>
          </defs>
          
          {/* Sombra de contato no chão */}
          <ellipse
            cx={x}
            cy={y + depth + 4}
            rx={tireWidth / 2.2}
            ry={tireHeight / 6}
            fill="hsl(0, 0%, 0%)"
            opacity="0.3"
            style={{ filter: 'blur(3px)' }}
          />
          
          {/* Base inferior (profundidade) */}
          <ellipse
            cx={x}
            cy={y + depth}
            rx={tireWidth / 2}
            ry={tireHeight / 2}
            fill="hsl(0, 0%, 5%)"
            opacity="0.8"
          />
          
          {/* Corpo lateral 3D do pneu */}
          <path
            d={`
              M ${x - tireWidth / 2} ${y}
              L ${x - tireWidth / 2} ${y + depth}
              A ${tireWidth / 2} ${tireHeight / 2} 0 0 0 ${x + tireWidth / 2} ${y + depth}
              L ${x + tireWidth / 2} ${y}
              A ${tireWidth / 2} ${tireHeight / 2} 0 0 1 ${x - tireWidth / 2} ${y}
            `}
            fill={`url(#depth-gradient-${posicao})`}
            stroke="hsl(0, 0%, 5%)"
            strokeWidth="0.5"
            opacity={isEmpty ? 0.4 : 1}
          />
          
          {/* Parede lateral com textura */}
          {!isEmpty && (
            <>
              {/* Linha da parede lateral esquerda */}
              <path
                d={`
                  M ${x - tireWidth / 2 + sidewallThickness} ${y}
                  L ${x - tireWidth / 2 + sidewallThickness} ${y + depth}
                `}
                stroke={`url(#sidewall-gradient-${posicao})`}
                strokeWidth="2"
                opacity="0.6"
              />
              
              {/* Linha da parede lateral direita */}
              <path
                d={`
                  M ${x + tireWidth / 2 - sidewallThickness} ${y}
                  L ${x + tireWidth / 2 - sidewallThickness} ${y + depth}
                `}
                stroke={`url(#sidewall-gradient-${posicao})`}
                strokeWidth="2"
                opacity="0.6"
              />
            </>
          )}
          
          {/* Face superior do pneu (principal) */}
          <ellipse
            cx={x}
            cy={y}
            rx={tireWidth / 2}
            ry={tireHeight / 2}
            fill={isEmpty ? 'hsl(var(--muted))' : `url(#rubber-gradient-${posicao})`}
            stroke={isEmpty ? 'hsl(var(--border))' : 'hsl(0, 0%, 0%)'}
            strokeWidth={isEmpty ? 1.5 : 1}
            strokeDasharray={isEmpty ? '4,2' : '0'}
            opacity={isEmpty ? 0.5 : 1}
          />
          
          {/* Sobreposição de status colorido */}
          {!isEmpty && (
            <ellipse
              cx={x}
              cy={y}
              rx={tireWidth / 2 - 1}
              ry={tireHeight / 2 - 1}
              fill={`url(#status-gradient-${posicao})`}
              opacity={0.3 + wear * 0.2}
            />
          )}
          
          {/* Aro metálico interno */}
          <ellipse
            cx={x}
            cy={y}
            rx={tireWidth / 4.5}
            ry={tireHeight / 4.5}
            fill={isEmpty ? 'hsl(var(--muted-foreground))' : 'hsl(0, 0%, 35%)'}
            opacity={isEmpty ? 0.3 : 0.9}
          />
          
          {/* Detalhe interno do aro */}
          <ellipse
            cx={x}
            cy={y}
            rx={tireWidth / 6}
            ry={tireHeight / 6}
            fill={isEmpty ? 'hsl(var(--background))' : 'hsl(0, 0%, 10%)'}
            opacity={isEmpty ? 0.4 : 0.8}
          />
          
          {/* Padrões de sulco ultra-realistas */}
          {!isEmpty && (
            <g opacity={0.7 - wear * 0.3}>
              {/* Sulcos longitudinais principais */}
              {[-9, -3, 3, 9].map((offset, idx) => (
                <g key={`long-${idx}`}>
                  {/* Sulco longitudinal */}
                  <ellipse
                    cx={x + offset}
                    cy={y}
                    rx="1.2"
                    ry="6"
                    fill="hsl(0, 0%, 0%)"
                    opacity="0.6"
                  />
                  {/* Profundidade do sulco */}
                  <ellipse
                    cx={x + offset}
                    cy={y + 1}
                    rx="0.8"
                    ry="5.5"
                    fill="hsl(0, 0%, 5%)"
                    opacity="0.4"
                  />
                </g>
              ))}
              
              {/* Sulcos transversais (blocos) */}
              {[-5, 0, 5].map((yOffset, idx) => (
                <g key={`trans-${idx}`}>
                  {Array.from({ length: 3 }).map((_, i) => {
                    const xOff = -6 + i * 6;
                    return (
                      <rect
                        key={`block-${idx}-${i}`}
                        x={x + xOff - 1.5}
                        y={y + yOffset - 0.8}
                        width="3"
                        height="1.6"
                        rx="0.3"
                        fill="hsl(0, 0%, 0%)"
                        opacity="0.5"
                      />
                    );
                  })}
                </g>
              ))}
              
              {/* Padrão de desgaste realista */}
              {wear > 0.5 && (
                <ellipse
                  cx={x}
                  cy={y}
                  rx={tireWidth / 3}
                  ry={tireHeight / 3}
                  fill="hsl(0, 0%, 25%)"
                  opacity={wear * 0.3}
                />
              )}
            </g>
          )}
          
          {/* Reflexo especular (brilho realista) */}
          {!isEmpty && (
            <>
              {/* Reflexo principal */}
              <ellipse
                cx={x - 7}
                cy={y - 5}
                rx="6"
                ry="3"
                fill={`url(#specular-${posicao})`}
                opacity="0.4"
              />
              
              {/* Reflexo secundário */}
              <ellipse
                cx={x + 5}
                cy={y - 3}
                rx="3"
                ry="1.5"
                fill="white"
                opacity="0.2"
              />
              
              {/* Brilho no aro */}
              <ellipse
                cx={x - 2}
                cy={y - 1}
                rx="2"
                ry="1"
                fill="white"
                opacity="0.5"
              />
            </>
          )}
          
          {/* Indicador de status 3D no canto */}
          {pneu && (
            <g>
              {/* Sombra do indicador */}
              <circle
                cx={x + tireWidth / 2 - 2.5}
                cy={y - tireHeight / 2 + 3.5}
                r="3.5"
                fill="hsl(0, 0%, 0%)"
                opacity="0.3"
              />
              {/* Indicador principal */}
              <circle
                cx={x + tireWidth / 2 - 3}
                cy={y - tireHeight / 2 + 3}
                r="3.5"
                fill={color}
                stroke="hsl(var(--background))"
                strokeWidth="1.5"
                opacity="0.95"
              />
              {/* Brilho do indicador */}
              <circle
                cx={x + tireWidth / 2 - 4}
                cy={y - tireHeight / 2 + 2}
                r="1.2"
                fill="white"
                opacity="0.6"
              />
              {/* Pulsação para pneus críticos */}
              {wear > 0.7 && (
                <circle
                  cx={x + tireWidth / 2 - 3}
                  cy={y - tireHeight / 2 + 3}
                  r="3.5"
                  fill={color}
                  opacity="0.5"
                  className="animate-ping"
                />
              )}
            </g>
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
