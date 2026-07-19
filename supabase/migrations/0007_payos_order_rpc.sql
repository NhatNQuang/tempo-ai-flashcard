-- RPC to create a payOS order from the server (security definer, bypasses RLS)
CREATE OR REPLACE FUNCTION rpc_create_payos_order(
  p_order_code BIGINT,
  p_user_id UUID,
  p_interval TEXT,
  p_amount INTEGER,
  p_payment_link_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO payos_orders (order_code, user_id, plan_interval, amount, payment_link_id)
  VALUES (p_order_code, p_user_id, p_interval, p_amount, p_payment_link_id);
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
