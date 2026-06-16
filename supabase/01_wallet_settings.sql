-- ============================================
-- PLATFORM SETTINGS
-- ============================================

CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_fee_percent INTEGER NOT NULL DEFAULT 5,
  customer_handling_fee INTEGER NOT NULL DEFAULT 2000,
  min_withdrawal_amount INTEGER NOT NULL DEFAULT 50000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert 1 default row
INSERT INTO platform_settings (platform_fee_percent, customer_handling_fee, min_withdrawal_amount) 
VALUES (5, 2000, 50000);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform settings viewable by everyone." ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Only admin can update settings." ON platform_settings FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ============================================
-- WALLET BALANCE TO PARTNERS
-- ============================================

ALTER TABLE partners ADD COLUMN wallet_balance INTEGER NOT NULL DEFAULT 0;

-- ============================================
-- WITHDRAWALS
-- ============================================

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mitra can view own withdrawals." ON withdrawals FOR SELECT USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));
CREATE POLICY "Mitra can request withdrawal." ON withdrawals FOR INSERT WITH CHECK (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));
CREATE POLICY "Admin can view all withdrawals." ON withdrawals FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admin can update withdrawals." ON withdrawals FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
