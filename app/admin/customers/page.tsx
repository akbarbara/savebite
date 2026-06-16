import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch profiles where role = 'customer'
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  // 2. Fetch all completed orders to count orders per customer
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('customer_id')
    .eq('status', 'completed');

  const orderCounts: Record<string, number> = {};
  orders?.forEach(o => {
    orderCounts[o.customer_id] = (orderCounts[o.customer_id] || 0) + 1;
  });

  // 3. Fetch auth users to get emails
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  const userMap = new Map((users || []).map(u => [u.id, u.email]));

  const customers = (profiles || []).map(p => ({
    id: p.id,
    name: p.full_name || 'Tanpa Nama',
    email: userMap.get(p.id) || '-',
    phone: p.phone || '-',
    orders: orderCounts[p.id] || 0,
    joined: p.created_at,
    status: p.is_active ? 'Aktif' : 'Nonaktif'
  }));

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Manajemen Customer</h1>
      <div className="mb-6"><Input placeholder="Cari customer..." icon={<Users size={18} />} className="max-w-xs" /></div>

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
            {customers.map(c => (
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
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  Belum ada customer yang mendaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
