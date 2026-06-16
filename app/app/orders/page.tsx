'use client';
import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { OrderCard } from '@/components/features/order-card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/types';

export default function OrdersPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      const { data, error } = await supabase
        .from('orders')
        .select('*, partner:partners(*), bag:rescue_bags(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setOrders(data as any[]);
      setIsLoading(false);
    }
    fetchOrders();
  }, [user]);

  const filtered = orders.filter(o => {
    if (filter === 'active') return ['pending', 'confirmed', 'ready'].includes(o.status);
    if (filter === 'completed') return ['completed', 'cancelled'].includes(o.status);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-extrabold text-text-primary mb-6">Pesanan Saya</h1>
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'completed'] as const).map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            filter === tab ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary'
          }`}>
            {tab === 'all' ? 'Semua' : tab === 'active' ? 'Aktif' : 'Selesai'}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-text-muted">Memuat pesanan...</div>
        ) : (
          filtered.map(order => <OrderCard key={order.id} order={order} />)
        )}
      </div>
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <ClipboardList size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="font-bold">Belum ada pesanan</h3>
          <p className="text-sm text-text-secondary">Yuk mulai belanja Rescue Bag!</p>
        </div>
      )}
    </div>
  );
}
