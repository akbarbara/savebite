'use client';
import { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, TrendingUp, Clock, CheckCircle, ClipboardList, Star } from 'lucide-react';
import { StatsCard } from '@/components/features/stats-card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Order, RescueBag, Partner } from '@/types';

export default function MitraDashboardPage() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bags, setBags] = useState<RescueBag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      // 1. Get partner
      const { data: partnerData } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!partnerData) {
        setIsLoading(false);
        return;
      }
      setPartner(partnerData as Partner);

      // 2. Get orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, bag:rescue_bags(*)')
        .eq('partner_id', partnerData.id)
        .order('created_at', { ascending: false });
        
      if (ordersData) setOrders(ordersData as any[]);

      // 3. Get bags
      const { data: bagsData } = await supabase
        .from('rescue_bags')
        .select('*')
        .eq('partner_id', partnerData.id)
        .eq('status', 'active');
        
      if (bagsData) setBags(bagsData as any[]);
      
      setIsLoading(false);
    }
    fetchData();
  }, [user]);

  const activeOrders = orders.filter(o => ['confirmed', 'ready'].includes(o.status));
  const completedToday = orders.filter(o => o.status === 'completed').length;
  const revenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total_price, 0);
  const activeBags = bags;

  if (isLoading) return <PageLoader message="Memuat dashboard..." />;
  if (!partner) return <div className="text-center py-20 text-error">Toko mitra tidak ditemukan. Harap pastikan kamu sudah mendaftar sebagai mitra.</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-text-primary">Selamat datang, {partner.business_name}! 👋</h1>
        <p className="text-text-secondary mt-1">Ringkasan aktivitas toko hari ini</p>
      </div>

      {/* Stats */}
      <div 
        className="flex lg:grid gap-4 mb-8 overflow-x-auto snap-x snap-mandatory pb-4 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 lg:mx-0 lg:px-0" 
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
      >
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start" icon={<ClipboardList size={24} />} label="Pesanan Aktif" value={activeOrders.length} />
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start" icon={<CheckCircle size={24} />} label="Selesai Hari Ini" value={completedToday} />
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start" icon={<DollarSign size={24} />} label="Pendapatan Hari Ini" value={formatCurrency(revenue)} />
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start" icon={<Package size={24} />} label="Rescue Bag Aktif" value={activeBags.length} />
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start" icon={<Star size={24} />} label="Rating Toko" value={`${partner.avg_rating} ⭐`} change={`${partner.total_reviews} ulasan`} />
      </div>

      {/* Active Orders */}
      <div className="bg-surface rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">📦 Pesanan Aktif</h2>
          <Badge variant="accent">{activeOrders.length} pesanan</Badge>
        </div>
        {activeOrders.length > 0 ? (
          <div className="space-y-3">
            {activeOrders.map(order => (
              <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-primary-light/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center"><ShoppingBag size={18} className="text-primary" /></div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{order.bag?.name}</p>
                  <p className="text-xs text-text-muted">Kode: <span className="font-mono font-bold text-primary">{order.pickup_code}</span></p>
                </div>
                <Badge variant={order.status === 'confirmed' ? 'info' : 'accent'}>{order.status === 'confirmed' ? 'Dikonfirmasi' : 'Siap Pickup'}</Badge>
                <span className="font-bold text-primary">{formatCurrency(order.total_price)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-muted py-8">Belum ada pesanan aktif</p>
        )}
      </div>

      {/* Active Bags */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="text-lg font-bold mb-4">🥡 Rescue Bag Aktif</h2>
        <div className="space-y-3">
          {activeBags.map(bag => (
            <div key={bag.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
              <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center"><Package size={18} className="text-accent" /></div>
              <div className="flex-1">
                <p className="font-bold text-sm">{bag.name}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span><Clock size={10} className="inline" /> {bag.pickup_start.slice(0,5)}-{bag.pickup_end.slice(0,5)}</span>
                  <span>Stok: {bag.quantity_remaining}/{bag.quantity_total}</span>
                </div>
              </div>
              <span className="font-bold text-primary">{formatCurrency(bag.rescue_price)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
