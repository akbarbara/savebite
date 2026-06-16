import { AdminDashboardClient } from './client';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all partners using service_role to bypass RLS
  const { data: partnersData } = await supabaseAdmin
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  const partners = partnersData || [];

  // Fetch all orders
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('*');
  const orders = ordersData || [];

  // Calculate unique customers
  const uniqueCustomerIds = new Set(orders.map(o => o.customer_id).filter(Boolean));
  const totalCustomers = uniqueCustomerIds.size;

  // Calculate stats from completed orders
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalItemsRescued = completedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0);
  const totalPlatformRevenue = completedOrders.reduce((sum, o) => sum + (o.platform_fee || 0) + (o.handling_fee || 0), 0);

  const platformStats = {
    bags_rescued: totalItemsRescued,
    kg_food_saved: totalItemsRescued * 0.5,
    co2_avoided_kg: totalItemsRescued * 1.25,
    total_revenue: totalRevenue,
    platform_revenue: totalPlatformRevenue
  };

  return (
    <AdminDashboardClient 
      initialPartners={partners as any[]} 
      totalOrders={totalItemsRescued} 
      totalRevenue={totalRevenue} 
      totalCustomers={totalCustomers}
      platformStats={platformStats} 
    />
  );
}
