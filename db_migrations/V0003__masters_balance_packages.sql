
-- Мастера
CREATE TABLE masters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(100),
  city VARCHAR(100),
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Пакеты откликов
CREATE TABLE response_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  responses_count INTEGER NOT NULL,
  price INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO response_packages (name, responses_count, price) VALUES
  ('Старт', 5, 199),
  ('Стандарт', 15, 499),
  ('Профи', 30, 799);

-- Транзакции баланса мастера
CREATE TABLE master_transactions (
  id SERIAL PRIMARY KEY,
  master_id INTEGER NOT NULL REFERENCES masters(id),
  type VARCHAR(50) NOT NULL, -- 'purchase' | 'spend'
  amount INTEGER NOT NULL,
  description TEXT,
  order_id INTEGER REFERENCES responses(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Платежи (для ЮKassa в будущем)
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  master_id INTEGER NOT NULL REFERENCES masters(id),
  package_id INTEGER NOT NULL REFERENCES response_packages(id),
  amount INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'succeeded' | 'canceled'
  provider_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

-- Добавляем master_id в responses
ALTER TABLE responses ADD COLUMN master_id INTEGER REFERENCES masters(id);
