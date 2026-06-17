'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Coffee, Utensils, Salad, ShoppingBag, Store, ChevronRight, Star } from 'lucide-react';
import { RescueBagCard } from '@/components/features/rescue-bag-card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { mockCategories } from '@/lib/mock-data';
import { RescueBag, Partner } from '@/types';

import { useAuth } from '@/lib/auth-context';

export default function CustomerHomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bags, setBags] = useState<RescueBag[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerSectionTitle, setPartnerSectionTitle] = useState('Mitra Pilihan 🏪');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth

    async function fetchData() {
      // Fetch active bags only from active partners
      const { data: bagsData } = await supabase
        .from('rescue_bags')
        .select('*, partner:partners!inner(*, category:categories(*))')
        .eq('status', 'active')
        .eq('partner.status', 'active');
        
      if (bagsData) setBags(bagsData as any[]);

      let sectionTitle = 'Mitra Pilihan 🏪';
      let fetchedPartners: any[] | null = null;

      if (user) {
        // Check past orders
        const { data: pastOrders } = await supabase
          .from('orders')
          .select('partner_id')
          .eq('customer_id', user.id);

        if (pastOrders && pastOrders.length > 0) {
          const partnerIds = Array.from(new Set(pastOrders.map(o => o.partner_id)));
          
          const { data: boughtPartners } = await supabase
            .from('partners')
            .select('*, category:categories(*)')
            .in('id', partnerIds)
            .eq('status', 'active')
            .limit(10);
            
          if (boughtPartners && boughtPartners.length > 0) {
            fetchedPartners = boughtPartners;
            sectionTitle = 'Pernah Kamu Beli 🛍️';
          }
        }
      }

      if (!fetchedPartners || fetchedPartners.length === 0) {
        // Fallback to highest rated
        const { data: topPartners } = await supabase
          .from('partners')
          .select('*, category:categories(*)')
          .eq('status', 'active')
          .order('avg_rating', { ascending: false })
          .limit(10);
          
        fetchedPartners = topPartners;
        sectionTitle = 'Rekomendasi Untukmu ⭐';
      }
      
      if (fetchedPartners) {
        setPartners(fetchedPartners as any[]);
        setPartnerSectionTitle(sectionTitle);
      }
      
      setIsLoading(false);
    }
    fetchData();
  }, [user, authLoading]);

  const filteredBags = bags.filter(bag => {
    if (selectedCategory && bag.partner?.category_id !== selectedCategory) return false;
    if (searchQuery && !bag.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categoryIcons: Record<string, React.ReactNode> = {
    '1': <Utensils size={14} />, '2': <ShoppingBag size={14} />, '3': <Coffee size={14} />,
    '4': <Salad size={14} />, '5': <ShoppingBag size={14} />, '6': <Utensils size={14} />,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
          <MapPin size={14} /> <span>Jakarta, Indonesia</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary">Rescue Bag Hari Ini 🥡</h1>
        <p className="text-text-secondary text-sm mt-1">Temukan makanan berkualitas dengan harga super hemat</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Cari rescue bag, restoran..."
          icon={<Search size={18} />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            !selectedCategory ? 'bg-primary text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
          }`}
        >
          🔥 Semua
        </button>
        {mockCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id ? 'bg-primary text-white shadow-sm' : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            {categoryIcons[cat.id]} {cat.name}
          </button>
        ))}
      </div>

      {/* Partner Shortcut */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">{partnerSectionTitle}</h2>
          <Link href="/app/search" className="text-sm text-primary font-semibold flex items-center hover:underline">
            Lihat Semua <ChevronRight size={16} />
          </Link>
        </div>
        <div className="overflow-hidden pt-4 pb-6 px-2 -mx-2">
          <div className="flex gap-4 w-max animate-marquee">
            {[...partners, ...partners, ...partners, ...partners].map((partner, idx) => (
              <Link key={`${partner.id}-${idx}`} href={`/app/partner/${partner.id}`} className="shrink-0 w-64 group outline-none">
                <div className="bg-surface rounded-2xl border border-border p-3 flex gap-3 cursor-pointer transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary group-focus-visible:-translate-y-1 group-focus-visible:shadow-lg group-focus-visible:border-primary">
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                    <Store size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{partner.business_name}</h4>
                    <p className="text-xs text-text-muted truncate mb-1">{partner.category?.name}</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                      <Star size={10} className="fill-amber-500" /> {partner.avg_rating}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bag Grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">Rescue Bag Tersedia 🥡</h2>
        <p className="text-sm text-text-secondary"><span className="font-bold">{filteredBags.length}</span> items</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10 text-text-muted">Memuat data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBags.map(bag => (
              <RescueBagCard key={bag.id} bag={bag} />
            ))}
          </div>

          {filteredBags.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="text-text-muted mx-auto mb-4" />
              <h3 className="font-bold text-text-primary mb-2">Tidak ada Rescue Bag</h3>
              <p className="text-sm text-text-secondary">Coba ubah filter atau cari yang lain</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
