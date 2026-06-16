'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { RescueBag } from '@/types';

import { ImageUploader } from '@/components/ui/image-uploader';

export default function EditBagPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [bag, setBag] = useState<RescueBag | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchBag() {
      if (!params.id) return;
      
      const { data, error } = await supabase
        .from('rescue_bags')
        .select('*')
        .eq('id', params.id as string)
        .single();
        
      if (data) {
        setBag(data as RescueBag);
      } else {
        addToast('error', 'Rescue Bag tidak ditemukan');
      }
      setIsLoadingData(false);
    }
    
    fetchBag();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !bag) return;
    
    // Capture form data synchronously
    const formData = new FormData(e.currentTarget);
    setIsSaving(true);
    
    try {
      // Prepare data
      const addStock = parseInt(formData.get('add_stock') as string) || 0;
      const newTotal = bag.quantity_total + addStock;
      const newRemaining = Math.max(0, newTotal - bag.quantity_sold);
      const newStatus = newRemaining > 0 ? 'active' : 'sold_out';

      const updatedBag = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        content_hint: formData.get('content_hint') as string,
        original_price: parseInt(formData.get('original_price') as string),
        rescue_price: parseInt(formData.get('rescue_price') as string),
        quantity_total: newTotal,
        status: newStatus,
        pickup_start: formData.get('pickup_start') as string,
        pickup_end: formData.get('pickup_end') as string,
        available_date: formData.get('available_date') as string,
        image_url: formData.get('image_url') as string || bag.image_url,
      };

      // Update to DB
      const { error: updateErr } = await supabase
        .from('rescue_bags')
        .update(updatedBag)
        .eq('id', bag.id);
      
      if (updateErr) throw new Error(updateErr.message);
      
      addToast('success', 'Rescue Bag berhasil diperbarui!');
      router.push('/mitra/bags');
    } catch (err: any) {
      addToast('error', 'Gagal: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) return <div className="text-center py-20 text-text-muted">Memuat data...</div>;
  if (!bag) return <div className="text-center py-20 text-error">Data tidak ditemukan.</div>;

  return (
    <div>
      <Link href="/mitra/bags" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6">
        <ArrowLeft size={18} /> Kembali
      </Link>
      <h1 className="text-2xl font-extrabold mb-6">Edit Rescue Bag</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold flex items-center gap-2"><Package size={18} className="text-primary" /> Informasi Bag</h3>
          <Input label="Nama Rescue Bag" name="name" defaultValue={bag.name} required />
          <Textarea label="Deskripsi" name="description" defaultValue={bag.description} rows={3} />
          <Textarea label="Perkiraan Isi (Content Hint)" name="content_hint" defaultValue={bag.content_hint} rows={2} />
          <ImageUploader 
            name="image_url" 
            folder="bags" 
            defaultImage={bag.image_url}
            label="Ganti Foto Makanan (Opsional)" 
          />
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold">💰 Harga & Stok</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Harga Asli (Rp)" name="original_price" type="number" defaultValue={bag.original_price} required />
            <Input label="Harga Rescue (Rp)" name="rescue_price" type="number" defaultValue={bag.rescue_price} required />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm space-y-2 mb-2">
            <p className="text-blue-800 font-bold">Info Stok Saat Ini:</p>
            <div className="flex gap-4 text-blue-700">
              <span>Total Disediakan: <b>{bag.quantity_total} porsi</b></span>
              <span>Terjual: <b>{bag.quantity_sold} porsi</b></span>
              <span>Sisa: <b>{bag.quantity_remaining} porsi</b></span>
            </div>
            <p className="text-blue-600 text-xs italic">
              *Ingin jualan lagi? Masukkan jumlah porsi baru di kolom Tambah Stok di bawah.
            </p>
          </div>
          
          <div className="space-y-1">
            <Input 
              label="Tambah Stok Baru (+)" 
              name="add_stock" 
              type="number" 
              defaultValue={0} 
              min={0}
              required 
            />
            <p className="text-xs text-text-muted ml-1">Angka ini akan ditambahkan ke total porsi sebelumnya.</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold">🕐 Waktu Pickup</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mulai" name="pickup_start" type="time" defaultValue={bag.pickup_start.slice(0, 5)} required />
            <Input label="Selesai" name="pickup_end" type="time" defaultValue={bag.pickup_end.slice(0, 5)} required />
          </div>
          <Input label="Tanggal Tersedia" name="available_date" type="date" defaultValue={bag.available_date} required />
        </div>

        <div className="flex gap-3">
          <Link href="/mitra/bags" className="flex-1">
            <Button type="button" variant="outline" className="w-full">Batal</Button>
          </Link>
          <Button type="submit" className="flex-1" isLoading={isSaving}>Simpan Perubahan</Button>
        </div>
      </form>
    </div>
  );
}
