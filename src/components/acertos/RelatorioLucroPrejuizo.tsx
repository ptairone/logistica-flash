import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DespesaCaminhao {
  id: string;
  categoria: string;
  valorDiario: number;
  quantidadeDias: number;
  tipo: 'debito' | 'credito';
}

interface DespesaVariavel {
  id: string;
  tipo: string;
  valor: number;
  reembolsavel: boolean;
}

interface RelatorioLucroPrejuizoProps {
  receitaTotal: number;
  despesasCaminhao: DespesaCaminhao[];
  despesasVariaveis: DespesaVariavel[];
  quantidadeDias: number;
  kmRodado: number;
}

export function RelatorioLucroPrejuizo({
  receitaTotal,
  despesasCaminhao,
  despesasVariaveis,
  quantidadeDias,
  kmRodado,
}: RelatorioLucroPrejuizoProps) {
  // Calcular totais das despesas do caminhão
  const despesasCaminhaoDebito = despesasCaminhao
    .filter(d => d.tipo === 'debito')
    .reduce((sum, d) => sum + (d.valorDiario * d.quantidadeDias), 0);

  const despesasCaminhaoCredito = despesasCaminhao
    .filter(d => d.tipo === 'credito')
    .reduce((sum, d) => sum + (d.valorDiario * d.quantidadeDias), 0);

  // Calcular totais das despesas variáveis
  const despesasVariaveisTotal = despesasVariaveis.reduce((sum, d) => sum + d.valor, 0);
  const despesasVariaveisReemb = despesasVariaveis
    .filter(d => d.reembolsavel)
    .reduce((sum, d) => sum + d.valor, 0);

  // Totais gerais
  const totalDebito = despesasCaminhaoDebito + despesasVariaveisTotal;
  const totalCredito = receitaTotal + despesasCaminhaoCredito;
  const resultado = totalCredito - totalDebito;
  const media = quantidadeDias > 0 ? resultado / quantidadeDias : 0;

  // Métricas por KM
  const receitaPorKm = kmRodado > 0 ? receitaTotal / kmRodado : 0;
  const custoPorKm = kmRodado > 0 ? totalDebito / kmRodado : 0;
  const lucroPorKm = kmRodado > 0 ? resultado / kmRodado : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Relatório de Lucro ou Prejuízo</CardTitle>
          <Badge variant={resultado >= 0 ? 'default' : 'destructive'} className="text-lg px-4 py-1">
            {resultado >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-2" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-2" />
            )}
            {resultado >= 0 ? 'LUCRO' : 'PREJUÍZO'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Resumo Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Crédito</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Débito</p>
                <p className="text-2xl font-bold text-destructive">
                  R$ {totalDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className={resultado >= 0 ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Resultado</p>
                <p className={`text-2xl font-bold ${resultado >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
                  R$ {Math.abs(resultado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detalhamento */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm mb-3">Detalhamento</h4>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receita Total (Fretes):</span>
                <span className="font-medium text-green-600">
                  R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Despesas Fixas Caminhão:</span>
                <span className="font-medium text-destructive">
                  R$ {despesasCaminhaoDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Créditos Caminhão:</span>
                <span className="font-medium text-green-600">
                  R$ {despesasCaminhaoCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Despesas Variáveis:</span>
                <span className="font-medium text-destructive">
                  R$ {despesasVariaveisTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Média por Dia:</span>
                <span className={`font-bold ${media >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
                  R$ {Math.abs(media).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia
                </span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Quantidade de Dias:</span>
                <span className="font-medium">{quantidadeDias} dias</span>
              </div>
            </div>
          </div>

          {/* Métricas por KM */}
          {kmRodado > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm mb-3">Análise por Quilômetro</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">KM Rodado</p>
                  <p className="text-xl font-bold">{kmRodado.toLocaleString('pt-BR')}</p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Receita/KM</p>
                  <p className="text-xl font-bold text-green-600">
                    R$ {receitaPorKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Custo/KM</p>
                  <p className="text-xl font-bold text-destructive">
                    R$ {custoPorKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Lucro/KM</p>
                  <p className={`text-xl font-bold ${lucroPorKm >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
                    R$ {Math.abs(lucroPorKm).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Margem */}
          {receitaTotal > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Margem de Lucro:</span>
                <span className={`text-2xl font-bold ${resultado >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
                  {((resultado / receitaTotal) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
