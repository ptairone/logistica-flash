import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, FileText, StopCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDespesas } from '@/hooks/useViagens';
import { useTransacoesViagem } from '@/hooks/useTransacoesViagem';
import { format } from 'date-fns';

interface EtapaAndamentoProps {
  viagem: any;
  onEncerrar: () => void;
}

export function EtapaAndamento({ viagem, onEncerrar }: EtapaAndamentoProps) {
  const navigate = useNavigate();
  const { despesas } = useDespesas(viagem.id);
  const { totais, recebimentos } = useTransacoesViagem(viagem.id);

  const totalDespesas = despesas?.reduce((sum, d) => sum + Number(d.valor), 0) || 0;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Viagem em Andamento</h2>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">R$ {totalDespesas.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{despesas?.length || 0} itens</p>
        </Card>
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-muted-foreground">Adiantamentos</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">R$ {totais.adiantamentos.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{recebimentos.length || 0} itens</p>
        </Card>
        <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <p className="text-sm text-muted-foreground">Recebimentos</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {totais.recebimentos.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{recebimentos.length || 0} itens</p>
        </Card>
      </div>

      {/* Lista de Recebimentos */}
      {recebimentos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-lg">Recebimentos de Frete</h3>
          </div>
          <div className="space-y-2">
            {recebimentos.slice(0, 3).map((rec) => (
              <Card key={rec.id} className="p-4 border-green-200 dark:border-green-800">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">
                      {rec.forma_pagamento ? rec.forma_pagamento.toUpperCase() : 'Recebimento'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(rec.data), 'dd/MM/yyyy')}
                    </p>
                    {rec.descricao && (
                      <p className="text-xs text-muted-foreground mt-1">{rec.descricao}</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {Number(rec.valor).toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Despesas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-lg">Últimas Despesas</h3>
        </div>
        {despesas && despesas.length > 0 ? (
          <div className="space-y-2">
            {despesas.slice(0, 3).map((despesa) => (
              <Card key={despesa.id} className="p-4 border-red-200 dark:border-red-800">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">{despesa.descricao || despesa.tipo}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(despesa.data), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">R$ {Number(despesa.valor).toFixed(2)}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>Nenhuma despesa registrada ainda</p>
          </Card>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="space-y-3">
        <Button
          onClick={() => navigate(`/motorista/viagem/${viagem.id}/adicionar-despesa`)}
          className="w-full h-16 text-xl font-bold"
          size="lg"
        >
          <Plus className="mr-2 h-6 w-6" />
          Adicionar Comprovante
        </Button>

        <Button
          onClick={onEncerrar}
          variant="destructive"
          className="w-full h-16 text-xl font-bold"
          size="lg"
        >
          <StopCircle className="mr-2 h-6 w-6" />
          Encerrar Viagem
        </Button>
      </div>
    </div>
  );
}
