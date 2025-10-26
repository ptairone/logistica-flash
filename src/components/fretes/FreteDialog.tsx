import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { freteSchema, FreteFormData, formatCPFCNPJ } from '@/lib/validations-frete';
import { formatCEP } from '@/lib/validations-viagem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FreteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FreteFormData) => void;
  frete?: any;
  isLoading?: boolean;
}

export function FreteDialog({ open, onOpenChange, onSubmit, frete, isLoading }: FreteDialogProps) {
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [buscandoCEPOrigem, setBuscandoCEPOrigem] = useState(false);
  const [buscandoCEPDestino, setBuscandoCEPDestino] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FreteFormData>({
    resolver: zodResolver(freteSchema),
    defaultValues: {
      status: 'aberto',
    },
  });

  useEffect(() => {
    if (frete) {
      reset({
        ...frete,
        peso: frete.peso || undefined,
        volume: frete.volume || undefined,
      });
    } else {
      reset({
        status: 'aberto',
      });
    }
  }, [frete, reset]);

  const status = watch('status');

  const handleCPFCNPJChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFCNPJ(e.target.value);
    setValue('cliente_cnpj_cpf', formatted);

    // Se for CNPJ completo (18 caracteres com formatação)
    if (formatted.length === 18) {
      setBuscandoCNPJ(true);
      try {
        const { data, error } = await supabase.functions.invoke('consultar-cnpj', {
          body: { cnpj: formatted }
        });

        if (error) throw error;

        if (data) {
          setValue('cliente_nome', data.razao_social || data.nome_fantasia);
          if (data.telefone) {
            setValue('cliente_contato', data.telefone);
          }
          toast.success('Dados do CNPJ carregados com sucesso!');
        }
      } catch (error: any) {
        console.error('Erro ao buscar CNPJ:', error);
        toast.error('Não foi possível buscar os dados do CNPJ');
      } finally {
        setBuscandoCNPJ(false);
      }
    }
  };

  const handleCEPChange = (field: 'origem_cep' | 'destino_cep') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setValue(field, formatted);

    // Se CEP completo (9 caracteres com formatação)
    if (formatted.length === 9) {
      const setBuscando = field === 'origem_cep' ? setBuscandoCEPOrigem : setBuscandoCEPDestino;
      setBuscando(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('consultar-cep', {
          body: { cep: formatted }
        });

        if (error) throw error;

        if (data) {
          const enderecoField = field === 'origem_cep' ? 'origem' : 'destino';
          setValue(enderecoField, data.cidade);
          toast.success('Endereço carregado com sucesso!');
        }
      } catch (error: any) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Não foi possível buscar o endereço');
      } finally {
        setBuscando(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{frete ? 'Editar Frete' : 'Novo Frete'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                {...register('codigo')}
                placeholder="FRT001"
              />
              {errors.codigo && (
                <p className="text-sm text-destructive">{errors.codigo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="faturado">Faturado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
              <Input
                id="cliente_nome"
                {...register('cliente_nome')}
                placeholder="Empresa LTDA"
              />
              {errors.cliente_nome && (
                <p className="text-sm text-destructive">{errors.cliente_nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_cnpj_cpf">CPF/CNPJ *</Label>
              <div className="relative">
                <Input
                  id="cliente_cnpj_cpf"
                  {...register('cliente_cnpj_cpf')}
                  onChange={handleCPFCNPJChange}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  disabled={buscandoCNPJ}
                />
                {buscandoCNPJ && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {errors.cliente_cnpj_cpf && (
                <p className="text-sm text-destructive">{errors.cliente_cnpj_cpf.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_contato">Contato</Label>
            <Input
              id="cliente_contato"
              {...register('cliente_contato')}
              placeholder="(11) 98765-4321"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origem">Origem *</Label>
              <Input
                id="origem"
                {...register('origem')}
                placeholder="São Paulo, SP"
              />
              {errors.origem && (
                <p className="text-sm text-destructive">{errors.origem.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="origem_cep">CEP Origem</Label>
              <div className="relative">
                <Input
                  id="origem_cep"
                  {...register('origem_cep')}
                  onChange={handleCEPChange('origem_cep')}
                  placeholder="01310-100"
                  maxLength={9}
                  disabled={buscandoCEPOrigem}
                />
                {buscandoCEPOrigem && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                {...register('destino')}
                placeholder="Rio de Janeiro, RJ"
              />
              {errors.destino && (
                <p className="text-sm text-destructive">{errors.destino.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino_cep">CEP Destino</Label>
              <div className="relative">
                <Input
                  id="destino_cep"
                  {...register('destino_cep')}
                  onChange={handleCEPChange('destino_cep')}
                  placeholder="20040-020"
                  maxLength={9}
                  disabled={buscandoCEPDestino}
                />
                {buscandoCEPDestino && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_coleta">Data de Coleta</Label>
              <Input
                id="data_coleta"
                type="date"
                {...register('data_coleta')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_entrega">Data de Entrega</Label>
              <Input
                id="data_entrega"
                type="date"
                {...register('data_entrega')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Input
                id="produto"
                {...register('produto')}
                placeholder="Mercadorias diversas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_carga">Tipo de Carga</Label>
              <Input
                id="tipo_carga"
                {...register('tipo_carga')}
                placeholder="Carga seca"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.01"
                {...register('peso', { valueAsNumber: true })}
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume (m³)</Label>
              <Input
                id="volume"
                type="number"
                step="0.01"
                {...register('volume', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_frete">Valor do Frete (R$) *</Label>
              <Input
                id="valor_frete"
                type="number"
                step="0.01"
                {...register('valor_frete', { valueAsNumber: true })}
                placeholder="1500.00"
              />
              {errors.valor_frete && (
                <p className="text-sm text-destructive">{errors.valor_frete.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condicao_pagamento">Condição de Pagamento</Label>
              <Input
                id="condicao_pagamento"
                {...register('condicao_pagamento')}
                placeholder="À vista / 30 dias"
              />
            </div>

            {status === 'faturado' && (
              <div className="space-y-2">
                <Label htmlFor="numero_fatura">Número da Fatura/Nota</Label>
                <Input
                  id="numero_fatura"
                  {...register('numero_fatura')}
                  placeholder="NF-12345"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais sobre o frete..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : frete ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
