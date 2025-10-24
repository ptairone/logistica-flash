import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDadosFrota } from '@/hooks/useRelatorios';
import { Wrench, Package } from 'lucide-react';

interface PainelFrotaProps {
  filtros: any;
}

export function PainelFrota({ filtros }: PainelFrotaProps) {
  const { data, isLoading } = useDadosFrota(filtros);

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
      <div className="grid gap-4 md:grid-cols-2">
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
