import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileSpreadsheet, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcertoCard } from "@/components/acertos/AcertoCard";
import { AcertoDialogWizard } from "@/components/acertos/AcertoDialogWizard";
import { AcertoDetailsDialog } from "@/components/acertos/AcertoDetailsDialog";
import { AcertoCLTCard } from "@/components/acertos/AcertoCLTCard";
import { AcertoCLTDialog } from "@/components/acertos/AcertoCLTDialog";
import { AcertoCLTDetailsDialog } from "@/components/acertos/AcertoCLTDetailsDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAcertos, useVincularViagens } from "@/hooks/useAcertos";
import { useAcertosCLT } from "@/hooks/useAcertosCLT";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Acertos() {
  const navigate = useNavigate();
  const { acertos, isLoading, createAcerto, updateAcerto, deleteAcerto } = useAcertos();
  const vincularViagens = useVincularViagens();
  const { acertos: acertosCLT, isLoading: isLoadingCLT, createAcertoCLT, updateAcertoCLT, deleteAcertoCLT } = useAcertosCLT();

  // Estados para acertos por comissão
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAcerto, setSelectedAcerto] = useState<any>(null);
  const [acertoToDelete, setAcertoToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estados para acertos CLT
  const [dialogCLTOpen, setDialogCLTOpen] = useState(false);
  const [detailsCLTDialogOpen, setDetailsCLTDialogOpen] = useState(false);
  const [deleteCLTDialogOpen, setDeleteCLTDialogOpen] = useState(false);
  const [selectedAcertoCLT, setSelectedAcertoCLT] = useState<any>(null);
  const [acertoCLTToDelete, setAcertoCLTToDelete] = useState<string | null>(null);
  const [searchTermCLT, setSearchTermCLT] = useState('');
  const [statusFilterCLT, setStatusFilterCLT] = useState<string>('all');

  // Handlers para acertos por comissão
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

  const handleSubmit = async (data: any, viagemIds: string[]) => {
    if (selectedAcerto) {
      updateAcerto.mutate({ id: selectedAcerto.id, data }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createAcerto.mutate(data, {
        onSuccess: (acerto) => {
          if (viagemIds.length > 0) {
            vincularViagens.mutate({ viagemIds, acertoId: acerto.id });
          }
          setDialogOpen(false);
        },
      });
    }
  };

  // Handlers para acertos CLT
  const handleCreateCLT = () => {
    setSelectedAcertoCLT(null);
    setDialogCLTOpen(true);
  };

  const handleEditCLT = (acerto: any) => {
    setSelectedAcertoCLT(acerto);
    setDialogCLTOpen(true);
  };

  const handleDeleteCLT = (id: string) => {
    setAcertoCLTToDelete(id);
    setDeleteCLTDialogOpen(true);
  };

  const confirmDeleteCLT = () => {
    if (acertoCLTToDelete) {
      deleteAcertoCLT.mutate(acertoCLTToDelete);
      setDeleteCLTDialogOpen(false);
      setAcertoCLTToDelete(null);
    }
  };

  const handleViewDetailsCLT = (acerto: any) => {
    setSelectedAcertoCLT(acerto);
    setDetailsCLTDialogOpen(true);
  };

  const handleSubmitCLT = (acertoData: any, dias: any[]) => {
    if (selectedAcertoCLT) {
      updateAcertoCLT.mutate({ id: selectedAcertoCLT.id, acerto: acertoData, dias }, { onSuccess: () => setDialogCLTOpen(false) });
    } else {
      createAcertoCLT.mutate({ acerto: acertoData, dias }, { onSuccess: () => setDialogCLTOpen(false) });
    }
  };

  const filteredAcertos = acertos?.filter((acerto) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = acerto.codigo?.toLowerCase().includes(search) || acerto.motorista?.nome?.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'all' || acerto.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredAcertosCLT = acertosCLT?.filter((acerto) => {
    const search = searchTermCLT.toLowerCase();
    const matchesSearch = acerto.codigo?.toLowerCase().includes(search) || acerto.motorista?.nome?.toLowerCase().includes(search);
    const matchesStatus = statusFilterCLT === 'all' || acerto.status === statusFilterCLT;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Acertos</h2>
            <p className="text-muted-foreground">Fechamento financeiro dos motoristas</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/acerto-completo')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Acerto Completo (Planilha)
          </Button>
        </div>

        <Tabs defaultValue="comissao" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="comissao">Por Comissão</TabsTrigger>
            <TabsTrigger value="clt">CLT</TabsTrigger>
          </TabsList>

          <TabsContent value="comissao" className="space-y-6">
            <div className="flex items-center justify-between">
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Acerto
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por código ou motorista..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_revisao">Em Revisão</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
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
                <p className="text-muted-foreground">{searchTerm || statusFilter !== 'all' ? 'Nenhum acerto encontrado' : 'Nenhum acerto cadastrado'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAcertos.map((acerto) => (
                  <AcertoCard key={acerto.id} acerto={acerto} onEdit={handleEdit} onDelete={handleDelete} onViewDetails={handleViewDetails} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="clt" className="space-y-6">
            <div className="flex items-center justify-between">
              <Button onClick={handleCreateCLT}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Acerto CLT
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por código ou motorista..." value={searchTermCLT} onChange={(e) => setSearchTermCLT(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilterCLT} onValueChange={setStatusFilterCLT}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoadingCLT ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando acertos CLT...</p>
              </div>
            ) : filteredAcertosCLT.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{searchTermCLT || statusFilterCLT !== 'all' ? 'Nenhum acerto CLT encontrado' : 'Nenhum acerto CLT cadastrado'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAcertosCLT.map((acerto) => (
                  <AcertoCLTCard key={acerto.id} acerto={acerto} onView={handleViewDetailsCLT} onEdit={handleEditCLT} onDelete={() => handleDeleteCLT(acerto.id)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AcertoDialogWizard open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} acerto={selectedAcerto} isLoading={createAcerto.isPending || updateAcerto.isPending} />
      <AcertoDetailsDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} acerto={selectedAcerto} />
      <AcertoCLTDialog open={dialogCLTOpen} onOpenChange={setDialogCLTOpen} onSubmit={handleSubmitCLT} acerto={selectedAcertoCLT} />
      <AcertoCLTDetailsDialog open={detailsCLTDialogOpen} onOpenChange={setDetailsCLTDialogOpen} acerto={selectedAcertoCLT} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este acerto? As viagens vinculadas ficarão disponíveis para novo acerto.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteCLTDialogOpen} onOpenChange={setDeleteCLTDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este acerto CLT?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCLT}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
