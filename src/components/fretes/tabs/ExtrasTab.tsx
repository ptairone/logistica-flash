import { UseFormRegister } from 'react-hook-form';
import { FreteFormData } from '@/lib/validations-frete';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';

interface ExtrasTabProps {
  register: UseFormRegister<FreteFormData>;
}

export function ExtrasTab({ register }: ExtrasTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="observacoes" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          Observações
        </Label>
        <Textarea
          id="observacoes"
          {...register('observacoes')}
          placeholder="Informações adicionais sobre o frete, restrições de entrega, horários especiais, etc..."
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use este campo para adicionar qualquer informação relevante que não se encaixe nos campos anteriores
        </p>
      </div>
    </div>
  );
}
