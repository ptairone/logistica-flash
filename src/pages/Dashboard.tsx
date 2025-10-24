import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, MapPin, DollarSign, Package, AlertTriangle, TrendingUp, TrendingDown, Users, Wrench, FileText } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { kpis, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalAlertas = (kpis?.cnhVencendo || 0) + (kpis?.estoqueBaixo || 0) + (kpis?.manutencaoAtrasada || 0);
  const margemPercent = kpis?.receitaRecente ? ((kpis.margemRecente / kpis.receitaRecente) * 100).toFixed(1) : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das operações de transporte
          </p>
        </div>

        {/* KPIs Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Viagens Concluídas
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.viagensConcluidas || 0}</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Custo por KM
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {kpis?.custoKm.toFixed(2) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Média do mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fretes em Aberto
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.fretesAberto || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando início
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Viagens em Andamento
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.viagensEmAndamento || 0}</div>
              <p className="text-xs text-muted-foreground">
                Veículos na rua
              </p>
            </CardContent>
          </Card>
        </div>

        {/* KPIs Financeiros */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita (7 dias)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {kpis?.receitaRecente.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas (7 dias)
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {kpis?.despesasRecentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Margem (7 dias)
              </CardTitle>
              <DollarSign className={`h-4 w-4 ${(kpis?.margemRecente || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(kpis?.margemRecente || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {kpis?.margemRecente.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {margemPercent}% de margem
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas e Avisos
              </span>
              {totalAlertas > 0 && (
                <Badge variant="destructive">{totalAlertas}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalAlertas === 0 ? (
              <p className="text-sm text-muted-foreground">
                ✓ Nenhum alerta no momento
              </p>
            ) : (
              <>
                {(kpis?.cnhVencendo || 0) > 0 && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
                    <Users className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">CNH Vencendo</p>
                      <p className="text-sm text-muted-foreground">
                        {kpis.cnhVencendo} motorista(s) com CNH vencendo nos próximos 30 dias
                      </p>
                      {kpis.alertas?.cnhVencendo.slice(0, 3).map(m => (
                        <p key={m.id} className="text-xs text-muted-foreground mt-1">
                          • {m.nome} - Vence em {new Date(m.validade_cnh).toLocaleDateString('pt-BR')}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {(kpis?.estoqueBaixo || 0) > 0 && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50 dark:bg-orange-950">
                    <Package className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Estoque Baixo</p>
                      <p className="text-sm text-muted-foreground">
                        {kpis.estoqueBaixo} item(ns) abaixo do estoque mínimo
                      </p>
                      {kpis.alertas?.estoqueBaixo.slice(0, 3).map(item => (
                        <p key={item.id} className="text-xs text-muted-foreground mt-1">
                          • {item.codigo} - {item.descricao} ({item.estoque_atual}/{item.estoque_minimo})
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {(kpis?.manutencaoAtrasada || 0) > 0 && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-red-50 dark:bg-red-950">
                    <Wrench className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Manutenção Atrasada</p>
                      <p className="text-sm text-muted-foreground">
                        {kpis.manutencaoAtrasada} veículo(s) com manutenção atrasada
                      </p>
                      {kpis.alertas?.manutencaoAtrasada.slice(0, 3).map(v => (
                        <p key={v.id} className="text-xs text-muted-foreground mt-1">
                          • {v.placa} - {v.proxima_manutencao_data 
                            ? `Data: ${new Date(v.proxima_manutencao_data).toLocaleDateString('pt-BR')}`
                            : `KM: ${v.km_atual}/${v.proxima_manutencao_km}`}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Resumo Operacional */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Status Operacional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Viagens Concluídas</span>
                  <span className="font-medium">{kpis?.viagensConcluidas || 0}</span>
                </div>
                <Progress value={kpis?.viagensConcluidas || 0} max={100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Em Andamento</span>
                  <span className="font-medium">{kpis?.viagensEmAndamento || 0}</span>
                </div>
                <Progress value={kpis?.viagensEmAndamento || 0} max={50} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Fretes Aguardando</span>
                  <span className="font-medium">{kpis?.fretesAberto || 0}</span>
                </div>
                <Progress value={kpis?.fretesAberto || 0} max={50} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/viagens" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Gerenciar Viagens</span>
              </a>
              <a href="/fretes" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Novo Frete</span>
              </a>
              <a href="/acertos" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Acertos Pendentes</span>
              </a>
              <a href="/relatorios" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Ver Relatórios</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
