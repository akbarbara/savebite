'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processCancelOrder(orderId: string) {
  try {
    // 1. Fetch the order
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('*, bag:rescue_bags(id, quantity_sold, quantity_total)')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) {
      return { success: false, error: 'Pesanan tidak ditemukan.' };
    }

    if (order.status === 'cancelled') {
      return { success: false, error: 'Pesanan sudah dibatalkan sebelumnya.' };
    }

    // 2. Update order status
    await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'cancelled', 
        cancelled_at: new Date().toISOString() 
      })
      .eq('id', order.id);

    // 3. If it was already paid/confirmed, we MUST return the stock
    if (order.status === 'confirmed' || order.payment_status === 'paid') {
      if (order.bag) {
        // Decrease the quantity_sold to return the stock back to the bag
        const newSold = Math.max(0, order.bag.quantity_sold - order.quantity);
        
        // Since stock is returned, the status is definitely active again
        await supabaseAdmin
          .from('rescue_bags')
          .update({
            quantity_sold: newSold,
            status: 'active'
          })
          .eq('id', order.bag.id);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error in processCancelOrder:', err);
    return { success: false, error: err.message };
  }
}
