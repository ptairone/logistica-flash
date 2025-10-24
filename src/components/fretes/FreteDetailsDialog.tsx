import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateBR } from '@/lib/validations';
import { useViagensVinculadasFrete } from '@/hooks/useFretes';
import { useFretes } from '@/hooks/useFretes';
import { podeFaturarFrete } from '@/lib/validations-frete';

interface FreteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frete: any;
}

export function FreteDetailsDialog({ open, onOpenChange, frete }: FreteDetailsDialogProps) {
  const { data: viagens = [], isLoading } = useViagensVinculadasFrete(frete?.id);
  const { updateFrete } = useFretes();
  const [numeroFatura, setNumeroFatura] = useState('');

  if (!frete) return null;

  const validacaoFaturamento = podeFaturarFrete(viagens);

  const handleFaturar = () => {
    if (!numeroFatura) return;

    updateFrete.mutate(
      {
        id: frete.id,
        data: {
          status: 'faturado',
          numero_fatura: numeroFatura,
        },
      },
      {
        onSuccess: () => {
          setNumeroFatura('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Frete - {frete.codigo}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="viagens">Viagens</TabsTrigger>
            <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Cliente</Label>
                <p className="font-medium">{frete.cliente_nome}</p>
                <p className="text-sm text-muted-foreground">{frete.cliente_cnpj_cpf}</p>
              </div>
              {frete.cliente_contato && (
                <div>
                  <Label className="text-muted-foreground">Contato</Label>
                  <p className="font-medium">{frete.cliente_contato}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-muted-foreground">Origem</Label>
                <p className="font-medium">{frete.origem}</p>
                {frete.origem_cep && <p className="text-sm text-muted-foreground">{frete.origem_cep}</p>}
              </div>
              <div>
                <Label className="text-muted-foreground">Destino</Label>
                <p className="font-medium">{frete.destino}</p>
                {frete.destino_cep && <p className="text-sm text-muted-foreground">{frete.destino_cep}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Data de Coleta</Label>
                <p className="font-medium">{formatDateBR(frete.data_coleta)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Data de Entrega</Label>
                <p className="font-medium">{formatDateBR(frete.data_entrega)}</p>
              </div>
            </div>

            {(frete.produto || frete.tipo_carga) && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {frete.produto && (
                  <div>
                    <Label className="text-muted-foreground">Produto</Label>
                    <p className="font-medium">{frete.produto}</p>
                  </div>
                )}
                {frete.tipo_carga && (
                  <div>
                    <Label className="text-muted-foreground">Tipo de Carga</Label>
                    <p className="font-medium">{frete.tipo_carga}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              {frete.peso && (
                <div>
                  <Label className="text-muted-foreground">Peso</Label>
                  <p className="font-medium">{frete.peso.toLocaleString('pt-BR')} kg</p>
                </div>
              )}
              {frete.volume && (
                <div>
                  <Label className="text-muted-foreground">Volume</Label>
                  <p className="font-medium">{frete.volume.toLocaleString('pt-BR')} m³</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Valor do Frete</Label>
                <p className="text-xl font-bold text-primary">
                  R$ {frete.valor_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {frete.condicao_pagamento && (
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">Condição de Pagamento</Label>
                <p className="font-medium">{frete.condicao_pagamento}</p>
              </div>
            )}

            {frete.observacoes && (
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">Observações</Label>
                <p className="text-sm mt-1">{frete.observacoes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="viagens" className="space-y-4 pt-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
            ) : viagens.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma viagem vinculada a este frete
              </p>
            ) : (
              <div className="space-y-2">
                {viagens.map((viagem) => (
                  <Card key={viagem.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Truck className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{viagem.codigo}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {viagem.origem} → {viagem.destino}
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                              <span>Veículo: {viagem.veiculo?.placa}</span>
                              <span>Motorista: {viagem.motorista?.nome}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-medium capitalize">{viagem.status.replace('_', ' ')}</p>
                          {viagem.data_saida && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDateBR(viagem.data_saida)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="faturamento" className="space-y-4 pt-4">
            {frete.status === 'faturado' ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold">Frete Faturado</p>
                  {frete.numero_fatura && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Número da Fatura/Nota: {frete.numero_fatura}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : frete.status === 'cancelado' ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-lg font-semibold">Frete Cancelado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Este frete não pode ser faturado
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {!validacaoFaturamento.pode ? (
                  <Card className="border-warning">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                        <div>
                          <p className="font-medium">Não é possível faturar este frete</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {validacaoFaturamento.motivo}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-4">Faturar Frete</p>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="numero_fatura">Número da Fatura/Nota Fiscal</Label>
                          <Input
                            id="numero_fatura"
                            value={numeroFatura}
                            onChange={(e) => setNumeroFatura(e.target.value)}
                            placeholder="NF-12345"
                          />
                        </div>

                        <Button
                          onClick={handleFaturar}
                          disabled={!numeroFatura}
                          className="w-full"
                        >
                          Marcar como Faturado
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
