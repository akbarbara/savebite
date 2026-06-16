'use client';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ children, content, position = 'top', className }: TooltipProps) {
  if (!content) return <>{children}</>;

  return (
    <div className={cn("relative group inline-flex items-center justify-center", className)}>
      {children}
      <div className={cn(
        "absolute z-[9999] hidden group-hover:block px-2.5 py-1.5 text-xs font-semibold text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none",
        position === 'top' && "bottom-full left-1/2 -translate-x-1/2 mb-2",
        position === 'bottom' && "top-full left-1/2 -translate-x-1/2 mt-2",
        position === 'left' && "right-full top-1/2 -translate-y-1/2 mr-2",
        position === 'right' && "left-full top-1/2 -translate-y-1/2 ml-2"
      )}>
        {content}
        {/* Triangle pointer */}
        <div className={cn(
          "absolute w-0 h-0 border-[5px] border-transparent",
          position === 'top' && "top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-800 border-b-0",
          position === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-800 border-t-0",
          position === 'left' && "left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-800 border-r-0",
          position === 'right' && "right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-800 border-l-0"
        )} />
      </div>
    </div>
  );
}
