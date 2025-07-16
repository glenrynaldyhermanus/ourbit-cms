-- POS CMS Database Schema for Supabase
-- Run this script in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
    ('Beverages', 'Hot and cold drinks'),
    ('Food', 'Food items and snacks'),
    ('Desserts', 'Sweet treats and desserts'),
    ('Merchandise', 'Store merchandise and gifts');

-- Insert sample products
INSERT INTO products (name, description, price, category, stock_quantity, sku) VALUES
    ('Coffee', 'Fresh brewed coffee', 4.50, 'Beverages', 50, 'BEV001'),
    ('Tea', 'Herbal tea blend', 3.50, 'Beverages', 30, 'BEV002'),
    ('Latte', 'Espresso with steamed milk', 5.25, 'Beverages', 40, 'BEV003'),
    ('Sandwich', 'Turkey and cheese sandwich', 8.99, 'Food', 25, 'FOOD001'),
    ('Salad', 'Fresh garden salad', 7.50, 'Food', 20, 'FOOD002'),
    ('Pastry', 'Fresh baked pastry', 5.99, 'Desserts', 15, 'DESS001'),
    ('Cookie', 'Chocolate chip cookie', 2.99, 'Desserts', 35, 'DESS002'),
    ('Mug', 'Coffee shop branded mug', 12.99, 'Merchandise', 10, 'MERCH001');

-- Insert sample customers
INSERT INTO customers (name, email, phone) VALUES
    ('John Doe', 'john.doe@example.com', '555-0123'),
    ('Jane Smith', 'jane.smith@example.com', '555-0456'),
    ('Bob Johnson', 'bob.johnson@example.com', '555-0789'),
    ('Alice Brown', 'alice.brown@example.com', '555-0321');

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON products FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON orders FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON order_items FOR ALL USING (true);

-- Note: In production, you should create more restrictive policies based on your authentication requirements