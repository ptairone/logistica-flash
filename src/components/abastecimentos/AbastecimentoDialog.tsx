import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Check, X, Fuel } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAbastecimentos } from '@/hooks/useAbastecimentos';
import { abastecimentoSchema, type AbastecimentoFormData, type AbastecimentoDadosExtraidos } from '@/lib/validations-abastecimento';

interface AbastecimentoDialogProps {
  open: boolean;
  onClose: () => void;
  veiculoId: string;
  viagemId?: string;
  motoristaId?: string;
}

export function AbastecimentoDialog({
  open,
  onClose,
  veiculoId,
  viagemId,
  motoristaId,
}: AbastecimentoDialogProps) {
  const [etapa, setEtapa] = useState<'foto' | 'confirmacao'>('foto');
  const [processando, setProcessando] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [dadosExtraidos, setDadosExtraidos] = useState<AbastecimentoDadosExtraidos | null>(null);

  const { createAbastecimento } = useAbastecimentos(veiculoId, viagemId);

  const form = useForm<AbastecimentoFormData>({
    resolver: zodResolver(abastecimentoSchema),
    defaultValues: {
      veiculo_id: veiculoId,
      viagem_id: viagemId || null,
      motorista_id: motoristaId || null,
      km_veiculo: 0,
      litros: 0,
      valor_total: 0,
      data_abastecimento: new Date().toISOString(),
    },
  });

  const handleFotoCapturada = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessando(true);

    try {
      // Upload do comprovante
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(uploadData.path);

      setFotoUrl(publicUrl);

      // Processar com edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', 'abastecimento');

      const { data, error } = await supabase.functions.invoke('processar-comprovante', {
        body: formData,
      });

      if (error) throw error;

      if (data?.dados) {
        setDadosExtraidos(data.dados);
        
        // Preencher formulário com dados extraídos
        if (data.dados.km_veiculo) form.setValue('km_veiculo', data.dados.km_veiculo);
        if (data.dados.litros) form.setValue('litros', data.dados.litros);
        if (data.dados.valor_total) form.setValue('valor_total', data.dados.valor_total);
        if (data.dados.posto_nome) form.setValue('posto_nome', data.dados.posto_nome);
        if (data.dados.posto_cidade) form.setValue('posto_cidade', data.dados.posto_cidade);
        if (data.dados.posto_uf) form.setValue('posto_uf', data.dados.posto_uf);
        if (data.dados.data_abastecimento) {
          form.setValue('data_abastecimento', data.dados.data_abastecimento);
        }

        form.setValue('comprovante_url', publicUrl);
        setEtapa('confirmacao');
      } else {
        toast.warning('Não foi possível extrair dados. Preencha manualmente.');
        form.setValue('comprovante_url', publicUrl);
        setEtapa('confirmacao');
      }
    } catch (error) {
      console.error('Erro ao processar comprovante:', error);
      toast.error('Erro ao processar comprovante');
    } finally {
      setProcessando(false);
    }
  };

  const handleSubmit = async (data: AbastecimentoFormData) => {
    try {
      // Capturar localização
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            form.setValue('latitude', position.coords.latitude);
            form.setValue('longitude', position.coords.longitude);
            form.setValue('localizacao_timestamp', new Date().toISOString());
          }
        );
      }

      await createAbastecimento.mutateAsync(data);
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar abastecimento:', error);
    }
  };

  const handleClose = () => {
    setEtapa('foto');
    setFotoUrl(null);
    setDadosExtraidos(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Registrar Abastecimento
          </DialogTitle>
        </DialogHeader>

        {etapa === 'foto' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Tire uma foto do comprovante de abastecimento
              </p>
              <Label
                htmlFor="foto-comprovante"
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {processando ? 'Processando...' : 'Toque para capturar'}
                </span>
              </Label>
              <Input
                id="foto-comprovante"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFotoCapturada}
                disabled={processando}
              />
            </div>
          </div>
        )}

        {etapa === 'confirmacao' && (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {fotoUrl && (
              <div className="rounded-lg overflow-hidden">
                <img src={fotoUrl} alt="Comprovante" className="w-full" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="km_veiculo">KM do Veículo *</Label>
                <Input
                  id="km_veiculo"
                  type="number"
                  step="0.1"
                  {...form.register('km_veiculo', { valueAsNumber: true })}
                />
                {form.formState.errors.km_veiculo && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.km_veiculo.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="litros">Litros *</Label>
                <Input
                  id="litros"
                  type="number"
                  step="0.01"
                  {...form.register('litros', { valueAsNumber: true })}
                />
                {form.formState.errors.litros && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.litros.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="valor_total">Valor Total (R$) *</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                {...form.register('valor_total', { valueAsNumber: true })}
              />
              {form.formState.errors.valor_total && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.valor_total.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="posto_nome">Nome do Posto</Label>
              <Input
                id="posto_nome"
                {...form.register('posto_nome')}
                placeholder="Ex: Shell, Petrobras"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="posto_cidade">Cidade</Label>
                <Input id="posto_cidade" {...form.register('posto_cidade')} />
              </div>
              <div>
                <Label htmlFor="posto_uf">UF</Label>
                <Input
                  id="posto_uf"
                  {...form.register('posto_uf')}
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" {...form.register('observacoes')} />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createAbastecimento.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
