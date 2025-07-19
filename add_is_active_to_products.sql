-- Add is_active field to products table
ALTER TABLE public.products 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add comment for the new field
COMMENT ON COLUMN public.products.is_active IS 'Status aktif produk (true = aktif, false = non-aktif)'; 