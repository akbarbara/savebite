'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Star, Minus, Plus, ShoppingBag, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceTag } from '@/components/features/price-tag';
import { RatingStars } from '@/components/features/rating-stars';
import { useToast } from '@/components/ui/toast';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase/client';
import { mockReviews } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { RescueBag } from '@/types';

export default function BagDetailPage() {
  const params = useParams();
  const [bag, setBag] = useState<RescueBag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchBag() {
      if (!params.id) return;
      const { data, error } = await supabase
        .from('rescue_bags')
        .select('*, partner:partners(*, category:categories(*))')
        .eq('id', params.id as string)
        .single();
      
      if (data) setBag(data as any);
      setIsLoading(false);
    }
    fetchBag();
  }, [params.id]);

  const reviews = bag ? mockReviews.filter(r => r.partner_id === bag.partner_id) : [];

  const handleAddToCart = () => {
    if (!bag) return;
    addToCart(bag, quantity);
    addToast('success', `${quantity}x ${bag.name} berhasil ditambahkan ke keranjang!`);
  };

  if (isLoading) {
    return <div className="text-center py-20 text-text-muted">Memuat detail produk...</div>;
  }

  if (!bag) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Produk Tidak Ditemukan</h2>
        <Link href="/app" className="text-primary hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/app" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={18} /> Kembali
      </Link>

      {/* Image */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden bg-gray-100 mb-6 flex items-center justify-center">
        {bag.image_url && !bag.image_url.includes('placehold.co') && !bag.image_url.includes('bread-box') ? (
          <img 
            src={bag.image_url} 
            alt={bag.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-primary/20', 'to-accent/20');
              const fallback = document.createElement('div');
              fallback.className = 'absolute inset-0 flex items-center justify-center text-primary/30';
              fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
              e.currentTarget.parentElement?.appendChild(fallback);
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <ShoppingBag size={64} className="text-primary/30" />
          </div>
        )}
        <div className="absolute top-4 left-4 z-10"><Badge className="bg-white text-accent border-none shadow-md font-extrabold px-3 py-1">-{Math.round(((bag.original_price - bag.rescue_price) / bag.original_price) * 100)}%</Badge></div>
        {bag.quantity_remaining <= 3 && bag.quantity_remaining > 0 && (
          <div className="absolute top-4 right-4 z-10"><Badge className="bg-white text-yellow-600 border-none shadow-md font-bold px-3 py-1">Sisa {bag.quantity_remaining}</Badge></div>
        )}
      </div>

      {/* Partner */}
      {bag.partner && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <ShoppingBag size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-text-primary">{bag.partner.business_name}</p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <MapPin size={12} /> {bag.partner.address}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="font-bold">{bag.partner.avg_rating}</span>
            <span className="text-xs text-text-muted">({bag.partner.total_reviews})</span>
          </div>
        </div>
      )}

      {/* Title & Description */}
      <h1 className="text-2xl font-extrabold text-text-primary mb-2">{bag.name}</h1>
      <p className="text-text-secondary mb-4">{bag.description}</p>

      {/* Content Hint */}
      <div className="bg-primary-light/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary mb-1">Perkiraan Isi</p>
            <p className="text-sm text-text-secondary">{bag.content_hint}</p>
          </div>
        </div>
      </div>

      {/* Pickup Info */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-surface rounded-xl border border-border">
        <Clock size={20} className="text-accent" />
        <div>
          <p className="font-semibold text-text-primary">Waktu Pickup</p>
          <p className="text-sm text-text-secondary">{bag.pickup_start.slice(0,5)} - {bag.pickup_end.slice(0,5)} • {bag.available_date}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <PriceTag originalPrice={bag.original_price} rescuePrice={bag.rescue_price} size="lg" />
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border mb-6">
        <span className="font-semibold">Jumlah</span>
        <div className="flex items-center gap-4">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50 cursor-pointer"><Minus size={16} /></button>
          <span className="font-bold text-lg w-8 text-center">{quantity}</span>
          <button onClick={() => setQuantity(Math.min(bag.quantity_remaining, quantity + 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50 cursor-pointer"><Plus size={16} /></button>
        </div>
      </div>

      {/* Total & CTA */}
      <div className="sticky bottom-20 lg:bottom-0 bg-surface rounded-2xl border border-border p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary">Total</span>
          <span className="text-xl font-extrabold text-primary">{formatCurrency(bag.rescue_price * quantity)}</span>
        </div>
        <Button 
          className="w-full" 
          size="lg" 
          disabled={bag.quantity_remaining <= 0}
          onClick={handleAddToCart}
        >
          <ShoppingBag size={20} /> {bag.quantity_remaining <= 0 ? 'Habis Terjual' : 'Tambah ke Keranjang'}
        </Button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-text-muted">
          <ShieldCheck size={14} /> Transaksi aman & terenkripsi
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-text-primary mb-4">Ulasan ({reviews.length})</h3>
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">{review.customer?.full_name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.customer?.full_name}</p>
                    <RatingStars rating={review.rating} size={12} />
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
