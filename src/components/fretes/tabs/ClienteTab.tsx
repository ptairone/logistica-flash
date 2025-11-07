import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { FreteFormData } from '@/lib/validations-frete';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, User, Phone } from 'lucide-react';

interface ClienteTabProps {
  register: UseFormRegister<FreteFormData>;
  setValue: UseFormSetValue<FreteFormData>;
  errors: FieldErrors<FreteFormData>;
  status: string;
  buscandoCNPJ: boolean;
  handleCPFCNPJChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ClienteTab({ 
  register, 
  setValue, 
  errors, 
  status, 
  buscandoCNPJ,
  handleCPFCNPJChange 
}: ClienteTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cliente_nome" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Nome do Cliente
            <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
          </Label>
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
          <Label htmlFor="cliente_cnpj_cpf" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            CPF/CNPJ
            <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
          </Label>
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
          <p className="text-xs text-muted-foreground">
            Digite o CNPJ completo para buscar dados automaticamente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cliente_contato" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Telefone de Contato
          </Label>
          <Input
            id="cliente_contato"
            {...register('cliente_contato')}
            placeholder="(11) 98765-4321"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
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

      <div className="space-y-2">
        <Label htmlFor="codigo">Código do Frete</Label>
        <Input
          id="codigo"
          {...register('codigo')}
          placeholder="Gerado automaticamente"
        />
        <p className="text-xs text-muted-foreground">
          Deixe em branco para gerar automaticamente no formato FRT-YYYY-XXX
        </p>
      </div>
    </div>
  );
}
