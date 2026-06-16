// User & Auth types
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'mitra' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Partner {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  logo_url?: string;
  banner_url?: string;
  category_id?: string;
  category?: Category;
  operational_hours?: Record<string, { open: string; close: string }>;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  rejection_reason?: string;
  avg_rating: number;
  total_reviews: number;
  wallet_balance?: number;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  platform_fee_percent: number;
  customer_handling_fee: number;
  min_withdrawal_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  partner_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  processed_at?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface RescueBag {
  id: string;
  partner_id: string;
  partner?: Partner;
  name: string;
  description?: string;
  content_hint?: string;
  image_url?: string;
  original_price: number;
  rescue_price: number;
  quantity_total: number;
  quantity_sold: number;
  quantity_remaining: number;
  pickup_start: string;
  pickup_end: string;
  available_date: string;
  status: 'active' | 'sold_out' | 'cancelled' | 'expired';
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  partner_id: string;
  partner?: Partner;
  bag_id: string;
  bag?: RescueBag;
  quantity: number;
  unit_price: number;
  total_price: number;
  pickup_code: string;
  qr_code_url?: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  platform_fee?: number;
  handling_fee?: number;
  notes?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  customer?: User;
  partner_id: string;
  rating: number;
  comment?: string;
  partner_reply?: string;
  is_flagged: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'system' | 'review';
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface PlatformStats {
  bags_rescued: number;
  kg_food_saved: number;
  co2_avoided_kg: number;
  total_transactions: number;
  total_revenue: number;
}

export interface CartItem {
  bag: RescueBag;
  quantity: number;
}
