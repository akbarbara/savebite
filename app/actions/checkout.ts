'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processCheckout(orderRows: any[], cartItems: any[]) {
  try {
    // 1. Insert orders with pending status
    const { data: insertedOrders, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert(orderRows)
      .select('id');
    
    if (insertError) {
      console.error('Failed to insert orders:', insertError);
      return { success: false, error: insertError.message };
    }

    // Stok tidak lagi dipotong di sini. Stok akan dipotong saat pembayaran berhasil.
    
    const orderIds = insertedOrders.map(o => o.id);

    return { success: true, orderIds };
  } catch (err: any) {
    console.error('Unexpected error in processCheckout:', err);
    return { success: false, error: err.message };
  }
}
