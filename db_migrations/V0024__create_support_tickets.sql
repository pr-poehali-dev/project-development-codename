CREATE TABLE IF NOT EXISTS t_p86314354_project_development_.support_tickets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(255),
  subject VARCHAR(50) NOT NULL DEFAULT 'other',
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  admin_reply TEXT,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON t_p86314354_project_development_.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON t_p86314354_project_development_.support_tickets(created_at DESC);
