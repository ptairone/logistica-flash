import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useImportacaoEstoque } from '@/hooks/useImportacaoEstoque';
import { validarTotais, validarCNPJ } from '@/lib/validations-importacao';
import { useToast } from '@/hooks/use-toast';

interface ImportacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportacaoDialog({ open, onOpenChange }: ImportacaoDialogProps) {
  const { toast } = useToast();
  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [arquivo, setArquivo] = useState<File | null>(null);
  
  const {
    documentoProcessado,
    itensComMatching,
    setItensComMatching,
    processarArquivo,
    confirmarEntrada,
    isProcessing,
    isConfirming,
  } = useImportacaoEstoque();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/xml', 'text/xml', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xml|png|jpe?g)$/i)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Por favor, envie apenas arquivos XML (NF-e) ou imagens PNG/JPEG (DANFE/Nota Fiscal).',
        variant: 'destructive',
      });
      return;
    }

    setArquivo(file);
  }, [toast]);

  const handleProcessar = async () => {
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      
      processarArquivo.mutate(
        {
          file: base64,
          fileName: arquivo.name,
          fileType: arquivo.type,
        },
        {
          onSuccess: () => setPasso(2),
        }
      );
    };
    reader.readAsDataURL(arquivo);
  };

  const handleToggleItem = (id: string) => {
    setItensComMatching(prev =>
      prev.map(item =>
        item.id_temp === id ? { ...item, aceito: !item.aceito } : item
      )
    );
  };

  const handleConfirmar = async () => {
    confirmarEntrada.mutate(itensComMatching, {
      onSuccess: () => {
        setPasso(3);
        setTimeout(() => {
          onOpenChange(false);
          setPasso(1);
          setArquivo(null);
        }, 2000);
      },
    });
  };

  const validacaoTotais = documentoProcessado
    ? validarTotais(documentoProcessado.itens, documentoProcessado.totais, 2)
    : null;

  const cnpjValido = documentoProcessado
    ? validarCNPJ(documentoProcessado.fornecedor.cnpj)
    : false;

  const itensBaixaConfianca = itensComMatching.filter(
    item => (item.score_matching || 0) < 0.8
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Importação de Documentos - Passo {passo} de 3
          </DialogTitle>
        </DialogHeader>

        {/* Passo 1: Upload */}
        {passo === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Arraste e solte ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".xml,.png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>Selecionar Arquivo</span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Tipos aceitos: XML (NF-e) ou imagens PNG/JPEG (DANFE, faturas)
              </p>
            </div>

            {arquivo && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <FileText className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">{arquivo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(arquivo.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  onClick={handleProcessar}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processando...' : 'Processar'}
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Extraindo dados do documento...
                </p>
                <Progress value={undefined} />
              </div>
            )}
          </div>
        )}

        {/* Passo 2: Revisão */}
        {passo === 2 && documentoProcessado && (
          <div className="space-y-4">
            {/* Alertas */}
            <div className="space-y-2">
              {!cnpjValido && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    CNPJ do fornecedor inválido: {documentoProcessado.fornecedor.cnpj}
                  </AlertDescription>
                </Alert>
              )}

              {validacaoTotais && !validacaoTotais.valido && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Divergência nos totais: {validacaoTotais.percentual.toFixed(2)}% 
                    (R$ {validacaoTotais.diferenca.toFixed(2)})
                  </AlertDescription>
                </Alert>
              )}

              {itensBaixaConfianca.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {itensBaixaConfianca.length} itens com baixa confiança de extração (menor que 80%)
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Informações do Documento */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
              <div>
                <p className="text-sm text-muted-foreground">Fornecedor</p>
                <p className="font-semibold">{documentoProcessado.fornecedor.razao}</p>
                <p className="text-sm">{documentoProcessado.fornecedor.cnpj}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documento</p>
                <p className="font-semibold">
                  {documentoProcessado.documento.tipo} - Nº {documentoProcessado.documento.numero}
                </p>
                <p className="text-sm">
                  Valor Total: R$ {documentoProcessado.totais.valorTotal.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tabela de Itens */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Match Catálogo</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensComMatching.map((item) => (
                    <TableRow key={item.id_temp}>
                      <TableCell>
                        <Checkbox
                          checked={item.aceito}
                          onCheckedChange={() => handleToggleItem(item.id_temp)}
                        />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="font-medium truncate">{item.descricao}</p>
                        {item.codigoFornecedor && (
                          <p className="text-xs text-muted-foreground">
                            Cód: {item.codigoFornecedor}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.item_catalogo_nome ? (
                          <div>
                            <p className="text-sm truncate max-w-[150px]">
                              {item.item_catalogo_nome}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {((item.score_matching || 0) * 100).toFixed(0)}% de similaridade
                            </p>
                          </div>
                        ) : (
                          <Badge variant="outline">Criar novo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.quantidade} {item.unidade}
                      </TableCell>
                      <TableCell>
                        R$ {item.valorUnitario?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        R$ {item.valorTotal?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        {item.aceito ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Aceito
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Ignorado
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setPasso(1)}>
                Voltar
              </Button>
              <Button
                onClick={handleConfirmar}
                disabled={isConfirming || itensComMatching.filter(i => i.aceito).length === 0}
              >
                {isConfirming ? 'Confirmando...' : 'Confirmar Entrada'}
              </Button>
            </div>
          </div>
        )}

        {/* Passo 3: Sucesso */}
        {passo === 3 && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Entrada Confirmada!</h3>
            <p className="text-muted-foreground">
              Os itens foram adicionados ao estoque com sucesso.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
