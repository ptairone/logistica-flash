import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegistroEmpresa } from '@/hooks/useRegistroEmpresa';

const registroSchema = z.object({
  nome: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido (formato: 00.000.000/0000-00)'),
  email_contato: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  nome_responsavel: z.string().min(3, 'Nome do responsável deve ter no mínimo 3 caracteres'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmar_senha: z.string()
}).refine(data => data.senha === data.confirmar_senha, {
  message: 'As senhas não coincidem',
  path: ['confirmar_senha']
});

type RegistroFormData = z.infer<typeof registroSchema>;

export default function RegistroEmpresa() {
  const navigate = useNavigate();
  const { registrarEmpresa, isLoading } = useRegistroEmpresa();
  const [sucesso, setSucesso] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema)
  });

  const onSubmit = async (data: RegistroFormData) => {
    const { confirmar_senha, ...rest } = data;
    const empresaData: RegistroEmpresaData = {
      nome: rest.nome,
      cnpj: rest.cnpj,
      email_contato: rest.email_contato,
      telefone: rest.telefone,
      nome_responsavel: rest.nome_responsavel,
      senha: rest.senha
    };
    
    registrarEmpresa.mutate(empresaData, {
      onSuccess: () => {
        setSucesso(true);
      }
    });
  };

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Solicitação Enviada!</CardTitle>
            <CardDescription>
              Sua solicitação foi recebida com sucesso. Você receberá um email em até 24 horas após a aprovação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-lg">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Login
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Cadastre sua Empresa</CardTitle>
            <CardDescription>
              Comece seu teste grátis de 7 dias agora mesmo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Transportes ABC Ltda"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  {...register('cnpj')}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                {errors.cnpj && (
                  <p className="text-sm text-destructive">{errors.cnpj.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_contato">Email de Contato *</Label>
                <Input
                  id="email_contato"
                  type="email"
                  {...register('email_contato')}
                  placeholder="contato@empresa.com.br"
                />
                {errors.email_contato && (
                  <p className="text-sm text-destructive">{errors.email_contato.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome_responsavel">Nome do Responsável *</Label>
                <Input
                  id="nome_responsavel"
                  {...register('nome_responsavel')}
                  placeholder="João Silva"
                />
                {errors.nome_responsavel && (
                  <p className="text-sm text-destructive">{errors.nome_responsavel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  {...register('senha')}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.senha && (
                  <p className="text-sm text-destructive">{errors.senha.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar_senha">Confirmar Senha *</Label>
                <Input
                  id="confirmar_senha"
                  type="password"
                  {...register('confirmar_senha')}
                  placeholder="Digite a senha novamente"
                />
                {errors.confirmar_senha && (
                  <p className="text-sm text-destructive">{errors.confirmar_senha.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Cadastrar Empresa'}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Ao cadastrar, você concorda com nossos termos de uso
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
