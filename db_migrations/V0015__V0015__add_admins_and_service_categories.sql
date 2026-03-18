-- Создание таблицы администраторов
CREATE TABLE IF NOT EXISTS t_p86314354_project_development_.admins (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы категорий услуг
CREATE TABLE IF NOT EXISTS t_p86314354_project_development_.service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
