import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useViagens } from '@/hooks/useViagens';
import { ViagemDialog } from '@/components/viagens/ViagemDialog';
import { ViagemCard } from '@/components/viagens/ViagemCard';
import { ViagemDetailsDialog } from '@/components/viagens/ViagemDetailsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Viagens() {
  const { viagens, isLoading, createViagem, updateViagem, deleteViagem } = useViagens();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedViagem, setSelectedViagem] = useState<any>(null);
  const [viagemToDelete, setViagemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = () => {
    setSelectedViagem(null);
    setDialogOpen(true);
  };

  const handleEdit = (viagem: any) => {
    setSelectedViagem(viagem);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setViagemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (viagemToDelete) {
      deleteViagem.mutate(viagemToDelete);
      setDeleteDialogOpen(false);
      setViagemToDelete(null);
    }
  };

  const handleViewDetails = (viagem: any) => {
    setSelectedViagem(viagem);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedViagem) {
      updateViagem.mutate(
        { id: selectedViagem.id, data },
        {
          onSuccess: () => setDialogOpen(false),
        }
      );
    } else {
      createViagem.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const filteredViagens = viagens.filter((viagem) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      viagem.codigo?.toLowerCase().includes(search) ||
      viagem.origem?.toLowerCase().includes(search) ||
      viagem.destino?.toLowerCase().includes(search) ||
      viagem.veiculo?.placa?.toLowerCase().includes(search) ||
      viagem.motorista?.nome?.toLowerCase().includes(search);
    
    const matchesStatus = statusFilter === 'all' || viagem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Viagens</h2>
            <p className="text-muted-foreground">
              Gerencie o ciclo completo das viagens
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Viagem
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, origem, destino, veículo ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="planejada">Planejada</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando viagens...</p>
          </div>
        ) : filteredViagens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Nenhuma viagem encontrada' : 'Nenhuma viagem cadastrada'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredViagens.map((viagem) => (
              <ViagemCard
                key={viagem.id}
                viagem={viagem}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      <ViagemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        viagem={selectedViagem}
        isLoading={createViagem.isPending || updateViagem.isPending}
      />

      <ViagemDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        viagem={selectedViagem}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita e todas as despesas e comprovantes associados serão perdidos.
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
