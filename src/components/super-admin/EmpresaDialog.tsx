import { useEffect, useState } from 'react';
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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useQueryClient } from '@tanstack/react-query';

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
  // Campos do administrador (apenas para criação)
  nome_responsavel: z.string().optional(),
  email_admin: z.string().email('Email inválido').optional(),
  senha: z.string().optional(),
  confirmar_senha: z.string().optional(),
}).refine((data) => {
  // Validação: senha e confirmar_senha devem ser iguais
  if (data.senha && data.senha !== data.confirmar_senha) {
    return false;
  }
  return true;
}, {
  message: 'As senhas não coincidem',
  path: ['confirmar_senha'],
}).refine((data) => {
  // Validação: senha deve ter no mínimo 8 caracteres
  if (data.senha && data.senha.length < 8) {
    return false;
  }
  return true;
}, {
  message: 'Senha deve ter no mínimo 8 caracteres',
  path: ['senha'],
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
  const queryClient = useQueryClient();
  const [consultandoCNPJ, setConsultandoCNPJ] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [criandoEmpresa, setCriandoEmpresa] = useState(false);

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
    if (empresa) {
      // Modo edição - só atualiza empresa
      try {
        await updateEmpresa.mutateAsync({
          id: empresa.id,
          data: formData,
        });
        onOpenChange(false);
        form.reset();
      } catch (error) {
        console.error('Erro ao salvar empresa:', error);
      }
    } else {
      // Modo criação - validar campos obrigatórios do admin
      if (!formData.nome_responsavel || !formData.email_admin || !formData.senha) {
        toast.error('Preencha todos os dados do administrador');
        return;
      }

      setCriandoEmpresa(true);
      
      try {
        const { data: result, error } = await supabase.functions.invoke('criar-empresa-admin', {
          body: {
            empresa: {
              nome: formData.nome,
              cnpj: formData.cnpj,
              email_contato: formData.email_contato,
              telefone: formData.telefone,
              status: formData.status,
              data_inicio_trial: formData.data_inicio_trial,
              data_fim_trial: formData.data_fim_trial,
              observacoes: formData.observacoes,
            },
            admin: {
              nome: formData.nome_responsavel,
              email: formData.email_admin,
              senha: formData.senha,
            }
          }
        });

        if (error) throw error;

        toast.success('Empresa e administrador criados com sucesso!', {
          description: `Login: ${formData.email_admin}`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['empresas'] });
        form.reset();
        onOpenChange(false);
      } catch (error: any) {
        console.error('Erro ao criar empresa:', error);
        toast.error('Erro ao criar empresa e administrador', {
          description: error.message,
        });
      } finally {
        setCriandoEmpresa(false);
      }
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

  const consultarCNPJ = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      toast.error('CNPJ deve ter 14 dígitos');
      return;
    }

    setConsultandoCNPJ(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('consultar-cnpj', {
        body: { cnpj: cnpjLimpo }
      });

      if (error) throw error;

      form.setValue('nome', data.razao_social || data.nome_fantasia || '');
      
      if (data.telefone) {
        form.setValue('telefone', data.telefone);
      }
      if (data.email) {
        form.setValue('email_contato', data.email);
      }

      toast.success('Dados da empresa consultados com sucesso!');
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      toast.error('Erro ao consultar CNPJ. Preencha os dados manualmente.');
    } finally {
      setConsultandoCNPJ(false);
    }
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
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        {...field}
                        onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                        maxLength={18}
                        disabled={empresa !== null}
                      />
                    </FormControl>
                    {!empresa && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => consultarCNPJ(field.value)}
                        disabled={consultandoCNPJ || field.value.replace(/\D/g, '').length !== 14}
                      >
                        {consultandoCNPJ ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Consultando...
                          </>
                        ) : (
                          'Buscar'
                        )}
                      </Button>
                    )}
                  </div>
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

            {/* Seção do Administrador - apenas ao criar */}
            {!empresa && (
              <>
                <Separator className="my-6" />
                
                <div className="space-y-2 mb-4">
                  <h3 className="text-lg font-semibold">Dados do Administrador</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie o primeiro usuário administrador desta empresa.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="nome_responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Responsável *</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email_admin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Administrador *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha *</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={mostrarSenha ? "text" : "password"}
                              placeholder="Mínimo 8 caracteres"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                          >
                            {mostrarSenha ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmar_senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha *</FormLabel>
                        <FormControl>
                          <Input
                            type={mostrarSenha ? "text" : "password"}
                            placeholder="Repita a senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={criandoEmpresa || createEmpresa.isPending || updateEmpresa.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={criandoEmpresa || createEmpresa.isPending || updateEmpresa.isPending}>
                {(criandoEmpresa || createEmpresa.isPending || updateEmpresa.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {empresa ? 'Salvar Alterações' : 'Criar Empresa e Admin'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
