import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PriceTagProps {
  originalPrice: number;
  rescuePrice: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceTag({ originalPrice, rescuePrice, size = 'md' }: PriceTagProps) {
  const discount = calculateDiscount(originalPrice, rescuePrice);
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };
  const origSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`${textSizes[size]} font-extrabold text-primary`}>
        {formatCurrency(rescuePrice)}
      </span>
      <span className={`${origSizes[size]} text-text-muted line-through`}>
        {formatCurrency(originalPrice)}
      </span>
      <Badge variant="accent">Hemat {discount}%</Badge>
    </div>
  );
}
