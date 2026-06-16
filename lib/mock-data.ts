import { User, Partner, Category, RescueBag, Order, Review, PlatformStats } from '@/types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Restoran', icon: 'Utensils', slug: 'restoran', sort_order: 1, is_active: true },
  { id: '2', name: 'Bakeri & Pastri', icon: 'Croissant', slug: 'bakeri', sort_order: 2, is_active: true },
  { id: '3', name: 'Kafe & Minuman', icon: 'Coffee', slug: 'kafe', sort_order: 3, is_active: true },
  { id: '4', name: 'Makanan Sehat', icon: 'Salad', slug: 'sehat', sort_order: 4, is_active: true },
  { id: '5', name: 'Fast Food', icon: 'Hamburger', slug: 'fast-food', sort_order: 5, is_active: true },
  { id: '6', name: 'Asian Food', icon: 'Soup', slug: 'asian', sort_order: 6, is_active: true },
];

export const mockPartners: Partner[] = [
  {
    id: 'p1', user_id: 'u1', business_name: 'Kopi Kenangan', description: 'Kafe modern dengan berbagai pilihan kopi dan pastri segar setiap hari.',
    address: 'Jl. Sudirman No. 45', city: 'Jakarta', latitude: -6.2088, longitude: 106.8456,
    phone: '081234567890', logo_url: '/images/partners/kopi-kenangan.jpg', banner_url: '/images/partners/banner-kopi.jpg',
    category_id: '3', category: { id: '3', name: 'Kafe & Minuman', icon: 'Coffee', slug: 'kafe', sort_order: 3, is_active: true },
    status: 'active', avg_rating: 4.6, total_reviews: 128, created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'p2', user_id: 'u2', business_name: 'Roti Bakar 88', description: 'Bakeri tradisional yang menyajikan roti, kue, dan pastri artisan berkualitas tinggi.',
    address: 'Jl. Gatot Subroto No. 12', city: 'Jakarta', latitude: -6.2350, longitude: 106.8220,
    phone: '081234567891', logo_url: '/images/partners/roti-bakar.jpg',
    category_id: '2', category: { id: '2', name: 'Bakeri & Pastri', icon: 'Croissant', slug: 'bakeri', sort_order: 2, is_active: true },
    status: 'active', avg_rating: 4.8, total_reviews: 256, created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'p3', user_id: 'u3', business_name: 'Warung Nasi Padang Sederhana', description: 'Masakan padang autentik dengan bumbu rempah pilihan.',
    address: 'Jl. Kebon Sirih No. 7', city: 'Jakarta', latitude: -6.1862, longitude: 106.8345,
    phone: '081234567892', logo_url: '/images/partners/nasi-padang.jpg',
    category_id: '1', category: { id: '1', name: 'Restoran', icon: 'Utensils', slug: 'restoran', sort_order: 1, is_active: true },
    status: 'active', avg_rating: 4.5, total_reviews: 89, created_at: '2026-02-01T00:00:00Z'
  },
  {
    id: 'p4', user_id: 'u4', business_name: 'Green Bowl Salad Bar', description: 'Healthy food dengan bahan organik segar setiap hari.',
    address: 'Jl. Kemang Raya No. 20', city: 'Jakarta', latitude: -6.2615, longitude: 106.8138,
    phone: '081234567893', logo_url: '/images/partners/green-bowl.jpg',
    category_id: '4', category: { id: '4', name: 'Makanan Sehat', icon: 'Salad', slug: 'sehat', sort_order: 4, is_active: true },
    status: 'active', avg_rating: 4.7, total_reviews: 67, created_at: '2026-02-15T00:00:00Z'
  },
  {
    id: 'p5', user_id: 'u5', business_name: 'Burger Bangor', description: 'Burger premium dengan daging sapi pilihan dan saus homemade.',
    address: 'Jl. Thamrin No. 55', city: 'Jakarta', latitude: -6.1950, longitude: 106.8230,
    phone: '081234567894', logo_url: '/images/partners/burger-bangor.jpg',
    category_id: '5', category: { id: '5', name: 'Fast Food', icon: 'Hamburger', slug: 'fast-food', sort_order: 5, is_active: true },
    status: 'active', avg_rating: 4.3, total_reviews: 45, created_at: '2026-03-01T00:00:00Z'
  },
  {
    id: 'p6', user_id: 'u6', business_name: 'Sushi Tei Express', description: 'Japanese food berkualitas dengan harga terjangkau.',
    address: 'Jl. Asia Afrika No. 8', city: 'Bandung', latitude: -6.9219, longitude: 107.6072,
    phone: '081234567895', logo_url: '/images/partners/sushi-tei.jpg',
    category_id: '6', category: { id: '6', name: 'Asian Food', icon: 'Soup', slug: 'asian', sort_order: 6, is_active: true },
    status: 'active', avg_rating: 4.4, total_reviews: 92, created_at: '2026-03-10T00:00:00Z'
  },
  {
    id: 'p7', user_id: 'u7', business_name: 'Toko Roti Mama', description: 'Roti dan kue rumahan dengan resep turun temurun.',
    address: 'Jl. Braga No. 30', city: 'Bandung',
    phone: '081234567896', logo_url: '/images/partners/roti-mama.jpg',
    category_id: '2', category: { id: '2', name: 'Bakeri & Pastri', icon: 'Croissant', slug: 'bakeri', sort_order: 2, is_active: true },
    status: 'pending', avg_rating: 0, total_reviews: 0, created_at: '2026-06-01T00:00:00Z'
  },
  {
    id: 'p8', user_id: 'u8', business_name: 'Kedai Kopi Lokal', description: 'Specialty coffee dari biji kopi Nusantara.',
    address: 'Jl. Dago No. 15', city: 'Bandung',
    phone: '081234567897', logo_url: '/images/partners/kedai-kopi.jpg',
    category_id: '3', category: { id: '3', name: 'Kafe & Minuman', icon: 'Coffee', slug: 'kafe', sort_order: 3, is_active: true },
    status: 'pending', avg_rating: 0, total_reviews: 0, created_at: '2026-06-05T00:00:00Z'
  },
];

export const mockRescueBags: RescueBag[] = [
  {
    id: 'b1', partner_id: 'p1', partner: mockPartners[0], name: 'Mystery Coffee Bag',
    description: 'Paket kejutan berisi aneka minuman kopi dan pastri pilihan barista kami.',
    content_hint: 'Perkiraan isi: 2 minuman kopi + 1-2 pastri (croissant/muffin)',
    image_url: '/images/bags/coffee-bag.jpg', original_price: 85000, rescue_price: 35000,
    quantity_total: 10, quantity_sold: 6, quantity_remaining: 4,
    pickup_start: '18:00', pickup_end: '20:00', available_date: '2026-06-14',
    status: 'active', created_at: '2026-06-14T08:00:00Z'
  },
  {
    id: 'b2', partner_id: 'p2', partner: mockPartners[1], name: 'Roti Assorted Box',
    description: 'Koleksi roti dan pastri segar yang dipanggang hari ini.',
    content_hint: 'Perkiraan isi: 4-6 potong roti (roti tawar, roti coklat, roti keju)',
    image_url: '/images/bags/bread-box.jpg', original_price: 65000, rescue_price: 25000,
    quantity_total: 15, quantity_sold: 10, quantity_remaining: 5,
    pickup_start: '17:00', pickup_end: '19:30', available_date: '2026-06-14',
    status: 'active', created_at: '2026-06-14T07:00:00Z'
  },
  {
    id: 'b3', partner_id: 'p3', partner: mockPartners[2], name: 'Nasi Padang Komplit',
    description: 'Paket nasi padang lengkap dengan lauk pilihan chef.',
    content_hint: 'Perkiraan isi: Nasi + rendang/ayam pop + sayur + sambal',
    image_url: '/images/bags/nasi-padang.jpg', original_price: 55000, rescue_price: 20000,
    quantity_total: 20, quantity_sold: 18, quantity_remaining: 2,
    pickup_start: '19:00', pickup_end: '21:00', available_date: '2026-06-14',
    status: 'active', created_at: '2026-06-14T09:00:00Z'
  },
  {
    id: 'b4', partner_id: 'p4', partner: mockPartners[3], name: 'Healthy Bowl Surprise',
    description: 'Bowl sehat dengan kombinasi salad, protein, dan topping.',
    content_hint: 'Perkiraan isi: 1 salad bowl + 1 smoothie',
    image_url: '/images/bags/healthy-bowl.jpg', original_price: 75000, rescue_price: 30000,
    quantity_total: 8, quantity_sold: 3, quantity_remaining: 5,
    pickup_start: '16:00', pickup_end: '18:30', available_date: '2026-06-14',
    status: 'active', created_at: '2026-06-14T06:00:00Z'
  },
  {
    id: 'b5', partner_id: 'p5', partner: mockPartners[4], name: 'Burger Combo Deal',
    description: 'Paket combo burger premium yang wajib dicoba.',
    content_hint: 'Perkiraan isi: 1-2 burger + french fries + minuman',
    image_url: '/images/bags/burger-combo.jpg', original_price: 95000, rescue_price: 40000,
    quantity_total: 12, quantity_sold: 12, quantity_remaining: 0,
    pickup_start: '20:00', pickup_end: '22:00', available_date: '2026-06-14',
    status: 'sold_out', created_at: '2026-06-14T10:00:00Z'
  },
  {
    id: 'b6', partner_id: 'p6', partner: mockPartners[5], name: 'Sushi Platter Rescue',
    description: 'Assortment sushi segar dengan berbagai topping premium.',
    content_hint: 'Perkiraan isi: 8-12 pieces sushi assorted',
    image_url: '/images/bags/sushi-platter.jpg', original_price: 120000, rescue_price: 45000,
    quantity_total: 6, quantity_sold: 2, quantity_remaining: 4,
    pickup_start: '19:00', pickup_end: '21:00', available_date: '2026-06-14',
    status: 'active', created_at: '2026-06-14T08:30:00Z'
  },
  {
    id: 'b7', partner_id: 'p1', partner: mockPartners[0], name: 'Afternoon Tea Set',
    description: 'Paket teh sore dengan aneka snack manis dan gurih.',
    content_hint: 'Perkiraan isi: 2 teh/kopi + 3-4 snack (cake, cookie, sandwich)',
    image_url: '/images/bags/tea-set.jpg', original_price: 110000, rescue_price: 42000,
    quantity_total: 5, quantity_sold: 1, quantity_remaining: 4,
    pickup_start: '15:00', pickup_end: '17:00', available_date: '2026-06-15',
    status: 'active', created_at: '2026-06-14T07:30:00Z'
  },
  {
    id: 'b8', partner_id: 'p3', partner: mockPartners[2], name: 'Lauk Padang Mix',
    description: 'Aneka lauk padang yang bisa dicampur sesuka hati.',
    content_hint: 'Perkiraan isi: 3-4 jenis lauk (dendeng, gulai, sambal hijau)',
    image_url: '/images/bags/lauk-padang.jpg', original_price: 70000, rescue_price: 28000,
    quantity_total: 10, quantity_sold: 4, quantity_remaining: 6,
    pickup_start: '18:30', pickup_end: '20:30', available_date: '2026-06-15',
    status: 'active', created_at: '2026-06-14T09:30:00Z'
  },
];

export const mockOrders: Order[] = [
  {
    id: 'o1', customer_id: 'c1', partner_id: 'p1', partner: mockPartners[0], bag_id: 'b1', bag: mockRescueBags[0],
    quantity: 1, unit_price: 35000, total_price: 35000, pickup_code: 'SB7K2M',
    status: 'confirmed', payment_method: 'Transfer Bank', payment_status: 'paid',
    created_at: '2026-06-14T10:30:00Z'
  },
  {
    id: 'o2', customer_id: 'c1', partner_id: 'p2', partner: mockPartners[1], bag_id: 'b2', bag: mockRescueBags[1],
    quantity: 2, unit_price: 25000, total_price: 50000, pickup_code: 'SB3N8P',
    status: 'completed', payment_method: 'QRIS', payment_status: 'paid',
    completed_at: '2026-06-13T18:45:00Z', created_at: '2026-06-13T14:00:00Z'
  },
  {
    id: 'o3', customer_id: 'c1', partner_id: 'p3', partner: mockPartners[2], bag_id: 'b3', bag: mockRescueBags[2],
    quantity: 1, unit_price: 20000, total_price: 20000, pickup_code: 'SBX4R9',
    status: 'completed', payment_method: 'GoPay', payment_status: 'paid',
    completed_at: '2026-06-12T20:15:00Z', created_at: '2026-06-12T15:00:00Z'
  },
  {
    id: 'o4', customer_id: 'c1', partner_id: 'p4', partner: mockPartners[3], bag_id: 'b4', bag: mockRescueBags[3],
    quantity: 1, unit_price: 30000, total_price: 30000, pickup_code: 'SBW6T2',
    status: 'cancelled', payment_method: 'Transfer Bank', payment_status: 'refunded',
    cancelled_at: '2026-06-11T16:00:00Z', cancel_reason: 'Tidak bisa pickup tepat waktu',
    created_at: '2026-06-11T12:00:00Z'
  },
  {
    id: 'o5', customer_id: 'c2', partner_id: 'p1', partner: mockPartners[0], bag_id: 'b1', bag: mockRescueBags[0],
    quantity: 1, unit_price: 35000, total_price: 35000, pickup_code: 'SBM5J7',
    status: 'confirmed', payment_method: 'Dana', payment_status: 'paid',
    created_at: '2026-06-14T11:00:00Z'
  },
];

export const mockReviews: Review[] = [
  { id: 'r1', order_id: 'o2', customer_id: 'c1', customer: { id: 'c1', full_name: 'Reza Mahasiswa', email: 'reza@email.com', role: 'customer', is_active: true, created_at: '2026-01-01T00:00:00Z' }, partner_id: 'p2', rating: 5, comment: 'Rotinya super enak dan masih fresh banget! Dapat banyak lagi. Worth it banget!', is_flagged: false, created_at: '2026-06-13T19:00:00Z' },
  { id: 'r2', order_id: 'o3', customer_id: 'c1', customer: { id: 'c1', full_name: 'Reza Mahasiswa', email: 'reza@email.com', role: 'customer', is_active: true, created_at: '2026-01-01T00:00:00Z' }, partner_id: 'p3', rating: 4, comment: 'Nasi padangnya enak, porsi cukup besar. Cuma sambalnya agak kurang banyak.', is_flagged: false, created_at: '2026-06-12T21:00:00Z' },
  { id: 'r3', order_id: 'o5', customer_id: 'c2', customer: { id: 'c2', full_name: 'Sarah Pekerja', email: 'sarah@email.com', role: 'customer', is_active: true, created_at: '2026-02-01T00:00:00Z' }, partner_id: 'p1', rating: 5, comment: 'Kopinya masih segar dan pastri-nya crispy. Senang bisa hemat sekaligus selamatkan makanan!', is_flagged: false, created_at: '2026-06-13T20:00:00Z' },
  { id: 'r4', order_id: 'o2', customer_id: 'c3', customer: { id: 'c3', full_name: 'Andi Freelancer', email: 'andi@email.com', role: 'customer', is_active: true, created_at: '2026-03-01T00:00:00Z' }, partner_id: 'p4', rating: 4, comment: 'Saladnya fresh dan porsinya generous. Recommended!', is_flagged: false, created_at: '2026-06-11T18:00:00Z' },
];

export const mockPlatformStats: PlatformStats = {
  bags_rescued: 12450,
  kg_food_saved: 6225,
  co2_avoided_kg: 15562,
  total_transactions: 8920,
  total_revenue: 280000000,
};

export const mockCurrentUser: User = {
  id: 'c1',
  full_name: 'Reza Mahasiswa',
  email: 'reza@email.com',
  phone: '081234567899',
  avatar_url: '/images/avatars/reza.jpg',
  role: 'customer',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z'
};

export const mockMitraUser: User = {
  id: 'u1',
  full_name: 'Dewi Pemilik Kafe',
  email: 'dewi@kopiken.com',
  phone: '081234567890',
  avatar_url: '/images/avatars/dewi.jpg',
  role: 'mitra',
  is_active: true,
  created_at: '2026-01-15T00:00:00Z'
};

export const mockAdminUser: User = {
  id: 'admin1',
  full_name: 'Admin SaveBite',
  email: 'admin@savebite.id',
  role: 'admin',
  is_active: true,
  created_at: '2025-12-01T00:00:00Z'
};
