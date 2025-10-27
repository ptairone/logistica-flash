import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { AcertoAjuste } from '@/hooks/useAcertoAjustes';

interface AcertoCalculoDetalhadoProps {
  comissao: number;
  reembolsos: number;
  bonificacoes: number;
  penalidades: number;
  adiantamentos: number;
  descontos: number;
  debitosDescontados: number;
  despesasReprovadas: number;
}

export function AcertoCalculoDetalhado({
  comissao,
  reembolsos,
  bonificacoes,
  penalidades,
  adiantamentos,
  descontos,
  debitosDescontados,
  despesasReprovadas,
}: AcertoCalculoDetalhadoProps) {
  const subtotalReceber = comissao + reembolsos + bonificacoes;
  const subtotalDescontar = adiantamentos + descontos + penalidades + debitosDescontados + despesasReprovadas;
  const totalLiquido = subtotalReceber - subtotalDescontar;
  const motoristaDevendo = totalLiquido < 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Receitas */}
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3 bg-green-50 dark:bg-green-950/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Comissão sobre fretes</span>
              <span className="font-medium">R$ {comissao.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reembolsos de despesas</span>
              <span className="font-medium">R$ {reembolsos.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bonificações e extras</span>
              <span className="font-medium">R$ {bonificacoes.toFixed(2)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-green-700 dark:text-green-400">Subtotal a Receber</span>
              <span className="text-lg font-bold text-green-700 dark:text-green-400">
                R$ {subtotalReceber.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Descontos */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-3 bg-red-50 dark:bg-red-950/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700 dark:text-red-400">
              <TrendingDown className="h-4 w-4" />
              A Descontar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Adiantamentos já pagos</span>
              <span className="font-medium">R$ {adiantamentos.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Descontos diversos</span>
              <span className="font-medium">R$ {descontos.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Penalidades</span>
              <span className="font-medium">R$ {penalidades.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Débitos anteriores</span>
              <span className="font-medium">R$ {debitosDescontados.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Despesas reprovadas</span>
              <span className="font-medium">R$ {despesasReprovadas.toFixed(2)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-red-700 dark:text-red-400">Subtotal a Descontar</span>
              <span className="text-lg font-bold text-red-700 dark:text-red-400">
                R$ {subtotalDescontar.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Líquido */}
      <Card className={`${motoristaDevendo ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-green-500 bg-green-50 dark:bg-green-950/20'}`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {motoristaDevendo ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <DollarSign className="h-8 w-8 text-green-600" />
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {motoristaDevendo ? 'MOTORISTA DEVE À EMPRESA' : 'TOTAL LÍQUIDO A PAGAR'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {motoristaDevendo 
                    ? 'O motorista tem saldo negativo neste acerto'
                    : 'Valor final a ser pago ao motorista'}
                </p>
              </div>
            </div>
            <div className={`text-4xl font-bold ${motoristaDevendo ? 'text-red-600' : 'text-green-600'}`}>
              {motoristaDevendo && '-'} R$ {Math.abs(totalLiquido).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {motoristaDevendo && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Atenção: Saldo negativo detectado
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  O motorista deverá realizar o pagamento deste valor à empresa ou o valor será acumulado como débito para o próximo acerto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown em porcentagem */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Composição do Acerto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(comissao / subtotalReceber * 100) || 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground min-w-[80px] text-right">
                Comissão {((comissao / subtotalReceber * 100) || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(reembolsos / subtotalReceber * 100) || 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground min-w-[80px] text-right">
                Reembolsos {((reembolsos / subtotalReceber * 100) || 0).toFixed(1)}%
              </span>
            </div>
            {bonificacoes > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(bonificacoes / subtotalReceber * 100) || 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground min-w-[80px] text-right">
                  Bonificações {((bonificacoes / subtotalReceber * 100) || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
