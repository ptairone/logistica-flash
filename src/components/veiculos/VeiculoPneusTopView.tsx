import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePneusPorVeiculo } from '@/hooks/usePneusPorVeiculo';
import { gerarPosicoesPneu, calcularTotalPneus } from '@/lib/validations-pneu';
import { PneuCirculo } from './PneuCirculo';
import { PneuPosicaoDialog } from './PneuPosicaoDialog';
import { InstalacaoPneuDialog } from '@/components/pneus/InstalacaoPneuDialog';
import { MedicaoDialog } from '@/components/pneus/MedicaoDialog';
import { PneuDetailsDialog } from '@/components/pneus/PneuDetailsDialog';
import { Loader2 } from 'lucide-react';

interface VeiculoPneusTopViewProps {
  veiculoId: string;
  numeroEixos: number;
  tipo: 'cavalo' | 'reboque';
  placa: string;
}

export function VeiculoPneusTopView({ veiculoId, numeroEixos, tipo, placa }: VeiculoPneusTopViewProps) {
  const { data: pneus, isLoading } = usePneusPorVeiculo(veiculoId);
  const [dialogAberto, setDialogAberto] = useState<'posicao' | 'instalar' | 'medicao' | 'detalhes' | null>(null);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<string>('');
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
    setDialogAberto('posicao');
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
          {/* SVG Top-Down - Vista Superior Limpa */}
          <div className="flex justify-center">
            <svg 
              width={svgWidth} 
              height={svgHeight} 
              className="border rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              {/* Placa do veículo em destaque no topo */}
              <rect
                x={svgWidth/2 - 50}
                y={15}
                width={100}
                height={30}
                rx={4}
                fill="white"
                stroke="hsl(var(--border))"
                strokeWidth={2}
              />
              <text
                x={svgWidth/2}
                y={35}
                textAnchor="middle"
                fontSize="16"
                fontWeight="700"
                fill="hsl(var(--foreground))"
              >
                {placa}
              </text>
              
              {/* Corpo do veículo - Retângulo cinza claro */}
              <rect 
                x="140" 
                y="60" 
                width="140" 
                height={svgHeight - 120} 
                rx={4}
                fill="hsl(0, 0%, 95%)"
                stroke="hsl(var(--border))" 
                strokeWidth={2}
              />
              
              {/* Renderizar eixos */}
              {posicoes.map((pos, idx) => {
                const yPos = 100 + (idx * 80);
                
                return (
                  <g key={pos.eixo}>
                    {/* Linha horizontal do eixo */}
                    <line 
                      x1="60" 
                      y1={yPos} 
                      x2="360" 
                      y2={yPos} 
                      stroke="hsl(var(--border))" 
                      strokeWidth="2"
                    />
                    
                    {/* Losango/círculo central do eixo */}
                    {pos.eixo === 1 ? (
                      // Eixo direcional (frontal) - Círculo
                      <circle
                        cx={210}
                        cy={yPos}
                        r={10}
                        fill="white"
                        stroke="hsl(var(--border))"
                        strokeWidth={2}
                      />
                    ) : (
                      // Eixos traseiros - Losango
                      <path
                        d={`M 210,${yPos - 12} L 222,${yPos} L 210,${yPos + 12} L 198,${yPos} Z`}
                        fill="hsl(0, 0%, 70%)"
                        stroke="hsl(var(--border))"
                        strokeWidth={1.5}
                      />
                    )}
                    
                    {/* Label do eixo */}
                    <text 
                      x="30" 
                      y={yPos + 5} 
                      textAnchor="middle" 
                      fontSize="11"
                      fontWeight="600"
                      fill="hsl(var(--muted-foreground))"
                    >
                      E{pos.eixo}
                    </text>
                    
                    {/* Renderizar pneus do eixo */}
                    {pos.pneus.map(posicao => {
                      const pneu = pneusMap.get(posicao);
                      
                      // Calcular posição X baseado na posição do pneu
                      let xPos = 210; // centro (raro, apenas direcional simples)
                      if (posicao.includes('EE')) xPos = 80;  // esquerda externa
                      if (posicao.includes('EI')) xPos = 130; // esquerda interna
                      if (posicao.includes('DI')) xPos = 290; // direita interna
                      if (posicao.includes('DE')) xPos = 340; // direita externa
                      
                      return (
                        <PneuCirculo
                          key={posicao}
                          x={xPos}
                          y={yPos}
                          pneu={pneu}
                          onClick={() => handlePneuClick(posicao, pneu)}
                        />
                      );
                    })}
                  </g>
                );
              })}
              
              {/* Pneu estepe (se for cavalo mecânico) */}
              {tipo === 'cavalo' && (
                <>
                  <text 
                    x={svgWidth - 50} 
                    y={svgHeight - 50} 
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle" 
                    fill="hsl(var(--muted-foreground))"
                  >
                    Estepe
                  </text>
                  <PneuCirculo
                    x={svgWidth - 50}
                    y={svgHeight - 30}
                    pneu={pneusMap.get('ESTEPE')}
                    onClick={() => handlePneuClick('ESTEPE', pneusMap.get('ESTEPE'))}
                  />
                </>
              )}
            </svg>
          </div>
          
          {/* Legenda Simplificada */}
          <div className="mt-6 flex gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span>OK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Atenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span>Crítico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-muted-foreground bg-transparent" />
              <span>Vazio</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PneuPosicaoDialog
        open={dialogAberto === 'posicao'}
        onOpenChange={(open) => setDialogAberto(open ? 'posicao' : null)}
        posicao={posicaoSelecionada}
        pneu={pneuSelecionado}
        veiculoId={veiculoId}
        onInstalar={() => setDialogAberto('instalar')}
        onMedir={() => setDialogAberto('medicao')}
        onDetalhes={() => setDialogAberto('detalhes')}
      />

      <InstalacaoPneuDialog
        open={dialogAberto === 'instalar'}
        onOpenChange={(open) => setDialogAberto(open ? 'instalar' : null)}
        veiculoId={veiculoId}
        posicao={posicaoSelecionada}
      />

      <MedicaoDialog
        open={dialogAberto === 'medicao'}
        onOpenChange={(open) => setDialogAberto(open ? 'medicao' : null)}
        pneu={pneuSelecionado}
      />

      <PneuDetailsDialog
        open={dialogAberto === 'detalhes'}
        onOpenChange={(open) => setDialogAberto(open ? 'detalhes' : null)}
        pneu={pneuSelecionado}
      />
    </>
  );
}
