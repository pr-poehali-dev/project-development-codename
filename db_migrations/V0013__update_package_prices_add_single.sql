-- Обновляем цены пакетов
UPDATE t_p86314354_project_development_.response_packages SET price = 549 WHERE id = 2;
UPDATE t_p86314354_project_development_.response_packages SET price = 899 WHERE id = 3;

-- Добавляем поштучный пакет (1 токен = 49 руб)
INSERT INTO t_p86314354_project_development_.response_packages (name, responses_count, price, is_active)
VALUES ('Поштучно', 1, 49, true);
