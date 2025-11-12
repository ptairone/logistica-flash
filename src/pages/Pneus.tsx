import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertTriangle, TrendingUp, Package, Truck } from 'lucide-react';
import { usePneus, usePneusRelatorios } from '@/hooks/usePneus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PneuCard } from '@/components/pneus/PneuCard';
import { PneuDialog } from '@/components/pneus/PneuDialog';
import { PneuDetailsDialog } from '@/components/pneus/PneuDetailsDialog';
import { MedicaoDialog } from '@/components/pneus/MedicaoDialog';
import { InstalacaoPneuDialog } from '@/components/pneus/InstalacaoPneuDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Pneus() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [medicaoDialogOpen, setMedicaoDialogOpen] = useState(false);
  const [instalacaoDialogOpen, setInstalacaoDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPneu, setSelectedPneu] = useState<any>(null);
  const [pneuToDelete, setPneuToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');

  const { pneus, isLoading, createPneu, updatePneu, deletePneu } = usePneus({
    status: activeTab === 'todos' ? undefined : activeTab,
    critico: activeTab === 'criticos',
  });

  const { relatorios } = usePneusRelatorios();

  const handleCreate = () => {
    setSelectedPneu(null);
    setDialogOpen(true);
  };

  const handleEdit = (pneu: any) => {
    setSelectedPneu(pneu);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPneuToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pneuToDelete) {
      deletePneu.mutate(pneuToDelete);
      setDeleteDialogOpen(false);
      setPneuToDelete(null);
    }
  };

  const handleViewDetails = (pneu: any) => {
    setSelectedPneu(pneu);
    setDetailsDialogOpen(true);
  };

  const handleMedir = (pneu: any) => {
    setSelectedPneu(pneu);
    setMedicaoDialogOpen(true);
  };

  const handleInstalar = (pneu: any) => {
    setSelectedPneu(pneu);
    setInstalacaoDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedPneu) {
      updatePneu.mutate(
        { id: selectedPneu.id, data },
        {
          onSuccess: () => setDialogOpen(false),
        }
      );
    } else {
      createPneu.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const filteredPneus = pneus.filter((pneu: any) => {
    const search = searchTerm.toLowerCase();
    return (
      pneu.numero_serie?.toLowerCase().includes(search) ||
      pneu.codigo_interno?.toLowerCase().includes(search) ||
      pneu.marca?.toLowerCase().includes(search) ||
      pneu.modelo?.toLowerCase().includes(search) ||
      pneu.veiculo?.placa?.toLowerCase().includes(search)
    );
  });

  const pneusCriticos = pneus.filter((pneu: any) => 
    pneu.profundidade_sulco_mm && 
    pneu.profundidade_sulco_mm <= (pneu.profundidade_minima_mm || 1.6)
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Pneus</h2>
            <p className="text-muted-foreground">
              Controle completo do ciclo de vida dos pneus
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pneu
          </Button>
        </div>

        {pneusCriticos.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Atenção! {pneusCriticos.length} pneu(s) com profundidade crítica necessitam substituição urgente.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pneus</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{relatorios?.totalPneus || 0}</div>
              <p className="text-xs text-muted-foreground">
                {relatorios?.emEstoque || 0} em estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{relatorios?.emUso || 0}</div>
              <p className="text-xs text-muted-foreground">
                Instalados em veículos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pneus Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {relatorios?.criticos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Necessitam substituição
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo por KM</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(relatorios?.custoPorKm || 0).toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground">
                Média de custo
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por série, código, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="estoque">Em Estoque</TabsTrigger>
            <TabsTrigger value="em_uso">Em Uso</TabsTrigger>
            <TabsTrigger value="criticos">Críticos</TabsTrigger>
            <TabsTrigger value="recapagem">Recapagem</TabsTrigger>
            <TabsTrigger value="descartado">Descartados</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando pneus...</p>
              </div>
            ) : filteredPneus.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum pneu encontrado' : 'Nenhum pneu cadastrado'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPneus.map((pneu: any) => (
                  <PneuCard
                    key={pneu.id}
                    pneu={pneu}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    onMedir={handleMedir}
                    onInstalar={handleInstalar}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <PneuDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        pneu={selectedPneu}
        isLoading={createPneu.isPending || updatePneu.isPending}
      />

      <PneuDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        pneu={selectedPneu}
      />

      <MedicaoDialog
        open={medicaoDialogOpen}
        onOpenChange={setMedicaoDialogOpen}
        pneu={selectedPneu}
      />

      <InstalacaoPneuDialog
        open={instalacaoDialogOpen}
        onOpenChange={setInstalacaoDialogOpen}
        pneu={selectedPneu}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pneu? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
