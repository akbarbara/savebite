'use client';
import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, DollarSign, Receipt } from 'lucide-react';
import { OrderCard } from '@/components/features/order-card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Order, Partner } from '@/types';

export default function MitraOrderHistoryPage() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      const { data: partnerData } = await supabase.from('partners').select('*').eq('user_id', user.id).single();
      if (!partnerData) { setIsLoading(false); return; }
      setPartner(partnerData as Partner);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, bag:rescue_bags(*)')
        .eq('partner_id', partnerData.id)
        .in('status', ['completed', 'cancelled'])
        .order('completed_at', { ascending: false, nullsFirst: false });
        
      if (ordersData) setCompletedOrders(ordersData as any[]);
      setIsLoading(false);
    }
    fetchHistory();
  }, [user]);

  if (isLoading) return <PageLoader message="Memuat riwayat transaksi..." />;
  if (!partner) return <div className="text-center py-20 text-error">Toko mitra tidak ditemukan.</div>;

  // ---------------------------------------------------------------------------
  // FILTER LOGIC
  // ---------------------------------------------------------------------------
  const now = new Date();
  
  const filteredOrders = completedOrders.filter(order => {
    // 1. Search Query
    const searchString = `${order.id} ${order.bag?.name}`.toLowerCase();
    if (searchQuery && !searchString.includes(searchQuery.toLowerCase())) return false;

    // 2. Status Filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;

    // 3. Time Filter
    if (timeRange !== 'all') {
      const orderDate = new Date(order.completed_at || order.created_at);
      if (timeRange === 'today') {
        if (orderDate.toDateString() !== now.toDateString()) return false;
      } else if (timeRange === 'week') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < lastWeek) return false;
      } else if (timeRange === 'month') {
        if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  // Calculate Summary based on Filtered Orders
  const totalRevenue = filteredOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => {
      // Net revenue for mitra is total_price minus platform_fee
      const netAmount = order.total_price - (order.platform_fee || 0);
      return sum + netAmount;
    }, 0);

  const completedCount = filteredOrders.filter(o => o.status === 'completed').length;

  return (
    <div className="pb-10">
      <h1 className="text-2xl font-extrabold mb-6">Riwayat Transaksi</h1>

      {/* Summary Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-emerald-500 rounded-2xl p-6 text-white mb-6 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group">
        {/* Shine effect */}
        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
        
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
          <DollarSign size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-100 mb-1 flex items-center gap-2">
              <DollarSign size={20} className="animate-bounce" style={{ animationDuration: '2s' }} /> Total Pendapatan Bersih
            </h2>
            <p className="text-xs text-emerald-50">Dari {completedCount} pesanan selesai pada periode yang difilter</p>
          </div>
          <div className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm transition-transform duration-500 group-hover:scale-105 origin-left md:origin-right">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border border-border p-4 mb-6 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="flex-1">
          <Input 
            placeholder="Cari ID pesanan atau nama makanan..." 
            icon={<Search size={18} />} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-48">
            <Select 
              icon={<Filter size={16} />}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'completed', label: 'Selesai' },
                { value: 'cancelled', label: 'Dibatalkan' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>

          <div className="w-full md:w-48">
            <Select 
              icon={<Calendar size={16} />}
              options={[
                { value: 'all', label: 'Semua Waktu' },
                { value: 'today', label: 'Hari Ini' },
                { value: 'week', label: '7 Hari Terakhir' },
                { value: 'month', label: 'Bulan Ini' }
              ]}
              value={timeRange}
              onChange={setTimeRange}
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map(order => <OrderCard key={order.id} order={order} basePath="/mitra/orders" />)}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl mt-4">
          <Receipt size={48} className="text-text-muted mx-auto mb-4 opacity-50" />
          <p className="font-bold text-text-primary">Tidak ada riwayat transaksi</p>
          <p className="text-sm text-text-secondary mt-1">Coba ubah filter pencarian Anda.</p>
        </div>
      )}
    </div>
  );
}
