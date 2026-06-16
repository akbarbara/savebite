'use client';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    xs: 12, sm: 14, md: 18, lg: 24,
  };

  return (
    <div className={cn(
      'rounded-full overflow-hidden bg-primary-light flex items-center justify-center flex-shrink-0',
      sizes[size],
      className
    )}>
      {src ? (
        <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
      ) : (
        <User size={iconSizes[size]} className="text-primary" />
      )}
    </div>
  );
}
