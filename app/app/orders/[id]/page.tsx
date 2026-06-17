'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Clock, MapPin, Phone, ShoppingBag, CheckCircle, XCircle, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/types';
import { submitReview } from '@/app/actions/reviews';
import { PageLoader } from '@/components/ui/page-loader';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      if (!params.id) return;
      const { data, error } = await supabase
        .from('orders')
        .select('*, partner:partners(*), bag:rescue_bags(*)')
        .eq('id', params.id as string)
        .single();
      
      if (data) setOrder(data as any);
      setIsLoading(false);
    }
    fetchOrder();
  }, [params.id]);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleCancelOrder = () => {
    if (!order) return;
    setIsCancelModalOpen(true);
  };

  const processCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    
    const { processCancelOrder: serverCancel } = await import('@/app/actions/cancel');
    const result = await serverCancel(order.id);
      
    if (!result.success) {
      addToast('error', 'Gagal membatalkan pesanan: ' + result.error);
    } else {
      addToast('success', order.payment_status === 'paid' ? 'Pesanan dibatalkan. Dana akan dikembalikan (Refund).' : 'Pesanan berhasil dibatalkan.');
      setOrder({ ...order, status: 'cancelled', cancelled_at: new Date().toISOString() });
      setIsCancelModalOpen(false);
    }
    setIsCancelling(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user) return;
    setIsSubmittingReview(true);
    
    const result = await submitReview(order.id, user.id, order.partner_id, rating, comment);
    
    if (result.success) {
      addToast('success', 'Terima kasih atas ulasanmu! ⭐');
      setIsReviewModalOpen(false);
      // Pura-pura udah di-review aja, karena MVP ini ga ngecek flag is_reviewed di orders
    } else {
      addToast('error', 'Gagal mengirim ulasan: ' + result.error);
    }
    setIsSubmittingReview(false);
  };

  if (isLoading) return <PageLoader message="Memuat pesanan..." />;
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/app/orders" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6">
        <ArrowLeft size={18} /> Kembali
      </Link>

      {/* Status */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          order.status === 'completed' ? 'bg-emerald-100' : order.status === 'cancelled' ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          {order.status === 'completed' ? <CheckCircle size={32} className="text-emerald-500" /> : <ShoppingBag size={32} className={config.color} />}
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
        <h1 className="text-xl font-extrabold text-text-primary mt-3">Pesanan #{order.id.slice(0,6).toUpperCase()}</h1>
      </div>

      {/* Pickup Code */}
      {['confirmed', 'ready'].includes(order.status) && (
        <div className="bg-gradient-to-br from-primary to-emerald-400 rounded-2xl p-6 text-center text-white mb-6">
          <p className="text-sm text-white/80 mb-2">Kode Pickup Kamu</p>
          <div className="bg-surface/20 backdrop-blur rounded-xl py-4 px-6 mb-3">
            <p className="text-4xl font-mono font-extrabold tracking-[0.3em]">{order.pickup_code}</p>
          </div>
          <p className="text-xs text-white/60">Tunjukkan kode ini ke kasir saat pickup</p>
          <Button variant="ghost" size="sm" className="mt-3 text-white hover:bg-surface/20" onClick={() => navigator.clipboard.writeText(order.pickup_code)}>
            <Copy size={14} /> Salin Kode
          </Button>
        </div>
      )}

      {/* Order Info */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <h3 className="font-bold">Detail Pesanan</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center"><ShoppingBag size={20} className="text-primary" /></div>
          <div className="flex-1"><p className="font-bold">{order.bag?.name}</p><p className="text-sm text-text-muted">{order.partner?.business_name}</p></div>
          <div className="text-right"><p className="font-bold text-primary">{formatCurrency(order.total_price)}</p><p className="text-xs text-text-muted">x{order.quantity}</p></div>
        </div>
      </div>

      {/* Pickup Info */}
      <div className="bg-surface rounded-2xl border border-border p-5 mt-4 space-y-3">
        <h3 className="font-bold">Informasi Pickup</h3>
        <div className="flex items-center gap-3"><MapPin size={16} className="text-text-muted" /><span className="text-sm text-text-secondary">{order.partner?.address}</span></div>
        <div className="flex items-center gap-3"><Clock size={16} className="text-text-muted" /><span className="text-sm text-text-secondary">{order.bag?.pickup_start?.slice(0,5)} - {order.bag?.pickup_end?.slice(0,5)}</span></div>
        <div className="flex items-center gap-3"><Phone size={16} className="text-text-muted" /><span className="text-sm text-text-secondary">{order.partner?.phone}</span></div>
      </div>

      {/* Payment */}
      <div className="bg-surface rounded-2xl border border-border p-5 mt-4 space-y-2 text-sm">
        <h3 className="font-bold mb-2">Pembayaran</h3>
        <div className="flex justify-between"><span className="text-text-secondary">Metode</span><span>{order.payment_method}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Status</span><Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>{order.payment_status === 'paid' ? 'Lunas' : 'Pending'}</Badge></div>
        <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-bold">Total</span><span className="font-extrabold text-primary">{formatCurrency(order.total_price)}</span></div>
      </div>

      {order.status === 'completed' && (
        <Button variant="outline" className="w-full mt-6 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>⭐ Beri Ulasan</Button>
      )}

      {/* Payment Button for Pending Orders */}
      {order.status === 'pending' && (
        <Button 
          className="w-full mt-6 bg-amber-500 hover:bg-amber-600"
          onClick={() => router.push('/app/payment/' + order.id)}
        >
          <CreditCard size={18} className="mr-2" /> Lanjutkan Pembayaran
        </Button>
      )}

      {/* Cancel Button */}
      {['pending', 'confirmed'].includes(order.status) && (
        <Button 
          variant="outline" 
          className="w-full mt-6 text-error border-error/30 hover:bg-error/5 hover:border-error"
          onClick={handleCancelOrder}
          isLoading={isCancelling}
        >
          <XCircle size={18} /> Batalkan Pesanan
        </Button>
      )}

      {/* Review Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Beri Ulasan" size="sm">
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-3">Bagaimana pengalamanmu dengan <strong>{order.partner?.business_name}</strong>?</p>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 transition-transform hover:scale-110 cursor-pointer ${rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                >
                  <Star size={32} className={rating >= star ? 'fill-amber-500' : ''} />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-500 mb-4">
              {rating === 5 ? 'Sempurna! 😍' : rating === 4 ? 'Sangat Baik! 😊' : rating === 3 ? 'Cukup Baik 😐' : rating === 2 ? 'Kurang Memuaskan 😕' : 'Sangat Buruk 😞'}
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-text-primary">Komentar (Opsional)</label>
            <textarea 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-y"
              placeholder="Ceritakan pengalamanmu menyelamatkan makanan ini..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full" isLoading={isSubmittingReview}>Kirim Ulasan</Button>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Batalkan Pesanan?" size="sm">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
            <XCircle size={32} className="text-error" />
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Apakah kamu yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dikembalikan.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsCancelModalOpen(false)} disabled={isCancelling}>Kembali</Button>
            <Button className="flex-1 bg-error hover:bg-red-600 text-white" onClick={processCancelOrder} isLoading={isCancelling}>Ya, Batalkan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
