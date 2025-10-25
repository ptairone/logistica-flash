import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Trash2, Plus, DollarSign, Banknote, TrendingUp } from 'lucide-react';
import { formatDateBR } from '@/lib/validations';
import { useDespesas, useComprovantesViagem } from '@/hooks/useViagens';
import { useTransacoesViagem } from '@/hooks/useTransacoesViagem';
import { DespesaDialog } from './DespesaDialog';
import { TransacaoDialog } from './TransacaoDialog';
import { calcularTotaisViagem } from '@/lib/validations-viagem';
import { DriverFormLinkCard } from './DriverFormLinkCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ViagemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagem: any;
}

export function ViagemDetailsDialog({ open, onOpenChange, viagem }: ViagemDetailsDialogProps) {
  const { despesas, createDespesa, deleteDespesa } = useDespesas(viagem?.id);
  const { comprovantes, uploadComprovante } = useComprovantesViagem(viagem?.id);
  const { transacoes, createTransacao, deleteTransacao, totais: totaisTransacoes } = useTransacoesViagem(viagem?.id);
  const [despesaDialogOpen, setDespesaDialogOpen] = useState(false);
  const [transacaoDialogOpen, setTransacaoDialogOpen] = useState(false);
  const [deleteDespesaDialogOpen, setDeleteDespesaDialogOpen] = useState(false);
  const [deleteTransacaoDialogOpen, setDeleteTransacaoDialogOpen] = useState(false);
  const [despesaToDelete, setDespesaToDelete] = useState<string | null>(null);
  const [transacaoToDelete, setTransacaoToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!viagem) return null;

  const totaisViagem = calcularTotaisViagem(
    despesas,
    viagem.km_percorrido,
    viagem.frete?.valor_frete
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viagem) return;

    // Verificar se é imagem
    const isImage = file.type.startsWith('image/');
    
    setUploading(true);
    try {
      // Fazer upload do comprovante
      await uploadComprovante.mutateAsync({
        file,
        viagemId: viagem.id,
      });

      // Se for imagem, processar com OpenAI
      if (isImage) {
        toast.info('Processando comprovante com IA...');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('viagemId', viagem.id);

        const response = await fetch(
          'https://plfpczvnqmvqpmsbjrra.supabase.co/functions/v1/processar-comprovante',
          {
            method: 'POST',
            body: formData,
          }
        );

        if (response.ok) {
          const despesaData = await response.json();
          console.log('Dados extraídos:', despesaData);
          
          // Criar despesa automaticamente
          await createDespesa.mutateAsync({
            ...despesaData,
            viagem_id: viagem.id,
          });
          
          toast.success('Comprovante processado e despesa criada automaticamente!');
        } else {
          const error = await response.json();
          console.error('Erro ao processar:', error);
          toast.warning('Comprovante salvo, mas não foi possível extrair informações automaticamente');
        }
      }
      
      e.target.value = '';
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar comprovante');
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Viagem - {viagem.codigo}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <DriverFormLinkCard viagemId={viagem.id} />
        </div>

        <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
              <TabsTrigger value="comprovantes">Comprovantes</TabsTrigger>
              <TabsTrigger value="calculos">Cálculos</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Veículo</Label>
                  <p className="font-medium">{viagem.veiculo?.placa} - {viagem.veiculo?.marca} {viagem.veiculo?.modelo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Motorista</Label>
                  <p className="font-medium">{viagem.motorista?.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Origem</Label>
                  <p className="font-medium">{viagem.origem}</p>
                  {viagem.origem_cep && <p className="text-sm text-muted-foreground">{viagem.origem_cep}</p>}
                </div>
                <div>
                  <Label className="text-muted-foreground">Destino</Label>
                  <p className="font-medium">{viagem.destino}</p>
                  {viagem.destino_cep && <p className="text-sm text-muted-foreground">{viagem.destino_cep}</p>}
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Saída</Label>
                  <p className="font-medium">{formatDateBR(viagem.data_saida)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Chegada</Label>
                  <p className="font-medium">{formatDateBR(viagem.data_chegada)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">KM Estimado</Label>
                  <p className="font-medium">{viagem.km_estimado?.toLocaleString('pt-BR') || '-'} km</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">KM Percorrido</Label>
                  <p className="font-medium">{viagem.km_percorrido?.toLocaleString('pt-BR') || '-'} km</p>
                </div>
              </div>

              {viagem.frete && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Frete Vinculado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Código</Label>
                      <p className="font-medium">{viagem.frete.codigo}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cliente</Label>
                      <p className="font-medium">{viagem.frete.cliente_nome}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Valor</Label>
                      <p className="font-medium text-primary">
                        R$ {viagem.frete.valor_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {viagem.notas && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">Notas</Label>
                  <p className="text-sm mt-1">{viagem.notas}</p>
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

            <TabsContent value="comprovantes" className="space-y-4 pt-4">
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

              <div className="space-y-2">
                {comprovantes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum comprovante enviado
                  </p>
                ) : (
                  comprovantes.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{doc.nome}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateBR(doc.created_at)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            Abrir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
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
          </Tabs>
        </DialogContent>
      </Dialog>

      <DespesaDialog
        open={despesaDialogOpen}
        onOpenChange={setDespesaDialogOpen}
        onSubmit={(data) => createDespesa.mutate(data)}
        viagemId={viagem.id}
        isLoading={createDespesa.isPending}
      />

      <TransacaoDialog
        open={transacaoDialogOpen}
        onOpenChange={setTransacaoDialogOpen}
        onSubmit={(data) => createTransacao.mutate({ 
          tipo: data.tipo,
          valor: data.valor,
          data: data.data,
          descricao: data.descricao,
          viagem_id: viagem.id 
        })}
        viagemId={viagem.id}
        isLoading={createTransacao.isPending}
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
