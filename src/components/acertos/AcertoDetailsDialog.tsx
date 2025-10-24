import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, FileText, Download } from 'lucide-react';
import { formatDateBR } from '@/lib/validations';
import { useViagensAcerto, useAcertos } from '@/hooks/useAcertos';
import { AcertoExportDialog } from './AcertoExportDialog';

interface AcertoDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acerto: any;
}

export function AcertoDetailsDialog({ open, onOpenChange, acerto }: AcertoDetailsDialogProps) {
  const { data: viagens = [], isLoading } = useViagensAcerto(acerto?.id);
  const { updateAcerto } = useAcertos();
  const [dataPagamento, setDataPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  if (!acerto) return null;

  const handleFecharAcerto = () => {
    updateAcerto.mutate({
      id: acerto.id,
      data: { status: 'fechado' },
    });
  };

  const handleRegistrarPagamento = () => {
    if (!dataPagamento || !formaPagamento) return;

    updateAcerto.mutate(
      {
        id: acerto.id,
        data: {
          status: 'pago',
          data_pagamento: dataPagamento,
          forma_pagamento: formaPagamento,
        },
      },
      {
        onSuccess: () => {
          setDataPagamento('');
          setFormaPagamento('');
        },
      }
    );
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Acerto - {acerto.codigo}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={
                acerto.status === 'pago' ? 'bg-green-500' : 
                acerto.status === 'fechado' ? 'bg-blue-500' : 
                'border-yellow-500 text-yellow-700'
              }>
                {acerto.status === 'pago' ? 'Pago' : acerto.status === 'fechado' ? 'Fechado' : 'Aberto'}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total a Pagar</p>
              <p className="text-2xl font-bold text-primary">
                R$ {acerto.total_pagar?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="viagens">Viagens</TabsTrigger>
            <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Motorista</Label>
                <p className="font-medium">{acerto.motorista?.nome}</p>
                <p className="text-sm text-muted-foreground">{acerto.motorista?.cpf}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Período</Label>
                <p className="font-medium">
                  {formatDateBR(acerto.periodo_inicio)} até {formatDateBR(acerto.periodo_fim)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <Card>
                <CardContent className="p-4">
                  <Label className="text-muted-foreground">Base de Comissão</Label>
                  <p className="text-xl font-bold mt-1">
                    R$ {acerto.base_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Label className="text-muted-foreground">Comissão ({acerto.percentual_comissao || 0}%)</Label>
                  <p className="text-xl font-bold text-primary mt-1">
                    R$ {acerto.valor_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Label className="text-muted-foreground">Reembolsos</Label>
                  <p className="text-xl font-bold mt-1">
                    R$ {acerto.total_reembolsos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Label className="text-muted-foreground">Adiantamentos</Label>
                  <p className="text-xl font-bold text-destructive mt-1">
                    - R$ {acerto.total_adiantamentos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Label className="text-muted-foreground">Descontos</Label>
                  <p className="text-xl font-bold text-destructive mt-1">
                    - R$ {acerto.total_descontos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Label className="text-muted-foreground">Total a Pagar</Label>
                  <p className="text-2xl font-bold text-primary mt-1">
                    R$ {acerto.total_pagar?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {acerto.observacoes && (
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">Observações</Label>
                <p className="text-sm mt-1">{acerto.observacoes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="viagens" className="space-y-4 pt-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
            ) : viagens.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma viagem vinculada
              </p>
            ) : (
              <div className="space-y-2">
                {viagens.map((viagem) => (
                  <Card key={viagem.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{viagem.codigo}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {viagem.origem} → {viagem.destino}
                            </div>
                          </div>
                          {viagem.frete && (
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Frete</p>
                              <p className="font-medium text-primary">
                                R$ {viagem.frete.valor_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          )}
                        </div>

                        {viagem.despesas && viagem.despesas.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium mb-2">Despesas:</p>
                            <div className="space-y-1">
                              {viagem.despesas.map((despesa: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {getTipoDespesaLabel(despesa.tipo)}
                                    {despesa.reembolsavel && ' (Reembolsável)'}
                                  </span>
                                  <span className="font-medium">
                                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pagamento" className="space-y-4 pt-4">
            {acerto.status === 'pago' ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-primary">Pagamento Realizado</p>
                    <p className="text-sm text-muted-foreground">
                      Data: {formatDateBR(acerto.data_pagamento)}
                    </p>
                    {acerto.forma_pagamento && (
                      <p className="text-sm text-muted-foreground">
                        Forma: {acerto.forma_pagamento}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : acerto.status === 'fechado' ? (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium mb-4">Registrar Pagamento</p>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="data_pagamento">Data do Pagamento</Label>
                        <Input
                          id="data_pagamento"
                          type="date"
                          value={dataPagamento}
                          onChange={(e) => setDataPagamento(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                        <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a forma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PIX">PIX</SelectItem>
                            <SelectItem value="Transferência">Transferência</SelectItem>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleRegistrarPagamento}
                        disabled={!dataPagamento || !formaPagamento}
                        className="w-full"
                      >
                        Registrar Pagamento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    O acerto precisa ser fechado antes de registrar o pagamento
                  </p>
                  <Button onClick={handleFecharAcerto}>
                    Fechar Acerto
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <AcertoExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          acerto={acerto}
        />
      </DialogContent>
    </Dialog>
  );
}
