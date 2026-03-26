CREATE TABLE IF NOT EXISTS t_p86314354_project_development_.chat_messages (
  id SERIAL PRIMARY KEY,
  inquiry_id INTEGER NOT NULL,
  sender_role VARCHAR(10) NOT NULL CHECK (sender_role IN ('customer', 'master')),
  sender_name VARCHAR(150) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_inquiry_id ON t_p86314354_project_development_.chat_messages(inquiry_id);