'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getWalletData(userId: string) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Get partner
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .select('id, wallet_balance')
      .eq('user_id', userId)
      .single();

    if (partnerError) {
      if (partnerError.code === '42703') { // Postgres error code for undefined_column
        return { success: false, error: 'Tabel database belum diperbarui. Pastikan Anda sudah menjalankan script SQL di Supabase.' };
      }
      return { success: false, error: partnerError.message };
    }

    if (!partner) return { success: false, error: 'Partner not found' };

    // Get platform settings for minimum withdrawal
    const { data: settings } = await supabaseAdmin
      .from('platform_settings')
      .select('min_withdrawal_amount')
      .limit(1)
      .single();

    // Get withdrawals history
    const { data: withdrawals, error: wError } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false });
      
    if (wError) {
      if (wError.code === '42P01') { // undefined_table
        return { success: false, error: 'Tabel dompet belum dipasang. Jalankan script SQL di Supabase.' };
      }
    }

    return { 
      success: true, 
      data: {
        wallet_balance: partner.wallet_balance || 0,
        min_withdrawal_amount: settings?.min_withdrawal_amount || 50000,
        withdrawals: withdrawals || []
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function requestWithdrawal(userId: string, amount: number, bankDetails: { bank_name: string, account_number: string, account_name: string }) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { data: partner } = await supabaseAdmin
      .from('partners')
      .select('id, wallet_balance')
      .eq('user_id', userId)
      .single();

    if (!partner) return { success: false, error: 'Partner not found' };
    
    // Validate balance
    if ((partner.wallet_balance || 0) < amount) {
      return { success: false, error: 'Saldo tidak mencukupi' };
    }

    // Create withdrawal request
    const { error: wErr } = await supabaseAdmin
      .from('withdrawals')
      .insert([{
        partner_id: partner.id,
        amount: amount,
        ...bankDetails,
        status: 'pending'
      }]);

    if (wErr) throw wErr;

    // Deduct balance
    const { error: uErr } = await supabaseAdmin
      .from('partners')
      .update({ wallet_balance: partner.wallet_balance - amount })
      .eq('id', partner.id);

    if (uErr) throw uErr;

    return { success: true };
  } catch (err: any) {
    console.error('Error requesting withdrawal:', err);
    return { success: false, error: err.message };
  }
}

export async function getAdminWithdrawals() {
  try {
    const { data: withdrawals, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*, partner:partners(business_name, user_id)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data: withdrawals || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateWithdrawalStatus(withdrawalId: string, status: 'approved' | 'rejected') {
  try {
    // 1. Get the withdrawal
    const { data: w } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (!w || w.status !== 'pending') {
      return { success: false, error: 'Penarikan tidak ditemukan atau sudah diproses.' };
    }

    // 2. Update status
    const { error: updateErr } = await supabaseAdmin
      .from('withdrawals')
      .update({ 
        status: status,
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (updateErr) throw updateErr;

    // 3. If rejected, refund the partner's wallet
    if (status === 'rejected') {
      const { data: partner } = await supabaseAdmin
        .from('partners')
        .select('wallet_balance')
        .eq('id', w.partner_id)
        .single();
        
      if (partner) {
        await supabaseAdmin
          .from('partners')
          .update({ wallet_balance: (partner.wallet_balance || 0) + w.amount })
          .eq('id', w.partner_id);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error updating withdrawal:', err);
    return { success: false, error: err.message };
  }
}
