'use client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export function RatingStars({ rating, maxRating = 5, size = 18, interactive = false, onRate, className }: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(i + 1)}
          className={cn(
            'transition-transform',
            interactive && 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}
