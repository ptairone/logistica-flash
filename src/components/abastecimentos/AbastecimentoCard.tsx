import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, Gauge, Droplet, DollarSign, TrendingUp, Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatDateBR } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface AbastecimentoCardProps {
  abastecimento: any;
  onViewDetails: (abastecimento: any) => void;
  onValidar?: (abastecimento: any) => void;
  onRejeitar?: (abastecimento: any) => void;
}

export function AbastecimentoCard({ 
  abastecimento, 
  onViewDetails, 
  onValidar,
  onRejeitar 
}: AbastecimentoCardProps) {
  const valorPorLitro = abastecimento.valor_total / abastecimento.litros;
  const isPendente = abastecimento.status === 'pendente_validacao';
  const isValidado = abastecimento.status === 'validado';
  const isRejeitado = abastecimento.status === 'rejeitado';

  return (
    <Card className={cn(
      "relative overflow-hidden hover:shadow-lg transition-all",
      isPendente && "border-warning/40",
      isValidado && "border-success/40",
      isRejeitado && "border-destructive/40"
    )}>
      {/* Header com Gradiente */}
      <div className="bg-gradient-to-r from-primary to-cyan p-4 rounded-t-lg relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
              <Droplet className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-bold text-lg">
                  {abastecimento.veiculo?.placa || 'N/A'}
                </h3>
                <Badge 
                  variant={isValidado ? 'default' : isPendente ? 'outline' : 'destructive'}
                  className={cn(
                    isValidado && "bg-success text-success-foreground border-success",
                    isPendente && "bg-warning text-warning-foreground border-warning",
                    isRejeitado && "border-destructive"
                  )}
                >
                  {isValidado ? 'Validado' : isPendente ? 'Pendente' : 'Rejeitado'}
                </Badge>
              </div>
              <p className="text-white/90 text-sm">
                {abastecimento.veiculo?.modelo || 'Modelo N/A'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(abastecimento)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none rounded-lg z-0" />
      
      <CardContent className="space-y-4 relative z-[1] pt-6">
        {/* Data e Local */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{formatDateBR(abastecimento.data_abastecimento)}</span>
          </div>
          {abastecimento.posto_nome && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">
                {abastecimento.posto_cidade}/{abastecimento.posto_uf}
              </span>
            </div>
          )}
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Gauge className="h-4 w-4" />
              <span>KM Veículo</span>
            </div>
            <p className="text-lg font-bold">
              {abastecimento.km_veiculo?.toLocaleString('pt-BR')}
            </p>
            {abastecimento.km_rodados && (
              <p className="text-xs text-success">
                +{abastecimento.km_rodados?.toLocaleString('pt-BR')} km
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Droplet className="h-4 w-4" />
              <span>Litros</span>
            </div>
            <p className="text-lg font-bold">
              {abastecimento.litros?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Valor Total</span>
            </div>
            <p className="text-lg font-bold">
              R$ {abastecimento.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              R$ {valorPorLitro.toFixed(2)}/L
            </p>
          </div>

          {abastecimento.media_calculada && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Média</span>
              </div>
              <p className="text-lg font-bold text-success">
                {abastecimento.media_calculada?.toFixed(2)} km/L
              </p>
              {abastecimento.veiculo?.media_consumo_geral && (
                <p className="text-xs text-muted-foreground">
                  Média geral: {abastecimento.veiculo.media_consumo_geral.toFixed(2)} km/L
                </p>
              )}
            </div>
          )}
        </div>

        {/* Motorista */}
        {abastecimento.motorista && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Motorista: <span className="font-medium text-foreground">{abastecimento.motorista.nome}</span>
            </p>
          </div>
        )}

        {/* Ações de Validação */}
        {isPendente && onValidar && onRejeitar && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="default"
              onClick={() => onValidar(abastecimento)}
              className="flex-1 bg-success hover:bg-success/90"
            >
              <CheckCircle className="h-4 w-4" />
              Validar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRejeitar(abastecimento)}
              className="flex-1"
            >
              <XCircle className="h-4 w-4" />
              Rejeitar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
