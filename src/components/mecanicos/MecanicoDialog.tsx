import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { mecanicoSchema, especialidadesOptions, type MecanicoFormData } from '@/lib/validations-manutencao';
import { useState } from 'react';

interface MecanicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MecanicoFormData) => void;
  mecanico?: any;
}

export function MecanicoDialog({ open, onOpenChange, onSubmit, mecanico }: MecanicoDialogProps) {
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState<string[]>(
    mecanico?.especialidades || []
  );

  const form = useForm<MecanicoFormData>({
    resolver: zodResolver(mecanicoSchema),
    defaultValues: mecanico || {
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      especialidades: [],
      status: 'ativo',
      observacoes: '',
    },
  });

  const handleSubmit = (data: MecanicoFormData) => {
    onSubmit({ ...data, especialidades: especialidadesSelecionadas });
    form.reset();
    setEspecialidadesSelecionadas([]);
  };

  const adicionarEspecialidade = (especialidade: string) => {
    if (!especialidadesSelecionadas.includes(especialidade)) {
      setEspecialidadesSelecionadas([...especialidadesSelecionadas, especialidade]);
    }
  };

  const removerEspecialidade = (especialidade: string) => {
    setEspecialidadesSelecionadas(especialidadesSelecionadas.filter(e => e !== especialidade));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mecanico ? 'Editar Mecânico' : 'Novo Mecânico'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do mecânico" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12345678900" maxLength={11} />
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
                      <Input {...field} placeholder="(00) 00000-0000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="mecanico@exemplo.com" />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="ferias">Férias</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Especialidades</FormLabel>
              <Select onValueChange={adicionarEspecialidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Adicionar especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {especialidadesOptions.map((esp) => (
                    <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {especialidadesSelecionadas.map((esp) => (
                  <Badge key={esp} variant="secondary" className="gap-1">
                    {esp}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removerEspecialidade(esp)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Informações adicionais" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {mecanico ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
