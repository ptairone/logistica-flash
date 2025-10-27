import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateBR } from '@/lib/validations';
import { AcertoFormData, ViagemAcerto } from '@/lib/validations-acerto';
import { FileText, Calendar, Truck, Wallet, AlertCircle } from 'lucide-react';

interface AcertoPreviewProps {
  data: AcertoFormData;
  viagens: ViagemAcerto[];
  motoristaNome: string;
}

export function AcertoPreview({ data, viagens, motoristaNome }: AcertoPreviewProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {data.codigo}
            </h3>
            <p className="text-sm text-muted-foreground">
              Acerto de contas - {motoristaNome}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {data.status === 'aberto' ? 'Em Aberto' : data.status === 'pago' ? 'Pago' : 'Cancelado'}
          </Badge>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Período:</span>
            <span className="font-medium">
              {formatDateBR(data.periodo_inicio)} até {formatDateBR(data.periodo_fim)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Viagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5 text-primary" />
              Viagens Incluídas ({viagens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {viagens.map((viagem) => {
                const valorFrete = viagem.frete?.valor_frete || 0;
                const despesasReemb = viagem.despesas
                  ?.filter((d) => d.reembolsavel)
                  .reduce((sum, d) => sum + Number(d.valor), 0) || 0;

                return (
                  <div
                    key={viagem.id}
                    className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{viagem.codigo}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateBR(viagem.data_saida)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {viagem.origem} → {viagem.destino}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Frete:</span>
                      <span className="font-medium text-success">{formatCurrency(valorFrete)}</span>
                    </div>
                    {despesasReemb > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Reembolsos:</span>
                        <span className="font-medium text-accent">{formatCurrency(despesasReemb)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cálculos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-5 w-5 text-primary" />
              Cálculos Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base de Comissão:</span>
                <span className="font-semibold">{formatCurrency(data.base_comissao || 0)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Percentual de Comissão:</span>
                <span className="font-semibold">{data.percentual_comissao}%</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Valor da Comissão:</span>
                <span className="font-bold text-success">{formatCurrency(data.valor_comissao || 0)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Reembolsos:</span>
                <span className="font-bold text-accent">{formatCurrency(data.total_reembolsos || 0)}</span>
              </div>

              <Separator />

              {data.total_adiantamentos > 0 && (
                <div className="flex items-center justify-between text-destructive">
                  <span className="text-sm font-medium">(-) Adiantamentos:</span>
                  <span className="font-bold">{formatCurrency(data.total_adiantamentos)}</span>
                </div>
              )}

              {data.total_descontos > 0 && (
                <div className="flex items-center justify-between text-destructive">
                  <span className="text-sm font-medium">(-) Descontos:</span>
                  <span className="font-bold">{formatCurrency(data.total_descontos)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="rounded-lg bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(data.total_pagar || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {data.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.observacoes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
