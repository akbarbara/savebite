'use client';
import { useState, useEffect } from 'react';
import { Landmark, Check, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { getAdminWithdrawals, updateWithdrawalStatus } from '@/app/actions/wallet';
import { Modal } from '@/components/ui/modal';

export default function AdminWithdrawalsPage() {
  const { addToast } = useToast();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, id: string, status: 'approved' | 'rejected' }>({ isOpen: false, id: '', status: 'approved' });

  const loadData = async () => {
    setIsLoading(true);
    const res = await getAdminWithdrawals();
    if (res.success) {
      setWithdrawals(res.data || []);
    } else {
      addToast('error', 'Gagal memuat riwayat penarikan');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openConfirmModal = (id: string, status: 'approved' | 'rejected') => {
    setConfirmModal({ isOpen: true, id, status });
  };

  const handleUpdateStatus = async () => {
    const { id, status } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });
    
    setProcessingId(id);
    const res = await updateWithdrawalStatus(id, status);
    setProcessingId(null);
    
    if (res.success) {
      addToast('success', `Status penarikan berhasil diperbarui!`);
      loadData();
    } else {
      addToast('error', `Gagal memproses penarikan: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Penarikan Dana 💸</h1>
          <p className="text-text-secondary mt-1">Kelola pencairan dana mitra dan status transfer.</p>
        </div>
      </div>

      <div className="mb-6"><Input placeholder="Cari nama mitra atau rekening..." icon={<Search size={18} />} className="max-w-xs" /></div>

      <div className="bg-surface rounded-2xl border border-border overflow-x-auto shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-muted animate-pulse">Memuat data...</div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Waktu Request</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Mitra</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Rekening Tujuan</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Jumlah</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">Belum ada permintaan penarikan dana.</td>
                </tr>
              ) : (
                withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm text-text-secondary">
                        {new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-text-muted">
                        {new Date(w.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-text-primary">{w.partner?.business_name || 'Mitra Tidak Ditemukan'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold">{w.bank_name}</p>
                      <p className="text-xs text-text-secondary">{w.account_number}</p>
                      <p className="text-xs text-text-muted uppercase">{w.account_name}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-lg text-primary whitespace-nowrap">
                        Rp {w.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={
                        w.status === 'approved' || w.status === 'completed' ? 'success' : 
                        w.status === 'pending' ? 'warning' : 'error'
                      }>
                        {w.status === 'approved' || w.status === 'completed' ? 'Selesai' : 
                         w.status === 'pending' ? 'Menunggu Transfer' : 'Ditolak'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {w.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-emerald-500 hover:bg-emerald-600 border-none"
                            isLoading={processingId === w.id}
                            disabled={processingId !== null}
                            onClick={() => openConfirmModal(w.id, 'approved')}
                          >
                            <Check size={16} /> Transfer
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            disabled={processingId !== null}
                            onClick={() => openConfirmModal(w.id, 'rejected')}
                          >
                            <X size={16} /> Tolak
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
        title="Konfirmasi Penarikan" 
        size="sm"
      >
        <div className="text-center py-2">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${confirmModal.status === 'approved' ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {confirmModal.status === 'approved' ? <Check size={32} className="text-emerald-500" /> : <X size={32} className="text-error" />}
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Apakah Anda yakin ingin menandai penarikan ini sebagai 
            <span className={`font-bold ml-1 ${confirmModal.status === 'approved' ? 'text-emerald-600' : 'text-error'}`}>
              {confirmModal.status === 'approved' ? 'SELESAI DITRANSFER' : 'DITOLAK'}
            </span>?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Batal</Button>
            <Button className={`flex-1 ${confirmModal.status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-error hover:bg-red-600'} text-white`} onClick={handleUpdateStatus}>
              Ya, Lanjutkan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
