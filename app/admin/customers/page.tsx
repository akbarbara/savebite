import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';

import { CustomerTable } from '@/components/admin/customer-table';

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
      <CustomerTable customers={customers} />
    </div>
  );
}
