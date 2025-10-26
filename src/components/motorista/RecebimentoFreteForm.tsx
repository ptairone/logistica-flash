import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface RecebimentoFreteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    valor: number;
    forma_pagamento: string;
    data: string;
    descricao?: string;
  }) => Promise<void>;
  valorExtraido?: number;
  isLoading?: boolean;
}

export function RecebimentoFreteForm({
  open,
  onOpenChange,
  onSubmit,
  valorExtraido,
  isLoading = false,
}: RecebimentoFreteFormProps) {
  const [valor, setValor] = useState(valorExtraido?.toString() || '');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      valor: parseFloat(valor),
      forma_pagamento: formaPagamento,
      data,
      descricao: descricao || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Recebimento de Frete</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor Recebido (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
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
            <Label htmlFor="data">Data do Recebimento</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Observações (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Recebido do cliente João Silva"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar Recebimento'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}