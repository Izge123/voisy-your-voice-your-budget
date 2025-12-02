-- Add type column to transactions table to store income/expense type
ALTER TABLE public.transactions
ADD COLUMN type text CHECK (type IN ('income', 'expense'));

-- Set default type based on existing category types
UPDATE public.transactions t
SET type = c.type
FROM public.categories c
WHERE t.category_id = c.id AND t.type IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.transactions.type IS 'Transaction type: income or expense. Takes precedence over category type for balance calculations.';