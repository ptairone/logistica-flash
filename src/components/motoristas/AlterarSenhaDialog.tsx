import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Key } from 'lucide-react';

const senhaSchema = z.object({
  novaSenha: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type SenhaFormData = z.infer<typeof senhaSchema>;

interface AlterarSenhaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motorista: any;
}

export function AlterarSenhaDialog({ open, onOpenChange, motorista }: AlterarSenhaDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<SenhaFormData>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  const onSubmit = async (data: SenhaFormData) => {
    if (!motorista?.user_id) {
      toast.error('Este motorista não possui login criado');
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('alterar-senha-motorista', {
        body: {
          userId: motorista.user_id,
          novaSenha: data.novaSenha,
        },
      });

      if (error) throw error;

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Senha alterada com sucesso!');
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  if (!motorista?.user_id) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha - {motorista.nome}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email de acesso</Label>
              <p className="font-medium">{motorista.email}</p>
            </div>

            <FormField
              control={form.control}
              name="novaSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Digite a nova senha" 
                      {...field} 
                    />
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
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirme a nova senha" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
