import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { alertaManutencaoSchema, type AlertaManutencaoFormData } from "@/lib/validations-manutencao";
import { useVeiculos } from "@/hooks/useVeiculos";
import { Loader2 } from "lucide-react";

interface AlertaManutencaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AlertaManutencaoFormData) => void;
  isSubmitting?: boolean;
  preSelectedVeiculoId?: string;
}

export function AlertaManutencaoDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  preSelectedVeiculoId,
}: AlertaManutencaoDialogProps) {
  const { veiculos } = useVeiculos();

  const form = useForm<AlertaManutencaoFormData>({
    resolver: zodResolver(alertaManutencaoSchema),
    defaultValues: {
      veiculo_id: preSelectedVeiculoId || '',
      tipo: 'km',
      descricao: '',
    },
  });

  const tipoAlerta = form.watch('tipo');

  const handleSubmit = (data: AlertaManutencaoFormData) => {
    onSubmit(data);
    if (!isSubmitting) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Alerta de Manutenção</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="veiculo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veículo *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!preSelectedVeiculoId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {veiculos.map((veiculo) => (
                        <SelectItem key={veiculo.id} value={veiculo.id}>
                          {veiculo.codigo_interno} - {veiculo.placa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Alerta *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="km" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Baseado em Quilometragem
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="data" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Baseado em Data
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ambos" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Baseado em KM e Data
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Alerta *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Troca de óleo a cada 10.000 km"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(tipoAlerta === 'km' || tipoAlerta === 'ambos') && (
              <FormField
                control={form.control}
                name="km_alerta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quilometragem para Alerta *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Ex: 50000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(tipoAlerta === 'data' || tipoAlerta === 'ambos') && (
              <FormField
                control={form.control}
                name="data_alerta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data para Alerta *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Alerta
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
