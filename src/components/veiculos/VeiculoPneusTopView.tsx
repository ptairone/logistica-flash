import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePneusPorVeiculo } from '@/hooks/usePneusPorVeiculo';
import { calcularTotalPneus } from '@/lib/validations-pneu';
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
  
  const svgHeight = 120 + (numeroEixos * 80);
  const svgWidth = 420;
  const totalPosicoes = calcularTotalPneus(numeroEixos, tipo);
  
  const pneusMap = new Map(pneus?.map(p => [p.posicao_veiculo, p]) || []);
  
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
              <Badge variant="outline">{pneusInstalados} / {totalPosicoes} pneus</Badge>
              {pneusCriticos > 0 && <Badge variant="destructive">{pneusCriticos} crítico{pneusCriticos > 1 ? 's' : ''}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <svg width={svgWidth} height={svgHeight} className="border rounded-lg bg-gray-50 dark:bg-gray-900">
              {/* Placa destacada */}
              <rect x={svgWidth/2 - 50} y={15} width={100} height={30} rx={4} fill="white" stroke="hsl(var(--border))" strokeWidth={2} />
              <text x={svgWidth/2} y={35} textAnchor="middle" fontSize="16" fontWeight="700" fill="hsl(var(--foreground))">{placa}</text>
              
              {/* Chassis */}
              <rect x="140" y="60" width="140" height={svgHeight - 120} rx={4} fill="hsl(0, 0%, 95%)" stroke="hsl(var(--border))" strokeWidth={2} />
              
              {/* Renderizar eixos manualmente */}
              {Array.from({ length: numeroEixos }, (_, i) => {
                const eixo = i + 1;
                const yPos = 100 + (i * 80);
                const isFirstAxisTruck = tipo === 'cavalo' && eixo === 1;
                
                return (
                  <g key={eixo}>
                    {/* Linha do eixo */}
                    <line x1="60" y1={yPos} x2="360" y2={yPos} stroke="hsl(var(--border))" strokeWidth="2" />
                    
                    {/* Forma central do eixo */}
                    {isFirstAxisTruck ? (
                      <circle cx={210} cy={yPos} r={10} fill="white" stroke="hsl(var(--border))" strokeWidth={2} />
                    ) : (
                      <path d={`M 210,${yPos - 12} L 222,${yPos} L 210,${yPos + 12} L 198,${yPos} Z`} fill="hsl(0, 0%, 70%)" stroke="hsl(var(--border))" strokeWidth={1.5} />
                    )}
                    
                    {/* Label do eixo */}
                    <text x="30" y={yPos + 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--muted-foreground))">E{eixo}</text>
                    
                    {/* Pneus do eixo */}
                    {isFirstAxisTruck ? (
                      // Eixo direcional: 2 pneus simples
                      <>
                        <PneuCirculo x={80} y={yPos} pneu={pneusMap.get(`eixo_${eixo}_esquerda`)} onClick={() => handlePneuClick(`eixo_${eixo}_esquerda`, pneusMap.get(`eixo_${eixo}_esquerda`))} />
                        <PneuCirculo x={340} y={yPos} pneu={pneusMap.get(`eixo_${eixo}_direita`)} onClick={() => handlePneuClick(`eixo_${eixo}_direita`, pneusMap.get(`eixo_${eixo}_direita`))} />
                      </>
                    ) : (
                      // Eixos de tração: 4 pneus duplos
                      <>
                        <PneuCirculo x={80} y={yPos} pneu={pneusMap.get(`eixo_${eixo}_esquerda_externa`)} onClick={() => handlePneuClick(`eixo_${eixo}_esquerda_externa`, pneusMap.get(`eixo_${eixo}_esquerda_externa`))} />
                        <PneuCirculo x={130} y={yPos} pneu={pneusMap.get(`eixo_${eixo}_esquerda_interna`)} onClick={() => handlePneuClick(`eixo_${eixo}_esquerda_interna`, pneusMap.get(`eixo_${eixo}_esquerda_interna`))} />
                        <PneuCirculo x={290} y={yPos} pneu={pneusMap.get(`eixo_${eixo}_direita_interna`)} onClick={() => handlePneuClick(`eixo_${eixo}_direita_interna`, pneusMap.get(`eixo_${eixo}_direita_interna`))} />
                        <PneuCirculo x={340} y={yPos} pneu={pneusMap.get(`eixo_${eixo}_direita_externa`)} onClick={() => handlePneuClick(`eixo_${eixo}_direita_externa`, pneusMap.get(`eixo_${eixo}_direita_externa`))} />
                      </>
                    )}
                  </g>
                );
              })}
              
              {/* Estepe (somente cavalo mecânico) */}
              {tipo === 'cavalo' && (
                <>
                  <text x={svgWidth - 50} y={svgHeight - 50} fontSize="12" fontWeight="600" textAnchor="middle" fill="hsl(var(--muted-foreground))">Estepe</text>
                  <PneuCirculo x={svgWidth - 50} y={svgHeight - 30} pneu={pneusMap.get('estepe')} onClick={() => handlePneuClick('estepe', pneusMap.get('estepe'))} />
                </>
              )}
            </svg>
          </div>
          
          {/* Legenda */}
          <div className="mt-6 flex gap-6 justify-center text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600" /><span>OK</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span>Atenção</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600" /><span>Crítico</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-muted-foreground bg-transparent" /><span>Vazio</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs com props corretas */}
      <PneuPosicaoDialog
        open={dialogAberto === 'posicao'}
        onOpenChange={(open) => setDialogAberto(open ? 'posicao' : null)}
        posicao={posicaoSelecionada}
        pneu={pneuSelecionado}
        veiculoId={veiculoId}
        onInstalarClick={() => setDialogAberto('instalar')}
        onMedicaoClick={() => setDialogAberto('medicao')}
        onDetalhesClick={() => setDialogAberto('detalhes')}
      />

      <InstalacaoPneuDialog
        open={dialogAberto === 'instalar'}
        onOpenChange={(open) => setDialogAberto(open ? 'instalar' : null)}
        pneu={null}
        veiculoIdProp={veiculoId}
        posicaoProp={posicaoSelecionada}
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
