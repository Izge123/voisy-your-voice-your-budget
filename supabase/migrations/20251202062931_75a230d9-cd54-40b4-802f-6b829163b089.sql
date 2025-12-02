-- Add parent_id to categories table for nested categories support
ALTER TABLE public.categories 
ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Add index for better query performance on parent_id
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Add index for user_id + parent_id combination for faster filtering
CREATE INDEX idx_categories_user_parent ON public.categories(user_id, parent_id);