CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  amount INTEGER NOT NULL,
  donor_name VARCHAR(150),
  donor_email VARCHAR(255),
  message TEXT,
  yookassa_payment_id VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  succeeded_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_yk_id ON donations(yookassa_payment_id);