'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Order, Partner } from '@/types';
import { PageLoader } from '@/components/ui/page-loader';

export default function MitraOrdersPage() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [verifyModal, setVerifyModal] = useState(false);
  const [pickupCode, setPickupCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      const { data: partnerData } = await supabase.from('partners').select('*').eq('user_id', user.id).single();
      if (!partnerData) { setIsLoading(false); return; }
      setPartner(partnerData as Partner);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, bag:rescue_bags(*)')
        .eq('partner_id', partnerData.id)
        .in('status', ['confirmed', 'ready'])
        .order('created_at', { ascending: false });
        
      if (ordersData) setOrders(ordersData as any[]);
      setIsLoading(false);
    }
    fetchOrders();
  }, [user]);

  const activeOrders = orders;

  const handleVerify = async () => {
    setIsVerifying(true);
    const found = activeOrders.find(o => o.pickup_code === pickupCode.toUpperCase());
    
    if (found) {
      // Update DB
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', found.id);
        
      if (!error) {
        setVerified(true);
        // Remove from list
        setOrders(prev => prev.filter(o => o.id !== found.id));
        // Dispatch event to update the sidebar badge immediately!
        window.dispatchEvent(new CustomEvent('orderUpdated'));
      }
    } else {
      alert('Kode pickup tidak valid atau pesanan tidak ditemukan.');
    }
    setIsVerifying(false);
  };

  if (isLoading) return <PageLoader message="Memuat pesanan..." />;
  if (!partner) return <div className="text-center py-20 text-error">Toko mitra tidak ditemukan.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Pesanan Aktif</h1>
          <p className="text-text-secondary text-sm mt-1">{activeOrders.length} pesanan menunggu</p>
        </div>
        <Button onClick={() => { setVerifyModal(true); setVerified(false); setPickupCode(''); }}>
          <Search size={18} /> Verifikasi Pickup
        </Button>
      </div>

      <div className="space-y-3">
        {activeOrders.map(order => (
          <div key={order.id} className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center"><ShoppingBag size={20} className="text-primary" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{order.bag?.name}</h3>
                <Badge variant={order.status === 'confirmed' ? 'info' : 'accent'}>{order.status === 'confirmed' ? 'Dikonfirmasi' : 'Siap Pickup'}</Badge>
              </div>
              <p className="text-sm text-text-muted mt-1">Kode: <span className="font-mono font-bold text-primary text-base">{order.pickup_code}</span></p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{formatCurrency(order.total_price)}</p>
              <p className="text-xs text-text-muted">x{order.quantity}</p>
            </div>
          </div>
        ))}
        {activeOrders.length === 0 && (
          <div className="text-center py-16"><ShoppingBag size={48} className="text-text-muted mx-auto mb-4" /><p className="font-bold">Tidak ada pesanan aktif</p></div>
        )}
      </div>

      {/* Verify Modal */}
      <Modal isOpen={verifyModal} onClose={() => setVerifyModal(false)} title="Verifikasi Pickup" size="sm">
        {!verified ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Masukkan kode pickup dari customer:</p>
            <Input placeholder="Contoh: SB7K2M" value={pickupCode} onChange={e => setPickupCode(e.target.value)} className="text-center font-mono text-2xl tracking-widest" />
            <Button className="w-full" onClick={handleVerify} disabled={pickupCode.length < 6} isLoading={isVerifying}>Verifikasi</Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4 flex items-center justify-center"><CheckCircle size={32} className="text-emerald-500" /></div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Pickup Berhasil! ✅</h3>
            <p className="text-sm text-text-secondary">Pesanan telah selesai diproses.</p>
            <Button className="mt-4" onClick={() => setVerifyModal(false)}>Tutup</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
