import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  return (
    <div className={cn(
      'bg-surface rounded-2xl border border-border',
      paddings[padding],
      hover && 'transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/20 cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}
