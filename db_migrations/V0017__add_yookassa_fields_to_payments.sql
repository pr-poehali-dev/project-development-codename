ALTER TABLE t_p86314354_project_development_.payments
  ADD COLUMN IF NOT EXISTS yookassa_payment_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS return_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS tokens_count INTEGER NULL;
