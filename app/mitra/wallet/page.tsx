'use client';
import { useState, useEffect } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { getWalletData, requestWithdrawal } from '@/app/actions/wallet';
import { Withdrawal } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { PageLoader } from '@/components/ui/page-loader';

export default function MitraWalletPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [minWithdrawal, setMinWithdrawal] = useState(50000);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accName, setAccName] = useState('');

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    const res = await getWalletData(user.id);
    if (res.success && res.data) {
      setBalance(res.data.wallet_balance);
      setMinWithdrawal(res.data.min_withdrawal_amount);
      setWithdrawals(res.data.withdrawals);
    } else {
      addToast('error', res.error || 'Gagal memuat data dompet');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const withdrawAmount = parseInt(amount.replace(/\D/g, ''));
    
    if (withdrawAmount < minWithdrawal) {
      return addToast('error', `Minimal penarikan adalah Rp ${minWithdrawal.toLocaleString('id-ID')}`);
    }
    if (withdrawAmount > balance) {
      return addToast('error', 'Saldo tidak mencukupi');
    }
    if (!bankName || !accNumber || !accName) {
      return addToast('error', 'Harap lengkapi detail rekening bank');
    }

    setIsWithdrawing(true);
    const res = await requestWithdrawal(user.id, withdrawAmount, {
      bank_name: bankName,
      account_number: accNumber,
      account_name: accName
    });
    
    setIsWithdrawing(false);
    
    if (res.success) {
      addToast('success', 'Permintaan penarikan dana berhasil dikirim!');
      setShowForm(false);
      setAmount('');
      setBankName('');
      setAccNumber('');
      setAccName('');
      loadData(); // Refresh data
    } else {
      addToast('error', 'Gagal memproses penarikan: ' + res.error);
    }
  };

  if (isLoading) {
    return <PageLoader message="Menyiapkan brankas dompet..." />;
  }

  const isEligible = balance >= minWithdrawal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dompet Mitra 💰</h1>
        <p className="text-text-secondary mt-1">Kelola saldo dan tarik dana pendapatan Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary to-emerald-400 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-surface/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} className="text-white/80" />
              <span className="text-white/80 font-medium">Total Saldo Aktif</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Rp {balance.toLocaleString('id-ID')}
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/20 pt-6">
              <div className="text-sm text-white/90">
                <p>Minimal penarikan: <strong>Rp {minWithdrawal.toLocaleString('id-ID')}</strong></p>
                {!isEligible && (
                  <p className="text-yellow-200 mt-1">Saldo Anda belum mencapai batas minimal penarikan.</p>
                )}
              </div>
              <Button 
                variant="white" 
                size="lg"
                disabled={!isEligible}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Batal Penarikan' : 'Tarik Dana Sekarang'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      {showForm && isEligible && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm animate-fade-in max-w-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Landmark size={20} className="text-primary" /> Detail Rekening Bank
          </h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Jumlah Penarikan (Rp)</label>
              <Input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 50000"
                min={minWithdrawal}
                max={balance}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Bank</label>
                <Input 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Contoh: BCA / Mandiri / GoPay"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nomor Rekening</label>
                <Input 
                  type="text"
                  value={accNumber}
                  onChange={(e) => setAccNumber(e.target.value)}
                  placeholder="Nomor rekening"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Nama Pemilik Rekening</label>
              <Input 
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="Sesuai buku tabungan"
                required
              />
            </div>
            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={isWithdrawing} className="w-full sm:w-auto">
                Kirim Permintaan Penarikan
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* History */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold">Riwayat Penarikan Dana</h3>
        </div>
        <div className="divide-y divide-border">
          {withdrawals.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              Belum ada riwayat penarikan dana.
            </div>
          ) : (
            withdrawals.map((w) => (
              <div key={w.id} className="p-6 flex items-center justify-between hover:bg-background transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    w.status === 'completed' || w.status === 'approved' ? 'bg-green-100 text-green-600' : 
                    w.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                    'bg-red-100 text-red-600'
                  }`}>
                    {w.status === 'pending' ? <Clock size={24} /> : 
                     w.status === 'completed' || w.status === 'approved' ? <CheckCircle2 size={24} /> : 
                     <ArrowDownRight size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Penarikan Saldo</p>
                    <p className="text-sm text-text-secondary">
                      {w.bank_name} • {w.account_number}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(w.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-text-primary">
                    Rp {w.amount.toLocaleString('id-ID')}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    w.status === 'completed' || w.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    w.status === 'pending' ? 'bg-orange-100 text-orange-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {w.status === 'completed' || w.status === 'approved' ? 'Berhasil' : 
                     w.status === 'pending' ? 'Diproses' : 'Ditolak'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
