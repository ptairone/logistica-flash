import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Wrench, AlertCircle, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { useManutencoes, useAlertasManutencao } from "@/hooks/useManutencoes";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useMecanicos } from "@/hooks/useMecanicos";
import { useAlertasAtivos } from "@/hooks/useAlertasAtivos";
import { ManutencaoCard } from "@/components/manutencoes/ManutencaoCard";
import { ManutencaoDialog } from "@/components/manutencoes/ManutencaoDialog";
import { ManutencaoDetailsDialog } from "@/components/manutencoes/ManutencaoDetailsDialog";
import { AlertaManutencaoDialog } from "@/components/manutencoes/AlertaManutencaoDialog";
import type { ManutencaoFormData, AlertaManutencaoFormData } from "@/lib/validations-manutencao";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function Manutencoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVeiculo, setSelectedVeiculo] = useState<string>("all");
  const [selectedMecanico, setSelectedMecanico] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedManutencao, setSelectedManutencao] = useState<any>(null);
  const [editingManutencao, setEditingManutencao] = useState<any>(null);

  const { manutencoes, isLoading, createManutencao, updateManutencao } = useManutencoes();
  const { alertas, createAlerta } = useAlertasManutencao();
  const { veiculos } = useVeiculos();
  const { mecanicos } = useMecanicos();
  const { data: alertasAtivos = [] } = useAlertasAtivos();

  const handleCreateManutencao = async (data: ManutencaoFormData) => {
    await createManutencao.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleUpdateManutencao = async (data: ManutencaoFormData) => {
    if (editingManutencao) {
      await updateManutencao.mutateAsync({ id: editingManutencao.id, data });
      setEditingManutencao(null);
      setDialogOpen(false);
    }
  };

  const handleStatusChange = async (manutencaoId: string, newStatus: string) => {
    await updateManutencao.mutateAsync({
      id: manutencaoId,
      data: { status: newStatus as any },
    });
  };

  const handleCreateAlerta = async (data: AlertaManutencaoFormData) => {
    await createAlerta.mutateAsync(data);
    setAlertDialogOpen(false);
  };

  const filteredManutencoes = manutencoes.filter((manutencao: any) => {
    const matchesSearch =
      manutencao.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manutencao.veiculo?.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manutencao.veiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVeiculo = selectedVeiculo === "all" || manutencao.veiculo_id === selectedVeiculo;
    const matchesMecanico = selectedMecanico === "all" || manutencao.mecanico_id === selectedMecanico;
    const matchesStatus = selectedStatus === "all" || manutencao.status === selectedStatus;

    return matchesSearch && matchesVeiculo && matchesMecanico && matchesStatus;
  });

  // KPIs
  const today = new Date();
  const agendadasHoje = manutencoes.filter((m: any) => {
    const dataManutencao = new Date(m.data);
    return (
      m.status === 'agendada' &&
      dataManutencao.toDateString() === today.toDateString()
    );
  }).length;

  const emAndamento = manutencoes.filter((m: any) => m.status === 'em_andamento').length;

  const atrasadas = manutencoes.filter((m: any) => {
    const dataManutencao = new Date(m.data);
    return m.status === 'agendada' && dataManutencao < today;
  }).length;

  const custoMensal = manutencoes
    .filter((m: any) => {
      if (m.status !== 'concluida') return false;
      const dataConclusao = m.data_conclusao ? new Date(m.data_conclusao) : new Date(m.data);
      const inicioMes = startOfMonth(today);
      const fimMes = endOfMonth(today);
      return dataConclusao >= inicioMes && dataConclusao <= fimMes && m.custo;
    })
    .reduce((sum: number, m: any) => sum + (m.custo || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manutenções</h1>
            <p className="text-muted-foreground">
              Gerencie as manutenções preventivas e corretivas da frota
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAlertDialogOpen(true)} variant="outline" className="relative">
              <AlertCircle className="h-4 w-4 mr-2" />
              Criar Alerta
              {alertasAtivos.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alertasAtivos.length}
                </Badge>
              )}
            </Button>
            <Button onClick={() => {
              setEditingManutencao(null);
              setDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Manutenção
            </Button>
          </div>
        </div>

        {/* Alertas Críticos */}
        {alertasAtivos.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Alertas de Manutenção Ativados!</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                {alertasAtivos.map((alerta: any) => (
                  <div key={alerta.id} className="text-sm">
                    <span className="font-medium">{alerta.veiculo?.codigo_interno}</span> - {alerta.descricao}
                    {alerta.tipo === 'km' && alerta.km_alerta && (
                      <span className="ml-2 text-xs">
                        (KM atual: {alerta.veiculo?.km_atual?.toLocaleString('pt-BR')} / 
                        Alerta: {alerta.km_alerta.toLocaleString('pt-BR')})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* KPIs Dashboard */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendadas Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agendadasHoje}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emAndamento}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{atrasadas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(custoMensal)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tipo, veículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={selectedVeiculo} onValueChange={setSelectedVeiculo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os veículos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os veículos</SelectItem>
                  {veiculos.map((veiculo: any) => (
                    <SelectItem key={veiculo.id} value={veiculo.id}>
                      {veiculo.codigo_interno}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMecanico} onValueChange={setSelectedMecanico}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os mecânicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os mecânicos</SelectItem>
                  {mecanicos.map((mecanico: any) => (
                    <SelectItem key={mecanico.id} value={mecanico.id}>
                      {mecanico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Manutenções */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredManutencoes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma manutenção encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || selectedVeiculo !== "all" || selectedMecanico !== "all" || selectedStatus !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece cadastrando a primeira manutenção"}
              </p>
              {!searchTerm && selectedVeiculo === "all" && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Manutenção
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredManutencoes.map((manutencao: any) => (
              <ManutencaoCard
                key={manutencao.id}
                manutencao={manutencao}
                onView={() => {
                  setSelectedManutencao(manutencao);
                  setDetailsDialogOpen(true);
                }}
                onEdit={() => {
                  setEditingManutencao(manutencao);
                  setDialogOpen(true);
                }}
                onStatusChange={(newStatus) => handleStatusChange(manutencao.id, newStatus)}
              />
            ))}
          </div>
        )}
      </div>

      <ManutencaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        manutencao={editingManutencao}
        onSubmit={editingManutencao ? handleUpdateManutencao : handleCreateManutencao}
        isSubmitting={createManutencao.isPending || updateManutencao.isPending}
      />

      <ManutencaoDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        manutencao={selectedManutencao}
      />

      <AlertaManutencaoDialog
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        onSubmit={handleCreateAlerta}
        isSubmitting={createAlerta.isPending}
      />
    </MainLayout>
  );
}
