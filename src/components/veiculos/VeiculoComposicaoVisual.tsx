import { useVeiculoComposicao } from '@/hooks/useVeiculoComposicao';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VeiculoComposicaoVisualProps {
  veiculo: any;
}

export function VeiculoComposicaoVisual({ veiculo }: VeiculoComposicaoVisualProps) {
  const { composicao, totalEixos } = useVeiculoComposicao(veiculo.id);

  const totalEixosCompleto = (veiculo.numero_eixos || 0) + totalEixos;
  const quantidadeReboques = composicao.length;

  const getTipoIcon = (tipo: string) => {
    const tipoLower = tipo?.toLowerCase() || '';
    if (tipoLower.includes('dolly')) return '⚙️';
    return '📦';
  };

  const getTipoColor = (tipo: string) => {
    const tipoLower = tipo?.toLowerCase() || '';
    if (tipoLower.includes('dolly')) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Composição Veicular</h3>
          <p className="text-sm text-muted-foreground">
            Total: {totalEixosCompleto} eixos | {quantidadeReboques} reboque(s) acoplado(s)
          </p>
        </div>
      </div>

      {/* Desenho Visual SVG */}
      <Card className="p-6 overflow-x-auto">
        <svg 
          viewBox={`0 0 ${200 + (quantidadeReboques * 200)} 180`} 
          className="w-full h-auto min-h-[180px]"
          style={{ maxHeight: '300px' }}
        >
          {/* Cavalo Mecânico */}
          <g transform="translate(25, 25)">
            <rect 
              width="150" 
              height="120" 
              fill="hsl(var(--primary))" 
              rx="8"
              className="drop-shadow-md"
            />
            <text 
              x="75" 
              y="35" 
              textAnchor="middle" 
              className="fill-primary-foreground text-2xl"
            >
              🚛
            </text>
            <text 
              x="75" 
              y="65" 
              textAnchor="middle" 
              className="fill-primary-foreground font-semibold text-sm"
            >
              {veiculo.placa}
            </text>
            <text 
              x="75" 
              y="85" 
              textAnchor="middle" 
              className="fill-primary-foreground text-xs"
            >
              Cavalo
            </text>
            <text 
              x="75" 
              y="105" 
              textAnchor="middle" 
              className="fill-primary-foreground text-xs"
            >
              {veiculo.numero_eixos || 0} eixos
            </text>
          </g>

          {/* Reboques */}
          {composicao.map((comp, index) => {
            const xPos = 225 + (index * 200);
            return (
              <g key={comp.id}>
                {/* Linha de conexão */}
                <line 
                  x1={xPos - 50} 
                  y1="85" 
                  x2={xPos - 25} 
                  y2="85" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth="4"
                  strokeDasharray="5,5"
                />
                
                {/* Reboque */}
                <g transform={`translate(${xPos - 25}, 25)`}>
                  <rect 
                    width="150" 
                    height="120" 
                    fill={getTipoColor(comp.reboques?.tipo || '')}
                    rx="8"
                    className="drop-shadow-md"
                  />
                  <text 
                    x="75" 
                    y="35" 
                    textAnchor="middle" 
                    className="text-2xl"
                    fill="white"
                  >
                    {getTipoIcon(comp.reboques?.tipo || '')}
                  </text>
                  <text 
                    x="75" 
                    y="65" 
                    textAnchor="middle" 
                    className="font-semibold text-sm"
                    fill="white"
                  >
                    {comp.reboques?.placa}
                  </text>
                  <text 
                    x="75" 
                    y="85" 
                    textAnchor="middle" 
                    className="text-xs"
                    fill="white"
                  >
                    {comp.reboques?.tipo || 'Reboque'}
                  </text>
                  <text 
                    x="75" 
                    y="105" 
                    textAnchor="middle" 
                    className="text-xs"
                    fill="white"
                  >
                    {comp.reboques?.numero_eixos || 0} eixos
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </Card>

      {/* Detalhes da Composição */}
      <div className="space-y-4">
        <h4 className="font-semibold">📋 Detalhes da Composição</h4>
        
        {/* Cavalo */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚛</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h5 className="font-semibold">Cavalo Mecânico</h5>
                <Badge variant="outline">{veiculo.placa}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>• Tipo: {veiculo.tipo}</div>
                <div>• Eixos: {veiculo.numero_eixos || 0}</div>
                <div>• Marca: {veiculo.marca}</div>
                <div>• Modelo: {veiculo.modelo}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Reboques */}
        {composicao.map((comp, index) => (
          <Card key={comp.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTipoIcon(comp.reboques?.tipo || '')}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold">Reboque {index + 1} - {comp.reboques?.tipo || 'Semi-reboque'}</h5>
                  <Badge variant="outline">{comp.reboques?.placa}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• Eixos: {comp.reboques?.numero_eixos || 0}</div>
                  <div>• Ordem: {comp.ordem}º</div>
                  {comp.reboques?.marca && <div>• Marca: {comp.reboques.marca}</div>}
                  {comp.reboques?.modelo && <div>• Modelo: {comp.reboques.modelo}</div>}
                  <div className="col-span-2">
                    • Acoplado em: {format(new Date(comp.data_acoplamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {quantidadeReboques === 0 && (
          <Card className="p-6 text-center text-muted-foreground">
            <p>Nenhum reboque acoplado no momento</p>
          </Card>
        )}
      </div>
    </div>
  );
}
