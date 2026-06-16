'use client';
import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Palette, Settings, Building, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { getPlatformSettings, updatePlatformSettings } from '@/app/actions/settings';

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    platform_fee_percent: 5,
    customer_handling_fee: 2000,
    min_withdrawal_amount: 50000
  });

  useEffect(() => {
    const loadSettings = async () => {
      const res = await getPlatformSettings();
      if (res.success && res.data) {
        setSettings({
          platform_fee_percent: res.data.platform_fee_percent,
          customer_handling_fee: res.data.customer_handling_fee,
          min_withdrawal_amount: res.data.min_withdrawal_amount
        });
      }
      setIsFetching(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    
    // For MVP we just save the finance settings since that's what's hooked up
    const res = await updatePlatformSettings(settings);
    
    setIsLoading(false);
    if (res.success) {
      addToast('success', 'Pengaturan berhasil disimpan!');
    } else {
      addToast('error', 'Gagal menyimpan pengaturan: ' + res.error);
    }
  };

  if (isFetching) return <div className="p-8 text-center animate-pulse">Memuat pengaturan...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Pengaturan Sistem ⚙️</h1>
        <p className="text-text-secondary mt-1">Kelola konfigurasi platform SaveBite secara menyeluruh.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
              activeTab === 'general' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface border border-transparent hover:border-border'
            }`}
          >
            <Settings size={18} /> Umum
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
              activeTab === 'finance' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface border border-transparent hover:border-border'
            }`}
          >
            <CreditCard size={18} /> Keuangan
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
              activeTab === 'security' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface border border-transparent hover:border-border'
            }`}
          >
            <Shield size={18} /> Keamanan
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
              activeTab === 'notifications' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface border border-transparent hover:border-border'
            }`}
          >
            <Bell size={18} /> Notifikasi
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
              activeTab === 'appearance' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface border border-transparent hover:border-border'
            }`}
          >
            <Palette size={18} /> Tampilan
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface rounded-2xl border border-border p-6 shadow-sm">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-border pb-4 flex items-center gap-2">
                <Building size={20} className="text-primary" /> Pengaturan Umum Platform
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nama Platform</label>
                  <Input defaultValue="SaveBite Indonesia" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email Dukungan Pelanggan</label>
                  <Input type="email" defaultValue="support@savebite.id" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nomor Telepon Kontak</label>
                  <Input defaultValue="+62 811-2233-4455" />
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Mode Pemeliharaan (Maintenance)</h4>
                      <p className="text-sm text-text-secondary">Aktifkan ini untuk menutup akses pelanggan ke aplikasi sementara.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-border pb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-primary" /> Pengaturan Keuangan & Biaya
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Biaya Layanan Platform (%)</label>
                  <Input 
                    type="number" 
                    value={settings.platform_fee_percent} 
                    onChange={(e) => setSettings({...settings, platform_fee_percent: parseInt(e.target.value) || 0})}
                  />
                  <p className="text-xs text-text-muted mt-1">Persentase potongan dari setiap transaksi mitra.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Biaya Penanganan (Customer)</label>
                  <Input 
                    type="number" 
                    value={settings.customer_handling_fee} 
                    onChange={(e) => setSettings({...settings, customer_handling_fee: parseInt(e.target.value) || 0})}
                  />
                  <p className="text-xs text-text-muted mt-1">Biaya tetap per transaksi (dalam Rupiah).</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Batas Minimal Penarikan Mitra</label>
                  <Input 
                    type="number" 
                    value={settings.min_withdrawal_amount} 
                    onChange={(e) => setSettings({...settings, min_withdrawal_amount: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-border pb-4 flex items-center gap-2">
                <Shield size={20} className="text-primary" /> Keamanan & Akses
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Pendaftaran Mitra Baru</h4>
                    <p className="text-sm text-text-secondary">Izinkan calon mitra mendaftar otomatis melalui aplikasi.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <h4 className="font-semibold">Verifikasi Email Wajib</h4>
                    <p className="text-sm text-text-secondary">Wajibkan verifikasi email untuk akun baru sebelum bisa bertransaksi.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'appearance') && (
            <div className="py-20 text-center animate-fade-in">
              <p className="text-text-muted">Pengaturan untuk modul ini sedang dalam pengembangan.</p>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <Button onClick={handleSave} isLoading={isLoading}>
              <Save size={18} /> Simpan Perubahan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
