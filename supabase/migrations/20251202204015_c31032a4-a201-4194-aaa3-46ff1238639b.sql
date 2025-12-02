-- Сначала исправляем существующие некорректные данные (где parent_id = id)
UPDATE categories SET parent_id = NULL WHERE parent_id = id;

-- Теперь добавляем защиту от циклических ссылок
ALTER TABLE categories 
ADD CONSTRAINT categories_no_self_reference 
CHECK (parent_id IS NULL OR parent_id != id);