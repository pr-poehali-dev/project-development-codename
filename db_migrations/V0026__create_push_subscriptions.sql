CREATE TABLE IF NOT EXISTS t_p86314354_project_development_.push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_phone VARCHAR(20) NOT NULL,
    user_role VARCHAR(10) NOT NULL CHECK (user_role IN ('customer', 'master')),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(endpoint)
);