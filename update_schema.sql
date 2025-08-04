-- Скрипт для обновления существующей схемы базы данных
-- Выполните этот скрипт, если у вас уже есть база данных с данными

-- Удаляем поле email из таблицы users (если оно существует)
ALTER TABLE users DROP COLUMN IF EXISTS email;

-- Проверяем, что все необходимые таблицы существуют
-- Если таблицы не существуют, создайте их с помощью blog_schema.sql

-- Проверяем структуру таблицы users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 