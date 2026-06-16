'use client';
import { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Upload, Save, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { mockCategories } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Partner } from '@/types';

export default function MitraProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setPartner(data as Partner);
        setCategoryId(data.category_id || '');
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !partner) return;
    
    const formData = new FormData(e.currentTarget);
    setIsSaving(true);
    
    try {
      const updatedProfile = {
        business_name: formData.get('business_name') as string,
        category_id: formData.get('category_id') as string,
        description: formData.get('description') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        phone: formData.get('phone') as string,
        logo_url: formData.get('logo_url') as string || partner.logo_url,
        banner_url: formData.get('banner_url') as string || partner.banner_url,
      };

      const { error } = await supabase
        .from('partners')
        .update(updatedProfile)
        .eq('id', partner.id);
        
      if (error) throw error;
      
      addToast('success', 'Profil toko berhasil diperbarui!');
    } catch (err: any) {
      addToast('error', 'Gagal menyimpan profil: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-text-muted">Memuat profil...</div>;
  if (!partner) return <div className="text-center py-20 text-error">Profil tidak ditemukan.</div>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Profil Toko</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold flex items-center gap-2"><ImageIcon size={18} className="text-primary" /> Visual Toko</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-bold mb-2">Logo Toko (1:1)</p>
              <ImageUploader 
                name="logo_url" 
                folder="profiles/logos" 
                defaultImage={partner.logo_url}
                label="Upload Logo" 
                helperText="JPG, PNG max 2MB. Rekomendasi 500x500px."
              />
            </div>
            <div>
              <p className="text-sm font-bold mb-2">Banner Sampul (16:9)</p>
              <ImageUploader 
                name="banner_url" 
                folder="profiles/banners" 
                defaultImage={partner.banner_url}
                label="Upload Banner" 
                helperText="JPG, PNG max 5MB. Rekomendasi 1280x720px."
              />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold flex items-center gap-2"><Store size={18} className="text-primary" /> Informasi Utama</h3>
          <Input label="Nama Bisnis" name="business_name" defaultValue={partner.business_name || ''} required />
          <Select 
            label="Kategori" 
            name="category_id"
            options={mockCategories.map(c => ({ value: c.id, label: c.name }))} 
            value={categoryId} 
            onChange={setCategoryId}
            required
          />
          <Textarea label="Deskripsi (Tampil di profil)" name="description" defaultValue={partner.description || ''} rows={3} />
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-bold flex items-center gap-2"><MapPin size={18} className="text-primary" /> Kontak & Lokasi</h3>
          <Input label="Alamat Lengkap" name="address" defaultValue={partner.address || ''} required />
          <Input label="Kota" name="city" defaultValue={partner.city || ''} required />
          <Input label="No. Telepon Aktif" name="phone" defaultValue={partner.phone || ''} required />
        </div>

        <Button type="submit" isLoading={isSaving} className="w-full md:w-auto"><Save size={18} /> Simpan Perubahan Profil</Button>
      </form>
    </div>
  );
}
