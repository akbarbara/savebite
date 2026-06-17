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

export async function saveCategoryAdmin(categoryData: any, categoryId?: string) {
  try {
    let result;
    if (categoryId) {
      result = await supabaseAdmin
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select();
    } else {
      result = await supabaseAdmin
        .from('categories')
        .insert([categoryData])
        .select();
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    revalidatePath('/admin/categories');
    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCategoryAdmin(categoryId: string) {
  try {
    // Check if category is used by partners
    const { count, error: countError } = await supabaseAdmin
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (countError) {
      return { success: false, error: 'Gagal mengecek penggunaan kategori' };
    }

    if (count && count > 0) {
      return { success: false, error: `Kategori ini sedang digunakan oleh ${count} mitra. Tidak bisa dihapus!` };
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
