import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useReboques } from '@/hooks/useReboques';
import { ReboqueDialog } from '@/components/reboques/ReboqueDialog';
import { ReboqueCard } from '@/components/reboques/ReboqueCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Tables } from '@/integrations/supabase/types';

type Reboque = Tables<'reboques'>;

export default function Reboques() {
  const { reboques, isLoading, createReboque, updateReboque, deleteReboque } = useReboques();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReboque, setSelectedReboque] = useState<Reboque | null>(null);
  const [reboqueToDelete, setReboqueToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    setSelectedReboque(null);
    setDialogOpen(true);
  };

  const handleEdit = (reboque: Reboque) => {
    setSelectedReboque(reboque);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setReboqueToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reboqueToDelete) {
      deleteReboque.mutate(reboqueToDelete);
      setDeleteDialogOpen(false);
      setReboqueToDelete(null);
    }
  };

  const handleSubmit = (data: any) => {
    if (selectedReboque) {
      updateReboque.mutate(
        { id: selectedReboque.id, data },
        {
          onSuccess: () => setDialogOpen(false),
        }
      );
    } else {
      createReboque.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const filteredReboques = reboques.filter((reboque) => {
    const search = searchTerm.toLowerCase();
    return (
      reboque.placa?.toLowerCase().includes(search) ||
      reboque.codigo_interno?.toLowerCase().includes(search) ||
      reboque.marca?.toLowerCase().includes(search) ||
      reboque.modelo?.toLowerCase().includes(search)
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reboques</h2>
            <p className="text-muted-foreground">
              Gerencie os reboques e semi-reboques da frota
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Reboque
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
            <p className="text-muted-foreground">Carregando reboques...</p>
          </div>
        ) : filteredReboques.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum reboque encontrado' : 'Nenhum reboque cadastrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReboques.map((reboque) => (
              <ReboqueCard
                key={reboque.id}
                reboque={reboque}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ReboqueDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        reboque={selectedReboque}
        isLoading={createReboque.isPending || updateReboque.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este reboque? Esta ação não pode ser desfeita.
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
