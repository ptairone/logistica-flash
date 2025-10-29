import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TIPOS_CARGA, 
  calcularPisoMinimoANTT, 
  formatarMoeda,
  type ParametrosCalculoANTT,
  type ResultadoCalculoANTT 
} from '@/lib/calculadora-antt';
import { Calculator, TrendingUp, Info, Navigation } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CalculadoraANTTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distanciaKm?: number;
  numeroEixosInicial?: number;
  onAplicarValor: (valor: number, numeroEixos?: number) => void;
}

export function CalculadoraANTTDialog({
  open,
  onOpenChange,
  distanciaKm,
  numeroEixosInicial,
  onAplicarValor,
}: CalculadoraANTTDialogProps) {
  const [parametros, setParametros] = useState<ParametrosCalculoANTT>({
    tipo_carga: 'geral',
    numero_eixos: numeroEixosInicial || 3,
    distancia_km: distanciaKm || 0,
    composicao_veicular: false,
    alto_desempenho: false,
    retorno_vazio: false,
  });

  const [resultado, setResultado] = useState<ResultadoCalculoANTT | null>(null);

  // Sincronizar distância quando o dialog abre ou distância muda
  useEffect(() => {
    if (open && distanciaKm && distanciaKm > 0) {
      setParametros(prev => ({
        ...prev,
        distancia_km: distanciaKm
      }));
      
      // Calcular automaticamente
      const novosParams = { 
        ...parametros, 
        numero_eixos: numeroEixosInicial || parametros.numero_eixos,
        distancia_km: distanciaKm 
      };
      try {
        const calc = calcularPisoMinimoANTT(novosParams);
        setResultado(calc);
      } catch (error) {
        console.error('Erro ao calcular:', error);
      }
    }
  }, [distanciaKm, open]);

  // Recalcular automaticamente quando parâmetros mudam
  const handleCalcular = () => {
    try {
      const calc = calcularPisoMinimoANTT(parametros);
      setResultado(calc);
    } catch (error) {
      console.error('Erro ao calcular:', error);
    }
  };

  // Atualizar parâmetro e recalcular
  const updateParam = <K extends keyof ParametrosCalculoANTT>(
    key: K,
    value: ParametrosCalculoANTT[K]
  ) => {
    const novosParametros = { ...parametros, [key]: value };
    setParametros(novosParametros);
    
    // Recalcular automaticamente se todos os campos necessários estão preenchidos
    if (novosParametros.distancia_km > 0) {
      try {
        const calc = calcularPisoMinimoANTT(novosParametros);
        setResultado(calc);
      } catch (error) {
        console.error('Erro ao calcular:', error);
      }
    }
  };

  const handleAplicar = () => {
    if (resultado) {
      onAplicarValor(resultado.valor_com_acrescimos, parametros.numero_eixos);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calcular Piso Mínimo ANTT
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Cálculo baseado na Resolução ANTT 6.067/2025. Os valores são referências mínimas 
            estabelecidas pela ANTT e podem ser ajustados manualmente.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Parâmetros do Cálculo */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Parâmetros do Veículo e Carga</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_carga">Tipo de Carga *</Label>
                <Select
                  value={parametros.tipo_carga}
                  onValueChange={(value) => updateParam('tipo_carga', value)}
                >
                  <SelectTrigger id="tipo_carga">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CARGA.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_eixos">Número de Eixos *</Label>
                <Select
                  value={parametros.numero_eixos.toString()}
                  onValueChange={(value) => updateParam('numero_eixos', parseInt(value))}
                >
                  <SelectTrigger id="numero_eixos">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 9].map((eixos) => (
                      <SelectItem key={eixos} value={eixos.toString()}>
                        {eixos} eixos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distancia_km">Distância (km) *</Label>
              <div className="flex gap-2">
                <input
                  id="distancia_km"
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={parametros.distancia_km}
                  onChange={(e) => updateParam('distancia_km', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 450"
                  min="0"
                  step="0.01"
                />
                {distanciaKm && distanciaKm > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateParam('distancia_km', distanciaKm)}
                    title="Recarregar distância do frete"
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {distanciaKm && distanciaKm > 0 ? (
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="text-green-600">✓</span> Distância preenchida automaticamente do cálculo do frete ({distanciaKm.toFixed(1)} km)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Preencha os CEPs de origem e destino no frete e clique em "Calcular Custos"
                </p>
              )}
            </div>

            <div className="space-y-3 border rounded-lg p-4 bg-accent/10">
              <Label className="text-sm font-semibold">Características do Veículo</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="composicao_veicular"
                  checked={parametros.composicao_veicular}
                  onCheckedChange={(checked) => 
                    updateParam('composicao_veicular', checked as boolean)
                  }
                />
                <label
                  htmlFor="composicao_veicular"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  É composição veicular? <span className="text-muted-foreground">(+15%)</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alto_desempenho"
                  checked={parametros.alto_desempenho}
                  onCheckedChange={(checked) => 
                    updateParam('alto_desempenho', checked as boolean)
                  }
                />
                <label
                  htmlFor="alto_desempenho"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  É veículo de alto desempenho? <span className="text-muted-foreground">(+10%)</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="retorno_vazio"
                  checked={parametros.retorno_vazio}
                  onCheckedChange={(checked) => 
                    updateParam('retorno_vazio', checked as boolean)
                  }
                />
                <label
                  htmlFor="retorno_vazio"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Retorno vazio? <span className="text-muted-foreground">(+20%)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Resultado do Cálculo */}
          {resultado && parametros.distancia_km > 0 && (
            <div className="space-y-4 border rounded-lg p-4 bg-primary/5">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-semibold">Resultado do Cálculo</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Valor Base:</span>
                  <span className="font-mono text-lg">{formatarMoeda(resultado.valor_base)}</span>
                </div>

                {resultado.detalhamento.percentual_acrescimo > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">
                      Acréscimos (+{resultado.detalhamento.percentual_acrescimo.toFixed(0)}%):
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatarMoeda(resultado.valor_com_acrescimos - resultado.valor_base)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Piso Mínimo ANTT:</span>
                    <span className="font-mono text-2xl font-bold text-primary">
                      {formatarMoeda(resultado.valor_com_acrescimos)}
                    </span>
                  </div>
                </div>

                {/* Detalhamento do Cálculo */}
                <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
                  <p><strong>Fórmula:</strong> Coeficiente × R$/km × Distância × Acréscimos</p>
                  <p>
                    <strong>Aplicado:</strong> {resultado.detalhamento.coeficiente} × R$ {resultado.detalhamento.valor_km.toFixed(2)} × {resultado.detalhamento.distancia_km.toFixed(0)} km
                    {resultado.detalhamento.percentual_acrescimo > 0 && 
                      ` × ${((resultado.detalhamento.percentual_acrescimo / 100) + 1).toFixed(2)}`
                    }
                  </p>
                  <p><strong>Tipo de carga:</strong> {resultado.detalhamento.tipo_carga_label}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-between gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCalcular}
                disabled={parametros.distancia_km <= 0}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calcular
              </Button>
              
              <Button
                type="button"
                onClick={handleAplicar}
                disabled={!resultado || parametros.distancia_km <= 0}
              >
                Aplicar ao Frete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
