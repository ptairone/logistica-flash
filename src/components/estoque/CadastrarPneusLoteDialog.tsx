import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { usePneus } from "@/hooks/usePneus";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const pneuLoteSchema = z.object({
  pneus: z.array(z.object({
    numero_serie: z.string().min(1, "Número de série obrigatório"),
    codigo_interno: z.string().min(1, "Código interno obrigatório")
  })).min(1, "Adicione pelo menos um pneu")
});

type PneuLoteFormData = z.infer<typeof pneuLoteSchema>;

interface CadastrarPneusLoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemEstoque: any;
}

export function CadastrarPneusLoteDialog({ 
  open, 
  onOpenChange, 
  itemEstoque 
}: CadastrarPneusLoteDialogProps) {
  const { createPneusLote } = usePneus();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<PneuLoteFormData>({
    resolver: zodResolver(pneuLoteSchema),
    defaultValues: {
      pneus: [
        { numero_serie: "", codigo_interno: "" }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pneus"
  });

  const onSubmit = async (data: PneuLoteFormData) => {
    setIsSubmitting(true);
    
    try {
      // Extrair informações do item de estoque
      const descricaoParts = itemEstoque.descricao.split(' ');
      const marca = descricaoParts[0] || '';
      const modelo = descricaoParts.slice(1, -1).join(' ') || '';
      const medida = descricaoParts[descricaoParts.length - 1] || '';

      const pneusData = data.pneus.map(p => ({
        numero_serie: p.numero_serie,
        codigo_interno: p.codigo_interno,
        marca: marca,
        modelo: modelo,
        medida: medida,
        tipo: 'radial',
        fornecedor: itemEstoque.fornecedor || '',
        valor_compra: itemEstoque.custo_medio || 0,
        data_compra: new Date().toISOString().split('T')[0],
        profundidade_sulco_mm: 16,
        profundidade_minima_mm: 1.6,
        observacoes: `Cadastrado em lote do item de estoque ${itemEstoque.codigo}`
      }));

      await createPneusLote.mutateAsync({
        itemEstoqueId: itemEstoque.id,
        pneus: pneusData
      });

      toast.success(`${pneusData.length} pneu(s) cadastrado(s) com sucesso!`);
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar pneus');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Cadastrar Pneus em Lote</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Item: {itemEstoque?.descricao} | Estoque disponível: {itemEstoque?.estoque_atual}
          </p>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Cada pneu cadastrado dará baixa automática de 1 unidade no estoque.
            Certifique-se de ter estoque suficiente antes de cadastrar.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Pneu #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`pneus.${index}.numero_serie`}>
                        Número de Série *
                      </Label>
                      <Input
                        {...register(`pneus.${index}.numero_serie`)}
                        placeholder="Ex: ABC123XYZ"
                      />
                      {errors.pneus?.[index]?.numero_serie && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.pneus[index]?.numero_serie?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`pneus.${index}.codigo_interno`}>
                        Código Interno *
                      </Label>
                      <Input
                        {...register(`pneus.${index}.codigo_interno`)}
                        placeholder="Ex: PN-001"
                      />
                      {errors.pneus?.[index]?.codigo_interno && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.pneus[index]?.codigo_interno?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ numero_serie: "", codigo_interno: "" })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Mais Pneus
          </Button>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : `Cadastrar ${fields.length} Pneu(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
