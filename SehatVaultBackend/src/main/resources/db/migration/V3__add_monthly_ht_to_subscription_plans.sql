-- Add explicit monthly HT allocation field to subscription plans
-- Allows hospital admins to specify monthly HT tokens per plan.
-- Required for new plans; existing rows default to 0 for compatibility.
ALTER TABLE subscription_plans
    ADD COLUMN IF NOT EXISTS monthly_ht INTEGER NOT NULL DEFAULT 0;

-- Create index for queries filtering by explicit HT allocation
CREATE INDEX IF NOT EXISTS idx_subscription_plans_monthly_ht ON subscription_plans(monthly_ht);
