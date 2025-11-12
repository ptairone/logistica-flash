import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useLocaisEstoque, LocalEstoqueFormData } from '@/hooks/useLocaisEstoque';
import { LocalDialog } from './LocalDialog';
import { MapPin, Edit, Trash2, Plus, Warehouse } from 'lucide-react';

export function LocaisManager() {
  const { locais, isLoading, createLocal, updateLocal, deleteLocal } = useLocaisEstoque();
  const [localDialogOpen, setLocalDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocal, setSelectedLocal] = useState<any>(null);

  const handleCreate = async (data: LocalEstoqueFormData) => {
    await createLocal.mutateAsync(data);
    setLocalDialogOpen(false);
  };

  const handleUpdate = async (data: LocalEstoqueFormData) => {
    if (selectedLocal) {
      await updateLocal.mutateAsync({ id: selectedLocal.id, ...data });
      setLocalDialogOpen(false);
      setSelectedLocal(null);
    }
  };

  const handleDelete = async () => {
    if (selectedLocal) {
      await deleteLocal.mutateAsync(selectedLocal.id);
      setDeleteDialogOpen(false);
      setSelectedLocal(null);
    }
  };

  const handleEdit = (local: any) => {
    setSelectedLocal(local);
    setLocalDialogOpen(true);
  };

  const handleDeleteClick = (local: any) => {
    setSelectedLocal(local);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {locais.length} {locais.length === 1 ? 'local cadastrado' : 'locais cadastrados'}
          </p>
          <Button onClick={() => {
            setSelectedLocal(null);
            setLocalDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Local
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando locais...</p>
          </div>
        ) : locais.length === 0 ? (
          <Card className="p-8 text-center">
            <Warehouse className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum local cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando seu primeiro local de estoque
            </p>
            <Button onClick={() => setLocalDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Local
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {locais.map((local) => (
              <Card key={local.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">{local.nome}</h3>
                      <Badge variant={local.ativo ? 'default' : 'secondary'}>
                        {local.codigo}
                      </Badge>
                      {!local.ativo && (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </div>
                    
                    {local.descricao && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {local.descricao}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      {local.responsavel && (
                        <div>
                          <span className="text-muted-foreground">Responsável:</span>{' '}
                          <span className="font-medium">{local.responsavel}</span>
                        </div>
                      )}
                      {local.capacidade_m3 && (
                        <div>
                          <span className="text-muted-foreground">Capacidade:</span>{' '}
                          <span className="font-medium">{local.capacidade_m3} m³</span>
                        </div>
                      )}
                      {local.endereco && (
                        <div className="w-full">
                          <span className="text-muted-foreground">Endereço:</span>{' '}
                          <span className="font-medium">{local.endereco}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(local)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(local)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <LocalDialog
        open={localDialogOpen}
        onOpenChange={setLocalDialogOpen}
        onSubmit={selectedLocal ? handleUpdate : handleCreate}
        defaultValues={selectedLocal || undefined}
        isEdit={!!selectedLocal}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o local "{selectedLocal?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
