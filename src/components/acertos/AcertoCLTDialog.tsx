import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { acertoCLTSchema, type AcertoCLT, type DiaTrabalhadoCLT } from "@/lib/validations-acerto-clt";
import { useMotoristas } from "@/hooks/useMotoristas";
import { useConfigCLT, useProcessarRelatorio, calcularAcertoCLT } from "@/hooks/useAcertosCLT";
import { format } from "date-fns";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface AcertoCLTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (acerto: AcertoCLT, dias: DiaTrabalhadoCLT[]) => void;
  acerto?: any;
}

export function AcertoCLTDialog({ open, onOpenChange, onSubmit, acerto }: AcertoCLTDialogProps) {
  const { motoristas } = useMotoristas();
  const [selectedMotorista, setSelectedMotorista] = useState<string | null>(null);
  const { data: config } = useConfigCLT(selectedMotorista);
  const { mutateAsync: processarRelatorio, isPending: isProcessing } = useProcessarRelatorio();
  
  const [dias, setDias] = useState<DiaTrabalhadoCLT[]>([]);
  const [feriados, setFeriados] = useState<string[]>([]);
  const [novaDataFeriado, setNovaDataFeriado] = useState("");
  const [nomeFeriado, setNomeFeriado] = useState("");
  const [progressoConversao, setProgressoConversao] = useState({ atual: 0, total: 0 });

  const form = useForm<AcertoCLT>({
    resolver: zodResolver(acertoCLTSchema),
    defaultValues: {
      motorista_id: "",
      periodo_inicio: "",
      periodo_fim: "",
      salario_base: 2700,
      observacoes: "",
      tipo_entrada: "manual",
      status: "aberto",
    },
  });

  const watchedMotorista = form.watch("motorista_id");

  useEffect(() => {
    if (watchedMotorista) {
      setSelectedMotorista(watchedMotorista);
    }
  }, [watchedMotorista]);

  useEffect(() => {
    if (config) {
      form.setValue("salario_base", config.salario_base);
    }
  }, [config, form]);

  useEffect(() => {
    const inicio = form.watch("periodo_inicio");
    const motorista = form.watch("motorista_id");
    
    if (inicio && motorista) {
      const motoristaData = motoristas?.find(m => m.id === motorista);
      const mes = format(new Date(inicio), "MM");
      const ano = format(new Date(inicio), "yyyy");
      const codigo = `CLT-${mes}${ano}-${motoristaData?.nome.split(' ')[0].toUpperCase()}`;
      form.setValue("codigo", codigo);
    }
  }, [form.watch("periodo_inicio"), form.watch("motorista_id"), motoristas, form]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!config) {
      toast.error("Configure os valores CLT do motorista primeiro");
      return;
    }

    try {
      let paginasBase64: string[] = [];

      // Se for PDF, converter todas as páginas
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        toast.info(`Convertendo ${numPages} páginas do PDF...`);
        setProgressoConversao({ atual: 0, total: numPages });

        // Converter cada página
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          setProgressoConversao({ atual: pageNum, total: numPages });
          
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas não suportado');
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          const renderContext: any = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
          
          // Converter para PNG base64
          const base64 = canvas.toDataURL('image/png');
          paginasBase64.push(base64);
        }

        toast.success(`${numPages} páginas convertidas com sucesso!`);
      } else if (file.type.startsWith('image/')) {
        // Se for imagem, apenas converter para base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        paginasBase64.push(base64);
      } else {
        throw new Error('Formato de arquivo não suportado. Use PDF ou imagens (PNG/JPG).');
      }

      // Processar com a edge function
      toast.info("Enviando para processamento...");
      setProgressoConversao({ atual: 0, total: 0 });
      
      const resultado = await processarRelatorio({
        imagens: paginasBase64,
        fileName: file.name
      });

      // Converter dados do rastreador para dias trabalhados
      const diasProcessados: DiaTrabalhadoCLT[] = resultado.dias.map((dia: any) => {
        const horasTrabalhadas = dia.horas_trabalhadas;
        const horasExtras = Math.max(0, horasTrabalhadas - 8);
        const horasNormais = Math.min(horasTrabalhadas, 8);
        const isFimDeSemana = dia.dia_semana === 0 || dia.dia_semana === 6;
        const isFeriado = feriados.includes(dia.data);

        let valorDiaria = horasTrabalhadas > 0 ? config.valor_diaria : 0;
        let valorHE = horasExtras * config.valor_hora_extra;
        let valorFds = isFimDeSemana ? horasTrabalhadas * config.valor_hora_fds : 0;
        let valorFeriado = isFeriado ? horasTrabalhadas * config.valor_hora_feriado : 0;

        return {
          data: dia.data,
          dia_semana: dia.dia_semana,
          horas_totais: horasTrabalhadas,
          horas_normais: horasNormais,
          horas_extras: horasExtras,
          horas_em_movimento: dia.horas_em_movimento || 0,
          horas_parado_ligado: dia.horas_parado_ligado || 0,
          valor_diaria: valorDiaria,
          valor_horas_extras: valorHE,
          valor_adicional_fds: valorFds,
          valor_adicional_feriado: valorFeriado,
          valor_total_dia: valorDiaria + valorHE + valorFds + valorFeriado,
          eh_feriado: isFeriado,
          origem: 'pdf' as const,
          dados_rastreador: dia,
        };
      });

      setDias(diasProcessados);
      form.setValue("tipo_entrada", "pdf");
      toast.success(`${diasProcessados.length} dias processados com sucesso!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao processar relatório");
    } finally {
      setProgressoConversao({ atual: 0, total: 0 });
    }
  };

  const adicionarDiaManual = () => {
    if (!config) {
      toast.error("Configure os valores CLT do motorista primeiro");
      return;
    }

    const novoDia: DiaTrabalhadoCLT = {
      data: format(new Date(), "yyyy-MM-dd"),
      dia_semana: new Date().getDay(),
      horas_totais: 8,
      horas_normais: 8,
      horas_extras: 0,
      valor_diaria: config.valor_diaria,
      valor_horas_extras: 0,
      valor_adicional_fds: 0,
      valor_adicional_feriado: 0,
      valor_total_dia: config.valor_diaria,
      eh_feriado: false,
      origem: 'manual',
    };

    setDias([...dias, novoDia]);
  };

  const removerDia = (index: number) => {
    setDias(dias.filter((_, i) => i !== index));
  };

  const atualizarDia = (index: number, campo: keyof DiaTrabalhadoCLT, valor: any) => {
    const novosDias = [...dias];
    const dia = { ...novosDias[index] };
    
    if (campo === 'horas_totais') {
      const horasTotais = parseFloat(valor) || 0;
      dia.horas_totais = horasTotais;
      dia.horas_normais = Math.min(horasTotais, 8);
      dia.horas_extras = Math.max(0, horasTotais - 8);
      
      if (config) {
        const isFimDeSemana = dia.dia_semana === 0 || dia.dia_semana === 6;
        dia.valor_diaria = horasTotais > 0 ? config.valor_diaria : 0;
        dia.valor_horas_extras = dia.horas_extras * config.valor_hora_extra;
        dia.valor_adicional_fds = isFimDeSemana ? horasTotais * config.valor_hora_fds : 0;
        dia.valor_adicional_feriado = dia.eh_feriado ? horasTotais * config.valor_hora_feriado : 0;
        dia.valor_total_dia = dia.valor_diaria + dia.valor_horas_extras + (dia.valor_adicional_fds || 0) + (dia.valor_adicional_feriado || 0);
      }
    } else {
      (dia as any)[campo] = valor;
    }

    novosDias[index] = dia;
    setDias(novosDias);
  };

  const adicionarFeriado = () => {
    if (!novaDataFeriado) return;
    
    setFeriados([...feriados, novaDataFeriado]);
    
    // Atualizar dias que coincidem com o feriado
    const novosDias = dias.map(dia => {
      if (dia.data === novaDataFeriado && config) {
        return {
          ...dia,
          eh_feriado: true,
          nome_feriado: nomeFeriado,
          valor_adicional_feriado: dia.horas_totais * config.valor_hora_feriado,
          valor_total_dia: dia.valor_diaria + dia.valor_horas_extras + (dia.valor_adicional_fds || 0) + (dia.horas_totais * config.valor_hora_feriado),
        };
      }
      return dia;
    });
    
    setDias(novosDias);
    setNovaDataFeriado("");
    setNomeFeriado("");
  };

  const calculos = config ? calcularAcertoCLT(config, dias) : null;

  const handleSubmit = (data: AcertoCLT) => {
    if (dias.length === 0) {
      toast.error("Adicione pelo menos um dia trabalhado");
      return;
    }

    if (!calculos) return;

    const acertoCompleto: AcertoCLT = {
      ...data,
      ...calculos,
    };

    onSubmit(acertoCompleto, dias);
    onOpenChange(false);
  };

  const diasSemanaLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{acerto ? "Editar" : "Novo"} Acerto CLT</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="motorista_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motorista</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motorista" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {motoristas?.map((motorista) => (
                          <SelectItem key={motorista.id} value={motorista.id}>
                            {motorista.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salario_base"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário Base</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="periodo_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodo_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período Fim</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Importar Relatório PDF ou Imagem
                    </label>
                    <Input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg"
                      onChange={handleFileUpload}
                      disabled={isProcessing || !config}
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground pt-6">
                    OU
                  </div>
                  <div className="pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={adicionarDiaManual}
                      disabled={!config}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Dia Manual
                    </Button>
                  </div>
                </div>

                {progressoConversao.total > 0 && (
                  <div className="space-y-2">
                    <Progress value={(progressoConversao.atual / progressoConversao.total) * 100} />
                    <p className="text-sm text-muted-foreground text-center">
                      Convertendo página {progressoConversao.atual} de {progressoConversao.total}
                    </p>
                  </div>
                )}

                {!config && selectedMotorista && (
                  <p className="text-sm text-amber-600">
                    Configure os valores CLT do motorista primeiro
                  </p>
                )}
              </CardContent>
            </Card>

            {dias.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Dias Trabalhados ({dias.length})</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Data</th>
                        <th className="p-2 text-left">Dia</th>
                        <th className="p-2 text-right">Horas</th>
                        <th className="p-2 text-right">HE</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dias.map((dia, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            {format(new Date(dia.data), "dd/MM/yyyy")}
                          </td>
                          <td className="p-2">
                            {diasSemanaLabels[dia.dia_semana]}
                            {dia.eh_feriado && (
                              <Badge variant="secondary" className="ml-2">Feriado</Badge>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            <Input
                              type="number"
                              step="0.1"
                              value={dia.horas_totais}
                              onChange={(e) => atualizarDia(index, 'horas_totais', e.target.value)}
                              className="w-20 text-right"
                            />
                          </td>
                          <td className="p-2 text-right">{dia.horas_extras.toFixed(1)}h</td>
                          <td className="p-2 text-right font-medium">
                            R$ {dia.valor_total_dia.toFixed(2)}
                          </td>
                          <td className="p-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removerDia(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold">Adicionar Feriado</h3>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={novaDataFeriado}
                    onChange={(e) => setNovaDataFeriado(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Nome do feriado"
                    value={nomeFeriado}
                    onChange={(e) => setNomeFeriado(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={adicionarFeriado}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {feriados.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {feriados.map((feriado, index) => (
                      <Badge key={index} variant="secondary">
                        {format(new Date(feriado), "dd/MM/yyyy")}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {calculos && (
              <Card className="bg-muted">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumo Financeiro
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Salário Base:</span>
                      <span className="font-medium ml-2">
                        R$ {calculos.salario_base.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Diárias ({calculos.dias_trabalhados}):</span>
                      <span className="font-medium ml-2">
                        R$ {calculos.total_diarias.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">HE ({calculos.total_horas_extras.toFixed(1)}h):</span>
                      <span className="font-medium ml-2">
                        R$ {calculos.valor_horas_fds.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fim de Semana ({calculos.total_horas_fds.toFixed(1)}h):</span>
                      <span className="font-medium ml-2">
                        R$ {calculos.valor_horas_fds.toFixed(2)}
                      </span>
                    </div>
                    {calculos.total_horas_feriados > 0 && (
                      <div>
                        <span className="text-muted-foreground">Feriados ({calculos.total_horas_feriados.toFixed(1)}h):</span>
                        <span className="font-medium ml-2">
                          R$ {calculos.valor_horas_feriados.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">TOTAL A PAGAR:</span>
                      <span className="text-2xl font-bold text-green-600">
                        R$ {calculos.total_liquido.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={dias.length === 0}>
                {acerto ? "Atualizar" : "Criar"} Acerto
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
