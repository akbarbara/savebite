'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDashboardPath, useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { Leaf, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (authError) {
      addToast('error', authError.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create profile row
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          full_name: fullName,
          phone: phone || null,
          role: 'customer',
        }
      ]);

      if (profileError) {
        addToast('error', 'Gagal membuat profil: ' + profileError.message);
        setIsLoading(false);
        return;
      }

      // 3. Refresh user to sync AuthContext with the newly created profile
      await refreshUser();

      // Success
      addToast('success', 'Pendaftaran berhasil!');
      router.push(getDashboardPath('customer'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-emerald-400 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Leaf size={28} />
            </div>
            <span className="text-3xl font-extrabold">SaveBite</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">Mulai Hemat<br />Hari Ini!</h2>
          <p className="text-white/80 text-lg">Daftar gratis dan dapatkan akses ke ratusan Rescue Bag dari mitra terbaik.</p>
          <div className="mt-10 space-y-4">
            {['Hemat hingga 70% setiap beli', 'Pickup mudah di toko terdekat', 'Bantu kurangi food waste Indonesia'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><span className="text-xs">✓</span></div>
                <span className="text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf size={22} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold">Save<span className="text-primary">Bite</span></span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-text-primary mb-2">Buat Akun Baru</h1>
            <p className="text-text-secondary">Daftar sebagai Customer — gratis!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama Lengkap" placeholder="John Doe" icon={<User size={18} />} value={fullName} onChange={e => setFullName(e.target.value)} required />
            <Input label="Email" type="email" placeholder="nama@email.com" icon={<Mail size={18} />} value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="No. Telepon" type="tel" placeholder="08xxxxxxxxxx" icon={<Phone size={18} />} value={phone} onChange={e => setPhone(e.target.value)} />
            <div className="relative">
              <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 karakter" icon={<Lock size={18} />} value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-text-muted hover:text-text-primary cursor-pointer">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary" required />
              <span className="text-xs text-text-secondary">Saya setuju dengan <Link href="#" className="text-primary font-medium">Syarat & Ketentuan</Link> dan <Link href="#" className="text-primary font-medium">Kebijakan Privasi</Link> SaveBite.</span>
            </label>
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Daftar Sekarang</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">Sudah punya akun? <Link href="/login" className="text-primary font-semibold hover:underline">Masuk</Link></p>
            <p className="text-sm text-text-muted mt-2">Ingin daftar sebagai Mitra? <Link href="/register/mitra" className="text-accent font-semibold hover:underline">Daftar Mitra</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
