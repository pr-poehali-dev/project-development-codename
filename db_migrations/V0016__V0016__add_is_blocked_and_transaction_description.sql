-- Добавление поля is_blocked для мастеров и заказчиков
ALTER TABLE t_p86314354_project_development_.masters 
    ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

ALTER TABLE t_p86314354_project_development_.customers 
    ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Добавление поля для транзакций (description если нет)
ALTER TABLE t_p86314354_project_development_.master_transactions 
    ADD COLUMN IF NOT EXISTS description TEXT;
