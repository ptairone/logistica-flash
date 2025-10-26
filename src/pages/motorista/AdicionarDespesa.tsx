import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, ArrowLeft, Loader2, DollarSign, Receipt, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdicionarDespesa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const processarComprovante = async (tipo: 'adiantamento' | 'despesa' | 'recebimento_frete') => {
    if (!foto || !id) {
      toast.error('Tire uma foto primeiro');
      return;
    }

    setProcessando(true);
    try {
      // Upload para storage
      const fileExt = foto.name.split('.').pop();
      const fileName = `${id}-${tipo}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, foto);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(fileName);

      // Processar com OpenAI
      const formData = new FormData();
      formData.append('file', foto);
      formData.append('viagemId', id);

      const response = await fetch(
        `https://plfpczvnqmvqpmsbjrra.supabase.co/functions/v1/processar-comprovante`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZnBjenZucW12cXBtc2JqcnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTIwMjEsImV4cCI6MjA3Njg2ODAyMX0.k0JoQvzptgBNr4pBSOQjAE9q_Mge6gVdCFd471onPBI`,
          },
          body: formData,
        }
      );

      let dadosExtraidos = null;
      if (response.ok) {
        dadosExtraidos = await response.json();
      }

      // Criar registro automático
      if (tipo === 'adiantamento' || tipo === 'recebimento_frete') {
        const { error } = await supabase
          .from('transacoes_viagem')
          .insert({
            viagem_id: id,
            tipo: tipo,
            valor: dadosExtraidos?.valor || 0,
            data: dadosExtraidos?.data || new Date().toISOString(),
            descricao: dadosExtraidos?.descricao || `${tipo} via comprovante`,
            forma_pagamento: dadosExtraidos?.forma_pagamento || (tipo === 'recebimento_frete' ? 'dinheiro' : null),
          });

        if (error) throw error;
        toast.success(`${tipo === 'adiantamento' ? 'Adiantamento' : 'Recebimento de Frete'} adicionado com sucesso!`);
      } else {
        const { error } = await supabase
          .from('despesas')
          .insert({
            viagem_id: id,
            tipo: dadosExtraidos?.tipo || 'outros',
            valor: dadosExtraidos?.valor || 0,
            data: dadosExtraidos?.data || new Date().toISOString(),
            descricao: dadosExtraidos?.descricao || 'Despesa via comprovante',
            reembolsavel: dadosExtraidos?.reembolsavel ?? true,
            anexo_url: publicUrl,
          });

        if (error) throw error;
        toast.success('Despesa adicionada com sucesso!');
      }

      navigate(`/motorista/viagem/${id}`);
    } catch (error: any) {
      console.error('Erro ao processar:', error);
      toast.error('Erro ao processar comprovante: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/motorista/viagem/${id}`)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Adicionar Comprovante</h1>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Área de Captura */}
        {!foto ? (
          <label
            htmlFor="foto-comprovante"
            className="flex flex-col items-center justify-center gap-4 h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
          >
            <Camera className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <p className="text-xl font-semibold mb-1">Tirar Foto do Comprovante</p>
              <p className="text-sm text-muted-foreground">Toque para abrir a câmera</p>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img src={previewUrl!} alt="Preview" className="w-full h-auto" />
            </Card>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setFoto(null);
                setPreviewUrl(null);
              }}
            >
              Tirar Outra Foto
            </Button>
          </div>
        )}

        <input
          id="foto-comprovante"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFotoChange}
          className="hidden"
        />

        {/* Botões de Tipo */}
        {foto && !processando && (
          <div className="space-y-3">
            <p className="text-center text-lg font-semibold">Selecione o tipo:</p>
            
            <Button
              onClick={() => processarComprovante('adiantamento')}
              className="w-full h-20 text-xl font-bold bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <DollarSign className="mr-3 h-8 w-8" />
              Adiantamento
            </Button>

            <Button
              onClick={() => processarComprovante('despesa')}
              className="w-full h-20 text-xl font-bold bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              <Receipt className="mr-3 h-8 w-8" />
              Despesa
            </Button>

            <Button
              onClick={() => processarComprovante('recebimento_frete')}
              className="w-full h-20 text-xl font-bold bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Banknote className="mr-3 h-8 w-8" />
              Recebimento de Frete
            </Button>
          </div>
        )}

        {/* Loading */}
        {processando && (
          <Card className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-xl font-semibold">Processando comprovante...</p>
            <p className="text-sm text-muted-foreground mt-2">Aguarde enquanto lemos as informações</p>
          </Card>
        )}
      </div>
    </div>
  );
}
