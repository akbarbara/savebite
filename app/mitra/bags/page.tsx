'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Package, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { RescueBag, Partner } from '@/types';
import { PageLoader } from '@/components/ui/page-loader';

export default function MitraBagsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [bags, setBags] = useState<RescueBag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bagToDelete, setBagToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBags() {
      if (!user) return;
      const { data: partnerData } = await supabase.from('partners').select('*').eq('user_id', user.id).single();
      if (!partnerData) { setIsLoading(false); return; }
      setPartner(partnerData as Partner);

      const { data: bagsData } = await supabase
        .from('rescue_bags')
        .select('*')
        .eq('partner_id', partnerData.id)
        .order('created_at', { ascending: false });
        
      if (bagsData) setBags(bagsData as any[]);
      setIsLoading(false);
    }
    fetchBags();
  }, [user]);

  const confirmDelete = (id: string) => {
    setBagToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleCancelBag = async () => {
    if (!bagToDelete) return;
    
    const { error } = await supabase
      .from('rescue_bags')
      .update({ status: 'cancelled' })
      .eq('id', bagToDelete);
      
    if (error) {
      addToast('error', 'Gagal membatalkan bag: ' + error.message);
    } else {
      addToast('success', 'Rescue Bag berhasil dibatalkan');
      setBags(bags.map(b => b.id === bagToDelete ? { ...b, status: 'cancelled' } : b));
    }
    setDeleteModalOpen(false);
    setBagToDelete(null);
  };

  if (isLoading) return <PageLoader message="Memuat..." />;
  if (!partner) return <div className="text-center py-20 text-error">Mitra tidak ditemukan.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Rescue Bag Saya</h1>
          <p className="text-text-secondary text-sm mt-1">{bags.length} rescue bag</p>
        </div>
        <Link href="/mitra/bags/create">
          <Button><Plus size={18} /> Buat Baru</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {bags.map(bag => (
          <div key={bag.id} className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Package size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-text-primary truncate">{bag.name}</h3>
                <Badge variant={bag.status === 'active' ? 'success' : bag.status === 'sold_out' ? 'warning' : 'neutral'}>
                  {bag.status === 'active' ? 'Aktif' : bag.status === 'sold_out' ? 'Habis' : bag.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span><Clock size={12} className="inline" /> {bag.pickup_start.slice(0,5)}-{bag.pickup_end.slice(0,5)}</span>
                <span>Stok: {bag.quantity_remaining}/{bag.quantity_total}</span>
                <span>Terjual: {bag.quantity_sold}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-primary">{formatCurrency(bag.rescue_price)}</p>
              <p className="text-xs text-text-muted line-through">{formatCurrency(bag.original_price)}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/mitra/bags/edit/${bag.id}`}>
                <button className="p-2 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary transition-colors cursor-pointer"><Edit size={16} /></button>
              </Link>
              <button 
                className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-error transition-colors cursor-pointer"
                onClick={() => confirmDelete(bag.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Batalkan Rescue Bag?" size="sm">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
            <Trash2 size={32} className="text-error" />
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Semua data produk ini akan diubah menjadi status "Dibatalkan" dan tidak akan bisa dibeli lagi oleh pelanggan.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)}>Kembali</Button>
            <Button className="flex-1 bg-error hover:bg-red-600 text-white" onClick={handleCancelBag}>Ya, Batalkan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
