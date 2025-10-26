import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const loginSchema = z.object({
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type LoginFormData = z.infer<typeof loginSchema>;

interface CriarLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motorista: any;
}

export function CriarLoginDialog({ open, onOpenChange, motorista }: CriarLoginDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!motorista.email) {
      toast({
        title: 'Erro',
        description: 'Motorista não possui email cadastrado. Edite o motorista e adicione um email primeiro.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('criar-usuario-motorista', {
        body: {
          email: motorista.email,
          password: data.senha,
          nome: motorista.nome,
          motoristaId: motorista.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Login criado com sucesso! O motorista já pode acessar o sistema.',
      });

      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Login para {motorista?.nome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              O motorista poderá acessar suas viagens usando o email: <strong>{motorista?.email}</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              type="password"
              {...register('senha')}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.senha && (
              <p className="text-sm text-destructive">{errors.senha.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
            <Input
              id="confirmarSenha"
              type="password"
              {...register('confirmarSenha')}
              placeholder="Digite a senha novamente"
            />
            {errors.confirmarSenha && (
              <p className="text-sm text-destructive">{errors.confirmarSenha.message}</p>
            )}
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
              {isLoading ? 'Criando...' : 'Criar Login'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
