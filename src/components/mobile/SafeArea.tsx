import { ReactNode } from 'react';

interface SafeAreaProps {
  children: ReactNode;
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function SafeArea({ children, top = true, bottom = true, className = '' }: SafeAreaProps) {
  const paddingClasses = [
    top && 'pt-safe',
    bottom && 'pb-safe',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={paddingClasses}>
      {children}
    </div>
  );
}
