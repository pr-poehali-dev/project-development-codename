ALTER TABLE t_p86314354_project_development_.chat_messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE t_p86314354_project_development_.chat_messages
ADD COLUMN IF NOT EXISTS read_by_role VARCHAR(10) NULL;