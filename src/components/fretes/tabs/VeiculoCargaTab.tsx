import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { FreteFormData } from '@/lib/validations-frete';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, Package, Weight } from 'lucide-react';
import { TIPOS_CARGA } from '@/lib/calculadora-antt';

interface VeiculoCargaTabProps {
  register: UseFormRegister<FreteFormData>;
  setValue: UseFormSetValue<FreteFormData>;
  watch: UseFormWatch<FreteFormData>;
  errors: FieldErrors<FreteFormData>;
}

export function VeiculoCargaTab({ register, setValue, watch, errors }: VeiculoCargaTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-accent/30">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-primary" />
          Parâmetros do Veículo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="tipo_carga" className="flex items-center gap-2">
              Tipo de Carga ANTT
              <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
            </Label>
            <Select
              value={watch('tipo_carga')}
              onValueChange={(value) => setValue('tipo_carga', value)}
            >
              <SelectTrigger id="tipo_carga">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CARGA.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo_carga && (
              <p className="text-sm text-destructive">{errors.tipo_carga.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_eixos" className="flex items-center gap-2">
              Número de Eixos
              <Badge variant="destructive" className="text-[10px] py-0 px-1">Obrigatório</Badge>
            </Label>
            <Select
              value={watch('numero_eixos')?.toString()}
              onValueChange={(value) => setValue('numero_eixos', parseInt(value))}
            >
              <SelectTrigger id="numero_eixos">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 9].map((eixos) => (
                  <SelectItem key={eixos} value={eixos.toString()}>
                    {eixos} eixos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.numero_eixos && (
              <p className="text-sm text-destructive">{errors.numero_eixos.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-3 border rounded-lg p-3 bg-background">
          <Label className="text-sm font-medium">Características do Veículo (acréscimos ANTT)</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="composicao_veicular"
              checked={watch('composicao_veicular') || false}
              onCheckedChange={(checked) => setValue('composicao_veicular', checked as boolean)}
            />
            <label htmlFor="composicao_veicular" className="text-sm cursor-pointer flex-1">
              Composição veicular (caminhão + reboque)
              <span className="text-amber-600 dark:text-amber-400 font-medium ml-2">+15%</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="alto_desempenho"
              checked={watch('alto_desempenho') || false}
              onCheckedChange={(checked) => setValue('alto_desempenho', checked as boolean)}
            />
            <label htmlFor="alto_desempenho" className="text-sm cursor-pointer flex-1">
              Veículo de alto desempenho
              <span className="text-amber-600 dark:text-amber-400 font-medium ml-2">+10%</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="retorno_vazio"
              checked={watch('retorno_vazio') || false}
              onCheckedChange={(checked) => setValue('retorno_vazio', checked as boolean)}
            />
            <label htmlFor="retorno_vazio" className="text-sm cursor-pointer flex-1">
              Retorno vazio
              <span className="text-amber-600 dark:text-amber-400 font-medium ml-2">+20%</span>
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-accent/30">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          Informações da Carga
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="produto">Produto</Label>
            <Input
              id="produto"
              {...register('produto')}
              placeholder="Mercadorias diversas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao_carga">Descrição da Carga</Label>
            <Input
              id="descricao_carga"
              {...register('descricao_carga')}
              placeholder="Produtos alimentícios, eletrônicos..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="peso" className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              Peso (kg)
            </Label>
            <Input
              id="peso"
              type="number"
              step="0.01"
              {...register('peso', { valueAsNumber: true })}
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Volume (m³)
            </Label>
            <Input
              id="volume"
              type="number"
              step="0.01"
              {...register('volume', { valueAsNumber: true })}
              placeholder="10"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
