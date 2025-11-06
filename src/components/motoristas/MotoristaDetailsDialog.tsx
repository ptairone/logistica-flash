import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, MapPin, DollarSign, TrendingUp, Clock, Settings } from 'lucide-react';
import { formatDateBR } from '@/lib/validations';
import {
  useViagensMotorista,
  useDespesasMotorista,
  useAcertosMotorista,
  useDocumentosMotorista,
} from '@/hooks/useMotoristas';
import { useConfigCLT, useSaveConfigCLT } from '@/hooks/useAcertosCLT';
import { calcularKPIsMotorista } from '@/lib/validations-motorista';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CriarLoginDialog } from './CriarLoginDialog';
import { AlterarSenhaDialog } from './AlterarSenhaDialog';
import { toast } from 'sonner';

interface MotoristaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motorista: any;
}

export function MotoristaDetailsDialog({ open, onOpenChange, motorista }: MotoristaDetailsDialogProps) {
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showCriarLogin, setShowCriarLogin] = useState(false);
  const [showAlterarSenha, setShowAlterarSenha] = useState(false);
  
  const [salarioBase, setSalarioBase] = useState('2700.00');
  const [valorDiaria, setValorDiaria] = useState('80.00');
  const [valorHoraExtra, setValorHoraExtra] = useState('19.64');
  const [valorHoraFDS, setValorHoraFDS] = useState('24.55');
  const [valorHoraFeriado, setValorHoraFeriado] = useState('24.55');

  const { data: viagens = [], isLoading: loadingViagens } = useViagensMotorista(
    motorista?.id,
    periodoInicio,
    periodoFim
  );
  const { data: despesas = [], isLoading: loadingDespesas } = useDespesasMotorista(
    motorista?.id,
    periodoInicio,
    periodoFim
  );
  const { data: acertos = [] } = useAcertosMotorista(motorista?.id);
  const { documentos, uploadDocumento } = useDocumentosMotorista(motorista?.id);
  
  const { data: configCLT } = useConfigCLT(motorista?.id);
  const { mutate: salvarConfig, isPending: salvandoConfig } = useSaveConfigCLT();
  
  // Pré-preencher valores se já existir configuração
  useState(() => {
    if (configCLT) {
      setSalarioBase(configCLT.salario_base.toString());
      setValorDiaria(configCLT.valor_diaria.toString());
      setValorHoraExtra(configCLT.valor_hora_extra.toString());
      setValorHoraFDS(configCLT.valor_hora_fds.toString());
      setValorHoraFeriado(configCLT.valor_hora_feriado.toString());
    }
  });

  if (!motorista) return null;

  const kpis = calcularKPIsMotorista(viagens);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tipoDocumento || !motorista) return;

    setUploading(true);
    try {
      await uploadDocumento.mutateAsync({
        file,
        tipoDocumento,
        motoristaId: motorista.id,
      });
      setTipoDocumento('');
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const getTipoDespesaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      combustivel: 'Combustível',
      pedagio: 'Pedágio',
      alimentacao: 'Alimentação',
      hospedagem: 'Hospedagem',
      manutencao: 'Manutenção',
      outros: 'Outros',
    };
    return labels[tipo] || tipo;
  };

  const handleSalvarConfigCLT = () => {
    if (!motorista?.id) return;

    salvarConfig({
      motorista_id: motorista.id,
      salario_base: parseFloat(salarioBase),
      valor_diaria: parseFloat(valorDiaria),
      valor_hora_extra: parseFloat(valorHoraExtra),
      valor_hora_fds: parseFloat(valorHoraFDS),
      valor_hora_feriado: parseFloat(valorHoraFeriado),
      ativo: true,
    }, {
      onSuccess: () => {
        toast.success('Configuração CLT salva com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao salvar configuração CLT');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Detalhes - {motorista.nome}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="dados" className="text-xs sm:text-sm px-2 py-2">Dados</TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs sm:text-sm px-2 py-2">Docs</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs sm:text-sm px-2 py-2">Histórico</TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs sm:text-sm px-2 py-2">$$</TabsTrigger>
            <TabsTrigger value="config-clt" className="text-xs sm:text-sm px-2 py-2">CLT</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Nome</Label>
                <p className="font-medium">{motorista.nome}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">CPF</Label>
                <p className="font-medium">{motorista.cpf || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">CNH</Label>
                <p className="font-medium">{motorista.cnh}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Validade CNH</Label>
                <p className="font-medium">{formatDateBR(motorista.validade_cnh)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Telefone</Label>
                <p className="font-medium">{motorista.telefone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">E-mail</Label>
                <p className="font-medium">{motorista.email || '-'}</p>
              </div>
            </div>

            <div className="border rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-3">Acesso ao Sistema</h3>
              {motorista.user_id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">✓ Login Ativo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email de acesso: <strong>{motorista.email}</strong>
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAlterarSenha(true)}
                  >
                    Alterar Senha
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="secondary">Sem Acesso</Badge>
                  <p className="text-sm text-muted-foreground">
                    Este motorista não possui acesso ao sistema.
                  </p>
                  {motorista.email ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCriarLogin(true)}
                    >
                      Criar Login
                    </Button>
                  ) : (
                    <p className="text-xs text-destructive">
                      Edite o motorista e adicione um email para criar o login.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <Label className="text-xs sm:text-sm text-muted-foreground">Total de KM (mês)</Label>
                  <p className="text-xl sm:text-2xl font-bold">{kpis.totalKm.toLocaleString('pt-BR')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <Label className="text-xs sm:text-sm text-muted-foreground">Nº de Viagens (mês)</Label>
                  <p className="text-xl sm:text-2xl font-bold">{kpis.totalViagens}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <Label className="text-xs sm:text-sm text-muted-foreground">Taxa de Pontualidade</Label>
                  <p className="text-xl sm:text-2xl font-bold">{kpis.pontualidade.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnh">CNH</SelectItem>
                  <SelectItem value="comprovante_residencia">Comprovante de Residência</SelectItem>
                  <SelectItem value="aso">ASO/PCMSO</SelectItem>
                  <SelectItem value="certificado">Certificado de Treinamento</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <label htmlFor="file-upload-motorista">
                <Button
                  type="button"
                  disabled={!tipoDocumento || uploading}
                  onClick={() => document.getElementById('file-upload-motorista')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Upload'}
                </Button>
              </label>
              <input
                id="file-upload-motorista"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
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

          <TabsContent value="historico" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
              <div className="flex-1">
                <Label className="text-sm">Período Início</Label>
                <Input
                  type="date"
                  value={periodoInicio}
                  onChange={(e) => setPeriodoInicio(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">Período Fim</Label>
                <Input
                  type="date"
                  value={periodoFim}
                  onChange={(e) => setPeriodoFim(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Label className="text-xs sm:text-sm text-muted-foreground">Total KM</Label>
                  </div>
                  <p className="text-base sm:text-xl font-bold">{kpis.totalKm.toLocaleString('pt-BR')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Label className="text-xs sm:text-sm text-muted-foreground">Despesas</Label>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-destructive">
                    R$ {kpis.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Label className="text-xs sm:text-sm text-muted-foreground">Custo/KM</Label>
                  </div>
                  <p className="text-base sm:text-xl font-bold">
                    R$ {kpis.custoKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Label className="text-xs sm:text-sm text-muted-foreground">Pontualidade</Label>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-primary">{kpis.pontualidade.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>

            <h3 className="font-semibold text-lg mb-2">Viagens</h3>
            <div className="space-y-2">
              {loadingViagens ? (
                <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
              ) : viagens.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma viagem encontrada
                </p>
              ) : (
                viagens.map((viagem) => {
                  const custoViagem = viagem.despesas?.reduce((sum: number, d: any) => sum + (d.valor || 0), 0) || 0;
                  const receita = viagem.frete?.valor_frete || 0;
                  const margem = receita - custoViagem;

                  return (
                    <Card key={viagem.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                           <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base">{viagem.codigo}</p>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{viagem.origem} → {viagem.destino}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground mt-2">
                              <span className="truncate">Veículo: {viagem.veiculo?.placa}</span>
                              {viagem.km_percorrido && <span>KM: {viagem.km_percorrido.toLocaleString('pt-BR')}</span>}
                              <span className="capitalize">{viagem.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs sm:text-sm text-muted-foreground">Margem</p>
                            <p className={`text-sm sm:text-base font-bold ${margem >= 0 ? 'text-primary' : 'text-destructive'}`}>
                              R$ {margem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            <h3 className="font-semibold text-lg mb-2 mt-6">Despesas</h3>
            <div className="space-y-2">
              {loadingDespesas ? (
                <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
              ) : despesas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma despesa encontrada
                </p>
              ) : (
                despesas.map((despesa: any) => (
                  <Card key={despesa.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{getTipoDespesaLabel(despesa.tipo)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateBR(despesa.data)} • {despesa.viagem?.codigo || 'Sem viagem'}
                          </p>
                        </div>
                        <p className="font-bold text-destructive">
                          R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4 pt-4">
            {acertos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum acerto registrado
              </p>
            ) : (
              <div className="space-y-2">
                {acertos.map((acerto) => (
                  <Card key={acerto.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{acerto.codigo}</p>
                           <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatDateBR(acerto.periodo_inicio)} até {formatDateBR(acerto.periodo_fim)}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Comissão:</span>
                              <span className="ml-1 font-medium">
                                R$ {acerto.valor_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reembolsos:</span>
                              <span className="ml-1 font-medium">
                                R$ {acerto.total_reembolsos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl font-bold text-primary">
                            R$ {acerto.total_pagar?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">{acerto.status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="config-clt" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração CLT para {motorista.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {configCLT && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary font-medium flex items-center gap-2">
                      ✓ Configuração ativa desde {formatDateBR(configCLT.created_at)}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="salario-base" className="text-sm">Salário Base (R$)</Label>
                    <Input
                      id="salario-base"
                      type="number"
                      step="0.01"
                      min="0"
                      value={salarioBase}
                      onChange={(e) => setSalarioBase(e.target.value)}
                      placeholder="2700.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor-diaria" className="text-sm">Valor da Diária (R$)</Label>
                    <Input
                      id="valor-diaria"
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorDiaria}
                      onChange={(e) => setValorDiaria(e.target.value)}
                      placeholder="80.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor-hora-extra" className="text-sm">Valor Hora Extra (R$)</Label>
                    <Input
                      id="valor-hora-extra"
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorHoraExtra}
                      onChange={(e) => setValorHoraExtra(e.target.value)}
                      placeholder="19.64"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor-hora-fds" className="text-sm">Valor Hora Fim de Semana (R$)</Label>
                    <Input
                      id="valor-hora-fds"
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorHoraFDS}
                      onChange={(e) => setValorHoraFDS(e.target.value)}
                      placeholder="24.55"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor-hora-feriado" className="text-sm">Valor Hora Feriado (R$)</Label>
                    <Input
                      id="valor-hora-feriado"
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorHoraFeriado}
                      onChange={(e) => setValorHoraFeriado(e.target.value)}
                      placeholder="24.55"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSalvarConfigCLT}
                    disabled={salvandoConfig}
                  >
                    {salvandoConfig ? 'Salvando...' : 'Salvar Configuração'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CriarLoginDialog
          open={showCriarLogin}
          onOpenChange={setShowCriarLogin}
          motorista={motorista}
        />

        <AlterarSenhaDialog
          open={showAlterarSenha}
          onOpenChange={setShowAlterarSenha}
          motorista={motorista}
        />
      </DialogContent>
    </Dialog>
  );
}
