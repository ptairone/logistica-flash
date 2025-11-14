import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, FileText, Gauge, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { InstalacaoPneuDialog } from '@/components/pneus/InstalacaoPneuDialog';
import { MedicaoDialog } from '@/components/pneus/MedicaoDialog';
import { PneuDetailsDialog } from '@/components/pneus/PneuDetailsDialog';
import { usePneus } from '@/hooks/usePneus';
import { getPosicaoLabel } from '@/lib/validations-pneu';
import { formatDateBR } from '@/lib/validations';
import { toast } from 'sonner';

interface PneuPosicaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veiculoId: string;
  posicao: string;
  pneu?: any;
}

export function PneuPosicaoDialog({ open, onOpenChange, veiculoId, posicao, pneu }: PneuPosicaoDialogProps) {
  const [showInstalar, setShowInstalar] = useState(false);
  const [showMedicao, setShowMedicao] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const { removerPneu } = usePneus();
  
  const handleRemover = () => {
    if (!pneu) return;
    
    if (confirm('Tem certeza que deseja remover este pneu?')) {
      removerPneu.mutate(
        { 
          pneuId: pneu.id,
          kmVeiculo: pneu.km_atual || 0
        },
        {
          onSuccess: () => {
            toast.success('Pneu removido com sucesso');
            onOpenChange(false);
          },
        }
      );
    }
  };
  
  const getStatusColor = (): "default" | "destructive" | "outline" | "secondary" => {
    if (!pneu) return 'secondary';
    
    const prof = pneu.profundidade_sulco_mm || 0;
    const min = pneu.profundidade_minima_mm || 1.6;
    
    if (prof <= min) return 'destructive';
    if (prof <= min + 1.5) return 'outline';
    return 'default';
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Posição: {getPosicaoLabel(posicao)}
            </DialogTitle>
          </DialogHeader>
          
          {pneu ? (
            <div className="space-y-4">
              {/* Informações do Pneu */}
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-lg">{pneu.numero_serie}</p>
                    <p className="text-sm text-muted-foreground">
                      {pneu.codigo_interno}
                    </p>
                  </div>
                  <Badge variant={getStatusColor()}>
                    {pneu.profundidade_sulco_mm} mm
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Marca/Modelo</p>
                    <p className="font-medium">{pneu.marca} {pneu.modelo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Medida</p>
                    <p className="font-medium">{pneu.medida}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize">{pneu.tipo}</p>
                  </div>
                  {pneu.km_rodados && (
                    <div>
                      <p className="text-muted-foreground">KM Rodados</p>
                      <p className="font-medium">{pneu.km_rodados.toLocaleString()}</p>
                    </div>
                  )}
                  {pneu.data_instalacao && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Instalado em</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateBR(pneu.data_instalacao)}
                      </p>
                    </div>
                  )}
                </div>
                
                {pneu.profundidade_sulco_mm && pneu.profundidade_minima_mm && 
                 pneu.profundidade_sulco_mm <= pneu.profundidade_minima_mm + 1.5 && (
                  <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-700 dark:text-yellow-500">
                      <p className="font-medium">Atenção necessária</p>
                      <p>Profundidade próxima ao mínimo recomendado</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Ações */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetalhes(true);
                    setTimeout(() => onOpenChange(false), 50);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMedicao(true);
                    setTimeout(() => onOpenChange(false), 50);
                  }}
                >
                  <Gauge className="h-4 w-4 mr-2" />
                  Medir
                </Button>
              </div>
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemover}
                disabled={removerPneu.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover Pneu
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <p className="text-muted-foreground mb-4">
                  Nenhum pneu instalado nesta posição
                </p>
                <Button
                  onClick={() => {
                    setShowInstalar(true);
                    setTimeout(() => onOpenChange(false), 50);
                  }}
                >
                  Instalar Pneu
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialogs de Ações */}
      {showInstalar && (
        <InstalacaoPneuDialog
          open={showInstalar}
          onOpenChange={setShowInstalar}
          pneu={null}
          veiculoIdProp={veiculoId}
          posicaoProp={posicao}
        />
      )}
      
      {showMedicao && pneu && (
        <MedicaoDialog
          open={showMedicao}
          onOpenChange={setShowMedicao}
          pneu={pneu}
        />
      )}
      
      {showDetalhes && pneu && (
        <PneuDetailsDialog
          open={showDetalhes}
          onOpenChange={setShowDetalhes}
          pneu={pneu}
        />
      )}
    </>
  );
}
