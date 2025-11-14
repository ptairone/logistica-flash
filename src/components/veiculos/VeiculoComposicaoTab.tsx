import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Unlink, TruckIcon, Info } from 'lucide-react';
import { useVeiculoComposicao } from '@/hooks/useVeiculoComposicao';
import { AcoplarReboqueDialog } from './AcoplarReboqueDialog';
import { getTipoReboqueLabel } from '@/lib/validations-reboque';
import { formatDateBR } from '@/lib/validations';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VeiculoComposicaoTabProps {
  veiculoId: string | undefined;
  numeroEixosCavalo?: number;
}

export function VeiculoComposicaoTab({ veiculoId, numeroEixosCavalo }: VeiculoComposicaoTabProps) {
  const [acoplarDialogOpen, setAcoplarDialogOpen] = useState(false);
  const { composicao, isLoading, desacoplarReboque, totalEixos } = useVeiculoComposicao(veiculoId);

  const handleDesacoplar = (composicaoId: string) => {
    if (confirm('Deseja realmente desacoplar este reboque?')) {
      desacoplarReboque.mutate(composicaoId);
    }
  };

  const totalEixosCompleto = (numeroEixosCavalo || 0) + totalEixos;

  if (isLoading) {
    return <div className="text-center py-8">Carregando composição...</div>;
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Total de Eixos:</strong> {numeroEixosCavalo || 0} (cavalo) + {totalEixos} (reboques) = <strong>{totalEixosCompleto} eixos</strong>
        </AlertDescription>
      </Alert>

      {composicao.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <TruckIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">Nenhum reboque acoplado</p>
          <Button onClick={() => setAcoplarDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Acoplar Primeiro Reboque
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {composicao.map((comp: any) => (
              <Card key={comp.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <TruckIcon className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{comp.reboques.placa}</h4>
                          <Badge variant="outline">Posição {comp.ordem}</Badge>
                          <Badge variant="secondary">{getTipoReboqueLabel(comp.reboques.tipo)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {comp.reboques.marca} {comp.reboques.modelo} {comp.reboques.ano && `(${comp.reboques.ano})`}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Eixos:</span>{' '}
                            <span className="font-medium">{comp.reboques.numero_eixos}</span>
                          </div>
                          {comp.reboques.capacidade_kg && (
                            <div>
                              <span className="text-muted-foreground">Capacidade:</span>{' '}
                              <span className="font-medium">{comp.reboques.capacidade_kg.toLocaleString()} kg</span>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Acoplado em:</span>{' '}
                            <span className="font-medium">{formatDateBR(comp.data_acoplamento)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDesacoplar(comp.id)}
                      disabled={desacoplarReboque.isPending}
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Desacoplar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {composicao.length < 2 && (
            <Button onClick={() => setAcoplarDialogOpen(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Acoplar {composicao.length === 1 ? 'Segundo' : 'Outro'} Reboque
            </Button>
          )}
        </>
      )}

      <AcoplarReboqueDialog
        open={acoplarDialogOpen}
        onOpenChange={setAcoplarDialogOpen}
        veiculoId={veiculoId}
        ordemProxima={composicao.length + 1}
      />
    </div>
  );
}
