-- payOS prepaid QR payments: orders table + pro_until expiry on profiles

-- 1. Pro expiry for prepaid (QR) payments. NULL = not prepaid.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pro_until TIMESTAMPTZ;

-- 2. Orders created for payOS payment links
CREATE TABLE payos_orders (
  order_code BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_interval TEXT NOT NULL CHECK (plan_interval IN ('month', 'year')),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled')),
  payment_link_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payos_orders_user_id ON payos_orders(user_id);

ALTER TABLE payos_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payos orders"
  ON payos_orders FOR SELECT
  USING (auth.uid() = user_id);

-- 3. RPC: apply a paid payOS order (idempotent), extend pro_until
CREATE OR REPLACE FUNCTION rpc_apply_payos_payment(p_order_code BIGINT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order payos_orders%ROWTYPE;
  v_base TIMESTAMPTZ;
  v_new_until TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_order FROM payos_orders WHERE order_code = p_order_code FOR UPDATE;

  IF v_order IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Order not found: ' || p_order_code);
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN json_build_object('success', true, 'already_processed', true);
  END IF;

  -- extend from current pro_until if still in the future, else from now
  SELECT GREATEST(COALESCE(pro_until, now()), now()) INTO v_base
  FROM profiles WHERE id = v_order.user_id;

  IF v_order.plan_interval = 'year' THEN
    v_new_until := v_base + INTERVAL '365 days';
  ELSE
    v_new_until := v_base + INTERVAL '30 days';
  END IF;

  UPDATE profiles SET pro_until = v_new_until WHERE id = v_order.user_id;
  UPDATE payos_orders SET status = 'paid', paid_at = now() WHERE order_code = p_order_code;

  RETURN json_build_object('success', true, 'user_id', v_order.user_id, 'pro_until', v_new_until);
END;
$$;
