import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  DollarSign, 
  Truck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Package,
  Wrench,
  FileText,
  Receipt,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function DashboardMobile() {
  const { kpis, isLoading } = useDashboard();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Bom dia';
    if (hour < 18) return '☀️ Boa tarde';
    return '🌙 Boa noite';
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const totalAlertas = (kpis?.cnhVencendo || 0) + (kpis?.estoqueBaixo || 0) + (kpis?.manutencaoAtrasada || 0);

  const quickActions = [
    { label: 'Viagens', icon: MapPin, url: '/viagens', color: 'text-blue-600' },
    { label: 'Fretes', icon: FileText, url: '/fretes', color: 'text-purple-600' },
    { label: 'Acertos', icon: Receipt, url: '/acertos', color: 'text-green-600' },
    { label: 'Relatórios', icon: BarChart3, url: '/relatorios', color: 'text-orange-600' },
  ];

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Greeting */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">{getGreeting()}!</h1>
        <p className="text-white/90 text-sm">
          {user?.user_metadata?.name || 'Usuário'}
        </p>
      </div>

      {/* KPIs Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="touch-target">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {kpis?.viagensConcluidas || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">Viagens Concluídas</p>
          </CardContent>
        </Card>

        <Card className="touch-target">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">
              R$ {kpis?.custoKm.toFixed(2) || '0,00'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">Custo por KM</p>
          </CardContent>
        </Card>

        <Card className="touch-target">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Truck className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {kpis?.fretesAberto || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">Fretes em Aberto</p>
          </CardContent>
        </Card>

        <Card className="touch-target">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Truck className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {kpis?.viagensEmAndamento || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Últimos 7 dias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm">Receita</span>
            </div>
            <span className="font-bold text-green-600">
              R$ {kpis?.receitaRecente.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-sm">Despesas</span>
            </div>
            <span className="font-bold text-red-600">
              R$ {kpis?.despesasRecentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Margem</span>
              <span className={cn(
                "font-bold",
                (kpis?.margemRecente || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                R$ {kpis?.margemRecente.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {totalAlertas > 0 && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Alertas
              </CardTitle>
              <Badge variant="destructive">{totalAlertas}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {(kpis?.cnhVencendo || 0) > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg touch-target">
                <Users className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">CNH Vencendo</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.cnhVencendo} motorista(s)
                  </p>
                </div>
              </div>
            )}

            {(kpis?.estoqueBaixo || 0) > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg touch-target">
                <Package className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Estoque Baixo</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.estoqueBaixo} item(ns)
                  </p>
                </div>
              </div>
            )}

            {(kpis?.manutencaoAtrasada || 0) > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg touch-target">
                <Wrench className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Manutenção Atrasada</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.manutencaoAtrasada} veículo(s)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <div>
        <h3 className="text-sm font-semibold mb-3 px-1">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.url}
                onClick={() => navigate(action.url)}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-card border rounded-xl touch-target hover:bg-accent transition-colors"
              >
                <div className={cn("p-3 rounded-full bg-muted", action.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
