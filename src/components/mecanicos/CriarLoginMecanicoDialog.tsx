import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type LoginFormData = z.infer<typeof loginSchema>;

interface CriarLoginMecanicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mecanico: any;
  onSuccess: () => void;
}

export function CriarLoginMecanicoDialog({ open, onOpenChange, mecanico, onSuccess }: CriarLoginMecanicoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: mecanico?.email || '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'criar-usuario-motorista',
        {
          body: {
            email: data.email,
            password: data.senha,
            nome: mecanico.nome,
            entityType: 'mecanico',
            entityId: mecanico.id,
          },
        }
      );

      if (functionError) throw functionError;

      toast.success('Login criado com sucesso!');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Erro ao criar login:', error);
      toast.error(error.message || 'Erro ao criar login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Login para Mecânico</DialogTitle>
          <DialogDescription>
            Crie credenciais de acesso para {mecanico?.nome}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="mecanico@exemplo.com" />
                  </FormControl>
                  <FormDescription>
                    Este email será usado para fazer login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha *</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Mínimo 6 caracteres" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmarSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha *</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Digite a senha novamente" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Login'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
