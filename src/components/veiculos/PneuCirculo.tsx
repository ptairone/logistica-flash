import { Circle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
    if (!pneu) return '#d1d5db'; // Cinza para vazio
    
    const prof = pneu.profundidade_sulco_mm || 0;
    const min = pneu.profundidade_minima_mm || 1.6;
    
    if (prof <= min) return '#ef4444'; // Vermelho crítico
    if (prof <= min + 1.5) return '#eab308'; // Amarelo atenção
    return '#22c55e'; // Verde OK
  };
  
  const color = getColor();
  const isEmpty = !pneu;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g 
          onClick={onClick}
          className="cursor-pointer transition-all hover:opacity-80"
        >
          <circle
            cx={x}
            cy={y}
            r={12}
            fill={color}
            stroke={isEmpty ? '#9ca3af' : '#000'}
            strokeWidth={isEmpty ? 2 : 1}
            strokeDasharray={isEmpty ? '3,3' : '0'}
            className="transition-all"
          />
          
          {pneu && (
            <>
              {/* Desenho de sulcos do pneu */}
              <line x1={x-8} y1={y-4} x2={x-8} y2={y+4} stroke="#fff" strokeWidth="1.5" opacity="0.8" />
              <line x1={x} y1={y-4} x2={x} y2={y+4} stroke="#fff" strokeWidth="1.5" opacity="0.8" />
              <line x1={x+8} y1={y-4} x2={x+8} y2={y+4} stroke="#fff" strokeWidth="1.5" opacity="0.8" />
            </>
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
