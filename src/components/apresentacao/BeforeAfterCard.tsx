import { Card } from "@/components/ui/card";
import { X, Check } from "lucide-react";

interface BeforeAfterCardProps {
  title: string;
  scenario: string;
  before: string;
  after: string;
}

export function BeforeAfterCard({ title, scenario, before, after }: BeforeAfterCardProps) {
  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{scenario}</p>
      
      <div className="space-y-3">
        <div className="flex gap-3 items-start p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Antes</p>
            <p className="text-sm text-muted-foreground">{before}</p>
          </div>
        </div>
        
        <div className="flex gap-3 items-start p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Agora</p>
            <p className="text-sm text-muted-foreground">{after}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
