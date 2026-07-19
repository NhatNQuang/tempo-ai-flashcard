-- Polar gửi các status chưa có trong enum ban đầu (trialing khi có trial period, ...)
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'trialing';
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'unpaid';
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'incomplete_expired';
