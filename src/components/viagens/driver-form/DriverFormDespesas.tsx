import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DriverFormDespesasProps {
  viagemId: string;
}

interface DespesaFormData {
  tipo: string;
  valor: number;
  data: string;
  reembolsavel: boolean;
}

export function DriverFormDespesas({ viagemId }: DriverFormDespesasProps) {
  const queryClient = useQueryClient();
  const [anexo, setAnexo] = useState<File | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<DespesaFormData>({
    defaultValues: {
      data: new Date().toISOString().slice(0, 16),
      reembolsavel: true,
    },
  });

  const tipo = watch('tipo');

  const { data: despesas } = useQuery({
    queryKey: ['despesas-driver', viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const adicionarDespesa = useMutation({
    mutationFn: async (data: DespesaFormData) => {
      let anexoUrl = null;

      if (anexo) {
        const fileName = `${viagemId}-despesa-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, anexo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(fileName);

        anexoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('despesas')
        .insert({
          viagem_id: viagemId,
          tipo: data.tipo,
          valor: data.valor,
          data: data.data,
          reembolsavel: data.reembolsavel,
          anexo_url: anexoUrl,
          origem: 'motorista',
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas-driver', viagemId] });
      toast.success('Despesa adicionada');
      reset();
      setAnexo(null);
    },
  });

  const deletarDespesa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas-driver', viagemId] });
      toast.success('Despesa removida');
    },
  });

  const onSubmit = (data: DespesaFormData) => {
    adicionarDespesa.mutate(data);
  };

  const subtotal = despesas?.reduce((sum, d) => sum + Number(d.valor), 0) || 0;

  return (
    <div className="space-y-6 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4">
        <h3 className="font-semibold">Adicionar Despesa</h3>

        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select onValueChange={(v) => setValue('tipo', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="combustivel">Combustível</SelectItem>
              <SelectItem value="pedagio">Pedágio</SelectItem>
              <SelectItem value="alimentacao">Alimentação</SelectItem>
              <SelectItem value="hospedagem">Hospedagem</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Valor (R$) *</Label>
          <Input
            type="number"
            step="0.01"
            {...register('valor', { required: true, valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label>Data/Hora</Label>
          <Input type="datetime-local" {...register('data')} />
        </div>

        <div className="space-y-2">
          <Label>Anexo (Nota/Foto)</Label>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setAnexo(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="reembolsavel"
            checked={watch('reembolsavel')}
            onCheckedChange={(checked) => setValue('reembolsavel', !!checked)}
          />
          <label htmlFor="reembolsavel" className="text-sm">Reembolsável</label>
        </div>

        <Button type="submit" className="w-full" disabled={!tipo}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </form>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Despesas Lançadas</h3>
          <p className="text-sm text-muted-foreground">
            Total: R$ {subtotal.toFixed(2)} ({despesas?.length || 0} itens)
          </p>
        </div>

        {despesas?.map((despesa) => (
          <Card key={despesa.id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-medium">{despesa.tipo}</p>
                <p className="text-sm text-muted-foreground">
                  R$ {Number(despesa.valor).toFixed(2)} - {new Date(despesa.data).toLocaleDateString('pt-BR')}
                </p>
                {despesa.reembolsavel && (
                  <p className="text-xs text-primary">Reembolsável</p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deletarDespesa.mutate(despesa.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {!despesas?.length && (
          <p className="text-center text-muted-foreground py-8">Nenhuma despesa lançada</p>
        )}
      </div>
    </div>
  );
}
