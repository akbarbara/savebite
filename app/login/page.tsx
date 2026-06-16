'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardPath } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      addToast('error', error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Fetch role to determine redirect
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      const role = profile?.role || 'customer';
      router.push(getDashboardPath(role));
    }
  };

  const handleQuickLogin = async (role: 'mitra' | 'admin') => {
    // We remove the auto quick login logic since we are now using real auth.
    // In production, you would remove these buttons. For now, we just show a toast.
    addToast('info', 'Quick login dimatikan di versi real-auth. Silakan login dengan akun yang dibuat.');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-emerald-400 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-surface/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-surface/10 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-surface/20 flex items-center justify-center">
              <Leaf size={28} />
            </div>
            <span className="text-3xl font-extrabold">SaveBite</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Selamatkan Makanan,<br />Hemat Pengeluaran
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Bergabung dengan ribuan orang yang sudah menyelamatkan makanan dan menghemat pengeluaran.
          </p>
          <div className="flex gap-8 mt-10">
            <div><p className="text-3xl font-extrabold">12k+</p><p className="text-sm text-white/60">Bags Rescued</p></div>
            <div><p className="text-3xl font-extrabold">200+</p><p className="text-sm text-white/60">Mitra Aktif</p></div>
            <div><p className="text-3xl font-extrabold">5k+</p><p className="text-sm text-white/60">Customer</p></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf size={22} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold">Save<span className="text-primary">Bite</span></span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-text-primary mb-2">Selamat Datang Kembali</h1>
            <p className="text-text-secondary">Masuk ke akun SaveBite-mu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="nama@email.com" icon={<Mail size={18} />} value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="relative">
              <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Masukkan password" icon={<Lock size={18} />} value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-text-muted hover:text-text-primary cursor-pointer">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm text-text-secondary">Ingat saya</span>
              </label>
              <Link href="#" className="text-sm text-primary font-medium hover:underline">Lupa password?</Link>
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Masuk</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Belum punya akun?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">Daftar sekarang</Link>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">atau masuk sebagai</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" size="sm" onClick={() => handleQuickLogin('mitra')} disabled={isLoading}>🏪 Mitra</Button>
            <Button variant="outline" className="w-full" size="sm" onClick={() => handleQuickLogin('admin')} disabled={isLoading}>🛡️ Admin</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
