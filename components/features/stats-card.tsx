import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  className?: string;
}

export function StatsCard({ icon, label, value, change, changeType = 'positive', className }: StatsCardProps) {
  return (
    <div className={cn(
      'bg-surface rounded-2xl border border-border p-3 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4',
      className
    )}>
      <div className="p-2 sm:p-3 rounded-xl bg-primary-light text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-sm text-text-secondary mb-0.5 sm:mb-1">{label}</p>
        <Tooltip content={String(value)} position="bottom">
          <p className="text-base sm:text-xl font-extrabold text-text-primary truncate tracking-tight">{value}</p>
        </Tooltip>
        {change && (
          <p className={cn(
            'text-[10px] sm:text-xs font-semibold mt-1',
            changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
          )}>
            {changeType === 'positive' ? '↑' : '↓'} {change}
          </p>
        )}
      </div>
    </div>
  );
}
