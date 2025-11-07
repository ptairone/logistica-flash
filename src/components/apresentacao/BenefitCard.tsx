import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BenefitCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  description: string;
}

export function BenefitCard({ icon: Icon, value, label, description }: BenefitCardProps) {
  return (
    <Card className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur-sm">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
        {value}
      </div>
      
      <div className="text-lg font-semibold mb-1">
        {label}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {description}
      </div>
    </Card>
  );
}
