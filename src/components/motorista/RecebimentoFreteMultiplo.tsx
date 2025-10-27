import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Trash2, DollarSign } from 'lucide-react';

interface Parcela {
  id: string;
  valor: number;
  forma_pagamento: string;
  descricao?: string;
}

interface RecebimentoFreteMultiploProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (parcelas: Array<{
    valor: number;
    forma_pagamento: string;
    data: string;
    descricao?: string;
  }>) => Promise<void>;
  valorExtraido?: number;
  isLoading?: boolean;
}

export function RecebimentoFreteMultiplo({
  open,
  onOpenChange,
  onSubmit,
  valorExtraido,
  isLoading = false,
}: RecebimentoFreteMultiploProps) {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [valor, setValor] = useState(valorExtraido?.toString() || '');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');

  const adicionarParcela = () => {
    if (!valor || parseFloat(valor) <= 0) {
      return;
    }

    const novaParcela: Parcela = {
      id: Date.now().toString(),
      valor: parseFloat(valor),
      forma_pagamento: formaPagamento,
      descricao: descricao || undefined,
    };

    setParcelas([...parcelas, novaParcela]);
    
    // Limpar campos
    setValor('');
    setFormaPagamento('dinheiro');
    setDescricao('');
  };

  const removerParcela = (id: string) => {
    setParcelas(parcelas.filter(p => p.id !== id));
  };

  const totalParcelas = parcelas.reduce((acc, p) => acc + p.valor, 0);

  const getFormaPagamentoLabel = (forma: string) => {
    const labels: Record<string, string> = {
      dinheiro: '💵 Dinheiro',
      pix: '📱 PIX',
      cheque: '📄 Cheque',
      carta_frete: '📋 Carta Frete',
      ted_doc: '🏦 TED/DOC',
    };
    return labels[forma] || forma;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parcelas.length === 0) {
      return;
    }

    const parcelasComData = parcelas.map(p => ({
      valor: p.valor,
      forma_pagamento: p.forma_pagamento,
      data,
      descricao: p.descricao,
    }));

    await onSubmit(parcelasComData);
    
    // Limpar tudo após sucesso
    setParcelas([]);
    setValor('');
    setFormaPagamento('dinheiro');
    setDescricao('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Recebimento de Frete</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data do Recebimento</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          {/* Lista de Parcelas Adicionadas */}
          {parcelas.length > 0 && (
            <div className="space-y-2">
              <Label>Recebimentos Adicionados</Label>
              <div className="space-y-2">
                {parcelas.map((parcela) => (
                  <Card key={parcela.id} className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {getFormaPagamentoLabel(parcela.forma_pagamento)}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {parcela.descricao && (
                            <p className="text-xs text-muted-foreground mt-1">{parcela.descricao}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removerParcela(parcela.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Total */}
              <Card className="bg-primary/10 border-primary">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Total Recebido</Label>
                    <p className="text-2xl font-bold text-primary">
                      R$ {totalParcelas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Formulário para Nova Parcela */}
          <div className="border-t pt-4 space-y-3">
            <Label className="text-base font-semibold">Adicionar {parcelas.length > 0 ? 'Outra' : ''} Forma de Pagamento</Label>
            
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger id="forma-pagamento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                  <SelectItem value="pix">📱 PIX</SelectItem>
                  <SelectItem value="cheque">📄 Cheque</SelectItem>
                  <SelectItem value="carta_frete">📋 Carta Frete</SelectItem>
                  <SelectItem value="ted_doc">🏦 TED/DOC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Observações (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Recebido do cliente João Silva"
                rows={2}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={adicionarParcela}
              className="w-full"
              disabled={!valor || parseFloat(valor) <= 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              {parcelas.length > 0 ? 'Adicionar Outra Parcela' : 'Adicionar Parcela'}
            </Button>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading || parcelas.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Confirmar {parcelas.length} {parcelas.length === 1 ? 'Recebimento' : 'Recebimentos'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
