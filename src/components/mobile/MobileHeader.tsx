import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({ title, showBack, onMenuClick, rightAction }: MobileHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 bg-card border-b border-border backdrop-blur-sm bg-card/95">
      <div className="flex items-center gap-2">
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : onMenuClick ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : null}
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>
      
      {rightAction && (
        <div className="flex items-center gap-2">
          {rightAction}
        </div>
      )}
    </header>
  );
}
