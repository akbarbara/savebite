'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Building2, QrCode, Wallet, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, generatePickupCode } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('error', 'Kamu harus login terlebih dahulu.');
      return;
    }
    if (cartItems.length === 0) return;

    setIsLoading(true);

    // Prepare order rows
    const orderRows = cartItems.map(item => ({
      customer_id: user.id,
      partner_id: item.bag.partner_id,
      bag_id: item.bag.id,
      quantity: item.quantity,
      unit_price: item.bag.rescue_price,
      total_price: item.bag.rescue_price * item.quantity,
      pickup_code: generatePickupCode(),
      status: 'pending',
      payment_method: paymentMethod,
    }));

    const { processCheckout } = await import('@/app/actions/checkout');
    const result = await processCheckout(orderRows, cartItems);

    if (!result.success || !result.orderIds) {
      addToast('error', 'Gagal membuat pesanan: ' + result.error);
      setIsLoading(false);
      return;
    }

    addToast('success', 'Pesanan berhasil dibuat, silakan selesaikan pembayaran!');
    clearCart();
    // Redirect to the new payment prototype page with comma-separated order IDs
    router.push('/app/payment/' + result.orderIds.join(','));
  };

  const payments = [
    { id: 'bank', label: 'Transfer Bank', icon: <Building2 size={20} />, desc: 'BCA, BNI, Mandiri, BRI' },
    { id: 'qris', label: 'QRIS', icon: <QrCode size={20} />, desc: 'Semua e-wallet' },
    { id: 'ewallet', label: 'E-Wallet', icon: <Wallet size={20} />, desc: 'GoPay, OVO, Dana' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/app/cart" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6">
        <ArrowLeft size={18} /> Kembali ke Keranjang
      </Link>
      <h1 className="text-2xl font-extrabold text-text-primary mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact */}
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">📋 Informasi Kontak</h3>
          <div className="space-y-4">
            <Input label="Nama Lengkap" placeholder="John Doe" required />
            <Input label="No. Telepon" type="tel" placeholder="08xxxxxxxxxx" required />
            <Textarea label="Catatan (opsional)" placeholder="Catatan untuk mitra..." rows={2} />
          </div>
        </div>

        {/* Payment */}
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">💳 Metode Pembayaran</h3>
          <div className="space-y-3">
            {payments.map(p => (
              <label key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === p.id ? 'border-primary bg-primary-light/30' : 'border-border hover:border-primary/30'
              }`}>
                <input type="radio" name="payment" value={p.id} checked={paymentMethod === p.id} onChange={() => setPaymentMethod(p.id)} className="hidden" />
                <div className={`p-2 rounded-lg ${paymentMethod === p.id ? 'bg-primary text-white' : 'bg-border/50 text-text-secondary'}`}>{p.icon}</div>
                <div><p className="font-semibold text-sm">{p.label}</p><p className="text-xs text-text-muted">{p.desc}</p></div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === p.id ? 'border-primary' : 'border-border'}`}>
                  {paymentMethod === p.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">📦 Ringkasan Pesanan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Subtotal ({totalItems} items)</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Biaya layanan</span><span>{formatCurrency(0)}</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between">
              <span className="font-bold text-lg">Total</span>
              <span className="font-extrabold text-lg text-primary">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={totalItems === 0}>
          <CreditCard size={20} /> Bayar {formatCurrency(subtotal)}
        </Button>
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <ShieldCheck size={14} /> Transaksi aman & terenkripsi
        </div>
      </form>
    </div>
  );
}
