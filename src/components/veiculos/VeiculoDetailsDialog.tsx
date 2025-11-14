import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Wrench, Calendar } from 'lucide-react';
import { formatDateBR } from '@/lib/validations';
import { useManutencoes, useDocumentosVeiculo } from '@/hooks/useVeiculos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VeiculoComposicaoTab } from './VeiculoComposicaoTab';
import { VeiculoComposicaoVisual } from './VeiculoComposicaoVisual';

interface VeiculoDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veiculo: any;
}

export function VeiculoDetailsDialog({ open, onOpenChange, veiculo }: VeiculoDetailsDialogProps) {
  const { manutencoes, isLoading: loadingManutencoes } = useManutencoes(veiculo?.id);
  const { documentos, uploadDocumento } = useDocumentosVeiculo(veiculo?.id);
  const [uploading, setUploading] = useState(false);
  const [selectedTipoDoc, setSelectedTipoDoc] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTipoDoc || !veiculo) return;

    setUploading(true);
    try {
      await uploadDocumento.mutateAsync({
        file,
        tipoDocumento: selectedTipoDoc,
        veiculoId: veiculo.id,
      });
      setSelectedTipoDoc('');
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  if (!veiculo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalhes do Veículo - {veiculo.placa}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="composicao-visual">Composição</TabsTrigger>
            <TabsTrigger value="reboques">Reboques</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Código Interno</Label>
                <p className="font-medium">{veiculo.codigo_interno}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Placa</Label>
                <p className="font-medium">{veiculo.placa}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">RENAVAM</Label>
                <p className="font-medium">{veiculo.renavam || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Marca/Modelo</Label>
                <p className="font-medium">{veiculo.marca} {veiculo.modelo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ano</Label>
                <p className="font-medium">{veiculo.ano || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">KM Atual</Label>
                <p className="font-medium">{veiculo.km_atual?.toLocaleString('pt-BR') || '-'}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Vencimentos
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">IPVA</Label>
                  <p className="font-medium">{formatDateBR(veiculo.vencimento_ipva)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Licenciamento</Label>
                  <p className="font-medium">{formatDateBR(veiculo.vencimento_licenciamento)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Seguro</Label>
                  <p className="font-medium">{formatDateBR(veiculo.vencimento_seguro)}</p>
                </div>
              </div>
            </div>

            {veiculo.observacoes && (
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">Observações</Label>
                <p className="text-sm mt-1">{veiculo.observacoes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="composicao-visual" className="space-y-4 pt-4">
            <VeiculoComposicaoVisual veiculo={veiculo} />
          </TabsContent>

          <TabsContent value="reboques" className="space-y-4 pt-4">
            <VeiculoComposicaoTab veiculoId={veiculo.id} />
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedTipoDoc}
                  onChange={(e) => setSelectedTipoDoc(e.target.value)}
                >
                  <option value="">Selecione o tipo de documento</option>
                  <option value="crlv">CRLV</option>
                  <option value="apolice">Apólice de Seguro</option>
                  <option value="vistoria">Vistoria</option>
                  <option value="outro">Outro</option>
                </select>
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    disabled={!selectedTipoDoc || uploading}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Upload'}
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="space-y-2">
              {documentos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum documento enviado
                </p>
              ) : (
                documentos.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{doc.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.tipo_documento?.toUpperCase()} • {formatDateBR(doc.created_at)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          Abrir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="manutencoes" className="space-y-4 pt-4">
            {loadingManutencoes ? (
              <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
            ) : manutencoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma manutenção registrada
              </p>
            ) : (
              <div className="space-y-2">
                {manutencoes.map((manutencao) => (
                  <Card key={manutencao.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Wrench className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{manutencao.tipo}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDateBR(manutencao.data)}
                              </p>
                            </div>
                            {manutencao.custo && (
                              <p className="font-medium text-primary">
                                R$ {manutencao.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            )}
                          </div>
                          {manutencao.descricao && (
                            <p className="text-sm mt-2">{manutencao.descricao}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            {manutencao.km_veiculo && (
                              <span>KM: {manutencao.km_veiculo.toLocaleString('pt-BR')}</span>
                            )}
                            {manutencao.fornecedor && (
                              <span>Fornecedor: {manutencao.fornecedor}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
