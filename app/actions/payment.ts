'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processPayment(orderIds: string[]) {
  try {
    // 1. Fetch the pending orders
    const { data: orders, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('*, bag:rescue_bags(id, quantity_sold, quantity_total)')
      .in('id', orderIds)
      .eq('status', 'pending');

    if (fetchErr || !orders || orders.length === 0) {
      return { success: false, error: 'Pesanan tidak ditemukan atau sudah dibayar.' };
    }

    // Fetch platform settings to get the fee
    const { data: settings } = await supabaseAdmin
      .from('platform_settings')
      .select('platform_fee_percent')
      .limit(1)
      .single();
      
    const feePercent = settings?.platform_fee_percent || 5;

    // 2. Process each order: update stock and set to completed
    for (const order of orders) {
      if (!order.bag) continue;
      
      const netAmount = Math.round(order.total_price * (1 - feePercent / 100));
      const platformFee = order.total_price - netAmount;

      // Update order status to confirmed and record platform_fee
      await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'confirmed', 
          payment_status: 'paid', 
          platform_fee: platformFee,
          updated_at: new Date().toISOString() 
        })
        .eq('id', order.id);

      // Deduct stock safely
      const newSold = order.bag.quantity_sold + order.quantity;
      const newRemaining = Math.max(0, order.bag.quantity_total - newSold);
      const status = newRemaining === 0 ? 'sold_out' : 'active';
      
      await supabaseAdmin
        .from('rescue_bags')
        .update({
          quantity_sold: newSold,
          status: status
        })
        .eq('id', order.bag.id);
        
      // Get current balance
      const { data: partner } = await supabaseAdmin
        .from('partners')
        .select('wallet_balance')
        .eq('id', order.partner_id)
        .single();
        
      if (partner) {
        await supabaseAdmin
          .from('partners')
          .update({ wallet_balance: (partner.wallet_balance || 0) + netAmount })
          .eq('id', order.partner_id);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error in processPayment:', err);
    return { success: false, error: err.message };
  }
}
