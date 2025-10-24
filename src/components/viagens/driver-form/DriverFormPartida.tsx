import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface DriverFormPartidaProps {
  viagemId: string;
}

interface PartidaFormData {
  km_inicial: number;
  data_saida: string;
  checklist_pneus: boolean;
  checklist_luzes: boolean;
  checklist_documentos: boolean;
}

export function DriverFormPartida({ viagemId }: DriverFormPartidaProps) {
  const queryClient = useQueryClient();
  const [fotoPanel, setFotoPanel] = useState<File | null>(null);
  const [fotoAvaria, setFotoAvaria] = useState<File | null>(null);

  const { data: viagem } = useQuery({
    queryKey: ['viagem-driver', viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viagens')
        .select('*, veiculo:veiculos(placa, status)')
        .eq('id', viagemId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { register, handleSubmit } = useForm<PartidaFormData>({
    defaultValues: {
      data_saida: new Date().toISOString().slice(0, 16),
    },
  });

  const registrarPartida = useMutation({
    mutationFn: async (data: PartidaFormData) => {
      let partidaFotoUrl = null;

      // Upload da foto do painel
      if (fotoPanel) {
        const fileName = `${viagemId}-partida-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, fotoPanel);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(fileName);

        partidaFotoUrl = publicUrl;
      }

      // Atualizar viagem
      const { error } = await supabase
        .from('viagens')
        .update({
          status: 'em_andamento',
          data_saida: data.data_saida,
          km_inicial: data.km_inicial,
          partida_foto_url: partidaFotoUrl,
        })
        .eq('id', viagemId);

      if (error) throw error;

      // Atualizar veículo para ocupado
      if (viagem?.veiculo_id) {
        await supabase
          .from('veiculos')
          .update({ em_viagem: true })
          .eq('id', viagem.veiculo_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagem-driver', viagemId] });
      toast.success('Partida registrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar partida: ' + error.message);
    },
  });

  const onSubmit = (data: PartidaFormData) => {
    if (!data.checklist_pneus || !data.checklist_luzes || !data.checklist_documentos) {
      toast.error('Complete o checklist antes de iniciar');
      return;
    }
    registrarPartida.mutate(data);
  };

  const veiculo = viagem?.veiculo ? (Array.isArray(viagem.veiculo) ? viagem.veiculo[0] : viagem.veiculo) : null;
  const jaIniciada = viagem?.status === 'em_andamento' || viagem?.status === 'concluida';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      <div className="space-y-2">
        <Label>Veículo (Placa)</Label>
        <Input
          value={veiculo?.placa || 'Carregando...'}
          disabled
          className={veiculo?.status === 'inativo' ? 'bg-destructive/10' : ''}
        />
        {veiculo?.status === 'inativo' && (
          <p className="text-sm text-destructive">Veículo inativo - contate o operacional</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Quilometragem Inicial *</Label>
        <Input
          type="number"
          {...register('km_inicial', { required: true, valueAsNumber: true })}
          disabled={jaIniciada}
        />
      </div>

      <div className="space-y-2">
        <Label>Foto do Painel *</Label>
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFotoPanel(e.target.files?.[0] || null)}
          disabled={jaIniciada}
        />
      </div>

      <div className="space-y-2">
        <Label>Data/Hora de Saída</Label>
        <Input
          type="datetime-local"
          {...register('data_saida')}
          disabled={jaIniciada}
        />
      </div>

      <div className="space-y-4">
        <Label>Checklist Rápido</Label>
        <div className="flex items-center space-x-2">
          <Checkbox id="pneus" {...register('checklist_pneus')} disabled={jaIniciada} />
          <label htmlFor="pneus" className="text-sm">Pneus OK</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="luzes" {...register('checklist_luzes')} disabled={jaIniciada} />
          <label htmlFor="luzes" className="text-sm">Luzes OK</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="docs" {...register('checklist_documentos')} disabled={jaIniciada} />
          <label htmlFor="docs" className="text-sm">Documentos OK</label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Foto de Avaria (se houver)</Label>
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFotoAvaria(e.target.files?.[0] || null)}
          disabled={jaIniciada}
        />
      </div>

      {!jaIniciada && (
        <Button
          type="submit"
          className="w-full"
          disabled={registrarPartida.isPending || veiculo?.status === 'inativo'}
        >
          <Upload className="w-4 h-4 mr-2" />
          Iniciar Viagem
        </Button>
      )}

      {jaIniciada && (
        <p className="text-center text-muted-foreground">Partida já registrada</p>
      )}
    </form>
  );
}
