-- ============================================
-- PLATFORM REVENUE TRACKING
-- ============================================

-- Tambahkan kolom platform_fee (potongan mitra) dan handling_fee (biaya layanan pelanggan) 
-- ke tabel orders untuk melacak pendapatan bersih perusahaan (SaveBite).

ALTER TABLE orders ADD COLUMN platform_fee INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN handling_fee INTEGER NOT NULL DEFAULT 0;

-- Catatan: Untuk pesanan yang sudah ada sebelumnya (historical data), 
-- nilai default-nya akan 0 karena saat itu belum diterapkan potongan platform.
