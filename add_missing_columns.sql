-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller_rank integer;
