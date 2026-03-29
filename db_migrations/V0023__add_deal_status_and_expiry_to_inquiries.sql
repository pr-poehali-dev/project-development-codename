ALTER TABLE t_p86314354_project_development_.master_inquiries
  ADD COLUMN IF NOT EXISTS deal_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS master_deal_confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS customer_deal_confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deal_completed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '3 days');

UPDATE t_p86314354_project_development_.master_inquiries SET expires_at = created_at + INTERVAL '3 days' WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_master_inquiries_expires_at ON t_p86314354_project_development_.master_inquiries(expires_at);
