import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface FreteRentabilidadeCardProps {
  valorFrete: number;
  despesas: number;
  abastecimentos: number;
  comissoes: number;
}

export function FreteRentabilidadeCard({ 
  valorFrete, 
  despesas, 
  abastecimentos, 
  comissoes 
}: FreteRentabilidadeCardProps) {
  const custoTotal = despesas + abastecimentos + comissoes;
  const margemReal = valorFrete - custoTotal;
  const percentualMargem = valorFrete > 0 ? (margemReal / valorFrete) * 100 : 0;
  const isPositivo = margemReal >= 0;

  const percentualDespesas = valorFrete > 0 ? (despesas / valorFrete) * 100 : 0;
  const percentualAbastecimentos = valorFrete > 0 ? (abastecimentos / valorFrete) * 100 : 0;
  const percentualComissoes = valorFrete > 0 ? (comissoes / valorFrete) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPositivo ? (
            <TrendingUp className="h-5 w-5 text-primary" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
          Análise de Rentabilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor do Frete</p>
            <p className="text-2xl font-bold text-primary">
              R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Custo Total</p>
            <p className="text-2xl font-bold text-destructive">
              R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Margem */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Margem Real</p>
            <p className={`text-2xl font-bold ${isPositivo ? 'text-primary' : 'text-destructive'}`}>
              R$ {margemReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-1">
            <Progress 
              value={Math.abs(percentualMargem)} 
              className={isPositivo ? '' : 'bg-destructive/20'}
            />
            <p className="text-xs text-muted-foreground text-right">
              {percentualMargem.toFixed(1)}% de margem
            </p>
          </div>
        </div>

        {/* Breakdown de Custos */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium">Distribuição de Custos</p>
          
          {despesas > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Despesas Operacionais</span>
                <span className="font-medium">R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <Progress value={percentualDespesas} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{percentualDespesas.toFixed(1)}%</p>
            </div>
          )}

          {abastecimentos > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Combustível</span>
                <span className="font-medium">R$ {abastecimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <Progress value={percentualAbastecimentos} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{percentualAbastecimentos.toFixed(1)}%</p>
            </div>
          )}

          {comissoes > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Comissões</span>
                <span className="font-medium">R$ {comissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <Progress value={percentualComissoes} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{percentualComissoes.toFixed(1)}%</p>
            </div>
          )}
        </div>

        {/* Alerta de margem negativa */}
        {!isPositivo && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Margem Negativa</p>
              <p className="text-muted-foreground">
                Os custos superaram o valor do frete em R$ {Math.abs(margemReal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
