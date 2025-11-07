import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDadosOperacionais } from '@/hooks/useRelatorios';
import { useMotoristasAtivos } from '@/hooks/useViagens';
import { useVeiculos } from '@/hooks/useVeiculos';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

export function DashboardRentabilidade() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');

  const { data: motoristas = [] } = useMotoristasAtivos();
  const { veiculos } = useVeiculos();
  const { data, isLoading } = useDadosOperacionais({
    dataInicio,
    dataFim,
    motoristaId,
    veiculoId,
  });

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análise</CardTitle>
          <CardDescription>Selecione o período e filtros para análise de rentabilidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Motorista</Label>
              <Select value={motoristaId} onValueChange={setMotoristaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {motoristas.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Select value={veiculoId} onValueChange={setVeiculoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {veiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Consolidados */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Carregando...</p>
      ) : kpis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                R$ {kpis.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis.totalViagens} viagens concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {kpis.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <p>Despesas: R$ {kpis.custoDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p>Combustível: R$ {kpis.custoCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p>Manutenção: R$ {kpis.custoManutencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Margem Consolidada</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpis.margemMedia >= 0 ? 'text-primary' : 'text-destructive'}`}>
                R$ {(kpis.receitaTotal - kpis.custoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lucro líquido do período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Margem %</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpis.margemMedia >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {kpis.margemMedia.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Percentual de margem
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Selecione um período para visualizar dados</p>
      )}

      {/* Detalhamento de Custos */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Custo/KM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                R$ {kpis.custoMedioKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis.kmTotal.toLocaleString('pt-BR')} km rodados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Receita/KM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">
                R$ {kpis.receitaPorKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Faturamento por quilômetro
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lucro/KM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${(kpis.receitaPorKm - kpis.custoMedioKm) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                R$ {(kpis.receitaPorKm - kpis.custoMedioKm).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Margem por quilômetro rodado
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
