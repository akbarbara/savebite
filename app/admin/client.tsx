'use client';
import { useState, useEffect } from 'react';
import { Users, Store, CreditCard, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/features/stats-card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Partner, Order } from '@/types';
import { useToast } from '@/components/ui/toast';
import { updatePartnerStatusAdmin } from '@/app/actions/admin';

interface AdminDashboardClientProps {
  initialPartners: Partner[];
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  platformStats: {
    bags_rescued: number;
    kg_food_saved: number;
    co2_avoided_kg: number;
    total_revenue: number;
    platform_revenue: number;
  };
}

export function AdminDashboardClient({ 
  initialPartners, 
  totalOrders, 
  totalRevenue, 
  totalCustomers, 
  platformStats 
}: AdminDashboardClientProps) {
  const { addToast } = useToast();
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Sync with server props if they change
  useEffect(() => {
    setPartners(initialPartners);
  }, [initialPartners]);

  const activePartners = partners.filter(p => p.status === 'active').length;
  const pendingPartnersList = partners.filter(p => p.status === 'pending');
  const pendingPartners = pendingPartnersList.length;

  const updatePartnerStatus = async (id: string, status: string) => {
    setIsLoading(id);
    const result = await updatePartnerStatusAdmin(id, status);
    if (!result.success) {
      addToast('error', 'Gagal update status: ' + result.error);
    } else {
      addToast('success', `Toko berhasil di-${status}`);
      // Optimistic update
      setPartners(partners.map(p => p.id === id ? { ...p, status: status as any } : p));
    }
    setIsLoading(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Dashboard Admin 🛡️</h1>
        <p className="text-text-secondary mt-1">Overview platform SaveBite</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatsCard icon={<Store size={24} />} label="Mitra Aktif" value={activePartners} change={`${pendingPartners} pending`} />
        <StatsCard icon={<Users size={24} />} label="Total Customer" value={totalCustomers.toLocaleString('id-ID')} change="Pengguna unik" />
        <StatsCard icon={<CreditCard size={24} />} label="Total Transaksi" value={totalOrders.toLocaleString('id-ID')} change="Pesanan selesai" />
        <StatsCard icon={<DollarSign size={24} />} label="GMV (Gross)" value={formatCurrency(totalRevenue)} change="Total Uang Masuk" />
      </div>

      {/* Net Revenue Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white mb-8 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Shine effect */}
        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
        
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-emerald-100 flex items-center gap-2">
            <DollarSign size={20} className="animate-bounce" style={{ animationDuration: '2s' }} /> Pendapatan Bersih Platform (SaveBite)
          </h2>
          <p className="text-sm text-emerald-50 mt-1">Total keuntungan dari potongan biaya layanan.</p>
        </div>
        <div className="relative z-10 text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">
          {formatCurrency(platformStats.platform_revenue)}
        </div>
      </div>

      {/* Impact Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-emerald-400 rounded-2xl p-6 text-white mb-8 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group">
        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🌿 Dampak Lingkungan Platform</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group/item hover:-translate-y-1 transition-transform duration-300"><p className="text-2xl font-extrabold drop-shadow-sm">{platformStats.bags_rescued.toLocaleString('id-ID')}</p><p className="text-xs text-emerald-50 mt-1">Bags Rescued</p></div>
            <div className="group/item hover:-translate-y-1 transition-transform duration-300"><p className="text-2xl font-extrabold drop-shadow-sm">{platformStats.kg_food_saved.toLocaleString('id-ID')} kg</p><p className="text-xs text-emerald-50 mt-1">Food Saved</p></div>
            <div className="group/item hover:-translate-y-1 transition-transform duration-300"><p className="text-2xl font-extrabold drop-shadow-sm">{platformStats.co2_avoided_kg.toLocaleString('id-ID', {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</p><p className="text-xs text-emerald-50 mt-1">CO₂ Avoided</p></div>
            <div className="group/item hover:-translate-y-1 transition-transform duration-300"><p className="text-2xl font-extrabold drop-shadow-sm">{formatCurrency(platformStats.total_revenue)}</p><p className="text-xs text-emerald-50 mt-1">Nilai Transaksi</p></div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">⏳ Menunggu Persetujuan</h2>
          <Badge variant="warning">{pendingPartners} menunggu</Badge>
        </div>
        {pendingPartnersList.map(partner => (
          <div key={partner.id} className="flex items-center gap-4 p-4 rounded-xl border border-border mb-3 last:mb-0 transition-all hover:border-primary/30">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><Store size={18} className="text-amber-600" /></div>
            <div className="flex-1">
              <p className="font-bold text-sm">{partner.business_name}</p>
              <p className="text-xs text-text-muted">{partner.address}, {partner.city}</p>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={isLoading === partner.id}
                onClick={() => updatePartnerStatus(partner.id, 'active')} 
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading === partner.id ? 'Memproses...' : 'Approve'}
              </button>
              <button 
                disabled={isLoading === partner.id}
                onClick={() => updatePartnerStatus(partner.id, 'rejected')} 
                className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {pendingPartnersList.length === 0 && (
          <div className="text-center py-10 border border-dashed border-border rounded-xl mt-4">
            <Store size={40} className="mx-auto text-text-muted mb-3 opacity-50" />
            <p className="text-sm font-bold text-text-primary">Semua beres!</p>
            <p className="text-xs text-text-muted mt-1">Tidak ada toko yang menunggu persetujuan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
