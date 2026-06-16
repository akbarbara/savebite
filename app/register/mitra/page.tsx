'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDashboardPath, useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { Leaf, Store, Mail, Lock, Phone, MapPin, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Category } from '@/types';

export default function RegisterMitraPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { refreshUser } = useAuth();
  
  // Step 1: Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);
  
  // Step 2: Business
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    
    setIsLoading(true);

    // 1. Sign up Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (authError) {
      addToast('error', authError.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Insert Profile
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        full_name: fullName,
        phone: phone || null,
        role: 'mitra',
      }]);

      if (profileError) {
        addToast('error', 'Gagal membuat profil: ' + profileError.message);
        setIsLoading(false);
        return;
      }

      // 3. Insert Partner (status defaults to pending based on schema)
      const { error: partnerError } = await supabase.from('partners').insert([{
        user_id: authData.user.id,
        business_name: businessName,
        category_id: categoryId || null,
        description: description || null,
        address: address,
        city: city,
        phone: phone || null,
      }]);

      if (partnerError) {
        addToast('error', 'Gagal membuat toko: ' + partnerError.message);
        setIsLoading(false);
        return;
      }

      // 4. Refresh auth context to sync profile
      await refreshUser();

      addToast('success', 'Pendaftaran Mitra berhasil! Menunggu verifikasi admin.');
      router.push(getDashboardPath('mitra'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Leaf size={22} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold">Save<span className="text-primary">Bite</span></span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-text-primary mb-2">Daftar Sebagai Mitra</h1>
          <p className="text-text-secondary">Jual makanan surplus dan kurangi food waste</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s <= step ? 'bg-primary text-white' : 'bg-gray-200 text-text-muted'
              }`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <h3 className="font-bold text-lg mb-4">📋 Informasi Akun</h3>
                <Input label="Nama Pemilik" placeholder="Nama lengkap" icon={<Store size={18} />} value={fullName} onChange={e => setFullName(e.target.value)} required />
                <Input label="Email Bisnis" type="email" placeholder="bisnis@email.com" icon={<Mail size={18} />} value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="No. Telepon" type="tel" placeholder="08xxxxxxxxxx" icon={<Phone size={18} />} value={phone} onChange={e => setPhone(e.target.value)} required />
                <Input label="Password" type="password" placeholder="Min. 8 karakter" icon={<Lock size={18} />} value={password} onChange={e => setPassword(e.target.value)} required />
              </>
            )}
            {step === 2 && (
              <>
                <h3 className="font-bold text-lg mb-4">🏪 Informasi Bisnis</h3>
                <Input label="Nama Bisnis/Toko" placeholder="Contoh: Kafe Aroma" icon={<Store size={18} />} value={businessName} onChange={e => setBusinessName(e.target.value)} required />
                <Select label="Kategori" options={categories.map(c => ({ value: c.id, label: c.name }))} placeholder="Pilih kategori" value={categoryId} onChange={setCategoryId} required />
                <Textarea label="Deskripsi Bisnis" placeholder="Ceritakan tentang bisnis Anda..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                <Input label="Alamat Lengkap" placeholder="Jl. ..." icon={<MapPin size={18} />} value={address} onChange={e => setAddress(e.target.value)} required />
                <Input label="Kota" placeholder="Jakarta" value={city} onChange={e => setCity(e.target.value)} required />
              </>
            )}
            {step === 3 && (
              <>
                <h3 className="font-bold text-lg mb-4">📄 Dokumen Verifikasi</h3>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload size={32} className="text-text-muted mx-auto mb-3" />
                  <p className="font-medium text-text-primary">Upload Foto Toko</p>
                  <p className="text-xs text-text-muted mt-1">JPG, PNG max 5MB</p>
                </div>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <FileText size={32} className="text-text-muted mx-auto mb-3" />
                  <p className="font-medium text-text-primary">Upload Dokumen Bisnis</p>
                  <p className="text-xs text-text-muted mt-1">SIUP, NIB, atau dokumen lainnya</p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-0.5 rounded" required />
                  <span className="text-xs text-text-secondary">Saya menyetujui Syarat & Ketentuan Mitra SaveBite</span>
                </label>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Kembali</Button>}
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                {step < 3 ? 'Lanjut' : 'Daftar Mitra'}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">Sudah punya akun mitra? <Link href="/login" className="text-primary font-medium">Masuk</Link></p>
      </div>
    </div>
  );
}
