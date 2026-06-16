'use server';

import { createClient } from '@supabase/supabase-js';

// We use service role key because some endpoints (like updating settings) 
// might need admin bypass or since we don't have cookies set up in this server action properly yet.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getPlatformSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from('platform_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
      return { success: false, error: error.message };
    }

    // If no row exists, return defaults
    if (!data) {
      return { 
        success: true, 
        data: {
          platform_fee_percent: 5,
          customer_handling_fee: 2000,
          min_withdrawal_amount: 50000
        } 
      };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updatePlatformSettings(settings: {
  platform_fee_percent?: number;
  customer_handling_fee?: number;
  min_withdrawal_amount?: number;
}) {
  try {
    // Check if row exists
    const { data: existing } = await supabaseAdmin
      .from('platform_settings')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('platform_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
        
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('platform_settings')
        .insert([{
          platform_fee_percent: settings.platform_fee_percent || 5,
          customer_handling_fee: settings.customer_handling_fee || 2000,
          min_withdrawal_amount: settings.min_withdrawal_amount || 50000
        }]);
        
      if (error) throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error updating settings:', err);
    return { success: false, error: err.message };
  }
}
