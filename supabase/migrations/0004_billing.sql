-- Billing / subscription support for Polar integration

-- 1. Subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'active',
  'canceled',
  'past_due',
  'revoked',
  'incomplete'
);

-- 2. Add plan column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

-- 3. Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  polar_customer_id TEXT,
  polar_subscription_id TEXT UNIQUE NOT NULL,
  polar_product_id TEXT NOT NULL,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 4. RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 5. RPC for webhook handler (security definer — no user JWT needed)
CREATE OR REPLACE FUNCTION rpc_upsert_subscription(
  p_email TEXT,
  p_polar_customer_id TEXT,
  p_polar_subscription_id TEXT,
  p_polar_product_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN,
  p_plan TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  SELECT id INTO v_user_id FROM profiles WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found for email: ' || p_email);
  END IF;

  INSERT INTO subscriptions (
    user_id, polar_customer_id, polar_subscription_id,
    polar_product_id, status,
    current_period_start, current_period_end,
    cancel_at_period_end, updated_at
  ) VALUES (
    v_user_id, p_polar_customer_id, p_polar_subscription_id,
    p_polar_product_id, p_status::subscription_status,
    p_current_period_start, p_current_period_end,
    p_cancel_at_period_end, now()
  )
  ON CONFLICT (polar_subscription_id) DO UPDATE SET
    polar_customer_id = EXCLUDED.polar_customer_id,
    polar_product_id = EXCLUDED.polar_product_id,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    updated_at = now();

  UPDATE profiles SET plan = p_plan WHERE id = v_user_id;

  RETURN json_build_object('success', true, 'user_id', v_user_id);
END;
$$;
