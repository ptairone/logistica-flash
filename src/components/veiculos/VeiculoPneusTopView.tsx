import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePneusPorVeiculo } from '@/hooks/usePneusPorVeiculo';
import { gerarPosicoesPneu, calcularTotalPneus } from '@/lib/validations-pneu';
import { PneuCirculo } from './PneuCirculo';
import { PneuPosicaoDialog } from './PneuPosicaoDialog';
import { Loader2 } from 'lucide-react';

interface VeiculoPneusTopViewProps {
  veiculoId: string;
  numeroEixos: number;
  tipo: 'cavalo' | 'reboque';
  placa: string;
}

export function VeiculoPneusTopView({ veiculoId, numeroEixos, tipo, placa }: VeiculoPneusTopViewProps) {
  const { data: pneus, isLoading } = usePneusPorVeiculo(veiculoId);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<string | null>(null);
  const [pneuSelecionado, setPneuSelecionado] = useState<any>(null);
  
  // Calcular dimensões do SVG baseado no número de eixos
  const svgHeight = 120 + (numeroEixos * 80);
  const svgWidth = 420;
  
  // Gerar posições de pneus
  const posicoes = gerarPosicoesPneu(numeroEixos, tipo);
  const totalPosicoes = calcularTotalPneus(numeroEixos, tipo);
  
  // Mapear pneus instalados por posição
  const pneusMap = new Map(
    pneus?.map(p => [p.posicao_veiculo, p]) || []
  );
  
  const handlePneuClick = (posicao: string, pneu?: any) => {
    setPosicaoSelecionada(posicao);
    setPneuSelecionado(pneu || null);
  };
  
  const pneusInstalados = pneus?.length || 0;
  const pneusCriticos = pneus?.filter(p => {
    const prof = p.profundidade_sulco_mm || 0;
    const min = p.profundidade_minima_mm || 1.6;
    return prof <= min;
  }).length || 0;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {tipo === 'cavalo' ? 'Cavalo Mecânico' : 'Reboque'} - {placa}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {pneusInstalados} / {totalPosicoes} pneus
              </Badge>
              {pneusCriticos > 0 && (
                <Badge variant="destructive">
                  {pneusCriticos} crítico{pneusCriticos > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* SVG Top-Down */}
          <div className="flex justify-center">
            <svg 
              width={svgWidth} 
              height={svgHeight} 
              className="border rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
            >
              {/* Retângulo do veículo */}
              <rect 
                x="110" y="30" 
                width="200" height={svgHeight - 60} 
                fill="none" 
                stroke="hsl(var(--border))" 
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              
              {/* Texto indicativo */}
              <text 
                x="210" 
                y="20" 
                textAnchor="middle" 
                className="text-xs fill-muted-foreground"
              >
                FRENTE
              </text>
              
              {/* Renderizar eixos */}
              {Array.from({ length: numeroEixos }, (_, i) => {
                const eixoNum = i + 1;
                const y = 70 + (i * 80);
                
                return (
                  <g key={`eixo-${eixoNum}`}>
                    {/* Linha do eixo */}
                    <line 
                      x1="80" y1={y} 
                      x2="340" y2={y} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth="3"
                      opacity="0.5"
                    />
                    
                    {/* Label do eixo */}
                    <text 
                      x="360" 
                      y={y + 5} 
                      className="text-xs fill-muted-foreground"
                    >
                      Eixo {eixoNum}
                    </text>
                    
                    {/* Pneus deste eixo */}
                    {eixoNum === 1 ? (
                      // Eixo dianteiro: 2 pneus
                      <>
                        <PneuCirculo 
                          x={90} y={y} 
                          posicao={`eixo_${eixoNum}_esquerda`}
                          pneu={pneusMap.get(`eixo_${eixoNum}_esquerda`)}
                          onClick={() => handlePneuClick(`eixo_${eixoNum}_esquerda`, pneusMap.get(`eixo_${eixoNum}_esquerda`))}
                        />
                        <PneuCirculo 
                          x={330} y={y} 
                          posicao={`eixo_${eixoNum}_direita`}
                          pneu={pneusMap.get(`eixo_${eixoNum}_direita`)}
                          onClick={() => handlePneuClick(`eixo_${eixoNum}_direita`, pneusMap.get(`eixo_${eixoNum}_direita`))}
                        />
                        
                        {/* Labels E/D */}
                        <text x="75" y={y + 5} className="text-xs fill-muted-foreground">E</text>
                        <text x="345" y={y + 5} className="text-xs fill-muted-foreground">D</text>
                      </>
                    ) : (
                      // Eixo traseiro: 4 pneus (duplo)
                      <>
                        {/* Esquerda Externa/Interna */}
                        <PneuCirculo 
                          x={75} y={y} 
                          posicao={`eixo_${eixoNum}_esquerda_externa`} 
                          pneu={pneusMap.get(`eixo_${eixoNum}_esquerda_externa`)}
                          onClick={() => handlePneuClick(`eixo_${eixoNum}_esquerda_externa`, pneusMap.get(`eixo_${eixoNum}_esquerda_externa`))}
                        />
                        <PneuCirculo 
                          x={105} y={y} 
                          posicao={`eixo_${eixoNum}_esquerda_interna`} 
                          pneu={pneusMap.get(`eixo_${eixoNum}_esquerda_interna`)}
                          onClick={() => handlePneuClick(`eixo_${eixoNum}_esquerda_interna`, pneusMap.get(`eixo_${eixoNum}_esquerda_interna`))}
                        />
                        
                        {/* Direita Interna/Externa */}
                        <PneuCirculo 
                          x={315} y={y} 
                          posicao={`eixo_${eixoNum}_direita_interna`} 
                          pneu={pneusMap.get(`eixo_${eixoNum}_direita_interna`)}
                          onClick={() => handlePneuClick(`eixo_${eixoNum}_direita_interna`, pneusMap.get(`eixo_${eixoNum}_direita_interna`))}
                        />
                        <PneuCirculo 
                          x={345} y={y} 
                          posicao={`eixo_${eixoNum}_direita_externa`} 
                          pneu={pneusMap.get(`eixo_${eixoNum}_direita_externa`)}
                          onClick={() => handlePneuClick(`eixo_${eixoNum}_direita_externa`, pneusMap.get(`eixo_${eixoNum}_direita_externa`))}
                        />
                        
                        {/* Labels EE/EI e DI/DE */}
                        <text x="55" y={y + 5} className="text-[10px] fill-muted-foreground">EE</text>
                        <text x="95" y={y - 18} className="text-[10px] fill-muted-foreground">EI</text>
                        <text x="305" y={y - 18} className="text-[10px] fill-muted-foreground">DI</text>
                        <text x="350" y={y + 5} className="text-[10px] fill-muted-foreground">DE</text>
                      </>
                    )}
                  </g>
                );
              })}
              
              {/* Estepe (embaixo) */}
              <PneuCirculo 
                x={210} y={svgHeight - 35} 
                posicao="estepe"
                pneu={pneusMap.get('estepe')}
                onClick={() => handlePneuClick('estepe', pneusMap.get('estepe'))}
              />
              <text 
                x="210" 
                y={svgHeight - 15} 
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                Estepe
              </text>
            </svg>
          </div>
          
          {/* Legenda */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>OK</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span>Atenção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span>Crítico</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-dashed border-gray-400" />
              <span>Vazio</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {posicaoSelecionada && (
        <PneuPosicaoDialog
          open={!!posicaoSelecionada}
          onOpenChange={(open) => {
            if (!open) {
              setPosicaoSelecionada(null);
              setPneuSelecionado(null);
            }
          }}
          veiculoId={veiculoId}
          posicao={posicaoSelecionada}
          pneu={pneuSelecionado}
        />
      )}
    </>
  );
}
