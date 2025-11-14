import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, TruckIcon } from 'lucide-react';
import { useVeiculoComposicao } from '@/hooks/useVeiculoComposicao';
import { VeiculoPneusTopView } from './VeiculoPneusTopView';
import { usePneusPorVeiculo } from '@/hooks/usePneusPorVeiculo';
import { calcularTotalPneus } from '@/lib/validations-pneu';

interface ComposicaoPneusManagerProps {
  veiculo: any;
}

export function ComposicaoPneusManager({ veiculo }: ComposicaoPneusManagerProps) {
  const { composicao, isLoading } = useVeiculoComposicao(veiculo.id);
  const { data: pneusCavalo } = usePneusPorVeiculo(veiculo.id);
  
  // Calcular resumo geral
  const totalPosicoesCavalo = calcularTotalPneus(veiculo.numero_eixos || 0);
  const pneusInstaladosCavalo = pneusCavalo?.length || 0;
  
  const totalPosicoesReboques = composicao?.reduce((total, comp) => {
    return total + calcularTotalPneus(comp.reboques?.numero_eixos || 0);
  }, 0) || 0;
  
  const totalPosicoes = totalPosicoesCavalo + totalPosicoesReboques;
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Carregando composição...</p>
      </div>
    );
  }
  
  const temReboques = composicao && composicao.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Resumo Consolidado */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Resumo da Composição</h3>
            <div className="flex gap-2">
              <Badge variant="outline">
                Total: {totalPosicoes} posições
              </Badge>
              <Badge>
                {pneusInstaladosCavalo} pneus instalados no cavalo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs por Elemento */}
      <Tabs defaultValue="cavalo" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="cavalo" className="gap-2">
            <Truck className="h-4 w-4" />
            Cavalo - {veiculo.placa}
          </TabsTrigger>
          {temReboques && composicao.map((comp, index) => (
            <TabsTrigger key={comp.id} value={`reboque-${comp.id}`} className="gap-2">
              <TruckIcon className="h-4 w-4" />
              Reboque {index + 1} - {comp.reboques?.placa}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="cavalo" className="mt-6">
          <VeiculoPneusTopView
            veiculoId={veiculo.id}
            numeroEixos={veiculo.numero_eixos || 0}
            tipo="cavalo"
            placa={veiculo.placa}
          />
        </TabsContent>
        
        {temReboques && composicao.map((comp, index) => (
          <TabsContent key={comp.id} value={`reboque-${comp.id}`} className="mt-6">
            <VeiculoPneusTopView
              veiculoId={comp.reboque_id}
              numeroEixos={comp.reboques?.numero_eixos || 0}
              tipo="reboque"
              placa={comp.reboques?.placa || 'N/A'}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
