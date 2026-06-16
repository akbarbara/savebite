'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Mail, Phone, Edit3, LogOut, ChevronRight, ShoppingBag, Heart, Bell, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { mockCurrentUser, mockOrders } from '@/lib/mock-data';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/modal';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [completedOrders, setCompletedOrders] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    async function fetchOrderStats() {
      if (!user) return;
      const { data } = await supabase
        .from('orders')
        .select('status, quantity')
        .eq('customer_id', user.id);
      
      if (data) {
        const completed = data.filter(o => o.status === 'completed');
        const active = data.filter(o => ['pending', 'confirmed', 'ready'].includes(o.status));
        
        setCompletedOrders(completed.reduce((sum, o) => sum + o.quantity, 0));
        setActiveOrders(active.length);
      }
    }
    fetchOrderStats();
  }, [user]);

  if (isLoading) return <div className="text-center py-20">Memuat profil...</div>;
  if (!user) return null; // Or redirect, but middleware usually handles this

  const menuItems = [
    { icon: <ShoppingBag size={20} />, label: 'Pesanan Saya', href: '/app/orders', badge: activeOrders },
    { icon: <Heart size={20} />, label: 'Mitra Favorit', href: '#' },
    { icon: <Bell size={20} />, label: 'Notifikasi', href: '#' },
    { icon: <Settings size={20} />, label: 'Pengaturan', href: '#' },
    { icon: <HelpCircle size={20} />, label: 'Bantuan & FAQ', href: '/#faq' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-emerald-400 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg" />
          <div>
            <h2 className="text-xl font-extrabold">{user.full_name}</h2>
            <p className="text-white/80 text-sm">{user.email || user.phone || 'Email tidak tersedia'}</p>
          </div>
          <button className="ml-auto p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer">
            <Edit3 size={18} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
          <div className="text-center"><p className="text-2xl font-extrabold">{completedOrders}</p><p className="text-xs text-white/60">Pesanan</p></div>
          <div className="text-center"><p className="text-2xl font-extrabold">{(completedOrders * 0.5).toFixed(1)} kg</p><p className="text-xs text-white/60">Food Saved</p></div>
          <div className="text-center"><p className="text-2xl font-extrabold">{(completedOrders * 1.25).toFixed(1)} kg</p><p className="text-xs text-white/60">CO₂ Saved</p></div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href} className="flex items-center gap-4 px-5 py-4 hover:bg-primary-light/30 transition-colors border-b border-border last:border-0">
            <div className="text-primary">{item.icon}</div>
            <span className="flex-1 font-medium text-text-primary">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">{item.badge}</span>
            )}
            <ChevronRight size={18} className="text-text-muted" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <Button 
        variant="outline" 
        className="w-full mt-6 text-error border-error/30 hover:bg-error/5 hover:border-error"
        onClick={() => setShowLogoutModal(true)}
      >
        <LogOut size={18} /> Keluar
      </Button>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Konfirmasi Keluar" size="sm">
        <div className="space-y-6">
          <p className="text-sm text-text-secondary text-center">
            Apakah Anda yakin ingin keluar dari akun ini?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border text-text-primary font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                setShowLogoutModal(false);
                await logout();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-error text-white font-medium hover:bg-error/90 transition-colors"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
