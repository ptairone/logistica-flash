import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download } from 'lucide-react';
import { useFretes } from '@/hooks/useFretes';
import { FreteDialog } from '@/components/fretes/FreteDialog';
import { FreteCard } from '@/components/fretes/FreteCard';
import { FreteDetailsDialog } from '@/components/fretes/FreteDetailsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportarFretesCSV } from '@/lib/validations-frete';

export default function Fretes() {
  const { fretes, isLoading, createFrete, updateFrete, deleteFrete } = useFretes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFrete, setSelectedFrete] = useState<any>(null);
  const [freteToDelete, setFreteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = () => {
    setSelectedFrete(null);
    setDialogOpen(true);
  };

  const handleEdit = (frete: any) => {
    setSelectedFrete(frete);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setFreteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (freteToDelete) {
      deleteFrete.mutate(freteToDelete);
      setDeleteDialogOpen(false);
      setFreteToDelete(null);
    }
  };

  const handleViewDetails = (frete: any) => {
    setSelectedFrete(frete);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedFrete) {
      updateFrete.mutate(
        { id: selectedFrete.id, data },
        {
          onSuccess: () => setDialogOpen(false),
        }
      );
    } else {
      createFrete.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleExportCSV = () => {
    const fretesParaExportar = filteredFretes.length > 0 ? filteredFretes : fretes;
    exportarFretesCSV(fretesParaExportar);
  };

  const filteredFretes = fretes.filter((frete) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      frete.codigo?.toLowerCase().includes(search) ||
      frete.cliente_nome?.toLowerCase().includes(search) ||
      frete.cliente_cnpj_cpf?.toLowerCase().includes(search) ||
      frete.origem?.toLowerCase().includes(search) ||
      frete.destino?.toLowerCase().includes(search);
    
    const matchesStatus = statusFilter === 'all' || frete.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Fretes</h2>
            <p className="text-muted-foreground">
              Gerencie os fretes e clientes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} disabled={fretes.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Frete
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, cliente, origem ou destino..."
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
              <SelectItem value="faturado">Faturado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando fretes...</p>
          </div>
        ) : filteredFretes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Nenhum frete encontrado' : 'Nenhum frete cadastrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFretes.map((frete) => (
              <FreteCard
                key={frete.id}
                frete={frete}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      <FreteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        frete={selectedFrete}
        isLoading={createFrete.isPending || updateFrete.isPending}
      />

      <FreteDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        frete={selectedFrete}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este frete? Esta ação não pode ser desfeita.
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
