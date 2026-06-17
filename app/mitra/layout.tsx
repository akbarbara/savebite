'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LayoutDashboard, Package, ClipboardList, History, BarChart3, Store, Settings, Clock, MessageSquare, Wallet } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Partner } from '@/types';
import Link from 'next/link';

export default function MitraLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  useEffect(() => {
    async function checkPartnerStatus() {
      if (!user) return;
      const { data } = await supabase.from('partners').select('*').eq('user_id', user.id).single();
      if (data) {
        setPartner(data as Partner);
        
        // Fetch initial active orders count
        const fetchCount = async () => {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('partner_id', data.id)
            .in('status', ['confirmed', 'ready']);
          setActiveOrdersCount(count || 0);
        };
        await fetchCount();

        // Listen to custom local event (triggers immediately when verified in the same tab)
        const handleOrderUpdate = () => {
          fetchCount();
        };
        window.addEventListener('orderUpdated', handleOrderUpdate);

        // Subscribe to real-time changes (for cross-device/customer updates)
        const channelName = `mitra_orders_${data.id}_${Math.random().toString(36).substring(7)}`;
        const channel = supabase
          .channel(channelName)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `partner_id=eq.${data.id}` }, () => {
             fetchCount();
          })
          .subscribe();

        setIsLoading(false);
        return () => { 
          supabase.removeChannel(channel); 
          window.removeEventListener('orderUpdated', handleOrderUpdate);
        };
      }
      setIsLoading(false);
    }
    checkPartnerStatus();
  }, [user]);

  const sidebarItems = [
    { label: 'Dashboard', href: '/mitra', icon: <LayoutDashboard size={20} /> },
    { label: 'Rescue Bag', href: '/mitra/bags', icon: <Package size={20} /> },
    { label: 'Pesanan Aktif', href: '/mitra/orders', icon: <ClipboardList size={20} />, badge: activeOrdersCount },
    { label: 'Riwayat', href: '/mitra/orders/history', icon: <History size={20} /> },
    { label: 'Dompet', href: '/mitra/wallet', icon: <Wallet size={20} /> },
    { label: 'Ulasan', href: '/mitra/reviews', icon: <MessageSquare size={20} /> },
    { label: 'Analitik', href: '/mitra/analytics', icon: <BarChart3 size={20} /> },
    { label: 'Profil Toko', href: '/mitra/profile', icon: <Store size={20} /> },
    { label: 'Pengaturan', href: '/mitra/settings', icon: <Settings size={20} /> },
  ];

  if (isLoading) {
    return <PageLoader message="Memuat profil mitra..." />;
  }

  if (partner && partner.status === 'pending') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <Clock size={40} className="text-amber-500" />
        </div>
        <h1 className="text-3xl font-extrabold mb-4 text-center">Menunggu Persetujuan Admin ⏳</h1>
        <p className="text-text-secondary text-center max-w-md mb-8">
          Halo <strong>{partner.business_name}</strong>! Pendaftaran tokomu telah kami terima dan saat ini sedang ditinjau oleh tim kami. Harap bersabar sebentar ya!
        </p>
        <Link href="/app" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Mitra Dashboard">{children}</DashboardLayout>;
}
