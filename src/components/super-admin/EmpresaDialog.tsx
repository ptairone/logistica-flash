import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmpresas } from '@/hooks/useEmpresas';
import { Loader2 } from 'lucide-react';

const empresaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)'),
  email_contato: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  status: z.enum(['ativo', 'trial', 'suspenso', 'bloqueado']),
  dominio_email: z.string().optional(),
  observacoes: z.string().optional(),
  data_inicio_trial: z.string().optional(),
  data_fim_trial: z.string().optional(),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  email_contato: string;
  telefone?: string;
  status: string;
  dominio_email?: string;
  observacoes?: string;
  data_inicio_trial?: string;
  data_fim_trial?: string;
}

interface EmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: Empresa | null;
}

export function EmpresaDialog({ open, onOpenChange, empresa }: EmpresaDialogProps) {
  const { createEmpresa, updateEmpresa } = useEmpresas();

  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      email_contato: '',
      telefone: '',
      status: 'trial',
      dominio_email: '',
      observacoes: '',
      data_inicio_trial: new Date().toISOString().split('T')[0],
      data_fim_trial: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const status = form.watch('status');

  useEffect(() => {
    if (empresa) {
      form.reset({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        email_contato: empresa.email_contato,
        telefone: empresa.telefone || '',
        status: empresa.status as any,
        dominio_email: empresa.dominio_email || '',
        observacoes: empresa.observacoes || '',
        data_inicio_trial: empresa.data_inicio_trial?.split('T')[0] || '',
        data_fim_trial: empresa.data_fim_trial?.split('T')[0] || '',
      });
    } else {
      form.reset({
        nome: '',
        cnpj: '',
        email_contato: '',
        telefone: '',
        status: 'trial',
        dominio_email: '',
        observacoes: '',
        data_inicio_trial: new Date().toISOString().split('T')[0],
        data_fim_trial: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [empresa, form, open]);

  const onSubmit = async (formData: EmpresaFormData) => {
    try {
      if (empresa) {
        await updateEmpresa.mutateAsync({
          id: empresa.id,
          data: formData,
        });
      } else {
        await createEmpresa.mutateAsync(formData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{empresa ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          <DialogDescription>
            {empresa ? 'Atualize os dados da empresa' : 'Preencha os dados para criar uma nova empresa'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Transportadora ABC Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        {...field}
                        onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                        maxLength={18}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="suspenso">Suspenso</SelectItem>
                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email_contato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contato *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) => field.onChange(formatTelefone(e.target.value))}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dominio_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domínio de Email</FormLabel>
                  <FormControl>
                    <Input placeholder="empresa.com.br" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === 'trial' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data_inicio_trial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Início Trial</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_fim_trial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Fim Trial</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre a empresa..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createEmpresa.isPending || updateEmpresa.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createEmpresa.isPending || updateEmpresa.isPending}>
                {(createEmpresa.isPending || updateEmpresa.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {empresa ? 'Salvar Alterações' : 'Criar Empresa'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
