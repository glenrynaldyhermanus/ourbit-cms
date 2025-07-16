-- POS CMS Database Schema for Supabase
-- Run this script in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by UUID NOT NULL, -- References auth.users.id
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Countries table
CREATE TABLE countries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provinces table  
CREATE TABLE provinces (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL REFERENCES countries(id),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities table
CREATE TABLE cities (
    id TEXT PRIMARY KEY,
    province_id TEXT NOT NULL REFERENCES provinces(id),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options table (for dropdowns)
CREATE TABLE options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL, -- business_field, business_age, inventory_valuation_method, currency
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    country_id TEXT REFERENCES countries(id),
    province_id TEXT REFERENCES provinces(id),
    city_id TEXT REFERENCES cities(id),
    name TEXT NOT NULL,
    address TEXT,
    business_field TEXT,
    business_description TEXT,
    stock_setting TEXT,
    currency TEXT,
    default_tax_rate NUMERIC(5,4) DEFAULT 0.0,
    is_branch BOOLEAN DEFAULT false,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role assignments table
CREATE TABLE role_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL, -- References auth.users.id
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    role_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, sku) -- SKU should be unique per store
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

-- Insert sample data for dropdown options
INSERT INTO options (type, key, value) VALUES
    ('business_field', '1001', 'Restoran & Katering'),
    ('business_field', '1002', 'Toko Kelontong'),
    ('business_field', '1003', 'Fashion & Pakaian'),
    ('business_field', '1004', 'Elektronik'),
    ('business_field', '1005', 'Kesehatan & Kecantikan'),
    ('business_field', '9999', 'Lainnya'),
    ('business_age', '1', 'Baru mulai (0-6 bulan)'),
    ('business_age', '2', '6 bulan - 1 tahun'),
    ('business_age', '3', '1-3 tahun'),
    ('business_age', '4', 'Lebih dari 3 tahun'),
    ('inventory_valuation_method', 'fifo', 'FIFO (First In First Out)'),
    ('inventory_valuation_method', 'lifo', 'LIFO (Last In First Out)'),
    ('inventory_valuation_method', 'average', 'Average Cost'),
    ('currency', 'IDR', 'Indonesian Rupiah (IDR)'),
    ('currency', 'USD', 'US Dollar (USD)'),
    ('currency', 'EUR', 'Euro (EUR)');

-- Insert sample countries
INSERT INTO countries (id, name) VALUES
    ('ID', 'Indonesia'),
    ('US', 'United States'),
    ('SG', 'Singapore');

-- Insert sample provinces for Indonesia
INSERT INTO provinces (id, country_id, name) VALUES
    ('ID-JK', 'ID', 'DKI Jakarta'),
    ('ID-JB', 'ID', 'Jawa Barat'),
    ('ID-JT', 'ID', 'Jawa Tengah'),
    ('ID-JI', 'ID', 'Jawa Timur'),
    ('ID-BT', 'ID', 'Banten');

-- Insert sample cities
INSERT INTO cities (id, province_id, name) VALUES
    ('ID-JK-01', 'ID-JK', 'Jakarta Pusat'),
    ('ID-JK-02', 'ID-JK', 'Jakarta Utara'),
    ('ID-JK-03', 'ID-JK', 'Jakarta Selatan'),
    ('ID-JK-04', 'ID-JK', 'Jakarta Timur'),
    ('ID-JK-05', 'ID-JK', 'Jakarta Barat'),
    ('ID-JB-01', 'ID-JB', 'Bandung'),
    ('ID-JB-02', 'ID-JB', 'Bekasi'),
    ('ID-JB-03', 'ID-JB', 'Depok');

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