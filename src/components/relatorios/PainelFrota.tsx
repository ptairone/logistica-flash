import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDadosFrota } from '@/hooks/useRelatorios';
import { useAbastecimentos } from '@/hooks/useAbastecimentos';
import { Wrench, Package, Droplet, TrendingUp } from 'lucide-react';

interface PainelFrotaProps {
  filtros: any;
}

export function PainelFrota({ filtros }: PainelFrotaProps) {
  const { data, isLoading } = useDadosFrota(filtros);
  const { abastecimentos } = useAbastecimentos();

  // Calcular estatísticas de abastecimento
  const statsAbastecimento = abastecimentos?.reduce(
    (acc, ab) => {
      if (ab.status === 'validado') {
        acc.totalLitros += ab.litros || 0;
        acc.totalValor += ab.valor_total || 0;
        if (ab.media_calculada) {
          acc.somaMedias += ab.media_calculada;
          acc.countMedias++;
        }
      }
      return acc;
    },
    { totalLitros: 0, totalValor: 0, somaMedias: 0, countMedias: 0 }
  ) || { totalLitros: 0, totalValor: 0, somaMedias: 0, countMedias: 0 };

  const mediaGeralFrota = statsAbastecimento.countMedias > 0 
    ? statsAbastecimento.somaMedias / statsAbastecimento.countMedias 
    : 0;

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  const kpis = data?.kpis || {
    custoManutencao: 0,
    consumoEstoque: 0,
  };
  const manutencoes = data?.manutencoes || [];
  const movimentacoes = data?.movimentacoes || [];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo de Manutenção</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.custoManutencao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo de Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.consumoEstoque?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Combustível</CardTitle>
            <Droplet className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsAbastecimento.totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              R$ {statsAbastecimento.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média da Frota</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mediaGeralFrota.toFixed(2)} km/L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsAbastecimento.countMedias} abastecimentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas */}
      <Card>
        <CardHeader>
          <CardTitle>Manutenções Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Veículo</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-right p-2">Custo</th>
                </tr>
              </thead>
              <tbody>
                {manutencoes.slice(0, 10).map((m: any) => (
                  <tr key={m.id} className="border-b">
                    <td className="p-2">{m.data}</td>
                    <td className="p-2">{m.veiculo?.placa || 'N/A'}</td>
                    <td className="p-2">{m.tipo}</td>
                    <td className="text-right p-2">
                      R$ {(m.custo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
