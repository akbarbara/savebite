'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Copy, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';

export default function PaymentGatewayPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  const orderIds = (params.ids as string).split(',');

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('id', orderIds);
        
      if (error || !data || data.length === 0) {
        addToast('error', 'Gagal memuat pesanan.');
        router.push('/app/orders');
        return;
      }
      
      setOrders(data as Order[]);
      setIsLoading(false);
    }
    fetchOrders();
  }, [params.ids]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    
    try {
      const { processPayment } = await import('@/app/actions/payment');
      const result = await processPayment(orderIds);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      addToast('success', 'Pembayaran berhasil dikonfirmasi!');
      router.push('/app/orders');
    } catch (err: any) {
      addToast('error', 'Gagal memproses pembayaran: ' + err.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-text-muted">Memuat gerbang pembayaran...</div>;

  const totalAmount = orders.reduce((sum, o) => sum + o.total_price, 0);
  const method = orders[0]?.payment_method || 'bank';
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/app/orders')} className="p-2 -ml-2 text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="font-bold text-lg flex items-center gap-1.5">
            <ShieldCheck size={20} className="text-primary" />
            SaveBite Pay
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-text-secondary text-sm mb-1">Total Pembayaran</p>
          <h1 className="text-4xl font-extrabold text-primary">{formatCurrency(totalAmount)}</h1>
          
          <div className="inline-flex items-center gap-2 bg-red-50 text-error px-3 py-1.5 rounded-full text-sm font-bold mt-4 border border-red-100">
            <Clock size={16} />
            Selesaikan dalam {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-6 shadow-sm">
          {method === 'qris' || method === 'ewallet' ? (
            <div className="p-6 text-center border-b border-border">
              <h3 className="font-bold mb-4">Scan QRIS Berikut</h3>
              <div className="w-48 h-48 bg-border/50 rounded-xl mx-auto flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                {/* Mock QR Code Pattern */}
                <div className="w-3/4 h-3/4 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-contain bg-no-repeat bg-center opacity-80" />
              </div>
              <p className="text-sm text-text-secondary">Mendukung GoPay, OVO, Dana, ShopeePay, dan M-Banking.</p>
            </div>
          ) : (
            <div className="p-6 border-b border-border">
              <h3 className="font-bold mb-4">Transfer Virtual Account</h3>
              <p className="text-sm text-text-secondary mb-1">Bank BCA (Virtual Account)</p>
              <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-border mb-4">
                <span className="font-mono text-xl font-bold tracking-wider text-text-primary">8277 0812 3456 7890</span>
                <button className="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors flex items-center gap-1 text-sm font-bold">
                  <Copy size={16} /> Salin
                </button>
              </div>
              <p className="text-sm text-text-secondary">Pastikan nama penerima adalah <b>PT SaveBite Indonesia</b>.</p>
            </div>
          )}
          
          <div className="bg-background p-6 flex flex-col gap-3">
            <Button 
              className="w-full text-lg h-14 bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20" 
              onClick={handleSimulatePayment} 
              isLoading={isProcessing}
            >
              <CheckCircle2 size={20} className="mr-1" /> Simulasikan Pembayaran Berhasil
            </Button>
            <p className="text-xs text-center text-text-muted mt-2">
              (Tombol ini murni untuk keperluan prototipe agar pengguna bisa mengetes alur checkout sampai selesai).
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-text-muted">
          <p>ID Transaksi: {orderIds[0].split('-')[0].toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
