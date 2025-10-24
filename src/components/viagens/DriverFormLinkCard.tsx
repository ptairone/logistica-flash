import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDriverFormLink } from '@/hooks/useDriverFormLink';
import { Copy, Send, RotateCcw, Ban, QrCode, MessageSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DriverFormLinkCardProps {
  viagemId: string;
}

export function DriverFormLinkCard({ viagemId }: DriverFormLinkCardProps) {
  const { linkStatus, isLoading, generateLink, revokeLink, renewLink } = useDriverFormLink(viagemId);
  const [canal, setCanal] = useState<'whatsapp' | 'sms' | 'email' | 'copiar'>('whatsapp');
  const [showQR, setShowQR] = useState(false);

  const handleGenerate = () => {
    generateLink.mutate({ viagemId, canal });
  };

  const handleRevoke = () => {
    if (confirm('Deseja realmente revogar este link?')) {
      revokeLink.mutate(viagemId);
    }
  };

  const handleRenew = () => {
    renewLink.mutate(viagemId);
  };

  const getStatusBadge = () => {
    if (!linkStatus?.link_status) return null;
    
    const statusMap = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      expirado: { label: 'Expirado', variant: 'secondary' as const },
      revogado: { label: 'Revogado', variant: 'destructive' as const },
    };

    const status = statusMap[linkStatus.link_status as keyof typeof statusMap];
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Link do Motorista</span>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {linkStatus?.driver_form_url ? (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Link gerado: {linkStatus.driver_form_url}
                </p>
                {linkStatus.link_expires_at && (
                  <p className="text-sm text-muted-foreground">
                    Válido até: {new Date(linkStatus.link_expires_at).toLocaleString('pt-BR')}
                  </p>
                )}
                {linkStatus.ultimo_acesso_em && (
                  <p className="text-sm text-muted-foreground">
                    Último acesso: {new Date(linkStatus.ultimo_acesso_em).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(linkStatus.driver_form_url);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowQR(true)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRenew}
                  disabled={linkStatus.link_status !== 'ativo'}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Renovar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRevoke}
                  disabled={linkStatus.link_status === 'revogado'}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Revogar
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={canal} onValueChange={(v: any) => setCanal(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="copiar">Apenas Copiar</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleGenerate} disabled={generateLink.isPending}>
                  <Send className="w-4 h-4 mr-2" />
                  Gerar e Enviar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code - Link do Motorista</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-6">
            {linkStatus?.driver_form_url && (
              <QRCodeSVG value={linkStatus.driver_form_url} size={256} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
