'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { ImageUploader } from '@/components/ui/image-uploader';

export default function CreateBagPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    // Capture form data synchronously before any await
    const formData = new FormData(e.currentTarget);
    
    setIsLoading(true);
    
    try {
      // 1. Get partner ID
      const { data: partnerData, error: partnerErr } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (partnerErr || !partnerData) throw new Error('Mitra tidak ditemukan');

      // 2. Prepare data
      const newBag = {
        partner_id: partnerData.id,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        content_hint: formData.get('content_hint') as string,
        original_price: parseInt(formData.get('original_price') as string),
        rescue_price: parseInt(formData.get('rescue_price') as string),
        quantity_total: parseInt(formData.get('quantity_total') as string),
        quantity_sold: 0,
        pickup_start: formData.get('pickup_start') as string,
        pickup_end: formData.get('pickup_end') as string,
        available_date: formData.get('available_date') as string,
        status: 'active',
        image_url: formData.get('image_url') as string || 'https://placehold.co/600x400/e2e8f0/64748b?text=Rescue+Bag' // Default if empty
      };

      // 3. Insert to DB
      const { error: insertErr } = await supabase.from('rescue_bags').insert([newBag]);
      
      if (insertErr) throw new Error(insertErr.message);
      
      addToast('success', 'Rescue Bag berhasil ditambahkan!');
      router.push('/mitra/bags');
    } catch (err: any) {
      addToast('error', 'Gagal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Link href="/mitra/bags" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6">
        <ArrowLeft size={18} /> Kembali
      </Link>
      <h1 className="text-2xl font-extrabold mb-6">Buat Rescue Bag Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold flex items-center gap-2"><Package size={18} className="text-primary" /> Informasi Bag</h3>
          <Input label="Nama Rescue Bag" name="name" placeholder="Contoh: Mystery Coffee Bag" required />
          <Textarea label="Deskripsi" name="description" placeholder="Deskripsi singkat tentang rescue bag..." rows={3} />
          <Textarea label="Perkiraan Isi (Content Hint)" name="content_hint" placeholder="Contoh: 2 minuman kopi + 1-2 pastri" rows={2} />
          
          <ImageUploader 
            name="image_url" 
            folder="bags" 
            label="Upload Foto Makanan (Opsional)" 
          />
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold">💰 Harga & Stok</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Harga Asli (Rp)" name="original_price" type="number" placeholder="85000" required />
            <Input label="Harga Rescue (Rp)" name="rescue_price" type="number" placeholder="35000" required />
          </div>
          <Input label="Jumlah Tersedia" name="quantity_total" type="number" placeholder="10" required />
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold">🕐 Waktu Pickup</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mulai" name="pickup_start" type="time" defaultValue="18:00" required />
            <Input label="Selesai" name="pickup_end" type="time" defaultValue="20:00" required />
          </div>
          <Input label="Tanggal Tersedia" name="available_date" type="date" required />
        </div>

        <div className="flex gap-3">
          <Link href="/mitra/bags" className="flex-1">
            <Button variant="outline" className="w-full">Batal</Button>
          </Link>
          <Button type="submit" className="flex-1" isLoading={isLoading}>Publikasikan Rescue Bag</Button>
        </div>
      </form>
    </div>
  );
}
