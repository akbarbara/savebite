'use client';
import { useState } from 'react';
import { Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function CustomerTable({ customers }: { customers: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <>
      <div className="mb-6">
        <Input 
          placeholder="Cari customer (nama/email/telp)..." 
          icon={<Users size={18} />} 
          className="max-w-xs" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-x-auto shadow-sm">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Customer</th>
              <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Kontak</th>
              <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Pesanan Selesai</th>
              <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap hidden sm:table-cell">Bergabung</th>
              <th className="text-left p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-primary-light/20 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-sm text-text-primary">{c.name}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-text-secondary">{c.email}</p>
                  {c.phone !== '-' && <p className="text-xs text-text-muted mt-0.5">{c.phone}</p>}
                </td>
                <td className="p-4">
                  <span className="font-bold text-primary">{c.orders}</span>
                </td>
                <td className="p-4 hidden sm:table-cell text-sm text-text-secondary">
                  {new Date(c.joined).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-4">
                  <Badge variant={c.status === 'Aktif' ? 'success' : 'neutral'}>{c.status}</Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  {searchQuery ? 'Customer tidak ditemukan.' : 'Belum ada customer yang mendaftar.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
