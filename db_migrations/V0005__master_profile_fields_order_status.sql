-- Добавляем поля профиля мастера
ALTER TABLE masters ADD COLUMN about TEXT;
ALTER TABLE masters ADD COLUMN avatar_color VARCHAR(20) DEFAULT '#7c3aed';
ALTER TABLE masters ADD COLUMN responses_count INTEGER DEFAULT 0;

-- Обновляем статус заявки заказчиком
-- status: 'new' | 'in_progress' | 'done' | 'cancelled'
ALTER TABLE orders ADD COLUMN closed_at TIMESTAMP;
