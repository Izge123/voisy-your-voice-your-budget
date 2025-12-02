-- Add new columns to profiles table for AI profile functionality
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS financial_goal TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_income NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS planning_horizon TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS life_tags TEXT[];