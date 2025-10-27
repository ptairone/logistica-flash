import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDiasAcertoCLT } from "@/hooks/useAcertosCLT";
import { format } from "date-fns";
import { FileDown, User, Calendar, DollarSign } from "lucide-react";

interface AcertoCLTDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acerto: any;
}

export function AcertoCLTDetailsDialog({ open, onOpenChange, acerto }: AcertoCLTDetailsDialogProps) {
  const { data: dias, isLoading } = useDiasAcertoCLT(acerto?.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const statusColors: Record<string, string> = {
    aberto: "bg-yellow-500",
    aprovado: "bg-blue-500",
    pago: "bg-green-500",
    cancelado: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    aberto: "Aberto",
    aprovado: "Aprovado",
    pago: "Pago",
    cancelado: "Cancelado",
  };

  const diasSemanaLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (!acerto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Acerto CLT - {acerto.codigo}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="resumo">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="dias">Dias Trabalhados</TabsTrigger>
            <TabsTrigger value="exportar">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Informações Gerais</CardTitle>
                  <Badge className={statusColors[acerto.status]}>
                    {statusLabels[acerto.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Motorista</p>
                      <p className="font-medium">{acerto.motorista?.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Período</p>
                      <p className="font-medium">
                        {format(new Date(acerto.periodo_inicio), "dd/MM/yyyy")} -{" "}
                        {format(new Date(acerto.periodo_fim), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Composição do Acerto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Salário Base:</span>
                      <span className="font-medium">{formatCurrency(acerto.salario_base)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Diárias ({acerto.dias_trabalhados}):
                      </span>
                      <span className="font-medium">{formatCurrency(acerto.total_diarias)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Horas Extras ({acerto.total_horas_extras?.toFixed(1)}h):
                      </span>
                      <span className="font-medium">
                        {formatCurrency(acerto.total_horas_extras * 19.64)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Fim de Semana ({acerto.total_horas_fds?.toFixed(1)}h):
                      </span>
                      <span className="font-medium">{formatCurrency(acerto.valor_horas_fds)}</span>
                    </div>
                    {acerto.total_horas_feriados > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Feriados ({acerto.total_horas_feriados?.toFixed(1)}h):
                        </span>
                        <span className="font-medium">
                          {formatCurrency(acerto.valor_horas_feriados)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Descontos:</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(acerto.total_descontos || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Bruto:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(acerto.total_bruto)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-semibold">Total Líquido:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(acerto.total_liquido)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {acerto.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {acerto.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dias" className="space-y-4">
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left">Data</th>
                          <th className="p-3 text-left">Dia</th>
                          <th className="p-3 text-right">Horas Totais</th>
                          <th className="p-3 text-right">Horas Extras</th>
                          <th className="p-3 text-right">Diária</th>
                          <th className="p-3 text-right">HE</th>
                          <th className="p-3 text-right">FDS</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dias?.map((dia: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{format(new Date(dia.data), "dd/MM/yyyy")}</td>
                            <td className="p-3">
                              {diasSemanaLabels[dia.dia_semana]}
                              {dia.eh_feriado && (
                                <Badge variant="secondary" className="ml-2">
                                  Feriado
                                </Badge>
                              )}
                            </td>
                            <td className="p-3 text-right">{dia.horas_totais.toFixed(1)}h</td>
                            <td className="p-3 text-right">{dia.horas_extras.toFixed(1)}h</td>
                            <td className="p-3 text-right">{formatCurrency(dia.valor_diaria)}</td>
                            <td className="p-3 text-right">
                              {formatCurrency(dia.valor_horas_extras)}
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(dia.valor_adicional_fds || 0)}
                            </td>
                            <td className="p-3 text-right font-medium">
                              {formatCurrency(dia.valor_total_dia)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted font-semibold">
                        <tr className="border-t-2">
                          <td colSpan={2} className="p-3">
                            Total
                          </td>
                          <td className="p-3 text-right">
                            {dias?.reduce((acc: number, d: any) => acc + d.horas_totais, 0).toFixed(1)}h
                          </td>
                          <td className="p-3 text-right">
                            {dias?.reduce((acc: number, d: any) => acc + d.horas_extras, 0).toFixed(1)}h
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(dias?.reduce((acc: number, d: any) => acc + d.valor_diaria, 0) || 0)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(dias?.reduce((acc: number, d: any) => acc + d.valor_horas_extras, 0) || 0)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(dias?.reduce((acc: number, d: any) => acc + (d.valor_adicional_fds || 0), 0) || 0)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(dias?.reduce((acc: number, d: any) => acc + d.valor_total_dia, 0) || 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="exportar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Acerto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <FileDown className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button className="w-full" variant="outline">
                  <FileDown className="h-4 w-4 mr-2" />
                  Baixar Excel
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
