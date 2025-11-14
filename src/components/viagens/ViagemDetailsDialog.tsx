import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Trash2, Plus, DollarSign, Banknote, TrendingUp, Download, Package, Camera, Phone, ImageIcon, Calendar } from 'lucide-react';
import { formatDateBR } from '@/lib/validations';
import { useDespesas, useComprovantesViagem } from '@/hooks/useViagens';
import { useTransacoesViagem } from '@/hooks/useTransacoesViagem';
import { useComprovantesWhatsApp } from '@/hooks/useComprovantesWhatsApp';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { DespesaDialog } from './DespesaDialog';
import { TransacaoDialog } from './TransacaoDialog';
import { calcularTotaisViagem } from '@/lib/validations-viagem';
import { DriverFormLinkCard } from './DriverFormLinkCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { gerarPDFViagem } from '@/lib/pdf-export-utils';
import { exportarViagemComComprovantes } from '@/lib/zip-export-utils';
import { MapaLocalizacoes } from '@/components/admin/MapaLocalizacoes';
import { PhotoGallery } from './PhotoGallery';
import { Badge } from '@/components/ui/badge';

interface ViagemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagem: any;
}

export function ViagemDetailsDialog({ open, onOpenChange, viagem }: ViagemDetailsDialogProps) {
  const queryClient = useQueryClient();
  const { despesas, createDespesa, deleteDespesa } = useDespesas(viagem?.id);
  const { comprovantes, uploadComprovante } = useComprovantesViagem(viagem?.id);
  const { transacoes, createTransacao, deleteTransacao, totais: totaisTransacoes } = useTransacoesViagem(viagem?.id);
  const { comprovantes: comprovantesWhatsApp, isLoading: isLoadingWhatsApp } = useComprovantesWhatsApp(undefined, viagem?.id);
  const [despesaDialogOpen, setDespesaDialogOpen] = useState(false);
  const [transacaoDialogOpen, setTransacaoDialogOpen] = useState(false);
  const [deleteDespesaDialogOpen, setDeleteDespesaDialogOpen] = useState(false);
  const [deleteTransacaoDialogOpen, setDeleteTransacaoDialogOpen] = useState(false);
  const [despesaToDelete, setDespesaToDelete] = useState<string | null>(null);
  const [transacaoToDelete, setTransacaoToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tipoComprovante, setTipoComprovante] = useState<'adiantamento' | 'recebimento_frete' | 'despesa' | 'outros'>('outros');
  const [comprovanteData, setComprovanteData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  // Buscar total de fotos
  const { data: totalFotos } = useQuery({
    queryKey: ['total-fotos', viagem?.id],
    queryFn: async () => {
      if (!viagem) return 0;
      const { count } = await supabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_entidade', 'viagem')
        .eq('entidade_id', viagem.id)
        .eq('tipo_documento', 'foto');
      return count || 0;
    },
    enabled: !!viagem,
  });

  if (!viagem) return null;

  const totaisViagem = calcularTotaisViagem(
    despesas,
    viagem.km_percorrido,
    viagem.frete?.valor_frete
  );

  const getTipoLabel = (tipo: string | null) => {
    if (!tipo) return 'Desconhecido';
    const labels: Record<string, string> = {
      'HODOMETRO': 'Hodômetro',
      'ABASTECIMENTO': 'Abastecimento',
      'DESPESA_ALIMENTACAO': 'Alimentação',
      'DESPESA_PEDAGIO': 'Pedágio',
      'DESPESA_HOSPEDAGEM': 'Hospedagem',
      'DESPESA_MANUTENCAO': 'Manutenção',
      'DESPESA_OUTRAS': 'Outras Despesas',
      'RECEBIMENTO': 'Recebimento',
      'ADIANTAMENTO': 'Adiantamento',
      'DESCONHECIDO': 'Desconhecido',
    };
    return labels[tipo] || tipo;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'processando': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'erro': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'rejeitado': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getConfiancaColor = (confianca: string | null) => {
    switch (confianca) {
      case 'alta': return 'text-green-600 dark:text-green-400';
      case 'media': return 'text-yellow-600 dark:text-yellow-400';
      case 'baixa': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viagem) return;
    
    setUploading(true);
    try {
      // Upload do arquivo para o storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${viagem.id}/comprovante_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(filePath);

      // Salvar documento
      const { error: docError } = await supabase
        .from('documentos')
        .insert({
          tipo_entidade: 'viagem',
          entidade_id: viagem.id,
          nome: file.name,
          tipo_documento: 'comprovante',
          url: publicUrl,
          tamanho: file.size,
          mime_type: file.type,
        });

      if (docError) throw docError;

      // Invalidar queries para atualizar a lista de comprovantes
      queryClient.invalidateQueries({ queryKey: ['comprovantes-viagem', viagem.id] });

      // Processar com OpenAI e criar automaticamente
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('viagemId', viagem.id);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/processar-comprovante`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Dados extraídos:', data);

          // Criar transação ou despesa automaticamente
          if (tipoComprovante === 'adiantamento' || tipoComprovante === 'recebimento_frete') {
            const { error: transacaoError } = await supabase
              .from('transacoes_viagem')
              .insert({
                viagem_id: viagem.id,
                tipo: tipoComprovante === 'adiantamento' ? 'adiantamento' : 'recebimento_frete',
                valor: data.valor || 0,
                data: data.data || new Date().toISOString().split('T')[0],
                descricao: data.descricao || `${tipoComprovante} via comprovante`,
              });

            if (transacaoError) throw transacaoError;
            queryClient.invalidateQueries({ queryKey: ['transacoes-viagem', viagem.id] });
            toast.success(`${tipoComprovante === 'adiantamento' ? 'Adiantamento' : 'Recebimento de frete'} adicionado automaticamente`);
          } else if (tipoComprovante === 'despesa') {
            const { error: despesaError } = await supabase
              .from('despesas')
              .insert({
                viagem_id: viagem.id,
                tipo: data.tipo || 'outros',
                valor: data.valor || 0,
                data: data.data || new Date().toISOString().split('T')[0],
                descricao: data.descricao || 'Despesa via comprovante',
                reembolsavel: data.reembolsavel ?? true,
              });

            if (despesaError) throw despesaError;
            queryClient.invalidateQueries({ queryKey: ['despesas-viagem', viagem.id] });
            toast.success('Despesa adicionada automaticamente');
          } else {
            toast.success('Comprovante salvo com sucesso');
          }
        } else {
          console.log('Processamento automático não disponível');
          toast.success('Comprovante salvo (processamento automático indisponível)');
        }
      } catch (aiError) {
        console.error('Erro ao processar com IA:', aiError);
        toast.success('Comprovante salvo, mas não foi possível processar automaticamente');
      }

      setTipoComprovante('outros');
      e.target.value = '';
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDespesa = (id: string) => {
    setDespesaToDelete(id);
    setDeleteDespesaDialogOpen(true);
  };

  const confirmDeleteDespesa = () => {
    if (despesaToDelete) {
      deleteDespesa.mutate(despesaToDelete);
      setDeleteDespesaDialogOpen(false);
      setDespesaToDelete(null);
    }
  };

  const getTipoDespesaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      combustivel: 'Combustível',
      pedagio: 'Pedágio',
      alimentacao: 'Alimentação',
      hospedagem: 'Hospedagem',
      manutencao: 'Manutenção',
      outros: 'Outros',
    };
    return labels[tipo] || tipo;
  };

  const getTipoTransacaoLabel = (tipo: string) => {
    return tipo === 'adiantamento' ? 'Adiantamento' : 'Recebimento de Frete';
  };

  const handleDeleteTransacao = (id: string) => {
    setTransacaoToDelete(id);
    setDeleteTransacaoDialogOpen(true);
  };

  const confirmDeleteTransacao = () => {
    if (transacaoToDelete) {
      deleteTransacao.mutate(transacaoToDelete);
      setDeleteTransacaoDialogOpen(false);
      setTransacaoToDelete(null);
    }
  };

  const handleExportPDF = async () => {
    if (!viagem) return;
    try {
      setExporting(true);
      await gerarPDFViagem(viagem, despesas, transacoes, comprovantes);
      toast.success('PDF gerado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportZIP = async () => {
    if (!viagem) return;
    try {
      setExporting(true);
      await exportarViagemComComprovantes(viagem, despesas, transacoes, comprovantes);
      toast.success('Arquivo ZIP gerado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar ZIP:', error);
      toast.error('Erro ao gerar arquivo ZIP');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg md:text-xl break-words">Detalhes da Viagem - {viagem.codigo}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <DriverFormLinkCard viagemId={viagem.id} />
        </div>

        <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
              <TabsTrigger value="info" className="text-xs md:text-sm">
                <span className="hidden sm:inline">📋 Informações</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="text-xs md:text-sm">
                <span className="hidden sm:inline">💰 Financeiro</span>
                <span className="sm:hidden">$$</span>
              </TabsTrigger>
              <TabsTrigger value="despesas" className="text-xs md:text-sm">
                <span className="hidden sm:inline">🧾 Despesas</span>
                <span className="sm:hidden">Desp.</span>
              </TabsTrigger>
              <TabsTrigger value="comprovantes" className="text-xs md:text-sm">
                <span className="hidden sm:inline">📄 Comprovantes</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="fotos" className="flex items-center gap-1 text-xs md:text-sm">
                <Camera className="h-3 w-3" />
                <span className="hidden sm:inline">Fotos</span>
                {totalFotos && totalFotos > 0 ? (
                  <Badge variant="secondary" className="ml-1 text-xs px-1">{totalFotos}</Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="localizacoes" className="text-xs md:text-sm">
                <span className="hidden sm:inline">📍 Localizações</span>
                <span className="sm:hidden">Local</span>
              </TabsTrigger>
              <TabsTrigger value="calculos" className="text-xs md:text-sm">
                <span className="hidden sm:inline">🧮 Cálculos</span>
                <span className="sm:hidden">Calc.</span>
              </TabsTrigger>
              <TabsTrigger value="exportar" className="text-xs md:text-sm">
                <span className="hidden sm:inline">⬇️ Exportar</span>
                <span className="sm:hidden">Export</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-xs md:text-sm text-muted-foreground font-medium">Veículo</Label>
                  <p className="text-sm md:text-base font-semibold break-words">{viagem.veiculo?.placa} - {viagem.veiculo?.marca} {viagem.veiculo?.modelo}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs md:text-sm text-muted-foreground font-medium">Motorista</Label>
                  <p className="text-sm md:text-base font-semibold break-words">{viagem.motorista?.nome}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs md:text-sm text-muted-foreground font-medium">Origem</Label>
                  <p className="text-sm md:text-base font-semibold break-words" title={viagem.origem}>{viagem.origem}</p>
                  {viagem.origem_cep && (
                    <Badge variant="outline" className="text-xs mt-1">
                      📍 {viagem.origem_cep}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs md:text-sm text-muted-foreground font-medium">Destino</Label>
                  <p className="text-sm md:text-base font-semibold break-words" title={viagem.destino}>{viagem.destino}</p>
                  {viagem.destino_cep && (
                    <Badge variant="outline" className="text-xs mt-1">
                      📍 {viagem.destino_cep}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs md:text-sm text-muted-foreground font-medium">Data Saída</Label>
                  <p className="text-sm md:text-base font-semibold">{formatDateBR(viagem.data_saida)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs md:text-sm text-muted-foreground font-medium">Data Chegada</Label>
                  <p className="text-sm md:text-base font-semibold">{formatDateBR(viagem.data_chegada)}</p>
                </div>
                {viagem.km_estimado && (
                  <div className="space-y-1">
                    <Label className="text-xs md:text-sm text-muted-foreground font-medium">KM Estimado (Planejado)</Label>
                    <p className="text-sm md:text-base font-semibold">{viagem.km_estimado?.toLocaleString('pt-BR')} km</p>
                  </div>
                )}
                {viagem.km_inicial && (
                  <div className="space-y-1">
                    <Label className="text-xs md:text-sm text-muted-foreground font-medium">KM Inicial</Label>
                    <p className="text-sm md:text-base font-semibold">{viagem.km_inicial?.toLocaleString('pt-BR')} km</p>
                  </div>
                )}
                {viagem.km_final && (
                  <div className="space-y-1">
                    <Label className="text-xs md:text-sm text-muted-foreground font-medium">KM Final</Label>
                    <p className="text-sm md:text-base font-semibold">{viagem.km_final?.toLocaleString('pt-BR')} km</p>
                  </div>
                )}
                {viagem.km_percorrido && (
                  <div className="space-y-1">
                    <Label className="text-xs md:text-sm text-muted-foreground font-medium">KM Percorrido (Calculado)</Label>
                    <p className="text-sm md:text-base font-bold text-primary">{viagem.km_percorrido?.toLocaleString('pt-BR')} km</p>
                  </div>
                )}
              </div>

              {viagem.frete && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-4 text-base md:text-lg">🚚 Frete Vinculado</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-xs md:text-sm text-muted-foreground font-medium">Código</Label>
                      <p className="text-sm md:text-base font-semibold">{viagem.frete.codigo}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs md:text-sm text-muted-foreground font-medium">Cliente</Label>
                      <p className="text-sm md:text-base font-semibold break-words leading-tight">{viagem.frete.cliente_nome}</p>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs md:text-sm text-muted-foreground font-medium">Valor do Frete</Label>
                      <p className="font-bold text-lg md:text-2xl text-primary">
                        R$ {viagem.frete.valor_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {viagem.notas && (
                <div className="pt-6 border-t">
                  <Label className="text-xs md:text-sm text-muted-foreground font-medium">📝 Notas</Label>
                  <p className="text-sm md:text-base mt-2 break-words leading-relaxed">{viagem.notas}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-amber-600" />
                        <Label className="text-muted-foreground">Total Adiantamentos</Label>
                      </div>
                      <p className="text-2xl font-bold text-amber-600 mt-1">
                        R$ {totaisTransacoes.adiantamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <Label className="text-muted-foreground">Total Recebimentos</Label>
                      </div>
                      <p className="text-2xl font-bold text-primary mt-1">
                        R$ {totaisTransacoes.recebimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Button onClick={() => setTransacaoDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-2">
                {transacoes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma transação registrada
                  </p>
                ) : (
                  transacoes.map((transacao) => (
                    <Card key={transacao.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {transacao.tipo === 'adiantamento' ? (
                              <Banknote className="h-5 w-5 text-amber-600 mt-0.5" />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{getTipoTransacaoLabel(transacao.tipo)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDateBR(transacao.data)}
                                  </p>
                                </div>
                                <p className={`font-medium ${transacao.tipo === 'adiantamento' ? 'text-amber-600' : 'text-primary'}`}>
                                  R$ {Number(transacao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              {transacao.descricao && (
                                <p className="text-sm mt-2 text-muted-foreground">{transacao.descricao}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransacao(transacao.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="despesas" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Total: R$ {totaisViagem.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <Button onClick={() => setDespesaDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Despesa
                </Button>
              </div>

              <div className="space-y-2">
                {despesas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma despesa registrada
                  </p>
                ) : (
                  despesas.map((despesa) => (
                    <Card key={despesa.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{getTipoDespesaLabel(despesa.tipo)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDateBR(despesa.data)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-primary">
                                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                  {despesa.reembolsavel && (
                                    <p className="text-xs text-muted-foreground">Reembolsável</p>
                                  )}
                                </div>
                              </div>
                              {despesa.descricao && (
                                <p className="text-sm mt-2">{despesa.descricao}</p>
                              )}
                              
                              {/* Mostrar anexo se existir */}
                              {despesa.anexo_url && (
                                <div className="mt-3 border-t pt-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Camera className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Comprovante anexado</p>
                                  </div>
                                  <a 
                                    href={despesa.anexo_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img 
                                      src={despesa.anexo_url}
                                      alt="Comprovante da despesa"
                                      className="w-full max-w-xs rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDespesa(despesa.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="comprovantes" className="space-y-6 pt-4">
              {(() => {
                // Interface para comprovantes unificados
                interface ComprovanteUnificado {
                  id: any;
                  tipo: 'whatsapp' | 'manual' | 'despesa';
                  nome: string;
                  url: string;
                  data: string;
                  valor?: number;
                  status?: string;
                  confianca?: string;
                  erro_mensagem?: string;
                  descricao?: string;
                  categoria?: string;
                }

                // Função auxiliar para obter label do tipo de despesa
                const getTipoDespesaLabel = (tipo: string) => {
                  const labels: Record<string, string> = {
                    alimentacao: 'Alimentação',
                    combustivel: 'Combustível',
                    pedagio: 'Pedágio',
                    manutencao: 'Manutenção',
                    hospedagem: 'Hospedagem',
                    outros: 'Outros',
                  };
                  return labels[tipo] || tipo;
                };

                // Unificar todos os comprovantes
                const comprovantesUnificados: ComprovanteUnificado[] = [
                  // Comprovantes via WhatsApp
                  ...(comprovantesWhatsApp || []).map((comp: any) => ({
                    id: comp.id,
                    tipo: 'whatsapp' as const,
                    nome: getTipoLabel(comp.tipo_identificado),
                    url: comp.imagem_url,
                    data: comp.created_at,
                    valor: comp.dados_extraidos?.valor,
                    status: comp.status,
                    confianca: comp.confianca,
                    erro_mensagem: comp.erro_mensagem,
                  })),
                  // Comprovantes manuais
                  ...(comprovantes || []).map((doc: any) => ({
                    id: doc.id,
                    tipo: 'manual' as const,
                    nome: doc.nome,
                    url: doc.url,
                    data: doc.created_at,
                    categoria: doc.categoria || tipoComprovante,
                  })),
                  // Comprovantes de despesas (anexos do app)
                  ...(despesas || [])
                    .filter((d: any) => d.anexo_url)
                    .map((d: any) => ({
                      id: d.id,
                      tipo: 'despesa' as const,
                      nome: `Comprovante - ${getTipoDespesaLabel(d.tipo)}`,
                      url: d.anexo_url,
                      data: d.data,
                      valor: d.valor,
                      descricao: d.descricao,
                      categoria: d.tipo,
                    })),
                ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

                return (
                  <div className="space-y-4">
                    {/* Header com estatísticas */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Total de Comprovantes</p>
                          <p className="text-2xl font-bold">{comprovantesUnificados.length}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">App Motorista</p>
                          <p className="text-2xl font-bold">
                            {despesas.filter((d: any) => d.anexo_url).length}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">WhatsApp</p>
                          <p className="text-2xl font-bold">{comprovantesWhatsApp?.length || 0}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Upload de comprovante manual */}
                    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Manual de Comprovante
                      </h3>
                      <div className="grid gap-3">
                        <Label htmlFor="tipo-comprovante">Tipo de Comprovante</Label>
                        <Select value={tipoComprovante} onValueChange={(value: any) => setTipoComprovante(value)}>
                          <SelectTrigger id="tipo-comprovante">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adiantamento">Adiantamento</SelectItem>
                            <SelectItem value="recebimento_frete">Recebimento de Frete</SelectItem>
                            <SelectItem value="despesa">Despesa</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end">
                        <label htmlFor="file-upload-viagem">
                          <Button
                            type="button"
                            disabled={uploading}
                            onClick={() => document.getElementById('file-upload-viagem')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? 'Enviando...' : 'Upload Comprovante'}
                          </Button>
                        </label>
                        <input
                          id="file-upload-viagem"
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>

                    {/* Lista unificada de comprovantes */}
                    {comprovantesUnificados.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum comprovante disponível
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {comprovantesUnificados.map((comp) => (
                          <Card key={`${comp.tipo}-${comp.id}`} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                {/* Preview da imagem */}
                                <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                                  <img 
                                    src={comp.url}
                                    alt={comp.nome}
                                    className="w-full h-full object-cover"
                                    onClick={() => window.open(comp.url, '_blank')}
                                  />
                                </div>
                                
                                {/* Informações do comprovante */}
                                <div className="flex-1 min-w-0">
                                  {/* Cabeçalho com nome e badges */}
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {comp.tipo === 'despesa' && (
                                        <Camera className="h-4 w-4 text-blue-500" />
                                      )}
                                      {comp.tipo === 'manual' && (
                                        <FileText className="h-4 w-4 text-green-500" />
                                      )}
                                      {comp.tipo === 'whatsapp' && (
                                        <Phone className="h-4 w-4 text-purple-500" />
                                      )}
                                      <p className="font-medium truncate">{comp.nome}</p>
                                    </div>
                                    <Badge 
                                      variant={
                                        comp.tipo === 'despesa' ? 'default' : 
                                        comp.tipo === 'whatsapp' ? 'secondary' : 
                                        'outline'
                                      }
                                    >
                                      {comp.tipo === 'despesa' ? 'App Motorista' : 
                                       comp.tipo === 'whatsapp' ? 'WhatsApp' : 
                                       'Manual'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Data */}
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {formatDateBR(comp.data)}
                                  </p>
                                  
                                  {/* Valor (para despesas e whatsapp) */}
                                  {comp.valor && (
                                    <p className="text-sm font-medium text-green-600 mb-1">
                                      R$ {Number(comp.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                  )}
                                  
                                  {/* Descrição (apenas para despesas) */}
                                  {comp.tipo === 'despesa' && comp.descricao && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                      {comp.descricao}
                                    </p>
                                  )}
                                  
                                  {/* Status e confiança (para WhatsApp) */}
                                  {comp.tipo === 'whatsapp' && (
                                    <div className="flex gap-2 mt-2">
                                      {comp.status && (
                                        <Badge variant="outline" className={getStatusColor(comp.status)}>
                                          {comp.status}
                                        </Badge>
                                      )}
                                      {comp.confianca && (
                                        <Badge variant="outline" className={`text-xs ${getConfiancaColor(comp.confianca)}`}>
                                          Confiança: {comp.confianca}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Erro (para WhatsApp) */}
                                  {comp.tipo === 'whatsapp' && comp.erro_mensagem && (
                                    <p className="text-xs text-destructive mt-2">{comp.erro_mensagem}</p>
                                  )}
                                </div>
                                
                                {/* Botão de ação */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(comp.url, '_blank')}
                                >
                                  Abrir
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="localizacoes" className="space-y-4 pt-4">
              {(() => {
                const localizacoes = [];

                // Localização da partida
                if (viagem.partida_latitude && viagem.partida_longitude && viagem.partida_localizacao_timestamp) {
                  localizacoes.push({
                    latitude: viagem.partida_latitude,
                    longitude: viagem.partida_longitude,
                    timestamp: viagem.partida_localizacao_timestamp,
                    tipo: 'partida',
                    descricao: `Partida - KM ${viagem.km_inicial || 0}`,
                  });
                }

                // Localização da chegada
                if (viagem.chegada_latitude && viagem.chegada_longitude && viagem.chegada_localizacao_timestamp) {
                  localizacoes.push({
                    latitude: viagem.chegada_latitude,
                    longitude: viagem.chegada_longitude,
                    timestamp: viagem.chegada_localizacao_timestamp,
                    tipo: 'chegada',
                    descricao: `Chegada - KM ${viagem.km_final || 0}`,
                  });
                }

                // Localizações das despesas
                despesas.forEach((d: any) => {
                  if (d.latitude && d.longitude && d.localizacao_timestamp) {
                    localizacoes.push({
                      latitude: d.latitude,
                      longitude: d.longitude,
                      timestamp: d.localizacao_timestamp,
                      tipo: 'despesa',
                      descricao: `${d.tipo} - R$ ${Number(d.valor).toFixed(2)}`,
                    });
                  }
                });

                // Localizações das transações
                transacoes.forEach((t: any) => {
                  if (t.latitude && t.longitude && t.localizacao_timestamp) {
                    localizacoes.push({
                      latitude: t.latitude,
                      longitude: t.longitude,
                      timestamp: t.localizacao_timestamp,
                      tipo: t.tipo,
                      descricao: `${t.tipo === 'adiantamento' ? 'Adiantamento' : 'Recebimento'} - R$ ${Number(t.valor).toFixed(2)}`,
                    });
                  }
                });

                return <MapaLocalizacoes localizacoes={localizacoes} />;
              })()}
            </TabsContent>

            <TabsContent value="calculos" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <Label className="text-muted-foreground">Total de Despesas</Label>
                    <p className="text-2xl font-bold text-destructive mt-1">
                      R$ {totaisViagem.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <Label className="text-muted-foreground">Receita do Frete</Label>
                    <p className="text-2xl font-bold text-primary mt-1">
                      R$ {totaisViagem.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <Label className="text-muted-foreground">Margem</Label>
                    <p className={`text-2xl font-bold mt-1 ${totaisViagem.margem >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      R$ {totaisViagem.margem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <Label className="text-muted-foreground">Custo por KM</Label>
                    <p className="text-2xl font-bold mt-1">
                      R$ {totaisViagem.custoKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fotos" className="space-y-4 pt-4">
              <PhotoGallery viagemId={viagem.id} />
            </TabsContent>

            <TabsContent value="exportar" className="space-y-4 pt-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">
                      Esta viagem possui {comprovantes.length} comprovante(s)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={handleExportPDF}
                      disabled={exporting}
                    >
                      <FileText className="h-4 w-4" />
                      {exporting ? 'Gerando PDF...' : 'Exportar PDF Completo'}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={handleExportZIP}
                      disabled={exporting || comprovantes.length === 0}
                    >
                      <Package className="h-4 w-4" />
                      {exporting ? 'Gerando ZIP...' : 'Exportar CSV + Comprovantes (ZIP)'}
                    </Button>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <p className="text-xs text-muted-foreground">
                      <strong>PDF Completo:</strong> Relatório visual com todas as informações e comprovantes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>ZIP:</strong> Arquivo CSV com dados + pasta com todos os comprovantes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DespesaDialog
        open={despesaDialogOpen}
        onOpenChange={(open) => {
          setDespesaDialogOpen(open);
          if (!open) setComprovanteData(null);
        }}
        onSubmit={(data) => createDespesa.mutate(data)}
        viagemId={viagem.id}
        isLoading={createDespesa.isPending}
        initialData={comprovanteData}
      />

      <TransacaoDialog
        open={transacaoDialogOpen}
        onOpenChange={(open) => {
          setTransacaoDialogOpen(open);
          if (!open) setComprovanteData(null);
        }}
        onSubmit={(data) => createTransacao.mutate({ 
          tipo: data.tipo,
          valor: data.valor,
          data: data.data,
          descricao: data.descricao,
          viagem_id: viagem.id 
        })}
        viagemId={viagem.id}
        isLoading={createTransacao.isPending}
        initialData={comprovanteData}
      />

      <AlertDialog open={deleteDespesaDialogOpen} onOpenChange={setDeleteDespesaDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDespesa}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteTransacaoDialogOpen} onOpenChange={setDeleteTransacaoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransacao}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
