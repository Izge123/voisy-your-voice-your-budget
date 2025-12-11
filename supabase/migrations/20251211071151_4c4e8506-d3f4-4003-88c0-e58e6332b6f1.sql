-- Create bloggers table for promo code management
CREATE TABLE public.bloggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  promo_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bloggers ENABLE ROW LEVEL SECURITY;

-- RLS policies for admins only
CREATE POLICY "Admins can view all bloggers"
  ON public.bloggers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert bloggers"
  ON public.bloggers FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bloggers"
  ON public.bloggers FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add promo code fields to profiles
ALTER TABLE public.profiles ADD COLUMN promo_code_used TEXT;
ALTER TABLE public.profiles ADD COLUMN referred_by_blogger_id UUID REFERENCES public.bloggers(id) ON DELETE SET NULL;

-- Update handle_new_user function: change trial from 30 days to 7 days
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Create subscription with 7-day trial (changed from 30 days)
  INSERT INTO public.subscriptions (user_id, status, plan, trial_started_at, trial_ends_at)
  VALUES (
    NEW.id,
    'trial',
    'free',
    now(),
    now() + interval '7 days'
  );
  
  -- Create 4 default categories
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Еда', 'expense', '🍔', '#22c55e'),
    (NEW.id, 'Транспорт', 'expense', '🚕', '#3b82f6'),
    (NEW.id, 'Дом', 'expense', '🏠', '#f97316'),
    (NEW.id, 'Зарплата', 'income', '💰', '#10b981');
  
  RETURN NEW;
END;
$$;