import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motoristaSchema, MotoristaFormData, formatTelefone } from '@/lib/validations-motorista';
import { formatCPFCNPJ } from '@/lib/validations-frete';

interface MotoristaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MotoristaFormData) => void;
  motorista?: any;
  isLoading?: boolean;
}

export function MotoristaDialog({ open, onOpenChange, onSubmit, motorista, isLoading }: MotoristaDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MotoristaFormData>({
    resolver: zodResolver(motoristaSchema),
    defaultValues: {
      status: 'ativo',
      comissao_padrao: 0,
    },
  });

  useEffect(() => {
    if (motorista) {
      reset({
        ...motorista,
        comissao_padrao: motorista.comissao_padrao || 0,
      });
    } else {
      reset({
        status: 'ativo',
        comissao_padrao: 0,
      });
    }
  }, [motorista, reset]);

  const status = watch('status');

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setValue('telefone', formatted);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFCNPJ(e.target.value);
    setValue('cpf', formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{motorista ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="João da Silva"
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                {...register('cpf')}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnh">CNH *</Label>
              <Input
                id="cnh"
                {...register('cnh')}
                placeholder="00000000000"
              />
              {errors.cnh && (
                <p className="text-sm text-destructive">{errors.cnh.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validade_cnh">Validade CNH *</Label>
              <Input
                id="validade_cnh"
                type="date"
                {...register('validade_cnh')}
              />
              {errors.validade_cnh && (
                <p className="text-sm text-destructive">{errors.validade_cnh.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                {...register('telefone')}
                onChange={handleTelefoneChange}
                placeholder="(11) 98765-4321"
                maxLength={15}
              />
              {errors.telefone && (
                <p className="text-sm text-destructive">{errors.telefone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="joao@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comissao_padrao">Comissão Padrão (%)</Label>
              <Input
                id="comissao_padrao"
                type="number"
                step="0.01"
                {...register('comissao_padrao', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>
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
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais..."
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
              {isLoading ? 'Salvando...' : motorista ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
