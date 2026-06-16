'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return { success: false, error: 'File tidak ditemukan' };
    }

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.' };
    }

    // Validasi ukuran (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Ukuran file maksimal 5MB.' };
    }

    // Buat nama file unik
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Konversi file ke buffer (karena Storage JS API di Next.js butuh arrayBuffer/Blob)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload ke Supabase
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: 'Gagal mengunggah gambar ke server.' };
    }

    // Dapatkan Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(data.path);

    return { success: true, url: publicUrl };

  } catch (err: any) {
    console.error('Unexpected error during upload:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan tidak terduga.' };
  }
}
