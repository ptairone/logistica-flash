import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { usePneusHistorico, usePneus } from '@/hooks/usePneus';
import { statusPneuLabels, tipoPneuLabels, getPosicaoLabel, getProfundidadeColor } from '@/lib/validations-pneu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, RotateCcw, Send } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PneuDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pneu: any;
}

export function PneuDetailsDialog({ open, onOpenChange, pneu }: PneuDetailsDialogProps) {
  const { historico } = usePneusHistorico(pneu?.id);
  const { removerPneu, descartarPneu, updatePneu } = usePneus();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [descartarDialogOpen, setDescartarDialogOpen] = useState(false);
  const [recapagemDialogOpen, setRecapagemDialogOpen] = useState(false);
  const [kmAtual, setKmAtual] = useState('');
  const [motivo, setMotivo] = useState('');

  if (!pneu) return null;

  const handleRemover = () => {
    if (pneu && kmAtual) {
      removerPneu.mutate(
        { pneuId: pneu.id, kmVeiculo: parseInt(kmAtual) },
        {
          onSuccess: () => {
            setRemoveDialogOpen(false);
            setKmAtual('');
            setMotivo('');
            onOpenChange(false);
          },
        }
      );
    }
  };

  const handleDescartar = () => {
    if (pneu && motivo) {
      descartarPneu.mutate(
        { pneuId: pneu.id, motivo },
        {
          onSuccess: () => {
            setDescartarDialogOpen(false);
            setMotivo('');
            onOpenChange(false);
          },
        }
      );
    }
  };

  const handleRecapagem = () => {
    if (pneu) {
      updatePneu.mutate(
        {
          id: pneu.id,
          data: {
            status: 'recapagem',
            numero_recapagens: (pneu.numero_recapagens || 0) + 1,
            veiculo_id: null,
            posicao_veiculo: null,
          },
        },
        {
          onSuccess: () => {
            setRecapagemDialogOpen(false);
            onOpenChange(false);
          },
        }
      );
    }
  };

  const getEventoIcon = (tipo: string) => {
    switch (tipo) {
      case 'instalacao': return '🔧';
      case 'remocao': return '📤';
      case 'rodizio': return '🔄';
      case 'medicao_sulco': return '📏';
      case 'recapagem': return '♻️';
      case 'descarte': return '🗑️';
      default: return '📝';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pneu</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{pneu.numero_serie}</h3>
                <p className="text-muted-foreground">{pneu.codigo_interno}</p>
              </div>
              <Badge>{statusPneuLabels[pneu.status]}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{pneu.marca}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{pneu.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medida</p>
                <p className="font-medium">{pneu.medida}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{tipoPneuLabels[pneu.tipo]}</p>
              </div>
              {pneu.fornecedor && (
                <div>
                  <p className="text-sm text-muted-foreground">Fornecedor</p>
                  <p className="font-medium">{pneu.fornecedor}</p>
                </div>
              )}
              {pneu.valor_compra && (
                <div>
                  <p className="text-sm text-muted-foreground">Valor de Compra</p>
                  <p className="font-medium">R$ {pneu.valor_compra.toFixed(2)}</p>
                </div>
              )}
            </div>

            {pneu.profundidade_sulco_mm && (
              <div>
                <p className="text-sm text-muted-foreground">Profundidade do Sulco</p>
                <p className={`text-2xl font-bold ${getProfundidadeColor(pneu.profundidade_sulco_mm, pneu.profundidade_minima_mm)}`}>
                  {pneu.profundidade_sulco_mm.toFixed(2)} mm
                </p>
                <p className="text-xs text-muted-foreground">
                  Mínimo: {pneu.profundidade_minima_mm || 1.6} mm
                </p>
              </div>
            )}

            {pneu.status === 'em_uso' && pneu.veiculo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Instalado em</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{pneu.veiculo.placa} - {pneu.veiculo.codigo_interno}</p>
                  {pneu.posicao_veiculo && (
                    <p className="text-sm text-muted-foreground">{getPosicaoLabel(pneu.posicao_veiculo)}</p>
                  )}
                  {pneu.data_instalacao && (
                    <p className="text-sm text-muted-foreground">
                      Desde: {format(new Date(pneu.data_instalacao), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  )}
                  {pneu.km_rodados > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {pneu.km_rodados.toLocaleString()} km rodados
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {pneu.numero_recapagens > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Recapagens</p>
                <p className="font-medium">{pneu.numero_recapagens}x</p>
              </div>
            )}

            {pneu.observacoes && (
              <div>
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="text-sm">{pneu.observacoes}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold">Histórico de Eventos</h4>
              {historico && historico.length > 0 ? (
                <div className="space-y-3">
                  {historico.map((evento: any) => (
                    <div key={evento.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl">{getEventoIcon(evento.tipo_evento)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="font-medium capitalize">{evento.tipo_evento.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(evento.data_evento), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        {evento.veiculo && (
                          <p className="text-sm text-muted-foreground">{evento.veiculo.placa}</p>
                        )}
                        {evento.posicao_nova && (
                          <p className="text-sm text-muted-foreground">
                            {getPosicaoLabel(evento.posicao_nova)}
                          </p>
                        )}
                        {evento.km_veiculo && (
                          <p className="text-xs text-muted-foreground">
                            KM: {evento.km_veiculo.toLocaleString()}
                          </p>
                        )}
                        {evento.observacoes && (
                          <p className="text-sm mt-1">{evento.observacoes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado</p>
              )}
            </div>

            {pneu.status !== 'descartado' && (
              <>
                <Separator />
                <div className="flex gap-2">
                  {pneu.status === 'em_uso' && (
                    <Button variant="outline" onClick={() => setRemoveDialogOpen(true)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Remover do Veículo
                    </Button>
                  )}
                  {pneu.status === 'em_uso' && (
                    <Button variant="outline" onClick={() => setRecapagemDialogOpen(true)}>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para Recapagem
                    </Button>
                  )}
                  <Button variant="destructive" onClick={() => setDescartarDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Descartar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover pneu do veículo</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="km_atual">KM Atual do Veículo *</Label>
                <Input
                  id="km_atual"
                  type="number"
                  value={kmAtual}
                  onChange={(e) => setKmAtual(e.target.value)}
                  placeholder="Digite o KM atual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo (opcional)</Label>
                <Textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Rodízio, Manutenção preventiva"
                  rows={3}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemover} disabled={!kmAtual}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={descartarDialogOpen} onOpenChange={setDescartarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar pneu</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Esta ação não pode ser desfeita. O pneu será marcado como descartado.</p>
              <div className="space-y-2">
                <Label htmlFor="motivo_descarte">Motivo do Descarte *</Label>
                <Textarea
                  id="motivo_descarte"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Desgaste excessivo, Danos irreparáveis"
                  rows={3}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDescartar} disabled={!motivo}>
              Confirmar Descarte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={recapagemDialogOpen} onOpenChange={setRecapagemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar para recapagem</AlertDialogTitle>
            <AlertDialogDescription>
              O pneu será removido do veículo e seu status será alterado para "Em Recapagem".
              O contador de recapagens será incrementado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecapagem}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
