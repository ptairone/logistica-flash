import { LucideIcon } from "lucide-react";

interface ProcessFlowProps {
  steps: {
    icon: LucideIcon;
    label: string;
  }[];
}

export function ProcessFlow({ steps }: ProcessFlowProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={index} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center animate-pulse">
                <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center max-w-[80px]">
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="relative">
                <div className="w-6 sm:w-12 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
