import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useMecanicos } from '@/hooks/useMecanicos';
import { MecanicoCard } from '@/components/mecanicos/MecanicoCard';
import { MecanicoDialog } from '@/components/mecanicos/MecanicoDialog';
import { CriarLoginMecanicoDialog } from '@/components/mecanicos/CriarLoginMecanicoDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { MecanicoFormData } from '@/lib/validations-manutencao';

export default function Mecanicos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMecanico, setSelectedMecanico] = useState<any>(null);

  const { mecanicos, isLoading, createMecanico, updateMecanico, deleteMecanico } = useMecanicos();

  const filteredMecanicos = (mecanicos as any[]).filter((mecanico: any) =>
    mecanico.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mecanico.cpf?.includes(searchTerm) ||
    mecanico.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedMecanico(null);
    setDialogOpen(true);
  };

  const handleEdit = (mecanico: any) => {
    setSelectedMecanico(mecanico);
    setDialogOpen(true);
  };

  const handleDelete = (mecanico: any) => {
    setSelectedMecanico(mecanico);
    setDeleteDialogOpen(true);
  };

  const handleCriarLogin = (mecanico: any) => {
    setSelectedMecanico(mecanico);
    setLoginDialogOpen(true);
  };

  const handleSubmit = (data: MecanicoFormData) => {
    if (selectedMecanico) {
      updateMecanico.mutate({ id: selectedMecanico.id, data });
    } else {
      createMecanico.mutate(data);
    }
  };

  const confirmDelete = () => {
    if (selectedMecanico) {
      deleteMecanico.mutate(selectedMecanico.id);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mecânicos</h1>
            <p className="text-muted-foreground">Gerencie a equipe de mecânicos</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Mecânico
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMecanicos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum mecânico encontrado' : 'Nenhum mecânico cadastrado ainda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMecanicos.map((mecanico) => (
              <MecanicoCard
                key={mecanico.id}
                mecanico={mecanico}
                onEdit={() => handleEdit(mecanico)}
                onDelete={() => handleDelete(mecanico)}
                onCriarLogin={() => handleCriarLogin(mecanico)}
              />
            ))}
          </div>
        )}
      </div>

      <MecanicoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        mecanico={selectedMecanico}
      />

      <CriarLoginMecanicoDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        mecanico={selectedMecanico}
        onSuccess={() => {
          setLoginDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o mecânico {selectedMecanico?.nome}? Esta ação não pode ser desfeita.
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
