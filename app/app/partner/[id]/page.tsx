'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star, Phone, Clock, Store, Info, ShoppingBag, MessageSquare, Reply } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RescueBagCard } from '@/components/features/rescue-bag-card';
import { supabase } from '@/lib/supabase/client';
import { Partner, RescueBag, Review } from '@/types';

export default function PartnerDetailPage() {
  const params = useParams();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerBags, setPartnerBags] = useState<RescueBag[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!params.id) return;

      const { data: partnerData } = await supabase
        .from('partners')
        .select('*, category:categories(*)')
        .eq('id', params.id as string)
        .single();
        
      if (partnerData) {
        setPartner(partnerData as Partner);
        const { data: bagsData } = await supabase
          .from('rescue_bags')
          .select('*, partner:partners(*, category:categories(*))')
          .eq('partner_id', params.id as string)
          .order('created_at', { ascending: false });
          
        if (bagsData) setPartnerBags(bagsData as any[]);

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*, customer:profiles(*)')
          .eq('partner_id', params.id as string)
          .order('created_at', { ascending: false });
          
        if (reviewsData) setReviews(reviewsData as any[]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [params.id]);
  
  if (isLoading) return <div className="text-center py-20 text-text-muted">Memuat informasi restoran...</div>;

  if (!partner) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Store size={48} className="text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Restoran tidak ditemukan</h1>
        <Link href="/app/search" className="text-primary hover:underline">Kembali ke Pencarian</Link>
      </div>
    );
  }

  const activeBags = partnerBags.filter(b => b.status === 'active' && b.quantity_remaining > 0);
  const soldOutBags = partnerBags.filter(b => b.status === 'sold_out' || (b.status === 'active' && b.quantity_remaining <= 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/app/search" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={18} /> Kembali ke Pencarian
      </Link>

      {/* Partner Header */}
      <div className="bg-surface rounded-3xl border border-border overflow-hidden mb-8 shadow-sm">
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/30 to-accent/30 relative">
          <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            {partner.avg_rating} <span className="text-text-muted font-normal text-xs">({partner.total_reviews})</span>
          </div>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-surface border-4 border-surface shadow-md flex items-center justify-center -mt-10 md:-mt-12 mb-4 relative z-10 overflow-hidden">
            {partner.logo_url && !partner.logo_url.includes('placehold.co') && !partner.logo_url.includes('bread-box') ? (
              <img src={partner.logo_url} alt={partner.business_name} className="w-full h-full object-cover" />
            ) : (
              <Store size={32} className="text-primary" />
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">{partner.business_name}</h1>
                <Badge variant="neutral">{partner.category?.name}</Badge>
              </div>
              <p className="text-text-secondary max-w-2xl mb-4">{partner.description}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-text-muted" />
                  {partner.address}, {partner.city}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={16} className="text-text-muted" />
                  {partner.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-text-muted" />
                  Buka setiap hari
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Bags */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Rescue Bag Tersedia
          </h2>
          {activeBags.length > 0 && (
            <Badge variant="success">{activeBags.length} tersedia</Badge>
          )}
        </div>
        
        {activeBags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeBags.map(bag => (
              <RescueBagCard key={bag.id} bag={bag} />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border border-dashed p-8 text-center">
            <Info size={32} className="text-text-muted mx-auto mb-3" />
            <h3 className="font-bold mb-1">Stok Sedang Habis</h3>
            <p className="text-sm text-text-secondary">Mitra ini belum memiliki Rescue Bag baru hari ini. Cek lagi nanti!</p>
          </div>
        )}
      </div>

      {/* Sold Out Bags (History) */}
      {soldOutBags.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 text-text-muted">Rescue Bag Sebelumnya</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-75">
            {soldOutBags.map(bag => (
              <RescueBagCard key={bag.id} bag={bag} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <MessageSquare size={20} className="text-primary" />
          Ulasan Pelanggan
        </h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-surface rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary">
                      {review.customer?.full_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{review.customer?.full_name || 'Anonim'}</p>
                      <p className="text-xs text-text-muted">{new Date(review.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-sm font-bold">
                    <Star size={14} className="fill-amber-500" /> {review.rating}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-text-secondary text-sm mt-3">{review.comment}</p>
                )}
                {review.partner_reply && (
                  <div className="mt-3 bg-primary-light/30 border border-primary-light rounded-xl p-3 ml-4 relative">
                    <div className="absolute -left-2.5 top-3 text-primary">
                      <Reply size={16} className="transform rotate-180" />
                    </div>
                    <p className="text-xs font-bold text-primary mb-1">Balasan dari {partner.business_name}</p>
                    <p className="text-sm text-text-secondary">{review.partner_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <MessageSquare size={32} className="text-text-muted mx-auto mb-3" />
            <h3 className="font-bold mb-1">Belum Ada Ulasan</h3>
            <p className="text-sm text-text-secondary">Jadilah yang pertama memberikan ulasan setelah menyelamatkan makanan dari sini!</p>
          </div>
        )}
      </div>
    </div>
  );
}
