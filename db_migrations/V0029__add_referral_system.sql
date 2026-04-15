
ALTER TABLE t_p86314354_project_development_.masters
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(10) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES t_p86314354_project_development_.masters(id),
  ADD COLUMN IF NOT EXISTS referral_bonus_paid BOOLEAN NOT NULL DEFAULT FALSE;
