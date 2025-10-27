import { useState, useRef, ReactNode } from 'react';
import { Edit, Eye, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: ReactNode;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SwipeableCard({ 
  children, 
  onEdit, 
  onView, 
  onDelete,
  className 
}: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Limita o swipe
    const maxSwipe = 160;
    const newOffset = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    setOffsetX(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Se passou do threshold, mantém aberto
    if (Math.abs(offsetX) > 60) {
      setOffsetX(offsetX > 0 ? 80 : -80);
    } else {
      setOffsetX(0);
    }
  };

  const handleAction = (action?: () => void) => {
    if (action) {
      action();
      setOffsetX(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Ações do lado esquerdo */}
      {onView && (
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-blue-500 flex items-center justify-center">
          <Eye className="h-5 w-5 text-white" />
        </div>
      )}
      
      {/* Ações do lado direito */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        {onEdit && (
          <div className="w-20 bg-orange-500 flex items-center justify-center">
            <Edit className="h-5 w-5 text-white" />
          </div>
        )}
        {onDelete && (
          <div className="w-20 bg-red-500 flex items-center justify-center">
            <Trash className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Card principal */}
      <div
        className={cn("relative bg-card", className)}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (Math.abs(offsetX) < 5) return;
          
          if (offsetX > 60 && onView) {
            handleAction(onView);
          } else if (offsetX < -60) {
            if (offsetX < -140 && onDelete) {
              handleAction(onDelete);
            } else if (onEdit) {
              handleAction(onEdit);
            }
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
