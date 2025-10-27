import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, ArrowLeft, Loader2, DollarSign, Receipt, Banknote, FileImage } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RecebimentoFreteMultiplo } from '@/components/motorista/RecebimentoFreteMultiplo';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function AdicionarDespesa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getCurrentLocation } = useGeolocation();
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [showRecebimentoForm, setShowRecebimentoForm] = useState(false);
  const [dadosExtraidosRecebimento, setDadosExtraidosRecebimento] = useState<any>(null);

  // Carregar foto do state (vinda do modal de captura rápida)
  useEffect(() => {
    if (location.state?.foto) {
      const file = location.state.foto as File;
      setFoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, [location.state]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const processarComprovante = async (tipo: 'adiantamento' | 'despesa' | 'recebimento_frete') => {
    if (!foto || !id) {
      toast.error('Tire uma foto primeiro');
      return;
    }

    // Se for recebimento de frete, processar e abrir formulário
    if (tipo === 'recebimento_frete') {
      setProcessando(true);
      try {
        // Comprimir imagem antes de processar
        const fotoComprimida = await compressImage(foto);
        
        const formData = new FormData();
        formData.append('file', fotoComprimida);
        formData.append('viagemId', id);

        const { data, error } = await supabase.functions.invoke('processar-comprovante', {
          body: formData
        });

        if (error) {
          console.error('Erro ao processar:', error);
          throw new Error(error.message || 'Erro ao processar comprovante');
        }

        setDadosExtraidosRecebimento(data);
        setShowRecebimentoForm(true);
      } catch (error: any) {
        console.error('Erro ao processar:', error);
        if (error.message?.includes('429')) {
          toast.error('Muitas requisições. Aguarde um momento e tente novamente.');
        } else if (error.message?.includes('402')) {
          toast.error('Créditos insuficientes. Entre em contato com o suporte.');
        } else {
          toast.error('Erro ao processar: ' + error.message);
        }
      } finally {
        setProcessando(false);
      }
      return;
    }

    // Para adiantamento e despesa, processar normalmente
    setProcessando(true);
    try {
      // Capturar localização GPS
      toast.info('📍 Capturando localização...');
      const locationData = await getCurrentLocation();

      // Comprimir imagem antes de processar
      const fotoComprimida = await compressImage(foto);
      
      // Upload para storage
      const fileExt = fotoComprimida.name.split('.').pop();
      const fileName = `${id}-${tipo}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, fotoComprimida);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(fileName);

      // Processar com Lovable AI
      const formData = new FormData();
      formData.append('file', fotoComprimida);
      formData.append('viagemId', id);

      const { data: dadosExtraidos, error: processError } = await supabase.functions.invoke('processar-comprovante', {
        body: formData
      });

      if (processError) {
        console.warn('Não foi possível processar automaticamente:', processError);
        toast.warning('Não foi possível extrair informações. Preencha manualmente.');
      }

      // Criar registro automático
      if (tipo === 'adiantamento') {
        const { error } = await supabase
          .from('transacoes_viagem')
          .insert({
            viagem_id: id,
            tipo: tipo,
            valor: dadosExtraidos?.valor || 0,
            data: dadosExtraidos?.data || new Date().toISOString(),
            descricao: dadosExtraidos?.descricao || 'Adiantamento via comprovante',
            forma_pagamento: null,
            latitude: locationData?.latitude,
            longitude: locationData?.longitude,
            localizacao_timestamp: locationData ? new Date(locationData.timestamp).toISOString() : null,
          });

        if (error) throw error;
        toast.success('Adiantamento adicionado com sucesso!');
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
            latitude: locationData?.latitude,
            longitude: locationData?.longitude,
            localizacao_timestamp: locationData ? new Date(locationData.timestamp).toISOString() : null,
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

  const handleRecebimentoSubmit = async (parcelas: Array<{
    valor: number;
    forma_pagamento: string;
    data: string;
    descricao?: string;
  }>) => {
    if (!id) return;

    setProcessando(true);
    try {
      // Capturar localização uma vez para todas as parcelas
      const locationData = await getCurrentLocation();

      // Inserir todas as parcelas de uma vez
      const transacoes = parcelas.map(parcela => ({
        viagem_id: id,
        tipo: 'recebimento_frete',
        valor: parcela.valor,
        data: parcela.data,
        descricao: parcela.descricao || `Recebimento via ${parcela.forma_pagamento}`,
        forma_pagamento: parcela.forma_pagamento,
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        localizacao_timestamp: locationData ? new Date(locationData.timestamp).toISOString() : null,
      }));

      const { error } = await supabase
        .from('transacoes_viagem')
        .insert(transacoes);

      if (error) throw error;
      
      const totalRecebido = parcelas.reduce((acc, p) => acc + p.valor, 0);
      toast.success(`${parcelas.length} recebimento(s) registrado(s) - Total: R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      navigate(`/motorista/viagem/${id}`);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar recebimentos: ' + error.message);
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
          <div className="space-y-3">
            <Button
              onClick={() => document.getElementById('foto-camera')?.click()}
              className="w-full h-20 text-lg font-semibold gap-3"
              size="lg"
            >
              <Camera className="h-6 w-6" />
              📸 Tirar Foto
            </Button>
            
            <Button
              onClick={() => document.getElementById('foto-galeria')?.click()}
              variant="outline"
              className="w-full h-20 text-lg font-semibold gap-3"
              size="lg"
            >
              <FileImage className="h-6 w-6" />
              📎 Escolher da Galeria
            </Button>
          </div>
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

        {/* Inputs ocultos - câmera e galeria separados */}
        <input
          id="foto-camera"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFotoChange}
          className="hidden"
        />
        <input
          id="foto-galeria"
          type="file"
          accept="image/*"
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

      <RecebimentoFreteMultiplo
        open={showRecebimentoForm}
        onOpenChange={setShowRecebimentoForm}
        onSubmit={handleRecebimentoSubmit}
        valorExtraido={dadosExtraidosRecebimento?.valor}
        isLoading={processando}
      />
    </div>
  );
}
