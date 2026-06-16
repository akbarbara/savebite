'use server';

import { createClient } from '@supabase/supabase-js';

export async function getTransactionsReportData() {
  try {
    // Gunakan service role key untuk membypass RLS karena admin berhak melihat seluruh order
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, partner:partners(business_name), bag:rescue_bags(name), customer:profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching report data:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: orders || [] };
  } catch (err: any) {
    console.error('Exception fetching report data:', err);
    return { success: false, error: err.message };
  }
}
