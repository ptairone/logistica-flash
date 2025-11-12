import { useState } from 'react';
import { Building2, Plus, Search, LogOut, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/MainLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmpresaDialog } from '@/components/super-admin/EmpresaDialog';

export default function Empresas() {
  const { signOut } = useAuth();
  const { empresas } = useEmpresas();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<any>(null);

  const empresasFiltradas = empresas.filter(empresa => {
    const matchStatus = filtroStatus === 'todos' || empresa.status === filtroStatus;
    const matchBusca = empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       empresa.cnpj.includes(busca);
    return matchStatus && matchBusca;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'default',
      trial: 'secondary',
      suspenso: 'destructive',
      bloqueado: 'destructive',
    };
    return variants[status as keyof typeof variants] || 'default';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">Gerenciar empresas cadastradas</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {
              setEmpresaEditando(null);
              setDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
              <SelectItem value="bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {empresasFiltradas.map((empresa) => (
            <Card key={empresa.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                  </div>
                  <Badge variant={getStatusBadge(empresa.status) as any}>
                    {empresa.status}
                  </Badge>
                </div>
                <CardDescription>{empresa.cnpj}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{empresa.email_contato}</p>
                </div>
                {empresa.telefone && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Telefone:</span>
                    <p className="font-medium">{empresa.telefone}</p>
                  </div>
                )}
                {empresa.status === 'trial' && empresa.data_fim_trial && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Trial até:</span>
                    <p className="font-medium">
                      {new Date(empresa.data_fim_trial).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">Cadastrado em:</span>
                  <p className="font-medium">
                    {new Date(empresa.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    setEmpresaEditando(empresa);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {empresasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground">
              Ajuste os filtros ou cadastre uma nova empresa
            </p>
          </div>
        )}

        <EmpresaDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          empresa={empresaEditando}
        />
      </div>
    </MainLayout>
  );
}
