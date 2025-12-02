-- Add new columns for AI profile
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_amount NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS financial_literacy_level TEXT;

-- Remove monthly_income column (no longer needed - AI will calculate from transactions)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS monthly_income;