import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDadosOperacionais } from '@/hooks/useRelatorios';
import { TrendingUp, DollarSign, Activity, Percent } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export-utils';

interface PainelOperacionalProps {
  filtros: any;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function PainelOperacional({ filtros }: PainelOperacionalProps) {
  const { data, isLoading } = useDadosOperacionais(filtros);

  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  const kpis = data?.kpis || {
    totalViagens: 0,
    kmTotal: 0,
    custoTotal: 0,
    receitaTotal: 0,
    custoMedioKm: 0,
    receitaPorKm: 0,
    margemMedia: 0,
  };
  const viagens = data?.viagens || [];

  // Dados para gráfico de status
  const statusData = [
    { name: 'Planejada', value: viagens.filter(v => v.status === 'planejada').length },
    { name: 'Em Andamento', value: viagens.filter(v => v.status === 'em_andamento').length },
    { name: 'Concluída', value: viagens.filter(v => v.status === 'concluida').length },
    { name: 'Cancelada', value: viagens.filter(v => v.status === 'cancelada').length },
  ].filter(d => d.value > 0);

  // Top 5 motoristas
  const motoristaMap = new Map();
  viagens.forEach(v => {
    if (v.motorista) {
      const nome = v.motorista.nome;
      motoristaMap.set(nome, (motoristaMap.get(nome) || 0) + 1);
    }
  });
  const topMotoristas = Array.from(motoristaMap.entries())
    .map(([nome, viagens]) => ({ nome, viagens }))
    .sort((a, b) => b.viagens - a.viagens)
    .slice(0, 5);

  const handleExport = () => {
    const csvData = viagens.map(v => ({
      Código: v.codigo,
      Motorista: v.motorista?.nome || 'N/A',
      Origem: v.origem,
      Destino: v.destino,
      'KM Percorrido': v.km_percorrido || 0,
      'Receita (R$)': v.frete?.valor_frete || 0,
      Status: v.status,
    }));
    exportToCSV(csvData, 'relatorio-operacional');
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viagens Realizadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.margemMedia?.toFixed(2) || '0,00'}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Viagens</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Motoristas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMotoristas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="viagens" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Viagens */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Viagens Detalhadas</CardTitle>
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
                  <th className="text-left p-2">Código</th>
                  <th className="text-left p-2">Motorista</th>
                  <th className="text-left p-2">Rota</th>
                  <th className="text-right p-2">KM</th>
                  <th className="text-right p-2">Receita</th>
                  <th className="text-left p-2">Status</th>
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
                    <td className="p-2">{v.status}</td>
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
