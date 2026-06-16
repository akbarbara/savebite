'use client';
import { useState, useEffect } from 'react';
import { Store, Search, Filter, MapPin, Star, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { supabase } from '@/lib/supabase/client';
import { Partner } from '@/types';
import { useToast } from '@/components/ui/toast';
import { updatePartnerStatusAdmin } from '@/app/actions/admin';

export default function AdminPartnersPage() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    async function fetchPartners() {
      const { data } = await supabase.from('partners').select('*, category:categories(*)').order('created_at', { ascending: false });
      if (data) setPartners(data as Partner[]);
      setIsLoading(false);
    }
    fetchPartners();
  }, []);

  const filtered = partners.filter(p => filter === 'all' || p.status === filter);

  const statusConfig: Record<string, any> = {
    active: { variant: 'success', label: 'Aktif', icon: <CheckCircle size={14} /> },
    pending: { variant: 'warning', label: 'Pending', icon: <Clock size={14} /> },
    suspended: { variant: 'error', label: 'Suspended', icon: <XCircle size={14} /> },
    rejected: { variant: 'error', label: 'Ditolak', icon: <XCircle size={14} /> },
  };

  const updateStatus = async (id: string, status: string) => {
    const result = await updatePartnerStatusAdmin(id, status);
    if (!result.success) {
      addToast('error', 'Gagal update: ' + result.error);
    } else {
      addToast('success', `Toko berhasil di-${status}`);
      setPartners(partners.map(p => p.id === id ? { ...p, status: status as any } : p));
      setSelectedPartner(null);
    }
  };

  if (isLoading) return <div className="text-center py-20">Memuat data mitra...</div>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Manajemen Mitra</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Cari mitra..." icon={<Search size={18} />} className="max-w-xs" />
        {['all', 'active', 'pending', 'suspended'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            filter === tab ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary'
          }`}>
            {tab === 'all' ? 'Semua' : statusConfig[tab as keyof typeof statusConfig]?.label || tab}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="text-left p-4 text-sm font-semibold text-text-secondary">Mitra</th>
              <th className="text-left p-4 text-sm font-semibold text-text-secondary hidden md:table-cell">Kategori</th>
              <th className="text-left p-4 text-sm font-semibold text-text-secondary hidden md:table-cell">Kota</th>
              <th className="text-left p-4 text-sm font-semibold text-text-secondary">Status</th>
              <th className="text-right p-4 text-sm font-semibold text-text-secondary">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(partner => {
              const config = statusConfig[partner.status];
              return (
                <tr key={partner.id} className="border-b border-border last:border-0 hover:bg-primary-light/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center"><Store size={18} className="text-primary" /></div>
                      <div><p className="font-bold text-sm">{partner.business_name}</p><p className="text-xs text-text-muted">{partner.phone}</p></div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell"><Badge variant="neutral">{partner.category?.name}</Badge></td>
                  <td className="p-4 hidden md:table-cell text-sm text-text-secondary">{partner.city}</td>
                  <td className="p-4"><Badge variant={config?.variant || 'neutral'}>{config?.icon} {config?.label || partner.status}</Badge></td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPartner(partner)}>Detail</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedPartner} onClose={() => setSelectedPartner(null)} title="Detail Mitra" size="lg">
        {selectedPartner && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center"><Store size={28} className="text-primary" /></div>
              <div>
                <h3 className="text-xl font-bold">{selectedPartner.business_name}</h3>
                <p className="text-sm text-text-muted">{selectedPartner.category?.name} • {selectedPartner.city}</p>
              </div>
              <div className="ml-auto"><Badge variant={statusConfig[selectedPartner.status]?.variant || 'neutral'}>{statusConfig[selectedPartner.status]?.label || selectedPartner.status}</Badge></div>
            </div>
            <p className="text-sm text-text-secondary">{selectedPartner.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-text-muted mb-1">Alamat</p><p className="font-medium">{selectedPartner.address}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-text-muted mb-1">Telepon</p><p className="font-medium">{selectedPartner.phone}</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-text-muted mb-1">Rating</p><p className="font-medium flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /> {selectedPartner.avg_rating} ({selectedPartner.total_reviews} reviews)</p></div>
              <div className="p-3 bg-gray-50 rounded-xl"><p className="text-text-muted mb-1">Bergabung</p><p className="font-medium">{new Date(selectedPartner.created_at).toLocaleDateString('id-ID')}</p></div>
            </div>
            {selectedPartner.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={() => updateStatus(selectedPartner.id, 'active')}>✅ Approve</Button>
                <Button variant="danger" className="flex-1" onClick={() => updateStatus(selectedPartner.id, 'rejected')}>❌ Reject</Button>
              </div>
            )}
            {selectedPartner.status === 'active' && (
              <Button variant="danger" className="w-full" onClick={() => updateStatus(selectedPartner.id, 'suspended')}>⚠️ Suspend Mitra</Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
