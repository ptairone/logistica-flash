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
  const { transacoes } = useTransacoesViagem(viagem.id);

  const totalDespesas = despesas?.reduce((sum, d) => sum + Number(d.valor), 0) || 0;
  const totalAdiantamentos = transacoes?.filter(t => t.tipo === 'adiantamento').reduce((sum, t) => sum + Number(t.valor), 0) || 0;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Viagem em Andamento</h2>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="text-2xl font-bold">R$ {totalDespesas.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{despesas?.length || 0} lançamentos</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Adiantamentos</p>
          <p className="text-2xl font-bold">R$ {totalAdiantamentos.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{transacoes?.filter(t => t.tipo === 'adiantamento').length || 0} lançamentos</p>
        </Card>
      </div>

      {/* Lista de Despesas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Últimas Despesas</h3>
        </div>
        {despesas && despesas.length > 0 ? (
          <div className="space-y-2">
            {despesas.slice(0, 5).map((despesa) => (
              <Card key={despesa.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{despesa.descricao || despesa.tipo}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(despesa.data), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <p className="text-lg font-bold">R$ {Number(despesa.valor).toFixed(2)}</p>
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
          Adicionar Despesa/Adiantamento
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
