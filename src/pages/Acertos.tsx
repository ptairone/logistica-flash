import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAcertos, useVincularViagens } from '@/hooks/useAcertos';
import { AcertoDialogWizard } from '@/components/acertos/AcertoDialogWizard';
import { AcertoCard } from '@/components/acertos/AcertoCard';
import { AcertoDetailsDialog } from '@/components/acertos/AcertoDetailsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Acertos() {
  const navigate = useNavigate();
  const { acertos, isLoading, createAcerto, updateAcerto, deleteAcerto } = useAcertos();
  const vincularViagens = useVincularViagens();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAcerto, setSelectedAcerto] = useState<any>(null);
  const [acertoToDelete, setAcertoToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = () => {
    setSelectedAcerto(null);
    setDialogOpen(true);
  };

  const handleEdit = (acerto: any) => {
    setSelectedAcerto(acerto);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAcertoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (acertoToDelete) {
      deleteAcerto.mutate(acertoToDelete);
      setDeleteDialogOpen(false);
      setAcertoToDelete(null);
    }
  };

  const handleViewDetails = (acerto: any) => {
    setSelectedAcerto(acerto);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = async (data: any, viagemIds: string[], ajustes: any[], debitos: any[], validacoes: any[]) => {
    if (selectedAcerto) {
      updateAcerto.mutate(
        { id: selectedAcerto.id, data },
        {
          onSuccess: () => setDialogOpen(false),
        }
      );
    } else {
      createAcerto.mutate(data, {
        onSuccess: (acerto) => {
          if (viagemIds.length > 0) {
            vincularViagens.mutate({
              viagemIds,
              acertoId: acerto.id,
            });
          }
          setDialogOpen(false);
        },
      });
    }
  };

  const filteredAcertos = acertos.filter((acerto) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      acerto.codigo?.toLowerCase().includes(search) ||
      acerto.motorista?.nome?.toLowerCase().includes(search);
    
    const matchesStatus = statusFilter === 'all' || acerto.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Acertos</h2>
            <p className="text-muted-foreground">
              Fechamento financeiro dos motoristas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/acertos/completo')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Acerto Completo (Planilha)
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Acerto
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou motorista..."
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
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando acertos...</p>
          </div>
        ) : filteredAcertos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Nenhum acerto encontrado' : 'Nenhum acerto cadastrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAcertos.map((acerto) => (
              <AcertoCard
                key={acerto.id}
                acerto={acerto}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      <AcertoDialogWizard
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        acerto={selectedAcerto}
        isLoading={createAcerto.isPending || updateAcerto.isPending}
      />

      <AcertoDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        acerto={selectedAcerto}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este acerto? As viagens vinculadas ficarão disponíveis para novo acerto.
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
