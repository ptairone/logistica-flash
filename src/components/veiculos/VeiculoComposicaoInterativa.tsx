import { useVeiculoComposicao } from "@/hooks/useVeiculoComposicao";
import { ElementoVeiculoTooltip } from "./ElementoVeiculoTooltip";
import { ElementoVeiculoPopover } from "./ElementoVeiculoPopover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VeiculoComposicaoInterativaProps {
  veiculo: any;
  onVerDetalhes?: () => void;
}

export const VeiculoComposicaoInterativa = ({ 
  veiculo,
  onVerDetalhes 
}: VeiculoComposicaoInterativaProps) => {
  const { composicao, desacoplarReboque, totalEixos } = useVeiculoComposicao(veiculo.id);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const handleDesacoplar = async (composicaoId: string, placaReboque: string) => {
    try {
      await desacoplarReboque.mutateAsync(composicaoId);
      toast.success(`Reboque ${placaReboque} desacoplado com sucesso`);
    } catch (error) {
      toast.error("Erro ao desacoplar reboque");
    }
  };

  const totalEixosCompleto = (veiculo.numero_eixos || 0) + totalEixos;
  const quantidadeReboques = composicao?.length || 0;

  const getTipoColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('baú') || tipoLower.includes('bau')) return 'hsl(var(--success))';
    if (tipoLower.includes('dolly')) return 'hsl(var(--warning))';
    if (tipoLower.includes('graneleiro')) return 'hsl(var(--primary))';
    if (tipoLower.includes('tanque')) return 'hsl(var(--chart-2))';
    return 'hsl(var(--accent))';
  };

  const isVencido = (data?: string) => {
    if (!data) return false;
    return new Date(data) < new Date();
  };

  const hasAlerta = (elemento: any) => {
    return isVencido(elemento.vencimento_licenciamento) || isVencido(elemento.vencimento_seguro);
  };

  // Calcular largura total do SVG baseado no número de reboques
  const svgWidth = 180 + (quantidadeReboques * 180);
  const isMobile = window.innerWidth < 768;
  const scale = isMobile ? Math.min(1, 600 / svgWidth) : 1;

  return (
    <div className="space-y-6">
      {/* Informações Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Eixos Total</p>
                <p className="text-2xl font-bold">{totalEixosCompleto}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Reboques</p>
                <p className="text-2xl font-bold">{quantidadeReboques}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Composição</p>
            <p className="text-sm font-medium">
              {veiculo.placa} 
              {composicao && composicao.length > 0 && (
                <> + {composicao.map((c: any) => c.reboques?.placa).join(' + ')}</>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desenho SVG Interativo */}
      <Card className="overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <svg
              viewBox={`0 0 ${svgWidth} 160`}
              className="w-full max-w-full"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
            >
              {/* Linha de chão */}
              <line
                x1="0"
                y1="130"
                x2={svgWidth}
                y2="130"
                stroke="hsl(var(--border))"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />

              {/* Cavalo Mecânico */}
              <ElementoVeiculoTooltip
                placa={veiculo.placa}
                tipo={`${veiculo.marca || ''} ${veiculo.modelo || ''}`}
                eixos={veiculo.numero_eixos || 0}
                status={veiculo.status}
              >
                <ElementoVeiculoPopover
                  elemento={{
                    id: veiculo.id,
                    placa: veiculo.placa,
                    tipo: `${veiculo.marca || ''} ${veiculo.modelo || ''}`,
                    marca: veiculo.marca,
                    modelo: veiculo.modelo,
                    eixos: veiculo.numero_eixos || 0,
                    status: veiculo.status,
                    vencimento_licenciamento: veiculo.vencimento_licenciamento,
                    vencimento_seguro: veiculo.vencimento_seguro,
                    observacoes: veiculo.observacoes
                  }}
                  onVerDetalhes={onVerDetalhes}
                >
                  <g
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredElement('cavalo')}
                    onMouseLeave={() => setHoveredElement(null)}
                    style={{
                      transform: hoveredElement === 'cavalo' ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                    }}
                  >
                    {/* Cabine do cavalo */}
                    <rect
                      x="20"
                      y="30"
                      width="60"
                      height="70"
                      rx="8"
                      fill="hsl(var(--primary))"
                      stroke={hoveredElement === 'cavalo' ? 'hsl(var(--ring))' : 'hsl(var(--primary-foreground))'}
                      strokeWidth={hoveredElement === 'cavalo' ? '3' : '1'}
                      opacity={hoveredElement === 'cavalo' ? '1' : '0.9'}
                    />

                    {/* Capô do motor */}
                    <rect
                      x="10"
                      y="45"
                      width="15"
                      height="40"
                      rx="3"
                      fill="hsl(var(--primary))"
                      opacity="0.8"
                    />

                    {/* Janela */}
                    <rect
                      x="30"
                      y="40"
                      width="40"
                      height="25"
                      rx="3"
                      fill="hsl(var(--background))"
                      opacity="0.3"
                    />

                    {/* Rodas do cavalo (baseado em numero_eixos) */}
                    {Array.from({ length: veiculo.numero_eixos || 2 }).map((_, idx) => {
                      const xPos = 30 + (idx * 25);
                      return (
                        <g key={`roda-cavalo-${idx}`}>
                          <circle
                            cx={xPos}
                            cy="120"
                            r="10"
                            fill="hsl(var(--foreground))"
                            stroke="hsl(var(--border))"
                            strokeWidth="2"
                            className={hoveredElement === 'cavalo' ? 'animate-[spin_3s_linear_infinite]' : ''}
                            style={{ transformOrigin: `${xPos}px 120px` }}
                          />
                          <circle cx={xPos} cy="120" r="5" fill="hsl(var(--muted))" />
                        </g>
                      );
                    })}

                    {/* Quinta roda (ponto de acoplamento) */}
                    <circle
                      cx="85"
                      cy="80"
                      r="6"
                      fill="hsl(var(--warning))"
                      className={composicao && composicao.length > 0 ? 'animate-pulse' : ''}
                    />

                    {/* Placa do veículo */}
                    <text
                      x="50"
                      y="65"
                      textAnchor="middle"
                      className="fill-primary-foreground font-bold text-xs"
                      style={{ fontSize: '10px' }}
                    >
                      {veiculo.placa}
                    </text>

                    {/* Alerta se houver documentos vencidos */}
                    {hasAlerta(veiculo) && (
                      <g>
                        <circle cx="75" cy="35" r="8" fill="hsl(var(--destructive))" className="animate-pulse" />
                        <text x="75" y="39" textAnchor="middle" className="fill-destructive-foreground font-bold" style={{ fontSize: '10px' }}>!</text>
                      </g>
                    )}
                  </g>
                </ElementoVeiculoPopover>
              </ElementoVeiculoTooltip>

              {/* Reboques */}
              {composicao && composicao.map((comp: any, index: number) => {
                const reboque = comp.reboques;
                const xOffset = 100 + (index * 180);
                const reboqueColor = getTipoColor(reboque?.tipo || '');
                const isDolly = reboque?.tipo?.toLowerCase().includes('dolly');
                const elementId = `reboque-${index}`;

                return (
                  <g key={comp.id}>
                    {/* Linha de acoplamento */}
                    <line
                      x1={xOffset - 15}
                      y1="80"
                      x2={xOffset + 10}
                      y2="80"
                      stroke="hsl(var(--warning))"
                      strokeWidth="4"
                      strokeDasharray="8,4"
                      className="animate-[pulse_2s_ease-in-out_infinite]"
                      opacity="0.7"
                    />

                    <ElementoVeiculoTooltip
                      placa={reboque?.placa || ''}
                      tipo={reboque?.tipo || ''}
                      eixos={reboque?.numero_eixos || 0}
                      capacidade={reboque?.capacidade_kg}
                      status={reboque?.status}
                    >
                      <ElementoVeiculoPopover
                        elemento={{
                          id: reboque?.id || '',
                          placa: reboque?.placa || '',
                          tipo: reboque?.tipo || '',
                          marca: reboque?.marca,
                          modelo: reboque?.modelo,
                          eixos: reboque?.numero_eixos || 0,
                          capacidade: reboque?.capacidade_kg,
                          status: reboque?.status,
                          vencimento_licenciamento: reboque?.vencimento_licenciamento,
                          vencimento_seguro: reboque?.vencimento_seguro,
                          observacoes: reboque?.observacoes
                        }}
                        isReboque={true}
                        onDesacoplar={() => handleDesacoplar(comp.id, reboque?.placa)}
                      >
                        <g
                          className="cursor-pointer transition-all duration-300"
                          onMouseEnter={() => setHoveredElement(elementId)}
                          onMouseLeave={() => setHoveredElement(null)}
                          style={{
                            transform: hoveredElement === elementId ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: 'center',
                          }}
                        >
                          {/* Corpo do reboque */}
                          <rect
                            x={xOffset + 10}
                            y={isDolly ? 50 : 30}
                            width={isDolly ? 50 : 130}
                            height={isDolly ? 50 : 70}
                            rx="8"
                            fill={reboqueColor}
                            stroke={hoveredElement === elementId ? 'hsl(var(--ring))' : 'transparent'}
                            strokeWidth={hoveredElement === elementId ? '3' : '0'}
                            opacity={hoveredElement === elementId ? '1' : '0.9'}
                          />

                          {/* Detalhes das portas (só para baús grandes) */}
                          {!isDolly && (
                            <line
                              x1={xOffset + 135}
                              y1="35"
                              x2={xOffset + 135}
                              y2="95"
                              stroke="hsl(var(--background))"
                              strokeWidth="3"
                              opacity="0.5"
                            />
                          )}

                          {/* Rodas do reboque */}
                          {Array.from({ length: reboque?.numero_eixos || 1 }).map((_, idx) => {
                            const wheelXPos = isDolly 
                              ? xOffset + 35
                              : xOffset + 40 + (idx * 35);
                            
                            return (
                              <g key={`roda-reboque-${index}-${idx}`}>
                                <circle
                                  cx={wheelXPos}
                                  cy="120"
                                  r="10"
                                  fill="hsl(var(--foreground))"
                                  stroke="hsl(var(--border))"
                                  strokeWidth="2"
                                  className={hoveredElement === elementId ? 'animate-[spin_3s_linear_infinite]' : ''}
                                  style={{ transformOrigin: `${wheelXPos}px 120px` }}
                                />
                                <circle cx={wheelXPos} cy="120" r="5" fill="hsl(var(--muted))" />
                              </g>
                            );
                          })}

                          {/* Placa do reboque */}
                          <text
                            x={xOffset + (isDolly ? 35 : 75)}
                            y={isDolly ? 75 : 65}
                            textAnchor="middle"
                            className="fill-primary-foreground font-bold text-xs"
                            style={{ fontSize: '9px' }}
                          >
                            {reboque?.placa}
                          </text>

                          {/* Alerta se houver documentos vencidos */}
                          {hasAlerta(reboque) && (
                            <g>
                              <circle 
                                cx={xOffset + (isDolly ? 55 : 135)} 
                                cy={isDolly ? 55 : 35} 
                                r="8" 
                                fill="hsl(var(--destructive))" 
                                className="animate-pulse" 
                              />
                              <text 
                                x={xOffset + (isDolly ? 55 : 135)} 
                                y={isDolly ? 59 : 39} 
                                textAnchor="middle" 
                                className="fill-destructive-foreground font-bold" 
                                style={{ fontSize: '10px' }}
                              >
                                !
                              </text>
                            </g>
                          )}
                        </g>
                      </ElementoVeiculoPopover>
                    </ElementoVeiculoTooltip>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legenda */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span className="text-muted-foreground">Cavalo Mecânico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span className="text-muted-foreground">Reboque Baú</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning" />
              <span className="text-muted-foreground">Dolly</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground">Documentos Vencidos</span>
            </div>
          </div>

          {quantidadeReboques === 0 && (
            <div className="mt-6 text-center">
              <Badge variant="outline" className="text-muted-foreground">
                Nenhum reboque acoplado
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dica de Interação */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 Passe o mouse sobre os elementos para ver mais informações e clique para ações rápidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
