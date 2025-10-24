import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDadosMotoristas } from '@/hooks/useRelatorios';
import { Truck, DollarSign, TrendingUp } from 'lucide-react';

interface PainelMotoristasProps {
  filtros: any;
}

export function PainelMotoristas({ filtros }: PainelMotoristasProps) {
  const { data, isLoading } = useDadosMotoristas(filtros);

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  const kpis = data?.kpis || {
    totalViagens: 0,
    kmTotal: 0,
    receitaTotal: 0,
    despesasReembolsaveis: 0,
  };
  const viagens = data?.viagens || [];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viagens Concluídas</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalViagens || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KM Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.kmTotal?.toLocaleString('pt-BR') || 0} km</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.receitaTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Reembolsáveis</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.despesasReembolsaveis?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Viagens */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Viagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Código</th>
                  <th className="text-left p-2">Motorista</th>
                  <th className="text-left p-2">Rota</th>
                  <th className="text-right p-2">KM</th>
                  <th className="text-right p-2">Receita</th>
                </tr>
              </thead>
              <tbody>
                {viagens.slice(0, 10).map((v: any) => (
                  <tr key={v.id} className="border-b">
                    <td className="p-2">{v.codigo}</td>
                    <td className="p-2">{v.motorista?.nome || 'N/A'}</td>
                    <td className="p-2">{v.origem} → {v.destino}</td>
                    <td className="text-right p-2">{v.km_percorrido || 0}</td>
                    <td className="text-right p-2">
                      R$ {(v.frete?.valor_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
