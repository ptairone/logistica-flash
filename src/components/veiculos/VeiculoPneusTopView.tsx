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
            <svg width={svgWidth} height={svgHeight} className="border rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
              <defs>
                {/* Gradiente para chassis com profundidade */}
                <linearGradient id="chassis-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(215, 20%, 75%)" />
                  <stop offset="50%" stopColor="hsl(215, 20%, 85%)" />
                  <stop offset="100%" stopColor="hsl(215, 20%, 75%)" />
                </linearGradient>
                
                {/* Gradiente para cabine */}
                <linearGradient id="cab-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(215, 25%, 70%)" />
                  <stop offset="50%" stopColor="hsl(215, 25%, 80%)" />
                  <stop offset="100%" stopColor="hsl(215, 25%, 70%)" />
                </linearGradient>

                {/* Sombra global */}
                <filter id="drop-shadow">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="2" dy="3" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.2"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Placa destacada com efeito 3D */}
              <rect x={svgWidth/2 - 52} y={13} width={104} height={34} rx={4} fill="hsl(0, 0%, 10%)" opacity="0.1" />
              <rect x={svgWidth/2 - 50} y={15} width={100} height={30} rx={4} fill="white" stroke="hsl(220, 13%, 40%)" strokeWidth={2.5} filter="url(#drop-shadow)" />
              <text x={svgWidth/2} y={35} textAnchor="middle" fontSize="16" fontWeight="700" fill="hsl(220, 13%, 20%)" letterSpacing="1">{placa}</text>
              
              {/* Cabine do caminhão (só para cavalo) */}
              {tipo === 'cavalo' && (
                <g>
                  {/* Sombra da cabine */}
                  <rect x="142" y="62" width="136" height="45" rx={3} fill="hsl(0, 0%, 0%)" opacity="0.08" />
                  
                  {/* Corpo da cabine */}
                  <rect x="140" y="60" width="140" height="45" rx={3} fill="url(#cab-gradient)" stroke="hsl(215, 20%, 50%)" strokeWidth={2} filter="url(#drop-shadow)" />
                  
                  {/* Para-brisa */}
                  <rect x="150" y="68" width="120" height="12" rx={1} fill="hsl(200, 50%, 70%)" opacity="0.7" stroke="hsl(215, 20%, 50%)" strokeWidth={1} />
                  
                  {/* Faróis */}
                  <circle cx="155" cy="95" r="4" fill="hsl(48, 100%, 50%)" opacity="0.8" stroke="hsl(215, 20%, 40%)" strokeWidth={1} />
                  <circle cx="265" cy="95" r="4" fill="hsl(48, 100%, 50%)" opacity="0.8" stroke="hsl(215, 20%, 40%)" strokeWidth={1} />
                  
                  {/* Detalhes da cabine */}
                  <line x1="160" y1="82" x2="260" y2="82" stroke="hsl(215, 20%, 50%)" strokeWidth="1" opacity="0.5" />
                </g>
              )}
              
              {/* Chassis principal com profundidade 3D */}
              <rect x="140" y={tipo === 'cavalo' ? "110" : "60"} width="140" height={svgHeight - (tipo === 'cavalo' ? 150 : 120)} rx={3} fill="url(#chassis-gradient)" stroke="hsl(215, 20%, 50%)" strokeWidth={2.5} filter="url(#drop-shadow)" />
              
              {/* Vigas estruturais do chassis */}
              <line x1="160" y1={tipo === 'cavalo' ? "115" : "65"} x2="160" y2={svgHeight - 45} stroke="hsl(215, 20%, 60%)" strokeWidth="2" opacity="0.4" />
              <line x1="210" y1={tipo === 'cavalo' ? "115" : "65"} x2="210" y2={svgHeight - 45} stroke="hsl(215, 20%, 60%)" strokeWidth="2" opacity="0.4" />
              <line x1="260" y1={tipo === 'cavalo' ? "115" : "65"} x2="260" y2={svgHeight - 45} stroke="hsl(215, 20%, 60%)" strokeWidth="2" opacity="0.4" />
              
              {/* Renderizar eixos manualmente com detalhes volumétricos */}
              {Array.from({ length: numeroEixos }, (_, i) => {
                const eixo = i + 1;
                const yPos = 100 + (i * 80);
                const isFirstAxisTruck = tipo === 'cavalo' && eixo === 1;
                
                return (
                  <g key={eixo}>
                    {/* Sombra do eixo */}
                    <line x1="60" y1={yPos + 2} x2="360" y2={yPos + 2} stroke="hsl(0, 0%, 0%)" strokeWidth="5" opacity="0.1" />
                    
                    {/* Linha principal do eixo com volume */}
                    <line x1="60" y1={yPos} x2="360" y2={yPos} stroke="hsl(215, 15%, 45%)" strokeWidth="4" />
                    <line x1="60" y1={yPos - 1} x2="360" y2={yPos - 1} stroke="hsl(215, 15%, 60%)" strokeWidth="1" opacity="0.6" />
                    
                    {/* Hub central do eixo com detalhes */}
                    {isFirstAxisTruck ? (
                      <g>
                        <circle cx={210} cy={yPos} r={12} fill="hsl(215, 15%, 40%)" opacity="0.3" />
                        <circle cx={210} cy={yPos} r={10} fill="hsl(215, 15%, 70%)" stroke="hsl(215, 15%, 45%)" strokeWidth={2} />
                        <circle cx={210} cy={yPos} r={6} fill="hsl(215, 15%, 50%)" />
                        <circle cx={210} cy={yPos} r={3} fill="hsl(215, 15%, 30%)" />
                      </g>
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
