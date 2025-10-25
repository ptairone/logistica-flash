import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCategorias, Categoria } from '@/hooks/useCategorias';
import { CategoriaDialog } from './CategoriaDialog';

export function CategoriasManager() {
  const { categorias, isLoading, createCategoria, updateCategoria, deleteCategoria } = useCategorias();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);

  const handleCreate = (data: any) => {
    createCategoria.mutate(data);
  };

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (selectedCategoria) {
      updateCategoria.mutate({ ...data, id: selectedCategoria.id });
    }
  };

  const handleDeleteClick = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCategoria) {
      deleteCategoria.mutate(selectedCategoria.id);
      setDeleteDialogOpen(false);
      setSelectedCategoria(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedCategoria(null);
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando categorias...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categorias</h3>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categorias.map((categoria) => (
          <Card key={categoria.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoria.cor || '#6366f1' }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{categoria.nome}</h4>
                  {categoria.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {categoria.descricao}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(categoria)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteClick(categoria)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <CategoriaDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={selectedCategoria ? handleUpdate : handleCreate}
        defaultValues={selectedCategoria || undefined}
        isEdit={!!selectedCategoria}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{selectedCategoria?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCategoria(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
