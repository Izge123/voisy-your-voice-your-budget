-- Удаляем старый constraint
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;

-- Добавляем новый constraint с поддержкой 'savings'
ALTER TABLE categories ADD CONSTRAINT categories_type_check 
  CHECK (type = ANY (ARRAY['expense'::text, 'income'::text, 'savings'::text]));