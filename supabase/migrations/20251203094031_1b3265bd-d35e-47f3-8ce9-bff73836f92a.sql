-- Drop the existing constraint and add updated one with 'savings'
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type = ANY (ARRAY['income'::text, 'expense'::text, 'savings'::text]));