'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Search, ShoppingBag, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { getAllTransactionsAdmin } from '@/app/actions/admin';
import { PageLoader } from '@/components/ui/page-loader';

export default function AdminTransactionsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const res = await getAllTransactionsAdmin();
      if (res.success) {
        setOrders(res.data || []);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const statusVariant: Record<string, any> = { pending: 'warning', confirmed: 'info', ready: 'accent', completed: 'success', cancelled: 'error' };

  // Filter logic
  const now = new Date();
  const filteredOrders = orders.filter(order => {
    // 1. Search Filter
    const searchString = `${order.id} ${order.partner?.business_name} ${order.bag?.name}`.toLowerCase();
    if (searchQuery && !searchString.includes(searchQuery.toLowerCase())) return false;

    // 2. Time Range Filter
    if (timeRange !== 'all') {
      const orderDate = new Date(order.created_at);
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

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Semua Transaksi</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <Input 
            placeholder="Cari ID, nama mitra..." 
            icon={<Search size={18} />} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-48">
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

      <div className="bg-surface rounded-2xl border border-border overflow-x-auto shadow-sm">
        {isLoading ? (
          <PageLoader message="Memuat transaksi..." />
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Tanggal</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Rescue Bag</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap hidden md:table-cell">Mitra</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Total</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap hidden md:table-cell">Pembayaran</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-primary-light/20 transition-colors">
                  <td className="p-4 font-mono text-xs text-text-muted">{order.id.slice(0,8)}</td>
                  <td className="p-4 text-sm text-text-secondary">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 font-bold text-sm text-text-primary">{order.bag?.name || 'Unknown Bag'}</td>
                  <td className="p-4 text-sm text-text-secondary hidden md:table-cell">{order.partner?.business_name || 'Unknown Partner'}</td>
                  <td className="p-4 font-bold text-primary">{formatCurrency(order.total_price)}</td>
                  <td className="p-4"><Badge variant={statusVariant[order.status] || 'neutral'}>{order.status}</Badge></td>
                  <td className="p-4 hidden md:table-cell"><Badge variant={order.payment_status === 'paid' ? 'success' : order.payment_status === 'refunded' ? 'error' : 'warning'}>{order.payment_status}</Badge></td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-text-muted">
                    <ShoppingBag size={40} className="mx-auto mb-3 opacity-50" />
                    <p className="font-bold text-text-primary">Transaksi tidak ditemukan</p>
                    <p className="text-sm">Coba ubah filter rentang waktu atau pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
