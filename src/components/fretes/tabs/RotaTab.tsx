import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { FreteFormData } from '@/lib/validations-frete';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar } from 'lucide-react';

interface RotaTabProps {
  register: UseFormRegister<FreteFormData>;
  setValue: UseFormSetValue<FreteFormData>;
  errors: FieldErrors<FreteFormData>;
  buscandoCEPOrigem: boolean;
  buscandoCEPDestino: boolean;
  handleCEPChange: (field: 'origem_cep' | 'destino_cep') => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RotaTab({ 
  register, 
  setValue,
  errors, 
  buscandoCEPOrigem,
  buscandoCEPDestino,
  handleCEPChange 
}: RotaTabProps) {
  return (
    <div className="space-y-6">
      {/* Origem */}
      <Card className="p-4 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <h3 className="font-semibold flex items-center gap-2 mb-4 text-green-700 dark:text-green-400">
          <MapPin className="h-5 w-5" />
          Origem
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="origem_cep" className="flex items-center gap-2">
              CEP
              <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
            </Label>
            <div className="relative">
              <Input
                id="origem_cep"
                {...register('origem_cep')}
                onChange={handleCEPChange('origem_cep')}
                placeholder="01310-100"
                maxLength={9}
                disabled={buscandoCEPOrigem}
              />
              {buscandoCEPOrigem && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="origem_logradouro">Logradouro</Label>
            <Input
              id="origem_logradouro"
              {...register('origem_logradouro')}
              placeholder="Av. Paulista"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origem_numero">Número</Label>
            <Input
              id="origem_numero"
              {...register('origem_numero')}
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origem_cidade" className="flex items-center gap-2">
              Cidade
              <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
            </Label>
            <Input
              id="origem_cidade"
              {...register('origem_cidade')}
              placeholder="São Paulo"
            />
            {errors.origem_cidade && (
              <p className="text-sm text-destructive">{errors.origem_cidade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="origem_uf">UF</Label>
            <Input
              id="origem_uf"
              {...register('origem_uf')}
              placeholder="SP"
              maxLength={2}
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="origem_ponto_referencia">Ponto de Referência</Label>
          <Input
            id="origem_ponto_referencia"
            {...register('origem_ponto_referencia')}
            placeholder="Próximo ao Shopping..."
          />
        </div>
      </Card>

      {/* Destino */}
      <Card className="p-4 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
        <h3 className="font-semibold flex items-center gap-2 mb-4 text-red-700 dark:text-red-400">
          <MapPin className="h-5 w-5" />
          Destino
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="destino_cep" className="flex items-center gap-2">
              CEP
              <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
            </Label>
            <div className="relative">
              <Input
                id="destino_cep"
                {...register('destino_cep')}
                onChange={handleCEPChange('destino_cep')}
                placeholder="20040-020"
                maxLength={9}
                disabled={buscandoCEPDestino}
              />
              {buscandoCEPDestino && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destino_logradouro">Logradouro</Label>
            <Input
              id="destino_logradouro"
              {...register('destino_logradouro')}
              placeholder="Rua das Flores"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="destino_numero">Número</Label>
            <Input
              id="destino_numero"
              {...register('destino_numero')}
              placeholder="500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destino_cidade" className="flex items-center gap-2">
              Cidade
              <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
            </Label>
            <Input
              id="destino_cidade"
              {...register('destino_cidade')}
              placeholder="Rio de Janeiro"
            />
            {errors.destino_cidade && (
              <p className="text-sm text-destructive">{errors.destino_cidade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destino_uf">UF</Label>
            <Input
              id="destino_uf"
              {...register('destino_uf')}
              placeholder="RJ"
              maxLength={2}
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="destino_ponto_referencia">Ponto de Referência</Label>
          <Input
            id="destino_ponto_referencia"
            {...register('destino_ponto_referencia')}
            placeholder="Em frente ao mercado..."
          />
        </div>
      </Card>

      {/* Datas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_coleta" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Data de Coleta
          </Label>
          <Input
            id="data_coleta"
            type="date"
            {...register('data_coleta')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_entrega" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Data de Entrega
          </Label>
          <Input
            id="data_entrega"
            type="date"
            {...register('data_entrega')}
          />
          {errors.data_entrega && (
            <p className="text-sm text-destructive">{errors.data_entrega.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
