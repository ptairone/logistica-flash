import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ScreenshotCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ScreenshotCard({ title, description, icon: Icon }: ScreenshotCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50">
      {/* Mockup Screenshot Area */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/5 flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent animate-pulse-glow" />
        
        {/* Icon */}
        <div className="relative z-10 p-6 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-2xl">
          <Icon className="h-16 w-16 text-primary" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-primary/40" />
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-secondary/40" />
        <div className="absolute bottom-4 left-1/4 w-4 h-4 rounded-full bg-accent/40" />
        <div className="absolute bottom-4 right-1/3 w-2 h-2 rounded-full bg-primary/40" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </Card>
  );
}
