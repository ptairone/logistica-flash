import { useState } from 'react';
import { useComprovantesWhatsApp, useComprovantesPendentes } from '@/hooks/useComprovantesWhatsApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, RefreshCw, Search, Image as ImageIcon, Phone, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ComprovantesWhatsApp() {
  const [filtro, setFiltro] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [comprovanteParaRejeitar, setComprovanteParaRejeitar] = useState<string | null>(null);

  const { comprovantes, isLoading, confirmarComprovante, rejeitarComprovante, reprocessarComprovante } = useComprovantesWhatsApp();
  const { pendentes } = useComprovantesPendentes();

  const comprovantesFiltrados = comprovantes.filter(c =>
    c.motorista?.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    c.viagem?.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    c.telefone.includes(filtro)
  );

  const getConfiancaColor = (confianca: string | null) => {
    switch (confianca) {
      case 'alta': return 'bg-success text-success-foreground';
      case 'media': return 'bg-warning text-warning-foreground';
      case 'baixa': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-success text-success-foreground';
      case 'processando': return 'bg-warning text-warning-foreground';
      case 'erro': return 'bg-destructive text-destructive-foreground';
      case 'rejeitado': return 'bg-destructive/80 text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTipoLabel = (tipo: string | null) => {
    if (!tipo) return 'Desconhecido';
    const labels: Record<string, string> = {
      'HODOMETRO': 'Hodômetro',
      'ABASTECIMENTO': 'Abastecimento',
      'DESPESA_ALIMENTACAO': 'Alimentação',
      'DESPESA_PEDAGIO': 'Pedágio',
      'DESPESA_HOSPEDAGEM': 'Hospedagem',
      'DESPESA_MANUTENCAO': 'Manutenção',
      'DESPESA_OUTRAS': 'Outras Despesas',
      'RECEBIMENTO': 'Recebimento',
      'ADIANTAMENTO': 'Adiantamento',
      'DESCONHECIDO': 'Desconhecido',
    };
    return labels[tipo] || tipo;
  };

  const handleRejeitar = (comprovanteId: string) => {
    if (motivoRejeicao.trim()) {
      rejeitarComprovante.mutate({ comprovanteId, motivo: motivoRejeicao });
      setComprovanteParaRejeitar(null);
      setMotivoRejeicao('');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comprovantes WhatsApp</h1>
          <p className="text-muted-foreground">Monitoramento de comprovantes recebidos via WhatsApp</p>
        </div>

        {pendentes.length > 0 && (
          <Card className="border-warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                {pendentes.length} comprovante{pendentes.length > 1 ? 's' : ''} em processamento
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por motorista, viagem ou telefone..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Carregando comprovantes...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {comprovantesFiltrados.map((comprovante) => (
              <Card key={comprovante.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={comprovante.imagem_url}
                        alt="Comprovante"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                        }}
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute bottom-2 right-2 h-6 w-6 p-0"
                          >
                            <ImageIcon className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Comprovante</DialogTitle>
                          </DialogHeader>
                          <img src={comprovante.imagem_url} alt="Comprovante" className="w-full" />
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {comprovante.motorista?.nome || 'Motorista não identificado'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {comprovante.telefone}
                            </span>
                            {comprovante.viagem && (
                              <span>Viagem: {comprovante.viagem.codigo}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(comprovante.created_at), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={getStatusColor(comprovante.status)}>
                            {comprovante.status}
                          </Badge>
                          {comprovante.tipo_identificado && (
                            <Badge variant="outline">{getTipoLabel(comprovante.tipo_identificado)}</Badge>
                          )}
                          {comprovante.confianca && (
                            <Badge className={getConfiancaColor(comprovante.confianca)}>
                              {comprovante.confianca}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {comprovante.dados_extraidos && Object.keys(comprovante.dados_extraidos).length > 0 && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm font-medium text-foreground mb-2">Dados extraídos:</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(comprovante.dados_extraidos).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground">{key}:</span>{' '}
                                <span className="text-foreground">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {comprovante.erro_mensagem && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                          {comprovante.erro_mensagem}
                        </div>
                      )}

                      {comprovante.status === 'processando' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => confirmarComprovante.mutate(comprovante.id)}
                            disabled={confirmarComprovante.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirmar
                          </Button>
                          <Dialog open={comprovanteParaRejeitar === comprovante.id} onOpenChange={(open) => {
                            if (!open) {
                              setComprovanteParaRejeitar(null);
                              setMotivoRejeicao('');
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setComprovanteParaRejeitar(comprovante.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeitar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rejeitar Comprovante</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Motivo da rejeição..."
                                  value={motivoRejeicao}
                                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setComprovanteParaRejeitar(null);
                                      setMotivoRejeicao('');
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleRejeitar(comprovante.id)}
                                    disabled={!motivoRejeicao.trim()}
                                  >
                                    Rejeitar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}

                      {comprovante.status === 'erro' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reprocessarComprovante.mutate(comprovante.id)}
                          disabled={reprocessarComprovante.isPending}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reprocessar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {comprovantesFiltrados.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum comprovante encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
