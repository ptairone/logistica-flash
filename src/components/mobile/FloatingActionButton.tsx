import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon = <Plus className="h-6 w-6" />,
  label,
  className 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed right-4 bottom-20 z-40 h-14 rounded-full shadow-lg",
        "hover:scale-110 active:scale-95 transition-transform",
        label ? "px-6 gap-2" : "w-14",
        className
      )}
    >
      {icon}
      {label && <span className="font-semibold">{label}</span>}
    </Button>
  );
}
