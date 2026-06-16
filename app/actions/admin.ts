'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updatePartnerStatusAdmin(partnerId: string, status: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('partners')
      .update({ status })
      .eq('id', partnerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating partner status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

export async function getAllTransactionsAdmin() {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, partner:partners(business_name), bag:rescue_bags(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin transactions:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
}
