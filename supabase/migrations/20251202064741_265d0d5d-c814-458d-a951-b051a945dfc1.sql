-- Add is_system column to protect default categories
ALTER TABLE public.categories 
ADD COLUMN is_system BOOLEAN DEFAULT false;

-- Recreate RLS policy for viewing categories
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories" ON categories 
FOR SELECT USING (auth.uid() = user_id);