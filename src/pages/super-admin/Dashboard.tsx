import { Building2, Users, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmpresas } from '@/hooks/useEmpresas';

export default function SuperAdminDashboard() {
  const { empresas, empresasPendentes } = useEmpresas();

  const empresasAtivas = empresas.filter(e => e.status === 'ativo').length;
  const empresasTrial = empresas.filter(e => e.status === 'trial').length;
  const totalEmpresas = empresas.length;

  const stats = [
    {
      title: 'Total de Empresas',
      value: totalEmpresas,
      description: 'Empresas cadastradas',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      title: 'Empresas Ativas',
      value: empresasAtivas,
      description: 'Com acesso completo',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Em Trial',
      value: empresasTrial,
      description: 'Período de teste',
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Pendentes',
      value: empresasPendentes.length,
      description: 'Aguardando aprovação',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Super Admin</h1>
          <p className="text-muted-foreground">Visão geral do sistema multi-tenant</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Empresas Cadastradas</CardTitle>
              <CardDescription>Empresas recentes no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {empresas.slice(0, 5).map((empresa) => (
                  <div key={empresa.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{empresa.nome}</p>
                      <p className="text-sm text-muted-foreground">{empresa.cnpj}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      empresa.status === 'ativo' ? 'bg-green-100 text-green-700' :
                      empresa.status === 'trial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {empresa.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes</CardTitle>
              <CardDescription>Empresas aguardando aprovação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {empresasPendentes.slice(0, 5).map((empresa) => (
                  <div key={empresa.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{empresa.nome}</p>
                      <p className="text-sm text-muted-foreground">{empresa.nome_responsavel}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(empresa.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {empresasPendentes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma solicitação pendente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
