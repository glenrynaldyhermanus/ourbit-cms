-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (read) - users can read products from their store
CREATE POLICY "Users can view products from their store" ON public.products
    FOR SELECT USING (
        store_id IN (
            SELECT store_id FROM public.role_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for INSERT - users can insert products to their store
CREATE POLICY "Users can insert products to their store" ON public.products
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT store_id FROM public.role_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for UPDATE - users can update products from their store
CREATE POLICY "Users can update products from their store" ON public.products
    FOR UPDATE USING (
        store_id IN (
            SELECT store_id FROM public.role_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for DELETE - users can delete products from their store
CREATE POLICY "Users can delete products from their store" ON public.products
    FOR DELETE USING (
        store_id IN (
            SELECT store_id FROM public.role_assignments 
            WHERE user_id = auth.uid()
        )
    ); 