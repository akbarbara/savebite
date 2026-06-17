'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, ShoppingBag, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/types';

export default function MitraOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!params.id || !user) return;
      const { data, error } = await supabase
        .from('orders')
        .select('*, bag:rescue_bags(*), customer:profiles(full_name, phone)')
        .eq('id', params.id as string)
        .single();
      
      if (data) setOrder(data as any);
      setIsLoading(false);
    }
    fetchOrder();
  }, [params.id, user]);

  if (isLoading) return <PageLoader message="Memuat detail pesanan..." />;
  if (!order) return <div className="text-center py-20 font-bold">Pesanan tidak ditemukan</div>;

  const statusConfig = {
    pending: { variant: 'warning' as const, label: 'Menunggu Pembayaran', color: 'text-amber-500' },
    confirmed: { variant: 'info' as const, label: 'Dikonfirmasi', color: 'text-blue-500' },
    ready: { variant: 'accent' as const, label: 'Siap Dipickup', color: 'text-accent' },
    completed: { variant: 'success' as const, label: 'Selesai', color: 'text-emerald-500' },
    cancelled: { variant: 'error' as const, label: 'Dibatalkan', color: 'text-red-500' },
  };

  const config = statusConfig[order.status];

  return (
    <div className="max-w-3xl mx-auto py-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 cursor-pointer">
        <ArrowLeft size={18} /> Kembali
      </button>

      {/* Status */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          order.status === 'completed' ? 'bg-emerald-100' : order.status === 'cancelled' ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          {order.status === 'completed' ? <CheckCircle size={32} className="text-emerald-500" /> : <ShoppingBag size={32} className={config.color} />}
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
        <h1 className="text-xl font-extrabold text-text-primary mt-3">Pesanan #{order.id.slice(0,8).toUpperCase()}</h1>
      </div>

      {/* Order Info */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4 mb-4">
        <h3 className="font-bold">Detail Barang</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center"><ShoppingBag size={20} className="text-primary" /></div>
          <div className="flex-1">
            <p className="font-bold">{order.bag?.name}</p>
            <p className="text-sm text-text-muted">Kode Pickup: <span className="font-mono text-primary font-bold">{order.pickup_code}</span></p>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary">{formatCurrency(order.total_price)}</p>
            <p className="text-xs text-text-muted">x{order.quantity || 1}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-surface rounded-2xl border border-border p-5 mb-4 space-y-3">
        <h3 className="font-bold">Informasi Pelanggan</h3>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center"><User size={16} className="text-text-secondary" /></div>
          <span className="text-sm font-medium">{(order as any).customer?.full_name || 'Tanpa Nama'}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center"><Phone size={16} className="text-text-secondary" /></div>
          <span className="text-sm font-medium">{(order as any).customer?.phone || 'Tidak ada nomor HP'}</span>
        </div>
      </div>

      {/* Time Info */}
      <div className="bg-surface rounded-2xl border border-border p-5 mb-4 space-y-3">
        <h3 className="font-bold">Waktu Transaksi</h3>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary flex items-center gap-2"><Clock size={16} /> Dipesan pada</span>
          <span>{new Date(order.created_at).toLocaleString('id-ID')}</span>
        </div>
        {order.completed_at && (
          <div className="flex justify-between text-sm mt-2">
            <span className="text-text-secondary flex items-center gap-2"><CheckCircle size={16} /> Diselesaikan pada</span>
            <span>{new Date(order.completed_at).toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-2 text-sm">
        <h3 className="font-bold mb-2">Ringkasan Pembayaran</h3>
        <div className="flex justify-between"><span className="text-text-secondary">Metode</span><span className="uppercase">{order.payment_method}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Status</span><Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>{order.payment_status === 'paid' ? 'Lunas' : 'Pending'}</Badge></div>
        <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-bold">Total Pendapatan</span><span className="font-extrabold text-primary">{formatCurrency(order.total_price)}</span></div>
      </div>
    </div>
  );
}
