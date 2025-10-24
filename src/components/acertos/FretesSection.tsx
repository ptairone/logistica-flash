import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface Frete {
  id: string;
  data: string;
  descricao: string;
  valor: number;
}

interface FretesSectionProps {
  fretes: Frete[];
  viagensSelecionadas?: any[];
}

export function FretesSection({ fretes, viagensSelecionadas = [] }: FretesSectionProps) {
  // Calcular totais dos fretes das viagens selecionadas
  const fretesViagens = viagensSelecionadas.map(viagem => ({
    id: viagem.id,
    data: viagem.data_saida,
    descricao: `${viagem.codigo} - ${viagem.origem} → ${viagem.destino}`,
    valor: viagem.frete?.valor_frete || 0,
    origem: viagem.origem,
    destino: viagem.destino,
    kmPercorrido: viagem.km_percorrido,
  }));

  const totalFretes = fretesViagens.reduce((sum, f) => sum + f.valor, 0);
  const totalKm = fretesViagens.reduce((sum, f) => sum + (f.kmPercorrido || 0), 0);
  const mediaKm = totalKm > 0 ? totalFretes / totalKm : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fretes do Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fretesViagens.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma viagem selecionada
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Descrição</th>
                      <th className="text-right p-2">KM</th>
                      <th className="text-right p-2">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fretesViagens.map((frete) => (
                      <tr key={frete.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          {new Date(frete.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{frete.descricao}</span>
                          </div>
                        </td>
                        <td className="p-2 text-right text-muted-foreground">
                          {frete.kmPercorrido?.toLocaleString('pt-BR') || '-'}
                        </td>
                        <td className="p-2 text-right font-medium text-green-600">
                          {frete.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td colSpan={2} className="p-2 text-right">TOTAL ({fretesViagens.length} viagens):</td>
                      <td className="p-2 text-right">{totalKm.toLocaleString('pt-BR')} km</td>
                      <td className="p-2 text-right text-primary">
                        R$ {totalFretes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="font-medium text-muted-foreground">
                      <td colSpan={3} className="p-2 text-right">Média por KM:</td>
                      <td className="p-2 text-right">
                        R$ {mediaKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/km
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Viagens</p>
                  <p className="text-2xl font-bold text-primary">{fretesViagens.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">KM Total</p>
                  <p className="text-2xl font-bold">{totalKm.toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalFretes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">R$/KM</p>
                  <p className="text-2xl font-bold">
                    {mediaKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
