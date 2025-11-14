import { useState } from 'react';
import { X, Maximize2, Download, Printer, Share2 } from 'lucide-react';
import { useDevice } from '@/hooks/useDevice';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VeiculoComposicaoInterativa } from './VeiculoComposicaoInterativa';
import { ComposicaoPneusManager } from './ComposicaoPneusManager';

interface VeiculoComposicaoSheetProps {
  veiculo: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VeiculoComposicaoSheet({ veiculo, open, onOpenChange }: VeiculoComposicaoSheetProps) {
  const { isMobile } = useDevice();

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" title="Compartilhar">
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" title="Imprimir">
        <Printer className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" title="Exportar">
        <Download className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Composição - {veiculo.placa}</DrawerTitle>
              {headerActions}
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-auto p-4">
            <Tabs defaultValue="composicao" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="composicao" className="flex-1">Composição</TabsTrigger>
                <TabsTrigger value="pneus" className="flex-1">Pneus</TabsTrigger>
              </TabsList>
              
              <TabsContent value="composicao" className="mt-4">
                <VeiculoComposicaoInterativa veiculo={veiculo} />
              </TabsContent>
              
              <TabsContent value="pneus" className="mt-4">
                <ComposicaoPneusManager veiculo={veiculo} />
              </TabsContent>
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl lg:max-w-6xl">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5" />
              Composição do Veículo - {veiculo.placa}
            </SheetTitle>
            {headerActions}
          </div>
        </SheetHeader>
        <div className="mt-6 overflow-auto h-[calc(100vh-8rem)]">
          <Tabs defaultValue="composicao" className="w-full">
            <TabsList>
              <TabsTrigger value="composicao">Composição</TabsTrigger>
              <TabsTrigger value="pneus">Gestão de Pneus</TabsTrigger>
            </TabsList>
            
            <TabsContent value="composicao" className="mt-6">
              <VeiculoComposicaoInterativa veiculo={veiculo} />
            </TabsContent>
            
            <TabsContent value="pneus" className="mt-6">
              <ComposicaoPneusManager veiculo={veiculo} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
