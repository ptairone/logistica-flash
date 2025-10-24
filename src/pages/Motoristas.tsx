import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download, AlertTriangle } from 'lucide-react';
import { useMotoristas } from '@/hooks/useMotoristas';
import { MotoristaDialog } from '@/components/motoristas/MotoristaDialog';
import { MotoristaCard } from '@/components/motoristas/MotoristaCard';
import { MotoristaDetailsDialog } from '@/components/motoristas/MotoristaDetailsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportarMotoristasCSV } from '@/lib/validations-motorista';

export default function Motoristas() {
  const { motoristas, isLoading, createMotorista, updateMotorista, deleteMotorista } = useMotoristas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMotorista, setSelectedMotorista] = useState<any>(null);
  const [motoristaToDelete, setMotoristaToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = () => {
    setSelectedMotorista(null);
    setDialogOpen(true);
  };

  const handleEdit = (motorista: any) => {
    setSelectedMotorista(motorista);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setMotoristaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (motoristaToDelete) {
      deleteMotorista.mutate(motoristaToDelete);
      setDeleteDialogOpen(false);
      setMotoristaToDelete(null);
    }
  };

  const handleViewDetails = (motorista: any) => {
    setSelectedMotorista(motorista);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedMotorista) {
      updateMotorista.mutate(
        { id: selectedMotorista.id, data },
        {
          onSuccess: () => setDialogOpen(false),
        }
      );
    } else {
      createMotorista.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleExportCSV = () => {
    const motoristasParaExportar = filteredMotoristas.length > 0 ? filteredMotoristas : motoristas;
    exportarMotoristasCSV(motoristasParaExportar);
  };

  const filteredMotoristas = motoristas.filter((motorista) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      motorista.nome?.toLowerCase().includes(search) ||
      motorista.cpf?.toLowerCase().includes(search) ||
      motorista.cnh?.toLowerCase().includes(search);
    
    const matchesStatus = statusFilter === 'all' || motorista.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Contar motoristas com CNH vencida ou a vencer
  const cnhsComProblema = motoristas.filter(m => {
    const hoje = new Date();
    const validade = new Date(m.validade_cnh);
    const diffDays = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Motoristas</h2>
            <p className="text-muted-foreground">
              Gerencie os motoristas da empresa
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} disabled={motoristas.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Motorista
            </Button>
          </div>
        </div>

        {cnhsComProblema > 0 && (
          <div className="bg-warning/10 border border-warning rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium">Atenção!</p>
              <p className="text-sm text-muted-foreground">
                {cnhsComProblema} motorista{cnhsComProblema > 1 ? 's' : ''} com CNH vencida ou a vencer em breve
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou CNH..."
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
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando motoristas...</p>
          </div>
        ) : filteredMotoristas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Nenhum motorista encontrado' : 'Nenhum motorista cadastrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMotoristas.map((motorista) => (
              <MotoristaCard
                key={motorista.id}
                motorista={motorista}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      <MotoristaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        motorista={selectedMotorista}
        isLoading={createMotorista.isPending || updateMotorista.isPending}
      />

      <MotoristaDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        motorista={selectedMotorista}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este motorista? Esta ação não pode ser desfeita.
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
