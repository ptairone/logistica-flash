import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Droplet, 
  Gauge, 
  DollarSign, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  User,
  Truck,
  Image as ImageIcon,
  CheckCircle,
  Route,
  Fuel
} from 'lucide-react';
import { formatDateBR } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface AbastecimentoDetailsDialogProps {
  abastecimento: any;
  open: boolean;
  onClose: () => void;
  onValidar?: (id: string) => void;
  onRejeitar?: (id: string) => void;
}

export function AbastecimentoDetailsDialog({ 
  abastecimento, 
  open, 
  onClose,
  onValidar,
  onRejeitar 
}: AbastecimentoDetailsDialogProps) {
  if (!abastecimento) return null;

  const valorPorLitro = abastecimento.valor_total / abastecimento.litros;
  const isPendente = abastecimento.status === 'pendente_validacao';
  const isValidado = abastecimento.status === 'validado';
  const custoKm = abastecimento.km_rodados 
    ? abastecimento.valor_total / abastecimento.km_rodados 
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Detalhes do Abastecimento</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Informações completas e análise de consumo
              </p>
            </div>
            <Badge 
              variant={isValidado ? 'default' : isPendente ? 'outline' : 'destructive'}
              className={cn(
                isValidado && "bg-success text-success-foreground",
                isPendente && "bg-warning text-warning-foreground"
              )}
            >
              {isValidado ? 'Validado' : isPendente ? 'Pendente' : 'Rejeitado'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comprovante */}
          {abastecimento.comprovante_url && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Comprovante
              </h3>
              <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                <img 
                  src={abastecimento.comprovante_url} 
                  alt="Comprovante de abastecimento"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            </div>
          )}

          {/* Informações do Veículo */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Veículo
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Placa</p>
                <p className="font-semibold">{abastecimento.veiculo?.placa || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-semibold">{abastecimento.veiculo?.modelo || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dados do Abastecimento */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Dados do Abastecimento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Data</span>
                </div>
                <p className="font-bold">{formatDateBR(abastecimento.data_abastecimento)}</p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Gauge className="h-4 w-4" />
                  <span>KM Veículo</span>
                </div>
                <p className="font-bold text-lg">
                  {abastecimento.km_veiculo?.toLocaleString('pt-BR')}
                </p>
                {abastecimento.km_anterior && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Anterior: {abastecimento.km_anterior.toLocaleString('pt-BR')}
                  </p>
                )}
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Droplet className="h-4 w-4" />
                  <span>Litros</span>
                </div>
                <p className="font-bold text-lg">
                  {abastecimento.litros?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Valor Total</span>
                </div>
                <p className="font-bold text-lg">
                  R$ {abastecimento.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  R$ {valorPorLitro.toFixed(2)}/L
                </p>
              </div>

              {abastecimento.km_rodados && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Route className="h-4 w-4" />
                    <span>KM Rodados</span>
                  </div>
                  <p className="font-bold text-lg text-success">
                    {abastecimento.km_rodados.toLocaleString('pt-BR')} km
                  </p>
                </div>
              )}

              {abastecimento.media_calculada && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-success text-sm mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Média Calculada</span>
                  </div>
                  <p className="font-bold text-2xl text-success">
                    {abastecimento.media_calculada.toFixed(2)} km/L
                  </p>
                  {abastecimento.veiculo?.media_consumo_geral && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Média geral: {abastecimento.veiculo.media_consumo_geral.toFixed(2)} km/L
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Custo por KM */}
          {custoKm && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-sm text-primary mb-2">💰 Custo por Quilômetro</h4>
              <p className="text-2xl font-bold">
                R$ {custoKm.toFixed(2)}/km
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado nos {abastecimento.km_rodados.toLocaleString('pt-BR')} km rodados
              </p>
            </div>
          )}

          {/* Local do Abastecimento */}
          {abastecimento.posto_nome && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold">{abastecimento.posto_nome}</p>
                <p className="text-sm text-muted-foreground">
                  {abastecimento.posto_cidade}, {abastecimento.posto_uf}
                </p>
              </div>
            </div>
          )}

          {/* Motorista */}
          {abastecimento.motorista && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Motorista
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold">{abastecimento.motorista.nome}</p>
              </div>
            </div>
          )}

          {/* Viagem */}
          {abastecimento.viagem && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Route className="h-4 w-4" />
                Viagem Associada
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold">Código: {abastecimento.viagem.codigo}</p>
              </div>
            </div>
          )}

          {/* Observações */}
          {abastecimento.observacoes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Observações</h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{abastecimento.observacoes}</p>
              </div>
            </div>
          )}

          {/* Validação */}
          {abastecimento.validado_em && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-semibold">Validado</span>
              </div>
              <p className="text-sm text-muted-foreground">
                em {formatDateBR(abastecimento.validado_em)}
              </p>
            </div>
          )}

          {/* Ações */}
          {isPendente && onValidar && onRejeitar && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  onValidar(abastecimento.id);
                  onClose();
                }}
                className="flex-1 bg-success hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4" />
                Validar Abastecimento
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onRejeitar(abastecimento.id);
                  onClose();
                }}
                className="flex-1"
              >
                Rejeitar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
