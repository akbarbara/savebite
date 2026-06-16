'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Clock, Star, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RescueBag } from '@/types';
import { formatCurrency, calculateDiscount } from '@/lib/utils';

interface RescueBagCardProps {
  bag: RescueBag;
}

export function RescueBagCard({ bag }: RescueBagCardProps) {
  const [imgError, setImgError] = useState(false);
  const discount = calculateDiscount(bag.original_price, bag.rescue_price);
  const isSoldOut = bag.quantity_remaining <= 0;

  return (
    <Link href={`/app/bag/${bag.id}`}>
      <Card hover padding="none" className="overflow-hidden group">
        {/* Image */}
        <div className="relative h-44 bg-border/50 overflow-hidden">
          {bag.image_url && !imgError ? (
            <img 
              src={bag.image_url} 
              alt={bag.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <ShoppingBag size={48} className="text-primary/40" />
            </div>
          )}
          
          {/* Discount Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-surface text-accent border-none shadow-md font-extrabold px-3 py-1">-{discount}%</Badge>
          </div>
          {/* Stock Badge */}
          {isSoldOut ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Habis Terjual</span>
            </div>
          ) : bag.quantity_remaining <= 3 && (
            <div className="absolute top-3 right-3">
              <Badge variant="warning">Sisa {bag.quantity_remaining}</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Partner Info */}
          {bag.partner && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
                <ShoppingBag size={10} className="text-primary" />
              </div>
              <span className="text-xs text-text-secondary font-medium truncate">{bag.partner.business_name}</span>
              {bag.partner.avg_rating > 0 && (
                <div className="flex items-center gap-0.5 ml-auto">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-text-secondary">{bag.partner.avg_rating}</span>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-text-primary text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">{bag.name}</h3>
          <p className="text-xs text-text-muted mb-3 line-clamp-1">{bag.content_hint}</p>

          {/* Pickup Time */}
          <div className="flex items-center gap-1.5 mb-3">
            <Clock size={14} className="text-text-muted" />
            <span className="text-xs text-text-secondary">Pickup {bag.pickup_start.slice(0,5)} - {bag.pickup_end.slice(0,5)}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-extrabold text-primary">{formatCurrency(bag.rescue_price)}</span>
              <span className="text-xs text-text-muted line-through ml-2">{formatCurrency(bag.original_price)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
