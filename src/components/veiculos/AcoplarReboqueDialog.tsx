import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReboques, type Reboque } from '@/hooks/useReboques';
import { useVeiculoComposicao } from '@/hooks/useVeiculoComposicao';
import { getTipoReboqueLabel } from '@/lib/validations-reboque';

interface AcoplarReboqueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veiculoId: string | undefined;
  ordemProxima: number;
}

export function AcoplarReboqueDialog({
  open,
  onOpenChange,
  veiculoId,
  ordemProxima,
}: AcoplarReboqueDialogProps) {
  const [reboqueId, setReboqueId] = useState<string>('');
  const { reboques } = useReboques();
  const { acoplarReboque } = useVeiculoComposicao(veiculoId);

  // Filtrar apenas reboques disponíveis
  const reboquesDisponiveis: Reboque[] = Array.isArray(reboques) 
    ? reboques.filter((r) => r.status === 'disponivel')
    : [];

  const handleAcoplar = () => {
    if (!veiculoId || !reboqueId) return;

    acoplarReboque.mutate(
      {
        veiculoId,
        reboqueId,
        ordem: ordemProxima,
      },
      {
        onSuccess: () => {
          setReboqueId('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acoplar Reboque (Posição {ordemProxima})</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reboque">Selecione o Reboque</Label>
            <Select value={reboqueId} onValueChange={setReboqueId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um reboque disponível" />
              </SelectTrigger>
              <SelectContent>
                {reboquesDisponiveis.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhum reboque disponível
                  </div>
                ) : (
                  reboquesDisponiveis.map((reboque) => (
                    <SelectItem key={reboque.id} value={reboque.id}>
                      {reboque.codigo_interno} | {reboque.placa} | {reboque.marca} {reboque.modelo} | {getTipoReboqueLabel(reboque.tipo)} ({reboque.numero_eixos} eixos)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {reboquesDisponiveis.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Cadastre reboques na página de Reboques ou verifique se há reboques com status "Disponível"
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAcoplar}
            disabled={!reboqueId || acoplarReboque.isPending}
          >
            Acoplar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
