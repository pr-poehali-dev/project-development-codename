-- Добавляем email в таблицы masters и customers
ALTER TABLE masters ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Таблица для кодов авторизации
CREATE TABLE IF NOT EXISTS auth_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT FALSE
);

-- Платная публикация услуг
ALTER TABLE master_services ADD COLUMN IF NOT EXISTS paid_until TIMESTAMP;
ALTER TABLE master_services ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMP;
ALTER TABLE master_services ADD COLUMN IF NOT EXISTS boost_count INTEGER DEFAULT 0;
ALTER TABLE master_services ADD COLUMN IF NOT EXISTS sort_order BIGINT DEFAULT 0;