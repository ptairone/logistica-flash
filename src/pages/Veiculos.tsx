import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useVeiculos } from '@/hooks/useVeiculos';
import { VeiculoDialog } from '@/components/veiculos/VeiculoDialog';
import { VeiculoCard } from '@/components/veiculos/VeiculoCard';
import { VeiculoDetailsDialog } from '@/components/veiculos/VeiculoDetailsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Veiculos() {
  const { veiculos, isLoading, createVeiculo, updateVeiculo, deleteVeiculo } = useVeiculos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<any>(null);
  const [veiculoToDelete, setVeiculoToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    setSelectedVeiculo(null);
    setDialogOpen(true);
  };

  const handleEdit = (veiculo: any) => {
    setSelectedVeiculo(veiculo);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setVeiculoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (veiculoToDelete) {
      deleteVeiculo.mutate(veiculoToDelete);
      setDeleteDialogOpen(false);
      setVeiculoToDelete(null);
    }
  };

  const handleViewDetails = (veiculo: any) => {
    setSelectedVeiculo(veiculo);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedVeiculo) {
      updateVeiculo.mutate(
        { id: selectedVeiculo.id, data },
        {
          onSuccess: () => setDialogOpen(false),
        }
      );
    } else {
      createVeiculo.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const filteredVeiculos = veiculos.filter((veiculo) => {
    const search = searchTerm.toLowerCase();
    return (
      veiculo.placa?.toLowerCase().includes(search) ||
      veiculo.codigo_interno?.toLowerCase().includes(search) ||
      veiculo.marca?.toLowerCase().includes(search) ||
      veiculo.modelo?.toLowerCase().includes(search)
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Veículos</h2>
            <p className="text-muted-foreground">
              Gerencie a frota de veículos da empresa
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Veículo
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, código, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando veículos...</p>
          </div>
        ) : filteredVeiculos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVeiculos.map((veiculo) => (
              <VeiculoCard
                key={veiculo.id}
                veiculo={veiculo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      <VeiculoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        veiculo={selectedVeiculo}
        isLoading={createVeiculo.isPending || updateVeiculo.isPending}
      />

      <VeiculoDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        veiculo={selectedVeiculo}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
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
