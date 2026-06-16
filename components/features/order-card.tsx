import Link from 'next/link';
import { Clock, ChevronRight, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { formatCurrency, formatDate, getRelativeTime } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  basePath?: string;
}

export function OrderCard({ order, basePath = '/app/orders' }: OrderCardProps) {
  const statusVariant = {
    pending: 'warning' as const,
    confirmed: 'info' as const,
    ready: 'accent' as const,
    completed: 'success' as const,
    cancelled: 'error' as const,
  };

  const statusLabel = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    ready: 'Siap Pickup',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  return (
    <Link href={`${basePath}/${order.id}`}>
      <div className="bg-surface rounded-2xl border border-border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={24} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">{order.bag?.name || 'Rescue Bag'}</h4>
                <p className="text-sm text-text-secondary mt-0.5">{order.partner?.business_name}</p>
              </div>
              <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={12} />
                <span>{getRelativeTime(order.created_at)}</span>
              </div>
              <span className="font-bold text-primary">{formatCurrency(order.total_price)}</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-text-muted group-hover:text-primary transition-colors mt-4" />
        </div>
      </div>
    </Link>
  );
}
