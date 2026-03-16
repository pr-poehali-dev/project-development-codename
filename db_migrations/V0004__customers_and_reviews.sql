-- Заказчики (регистрация по телефону)
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Привязываем orders к customer
ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES customers(id);

-- Отзывы заказчиков о мастерах
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  master_id INTEGER REFERENCES masters(id),
  master_name VARCHAR(150) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(order_id, customer_id)
);
