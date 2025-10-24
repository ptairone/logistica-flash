import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDadosFinanceiros } from '@/hooks/useRelatorios';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export-utils';

interface PainelFinanceiroProps {
  filtros: any;
}

export function PainelFinanceiro({ filtros }: PainelFinanceiroProps) {
  const { data, isLoading } = useDadosFinanceiros(filtros);

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  const kpis = data?.kpis || {
    receitaTotal: 0,
    despesasReembolsadas: 0,
    comissoesPagas: 0,
    adiantamentos: 0,
    descontos: 0,
    totalLiquidoPago: 0,
    margemConsolidada: 0,
  };
  const acertos = data?.acertos || [];

  const handleExport = () => {
    const csvData = acertos.map(a => ({
      Motorista: a.motorista?.nome || 'N/A',
      Código: a.codigo,
      'Período Início': a.periodo_inicio,
      'Período Fim': a.periodo_fim,
      'Comissão (R$)': a.valor_comissao || 0,
      'Reembolsos (R$)': a.total_reembolsos || 0,
      'Total a Pagar (R$)': a.total_pagar || 0,
      Status: a.status,
    }));
    exportToCSV(csvData, 'relatorio-financeiro');
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.receitaTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.comissoesPagas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Reembolsadas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.despesasReembolsadas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Líquido Pago</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.totalLiquidoPago?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Composição Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Receita', valor: kpis.receitaTotal || 0 },
              { name: 'Comissões', valor: kpis.comissoesPagas || 0 },
              { name: 'Reembolsos', valor: kpis.despesasReembolsadas || 0 },
              { name: 'Margem', valor: kpis.margemConsolidada || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="valor" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Acertos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Acertos Detalhados</CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Motorista</th>
                  <th className="text-left p-2">Período</th>
                  <th className="text-right p-2">Comissão</th>
                  <th className="text-right p-2">Total a Pagar</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {acertos.slice(0, 10).map((a: any) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2">{a.motorista?.nome || 'N/A'}</td>
                    <td className="p-2">{a.periodo_inicio} a {a.periodo_fim}</td>
                    <td className="text-right p-2">
                      R$ {(a.valor_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right p-2">
                      R$ {(a.total_pagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2">{a.status}</td>
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
