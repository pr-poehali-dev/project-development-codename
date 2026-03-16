CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  budget INTEGER,
  contact_name VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  contact_email VARCHAR(150),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  master_name VARCHAR(150) NOT NULL,
  master_phone VARCHAR(50) NOT NULL,
  master_category VARCHAR(100),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
