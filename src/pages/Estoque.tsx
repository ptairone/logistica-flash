import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Plus, Search, Download, AlertTriangle, Package, FileUp, Settings } from 'lucide-react';
import { useEstoque } from '@/hooks/useEstoque';
import { useCategorias } from '@/hooks/useCategorias';
import { ItemEstoqueDialog } from '@/components/estoque/ItemEstoqueDialog';
import { ItemEstoqueCard } from '@/components/estoque/ItemEstoqueCard';
import { ItemEstoqueDetailsDialog } from '@/components/estoque/ItemEstoqueDetailsDialog';
import { ImportacaoDialog } from '@/components/estoque/ImportacaoDialog';
import { CategoriasManager } from '@/components/estoque/CategoriasManager';
import { exportarItensCSV, isItemCritico } from '@/lib/validations-estoque';
import { useToast } from '@/hooks/use-toast';

export default function Estoque() {
  const { toast } = useToast();
  const { itens, isLoading, createItem, updateItem, deleteItem } = useEstoque();
  const { categorias } = useCategorias();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importacaoDialogOpen, setImportacaoDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todos');
  const [criticosFilter, setCriticosFilter] = useState<string>('todos');

  // Filtrar itens
  const filteredItens = itens.filter(item => {
    const matchSearch = 
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategoria = 
      categoriaFilter === 'todos' || item.categoria === categoriaFilter;
    
    const matchCriticos = 
      criticosFilter === 'todos' ||
      (criticosFilter === 'sim' && isItemCritico(item.estoque_atual, item.estoque_minimo)) ||
      (criticosFilter === 'nao' && !isItemCritico(item.estoque_atual, item.estoque_minimo));

    return matchSearch && matchCategoria && matchCriticos;
  });

  // Contar itens críticos
  const itensCriticos = itens.filter(item => 
    isItemCritico(item.estoque_atual, item.estoque_minimo)
  );

  const handleCreate = (data: any) => {
    createItem.mutate(data);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (selectedItem) {
      updateItem.mutate({ ...data, id: selectedItem.id });
    }
  };

  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) {
      deleteItem.mutate(selectedItem.id);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const handleView = (item: any) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleExportCSV = () => {
    const csv = exportarItensCSV(filteredItens.map(item => ({
      ...item,
      critico: isItemCritico(item.estoque_atual, item.estoque_minimo),
      percentual_uso: (item.estoque_atual / item.estoque_minimo) * 100,
    })) as any);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `estoque_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'CSV exportado',
      description: 'Arquivo CSV exportado com sucesso.',
    });
  };

  const handleNewItem = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Estoque</h2>
            <p className="text-muted-foreground">
              Controle de peças e materiais
            </p>
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Categorias
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Gerenciar Categorias</SheetTitle>
                  <SheetDescription>
                    Crie e organize categorias para seus itens de estoque
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <CategoriasManager />
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={() => setImportacaoDialogOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              Importar NF-e/PDF
            </Button>
            <Button onClick={handleNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </div>

        {itensCriticos.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {itensCriticos.length} {itensCriticos.length === 1 ? 'item está' : 'itens estão'} com estoque abaixo do mínimo
            </AlertDescription>
          </Alert>
        )}

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Itens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{itens.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Itens Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">
                {itensCriticos.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                R$ {itens.reduce((acc, item) => 
                  acc + (item.estoque_atual * item.custo_medio), 0
                ).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Set(itens.map(i => i.categoria)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas categorias</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nome}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.cor || '#6366f1' }}
                        />
                        {cat.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={criticosFilter} onValueChange={setCriticosFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Estoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os itens</SelectItem>
                  <SelectItem value="sim">Apenas críticos</SelectItem>
                  <SelectItem value="nao">Apenas normais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Itens */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : filteredItens.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchTerm || categoriaFilter !== 'todos' || criticosFilter !== 'todos'
                  ? 'Nenhum item encontrado com os filtros aplicados'
                  : 'Nenhum item cadastrado'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItens.map((item) => (
              <ItemEstoqueCard
                key={item.id}
                item={item}
                onView={() => handleView(item)}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDeleteClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      <ItemEstoqueDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={selectedItem ? handleUpdate : handleCreate}
        defaultValues={selectedItem || undefined}
        isEdit={!!selectedItem}
      />

      <ItemEstoqueDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        item={selectedItem}
      />

      <ImportacaoDialog
        open={importacaoDialogOpen}
        onOpenChange={setImportacaoDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item "{selectedItem?.descricao}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
