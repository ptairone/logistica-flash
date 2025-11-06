import { useState } from 'react';
import { Plus, Filter, Droplet, TrendingUp, DollarSign, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AbastecimentoCard } from '@/components/abastecimentos/AbastecimentoCard';
import { AbastecimentoDetailsDialog } from '@/components/abastecimentos/AbastecimentoDetailsDialog';
import { AbastecimentoDialog } from '@/components/abastecimentos/AbastecimentoDialog';
import { useAbastecimentos } from '@/hooks/useAbastecimentos';
import { useVeiculos } from '@/hooks/useVeiculos';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/MainLayout';

export default function Abastecimentos() {
  const [selectedAbastecimento, setSelectedAbastecimento] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filtroVeiculo, setFiltroVeiculo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const { abastecimentos, isLoading, validarAbastecimento } = useAbastecimentos(
    filtroVeiculo === 'todos' ? undefined : filtroVeiculo
  );
  const { veiculos } = useVeiculos();

  // Calcular estatísticas
  const stats = abastecimentos?.reduce(
    (acc, ab) => {
      acc.totalLitros += ab.litros || 0;
      acc.totalValor += ab.valor_total || 0;
      if (ab.media_calculada) {
        acc.somaMedias += ab.media_calculada;
        acc.countMedias++;
      }
      return acc;
    },
    { totalLitros: 0, totalValor: 0, somaMedias: 0, countMedias: 0 }
  ) || { totalLitros: 0, totalValor: 0, somaMedias: 0, countMedias: 0 };

  const mediaGeral = stats.countMedias > 0 ? stats.somaMedias / stats.countMedias : 0;

  // Filtrar abastecimentos
  const abastecimentosFiltrados = abastecimentos?.filter((ab) => {
    if (filtroStatus === 'todos') return true;
    return ab.status === filtroStatus;
  });

  const handleValidar = async (abastecimento: any) => {
    await validarAbastecimento.mutateAsync({ id: abastecimento.id });
  };

  const handleRejeitar = async (abastecimento: any) => {
    await validarAbastecimento.mutateAsync({ 
      id: abastecimento.id,
      observacoes: 'Rejeitado pela administração' 
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan bg-clip-text text-transparent">
              Gestão de Abastecimentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle completo de abastecimentos e consumo da frota
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Novo Abastecimento
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplet className="h-4 w-4 text-primary" />
                Total de Litros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} L
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {abastecimentosFiltrados?.length || 0} abastecimentos
              </p>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Média Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {mediaGeral.toFixed(2)} km/L
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.countMedias} médias calculadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-warning" />
                Total Gasto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Custo médio/L: R$ {stats.totalLitros > 0 ? (stats.totalValor / stats.totalLitros).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-cyan" />
                Veículos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(abastecimentosFiltrados?.map(ab => ab.veiculo_id)).size}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Com abastecimentos registrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Veículo</label>
                <Select value={filtroVeiculo} onValueChange={setFiltroVeiculo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os veículos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os veículos</SelectItem>
                    {veiculos?.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa} - {veiculo.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="pendente_validacao">Pendente</SelectItem>
                    <SelectItem value="validado">Validado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Abastecimentos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Abastecimentos</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : abastecimentosFiltrados?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Droplet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhum abastecimento encontrado
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Registre o primeiro abastecimento para começar o controle
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {abastecimentosFiltrados?.map((abastecimento) => (
                <AbastecimentoCard
                  key={abastecimento.id}
                  abastecimento={abastecimento}
                  onViewDetails={(ab) => {
                    setSelectedAbastecimento(ab);
                    setDetailsDialogOpen(true);
                  }}
                  onValidar={handleValidar}
                  onRejeitar={handleRejeitar}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Dialogs */}
      <AbastecimentoDetailsDialog
        abastecimento={selectedAbastecimento}
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedAbastecimento(null);
        }}
        onValidar={(id) => validarAbastecimento.mutateAsync({ id })}
        onRejeitar={(id) => validarAbastecimento.mutateAsync({ 
          id, 
          observacoes: 'Rejeitado pela administração' 
        })}
      />

      <AbastecimentoDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        veiculoId={filtroVeiculo === 'todos' ? undefined : filtroVeiculo}
      />
    </MainLayout>
  );
}
