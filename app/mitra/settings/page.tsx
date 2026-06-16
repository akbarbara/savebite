import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
        <Settings size={40} className="text-primary animate-spin-slow" />
      </div>
      <h1 className="text-2xl font-extrabold text-text-primary mb-2">Segera Hadir! 🚧</h1>
      <p className="text-text-secondary text-center max-w-md">
        Fitur Pengaturan sedang dalam tahap pengembangan. Nantinya kamu bisa mengatur notifikasi, akun, dan operasional toko di sini.
      </p>
    </div>
  );
}
