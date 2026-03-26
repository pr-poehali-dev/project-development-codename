CREATE TABLE IF NOT EXISTS t_p86314354_project_development_.master_inquiries (
  id SERIAL PRIMARY KEY,
  master_id INTEGER NOT NULL,
  service_id INTEGER,
  contact_name VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);