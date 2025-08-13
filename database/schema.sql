-- ========================================
-- SCHEMA DATABASE OURBIT POS (Refreshed via Supabase MCP)
-- ========================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Optional extensions present in project
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";

-- ========================================
-- TABEL MASTER
-- ========================================

-- business_online_settings
CREATE TABLE IF NOT EXISTS public.business_online_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    business_id UUID NOT NULL,
    subdomain VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    description TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    stock_tracking INTEGER NOT NULL,
    default_online_store_id UUID NULL,
    display_name TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    theme_json JSONB,
    socials_json JSONB,
    CONSTRAINT business_online_settings_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT business_online_settings_default_online_store_id_fkey FOREIGN KEY (default_online_store_id) REFERENCES public.stores(id),
    CONSTRAINT business_online_settings_subdomain_unique UNIQUE (subdomain)
);

-- businesses
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    CONSTRAINT businesses_code_key UNIQUE (code)
);

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    business_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT categories_business_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- cities
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    name VARCHAR(100) NOT NULL,
    province_id UUID NOT NULL,
    CONSTRAINT cities_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id) ON DELETE CASCADE
);

-- countries
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    name VARCHAR(100) NOT NULL
);

-- inventory_transactions
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    product_id UUID NOT NULL,
    store_id UUID NOT NULL,
    type INTEGER NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    reference VARCHAR(100),
    note TEXT,
    previous_qty NUMERIC,
    new_qty NUMERIC,
    batch_number VARCHAR,
    expiry_date DATE,
    unit_cost NUMERIC,
    total_cost NUMERIC,
    CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT inventory_transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- options
CREATE TABLE IF NOT EXISTS public.options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    category_id UUID,
    store_id UUID NOT NULL,
    type TEXT NOT NULL,
    auto_sku BOOLEAN NOT NULL DEFAULT true,
    code VARCHAR(50),
    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(20),
    weight_grams INTEGER NOT NULL DEFAULT 0,
    discount_type INTEGER NOT NULL DEFAULT 1,
    discount_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    description TEXT,
    rack_location VARCHAR(100),
    image_url TEXT,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    availability_status TEXT NOT NULL DEFAULT 'available',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT products_availability_status_check CHECK (availability_status IN ('available','out_of_stock','preorder')),
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT products_code_key UNIQUE (code)
);

-- provinces
CREATE TABLE IF NOT EXISTS public.provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    name VARCHAR NOT NULL,
    country_id UUID NOT NULL,
    CONSTRAINT provinces_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- role_assignments
CREATE TABLE IF NOT EXISTS public.role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    user_id UUID NOT NULL,
    business_id UUID NOT NULL,
    role_id UUID NOT NULL,
    store_id UUID NOT NULL,
    CONSTRAINT users_businesses_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT users_businesses_roles_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT users_businesses_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT role_assignments_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    name VARCHAR(50) NOT NULL
);

-- stock_opname_items
CREATE TABLE IF NOT EXISTS public.stock_opname_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    session_id UUID NOT NULL,
    product_id UUID NOT NULL,
    expected_qty NUMERIC(12,2) NOT NULL,
    actual_qty NUMERIC(12,2) NOT NULL,
    qty_variance NUMERIC(12,2),
    note TEXT,
    CONSTRAINT stock_opname_items_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.stock_opname_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT stock_opname_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- stock_opname_sessions
CREATE TABLE IF NOT EXISTS public.stock_opname_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    finished_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT '1',
    total_items INTEGER DEFAULT 0,
    items_counted INTEGER DEFAULT 0,
    total_variance_value NUMERIC DEFAULT 0,
    notes TEXT,
    CONSTRAINT stock_opname_sessions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- stores
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    business_id UUID NOT NULL,
    country_id UUID NOT NULL,
    province_id UUID NOT NULL,
    city_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    phone_country_code VARCHAR(10) NOT NULL DEFAULT '+62',
    phone_number VARCHAR(20) NOT NULL,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    business_field TEXT NOT NULL,
    business_description TEXT,
    stock_setting TEXT NOT NULL,
    currency TEXT NOT NULL,
    default_tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    motto TEXT,
    is_branch BOOLEAN NOT NULL DEFAULT true,
    is_online_delivery_active BOOLEAN DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT stores_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT stores_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT stores_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT stores_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    business_id UUID NOT NULL,
    country_id UUID NOT NULL,
    province_id UUID NOT NULL,
    city_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    phone_country_code VARCHAR NOT NULL DEFAULT '+62',
    phone_number VARCHAR NOT NULL,
    warehouse_type VARCHAR NOT NULL DEFAULT 'distribution',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_online_delivery_active BOOLEAN DEFAULT false,
    notes TEXT,
    CONSTRAINT warehouses_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
    CONSTRAINT warehouses_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id),
    CONSTRAINT warehouses_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id),
    CONSTRAINT warehouses_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);

-- users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- store_carts
CREATE TABLE IF NOT EXISTS public.store_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT store_carts_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT store_carts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    business_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    code VARCHAR,
    contact_person VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    address TEXT,
    city_id UUID,
    province_id UUID,
    country_id UUID,
    tax_number VARCHAR,
    bank_name VARCHAR,
    bank_account_number VARCHAR,
    bank_account_name VARCHAR,
    credit_limit NUMERIC DEFAULT 0,
    payment_terms INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    CONSTRAINT suppliers_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
    CONSTRAINT suppliers_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id),
    CONSTRAINT suppliers_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id),
    CONSTRAINT suppliers_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id)
);

-- customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    business_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    code VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    address TEXT,
    city_id UUID,
    province_id UUID,
    country_id UUID,
    tax_number VARCHAR,
    customer_type VARCHAR DEFAULT 'retail',
    credit_limit NUMERIC DEFAULT 0,
    payment_terms INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    auth_user_id UUID,
    customer_source VARCHAR DEFAULT 'offline',
    is_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    CONSTRAINT customers_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
    CONSTRAINT customers_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id),
    CONSTRAINT customers_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id),
    CONSTRAINT customers_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id),
    CONSTRAINT customers_email_unique UNIQUE (email),
    CONSTRAINT customers_phone_unique UNIQUE (phone),
    CONSTRAINT customers_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);

-- zmaster (placeholder table)
CREATE TABLE IF NOT EXISTS public.zmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- payment_types
CREATE TABLE IF NOT EXISTS public.payment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    code TEXT NOT NULL,
    name TEXT NOT NULL
);

-- payment_methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    payment_type_id UUID NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    CONSTRAINT payment_methods_payment_type_id_fkey FOREIGN KEY (payment_type_id) REFERENCES public.payment_types(id)
);

-- store_payment_methods
CREATE TABLE IF NOT EXISTS public.store_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    payment_method_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT store_payment_methods_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT store_payment_methods_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id)
);

-- ========================================
-- TABEL UNTUK LAPORAN
-- ========================================

-- sales
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID,
    warehouse_id UUID,
    customer_id UUID,
    customer_name VARCHAR,
    customer_phone VARCHAR,
    customer_email VARCHAR,
    sale_number VARCHAR NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method_id UUID,
    status VARCHAR NOT NULL DEFAULT 'completed',
    notes TEXT,
    cashier_id UUID,
    sale_source VARCHAR DEFAULT 'offline',
    delivery_address TEXT,
    delivery_fee NUMERIC DEFAULT 0,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    tracking_number VARCHAR,
    courier_name VARCHAR,
    currency TEXT DEFAULT 'IDR',
    expires_at TIMESTAMP WITH TIME ZONE,
    promo_code TEXT,
    fee_amount NUMERIC NOT NULL DEFAULT 0,
    CONSTRAINT sales_sale_number_unique UNIQUE (sale_number),
    CONSTRAINT sales_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT sales_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id),
    CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
    CONSTRAINT sales_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id),
    CONSTRAINT sales_cashier_id_fkey FOREIGN KEY (cashier_id) REFERENCES public.users(id),
    CONSTRAINT sales_status_check_full CHECK (status IN ('pending','paid','processing','fulfilled','cancelled','refunded','completed'))
);

-- sales_items
CREATE TABLE IF NOT EXISTS public.sales_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    sale_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    variant_id UUID,
    name_snapshot TEXT,
    variant_snapshot TEXT,
    weight_grams_snapshot INTEGER DEFAULT 0,
    CONSTRAINT sales_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id),
    CONSTRAINT sales_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
    CONSTRAINT sales_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);

-- purchases
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    purchase_number VARCHAR NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    due_date TIMESTAMP WITH TIME ZONE,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method_id UUID,
    payment_terms INTEGER DEFAULT 0,
    status VARCHAR NOT NULL DEFAULT 'pending',
    received_by UUID,
    received_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    CONSTRAINT purchases_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
    CONSTRAINT purchases_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id),
    CONSTRAINT purchases_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.users(id)
);

-- purchases_items
CREATE TABLE IF NOT EXISTS public.purchases_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    purchase_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    received_qty NUMERIC DEFAULT 0,
    CONSTRAINT purchases_items_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id),
    CONSTRAINT purchases_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- financial_transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    transaction_type VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    subcategory VARCHAR,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method_id UUID,
    account VARCHAR,
    reference_number VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'completed',
    notes TEXT,
    CONSTRAINT financial_transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT financial_transactions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id)
);

-- receivables
CREATE TABLE IF NOT EXISTS public.receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    sale_id UUID,
    reference_number VARCHAR NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    original_amount NUMERIC NOT NULL,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    remaining_amount NUMERIC,
    status VARCHAR NOT NULL DEFAULT 'pending',
    notes TEXT,
    CONSTRAINT receivables_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT receivables_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
    CONSTRAINT receivables_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id)
);

-- payables
CREATE TABLE IF NOT EXISTS public.payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    purchase_id UUID,
    reference_number VARCHAR NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    original_amount NUMERIC NOT NULL,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    remaining_amount NUMERIC,
    status VARCHAR NOT NULL DEFAULT 'pending',
    notes TEXT,
    CONSTRAINT payables_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT payables_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
    CONSTRAINT payables_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id)
);

-- profit_loss_items
CREATE TABLE IF NOT EXISTS public.profit_loss_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    category VARCHAR NOT NULL,
    subcategory VARCHAR NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    percentage_of_revenue NUMERIC,
    notes TEXT,
    CONSTRAINT profit_loss_items_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- ========================================
-- TABEL TAMBAHAN UNTUK MANAGEMENT SYSTEM
-- ========================================

-- discounts
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    business_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    code VARCHAR,
    type VARCHAR NOT NULL DEFAULT 'percentage',
    value NUMERIC NOT NULL DEFAULT 0,
    min_purchase_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    description TEXT,
    notes TEXT,
    CONSTRAINT discounts_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
    CONSTRAINT discounts_code_key UNIQUE (code)
);

-- expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    category VARCHAR NOT NULL,
    subcategory VARCHAR,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method_id UUID,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_by UUID,
    receipt_url TEXT,
    notes TEXT,
    CONSTRAINT expenses_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT expenses_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id),
    CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.users(id)
);

-- loyalty_programs
CREATE TABLE IF NOT EXISTS public.loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    business_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    code VARCHAR,
    min_points INTEGER NOT NULL DEFAULT 0,
    discount_percentage NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    terms_conditions TEXT,
    CONSTRAINT loyalty_programs_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
    CONSTRAINT loyalty_programs_code_key UNIQUE (code)
);

-- customer_loyalty_memberships
CREATE TABLE IF NOT EXISTS public.customer_loyalty_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    customer_id UUID NOT NULL,
    loyalty_program_id UUID NOT NULL,
    current_points INTEGER NOT NULL DEFAULT 0,
    total_points_earned INTEGER NOT NULL DEFAULT 0,
    total_points_redeemed INTEGER NOT NULL DEFAULT 0,
    joined_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT customer_loyalty_memberships_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
    CONSTRAINT customer_loyalty_memberships_loyalty_program_id_fkey FOREIGN KEY (loyalty_program_id) REFERENCES public.loyalty_programs(id)
);

-- product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    product_id UUID NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    price_override NUMERIC,
    stock INTEGER,
    weight_grams INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- product_images
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    product_id UUID NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- carts (server-side)
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    session_id TEXT NOT NULL,
    user_id UUID,
    CONSTRAINT carts_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variant_id UUID,
    qty INTEGER NOT NULL DEFAULT 1,
    price_snapshot NUMERIC NOT NULL DEFAULT 0,
    name_snapshot TEXT,
    variant_snapshot TEXT,
    weight_grams_snapshot INTEGER DEFAULT 0,
    CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE,
    CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
    CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id),
    CONSTRAINT cart_items_qty_check CHECK (qty > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_cart_items_cart_product_variant
  ON public.cart_items(
    cart_id,
    product_id,
    COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- shipping_rates
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    region TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT shipping_rates_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- store_platform_settings
CREATE TABLE IF NOT EXISTS public.store_platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    store_id UUID NOT NULL UNIQUE,
    fee_type TEXT NOT NULL DEFAULT 'percent',
    fee_value NUMERIC NOT NULL DEFAULT 0,
    tax_rate NUMERIC NOT NULL DEFAULT 0,
    CONSTRAINT store_platform_settings_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT store_platform_fee_type_check CHECK (fee_type IN ('percent','amount'))
);

-- payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    sale_id UUID NOT NULL,
    provider TEXT NOT NULL,
    provider_ref TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL,
    raw_json JSONB,
    CONSTRAINT payments_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id),
    CONSTRAINT payments_status_check CHECK (status IN ('pending','settlement','expire','deny','cancel')),
    CONSTRAINT payments_provider_ref_unique UNIQUE (provider_ref)
);

-- webhook_events
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL,
    raw_json JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'received',
    CONSTRAINT webhook_events_event_unique UNIQUE (provider, event_id)
);

-- analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    store_id UUID NOT NULL,
    session_id TEXT,
    type TEXT NOT NULL,
    meta_json JSONB,
    CONSTRAINT analytics_events_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT analytics_type_check CHECK (type IN ('page_view','link_click','add_to_cart','checkout_start','purchase'))
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    store_id UUID NOT NULL,
    sale_id UUID,
    channel TEXT NOT NULL CHECK (channel IN ('email','whatsapp')),
    template TEXT NOT NULL,
    recipient TEXT NOT NULL,
    payload_json JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
    error TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT notifications_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT notifications_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id)
);

-- shipping_integrations
CREATE TABLE IF NOT EXISTS public.shipping_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    store_id UUID NOT NULL,
    provider TEXT NOT NULL,
    api_key_masked TEXT,
    active BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT shipping_integrations_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- order_shipments
CREATE TABLE IF NOT EXISTS public.order_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    sale_id UUID NOT NULL,
    provider TEXT,
    service TEXT,
    cost NUMERIC,
    etd TEXT,
    tracking_number TEXT,
    status TEXT,
    raw_json JSONB,
    CONSTRAINT order_shipments_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id)
);

-- ========================================
-- INDEXES UNTUK PERFORMANCE (idempotent)
-- ========================================

CREATE INDEX IF NOT EXISTS idx_discounts_business_id ON public.discounts(business_id);
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON public.discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_end_date ON public.discounts(end_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_subdomain ON public.business_online_settings(subdomain);

CREATE INDEX IF NOT EXISTS idx_expenses_store_id ON public.expenses(store_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_is_paid ON public.expenses(is_paid);

CREATE INDEX IF NOT EXISTS idx_loyalty_programs_business_id ON public.loyalty_programs(business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_is_active ON public.loyalty_programs(is_active);

CREATE INDEX IF NOT EXISTS idx_customer_loyalty_memberships_customer_id ON public.customer_loyalty_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_memberships_loyalty_program_id ON public.customer_loyalty_memberships(loyalty_program_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_memberships_is_active ON public.customer_loyalty_memberships(is_active);

CREATE INDEX IF NOT EXISTS idx_products_store_active ON public.products(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(availability_status);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE (is_active = true);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON public.products(store_id) WHERE (stock <= min_stock);
CREATE INDEX IF NOT EXISTS idx_products_store_category ON public.products(store_id, category_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_carts_store_session ON public.carts(store_id, session_id);

CREATE INDEX IF NOT EXISTS idx_shipping_rates_store_active ON public.shipping_rates(store_id, is_active);

CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON public.payments(sale_id);

CREATE INDEX IF NOT EXISTS idx_analytics_store_type ON public.analytics_events(store_id, type);
CREATE INDEX IF NOT EXISTS idx_analytics_store_session_created_at ON public.analytics_events(store_id, session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_store_status ON public.notifications(store_id, status);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON public.inventory_transactions(type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_store ON public.inventory_transactions(product_id, store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON public.inventory_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_status_date ON public.sales(status, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_items_sale ON public.sales_items(sale_id);

CREATE INDEX IF NOT EXISTS idx_categories_business ON public.categories(business_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS) ENABLE (from live)
-- ========================================

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_online_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_loss_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_opname_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_opname_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zmaster ENABLE ROW LEVEL SECURITY;

-- ========================================
-- DATA TABEL OPTIONS (dumped via MCP)
-- ========================================

BEGIN;
INSERT INTO public.options (
    id, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by,
    type, name, key, value
) VALUES
    ('e54055f4-e5f8-4a65-96ae-708759bc1ce9','2025-05-21 08:36:02.923815+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_age','Business Age','1','Kurang dari 1 tahun'),
    ('cefc4aa9-0d31-4f44-b557-869032d6a8d5','2025-05-21 08:36:02.923815+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_age','Business Age','2','1 – 3 tahun'),
    ('c084b3e6-c35a-4a48-956c-48496c6a7cd3','2025-05-21 08:36:02.923815+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_age','Business Age','3','3 – 5 tahun'),
    ('d1d29536-138e-41a6-9590-f24847a52931','2025-05-21 08:36:02.923815+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_age','Business Age','4','5 – 10 tahun'),
    ('39b3998f-ec74-498f-8955-fea4ae03049f','2025-05-21 08:36:02.923815+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_age','Business Age','5','Lebih dari 10 tahun'),
    ('637dff40-85db-4004-8c16-c971095e7f6e','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','1','Kelontong / Grocery'),
    ('78cbac4d-7955-40fe-9c96-8ef248c15f66','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','10','Buku & Alat Tulis'),
    ('559bb01d-35db-4a3b-9137-2df3be5cf178','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','11','Souvenir & Gift'),
    ('6a7af10c-d35c-44d1-8c15-173c44f89158','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','12','Olahraga & Outdoor'),
    ('26339113-453d-4195-b8c7-c5446d042e1d','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','13','Jasa (laundry, cleaning...)'),
    ('b71511bd-2f56-4bdf-a4f8-f1b62b7fe653','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','14','Optik'),
    ('76a6d54f-6ea7-48d7-abe5-9c055caa6613','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','2','Elektronik'),
    ('e4d86e82-39d9-4039-9440-37a37d24f8b3','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','3','Fashion / Pakaian & Aksesoris'),
    ('9d4c8a99-601e-4384-949e-bc6ad8352b9f','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','4','Makanan & Minuman'),
    ('788b88c7-66ab-451c-a64d-d5eeeaf56d0f','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','5','Kecantikan & Perawatan'),
    ('800254f8-d0ea-4ca2-88c8-5f53e2b78f31','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','6','Pet Shop'),
    ('e85ca74e-ef15-48a2-99da-4d099ffbd92f','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','7','Kesehatan & Farmasi'),
    ('b17320d9-9f6e-407d-8438-3563b5dd9443','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','8','Otomotif & Bengkel'),
    ('8ab1b239-7b6d-43c1-b047-924408e52e0d','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','9','Perlengkapan Rumah Tangga'),
    ('aa2a1b16-5dfe-4d9c-aff4-12cdc55a5049','2025-05-21 07:49:23.889324+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'business_field','Business Field','9999','Lain-lain'),
    ('712cd03d-fad1-45e5-8ecd-ddd36572ed83','2025-05-21 08:41:06.315063+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'currency','Kurs Mata Uang','1','Indonesian Rupiah (Rp)'),
    ('ea7e80bd-e00c-4c2d-884d-9f1c91fe2316','2025-05-21 08:41:06.315063+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'currency','Kurs Mata Uang','2','US Dollar ($)'),
    ('7dd098c8-1530-43fe-84a6-30e181a4f302','2025-05-21 08:41:06.315063+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'currency','Kurs Mata Uang','3','Euro (€)'),
    ('be777f4a-99c2-4297-9682-7213b530ddc2','2025-05-21 08:41:06.315063+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'currency','Kurs Mata Uang','4','Singapore Dollar (S$)'),
    ('dfa19504-fff1-4bcc-b7a4-707b594e9f6f','2025-05-21 08:41:06.315063+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'currency','Kurs Mata Uang','5','Malaysian Ringgit (RM)'),
    ('0029ac0a-92d1-4377-9ca7-60e4fb6b36ba','2025-05-21 08:41:06.315063+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'currency','Kurs Mata Uang','6','Japanese Yen (¥)'),
    ('98c34c29-b3b1-41d1-b6f2-408057c8bfb4','2025-05-21 08:41:06.315063+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'currency','Kurs Mata Uang','7','British Pound Sterling (£)'),
    ('ea9e96f6-3eba-4ac9-9e23-2bcec60fc983','2025-05-15 17:29:57.542706+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','1','Purchase'),
    ('1aa5fd15-daa4-4314-8c00-68ea5867d7a5','2025-07-20 11:10:08.84082+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','1','Pembelian'),
    ('be20a01e-42c3-47f1-8298-3609aec7964d','2025-07-20 11:10:08.84082+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','2','Penjualan'),
    ('6d83a0bd-4966-4c0d-946e-740c4167dd82','2025-05-15 17:29:57.542706+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','2','Sale'),
    ('5ed9359a-85b1-43c3-ae49-77782e63486b','2025-07-20 11:10:08.84082+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','3','Penyesuaian'),
    ('be96a5d2-1d47-4834-9af3-22df2b6fab0f','2025-05-15 17:29:57.542706+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','3','Transfer In'),
    ('5b6d19bd-e195-455c-9e80-9736555856cd','2025-05-15 17:29:57.542706+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','4','Transfer Out'),
    ('32e3a66b-c7c5-412d-8dcf-2158e3dd1475','2025-07-20 11:10:08.84082+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','4','Transfer'),
    ('474e428a-d921-4098-b79e-95573c21ee4a','2025-07-20 11:10:08.84082+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','5','Produksi'),
    ('362d4a90-48bf-4572-abe2-f849e376af3c','2025-05-15 17:29:57.542706+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','5','Adjustment'),
    ('59a72f9e-0898-4b17-b73b-445bf3a7dc9e','2025-07-20 11:10:08.84082+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','6','Kerusakan'),
    ('39871ba8-f80d-452d-8182-d2edb4344fef','2025-07-20 11:10:08.84082+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','7','Retur'),
    ('f3c7da31-1deb-448b-8d48-db97b7f37bd8','2025-07-20 11:10:08.84082+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_transaction_type','Inventory Transaction Type','8','Stock Opname'),
    ('de41f14e-bb44-458f-83ba-21a0ccb23d7a','2025-05-21 08:38:17.172882+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_valuation_method','Inventory Valuation Method','1','Default'),
    ('21c35d0c-c6a2-45bc-90fb-f93d5e394b8e','2025-05-21 08:38:17.172882+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_valuation_method','Inventory Valuation Method','2','FIFO'),
    ('e54e2e96-69ce-4e12-ae6d-de0d6dbfadd2','2025-05-21 08:38:17.172882+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_valuation_method','Inventory Valuation Method','3','LIFO'),
    ('8a334bc2-c12c-47bd-a249-db39d91844fc','2025-05-21 08:38:17.172882+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'inventory_valuation_method','Inventory Valuation Method','4','Average'),
    ('1e8f2ddf-052b-4f16-8ac3-c02de2be6884','2025-05-16 03:34:14.791212+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'online_store_mode','Online Store Mode','1','Catalog'),
    ('cc39c4dc-660f-41b3-bb70-0eaec8d9a3e3','2025-05-16 03:34:14.791212+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'online_store_mode','Online Store Mode','2','Catalog & Order'),
    ('2da46dfb-a304-4f48-9036-4f4ee0d3b957','2025-05-16 03:34:14.791212+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'online_store_mode','Online Store Mode','3','Disabled'),
    ('8d7a200d-f9fc-428b-817e-ea857a5182dc','2025-05-15 16:33:59.211668+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'product_type','Product Type','1','Barang'),
    ('5faddbcc-7b91-4af4-aee7-7add06d0322c','2025-05-15 16:34:48.327771+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'product_type','Product Type','2','Jasa'),
    ('df7af1f8-d9b4-45c9-827b-da65676dc893','2025-05-15 16:35:07.116252+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'product_type','Product Type','3','Kelas/Jadwal'),
    ('34f0ae5f-0bc8-4f4f-9f8f-de41afd18f8a','2025-05-15 17:33:14.507196+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_opname_session_status','Stock Opname Session Status','1','Open'),
    ('c313a2b6-f85b-405c-8562-1eae11e95cc6','2025-05-15 17:33:14.507196+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_opname_session_status','Stock Opname Session Status','2','Counted'),
    ('6a12535d-fcef-40f8-924a-88496282b667','2025-05-15 17:33:14.507196+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_opname_session_status','Stock Opname Session Status','3','Adjusted'),
    ('cde7ba08-fe04-407d-9e22-51e32cab4a16','2025-05-15 17:33:14.507196+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_opname_session_status','Stock Opname Session Status','4','Closed'),
    ('ebd9a45c-3084-4bd3-986c-c24ff9ee1fd3','2025-07-20 11:10:40.286552+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_opname_status','Stock Opname Status','1','Draft'),
    ('fe1655e5-b685-4b8f-a384-b2a074f8a5e4','2025-07-20 11:10:40.286552+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_opname_status','Stock Opname Status','2','Sedang Berlangsung'),
    ('eabdf506-251a-4cd9-8929-8177da0f6232','2025-07-20 11:10:40.286552+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_opname_status','Stock Opname Status','3','Selesai'),
    ('34b7dbed-37c4-4bcc-ac72-e00b85424f00','2025-07-20 11:10:40.286552+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_opname_status','Stock Opname Status','4','Dibatalkan'),
    ('c5f611dd-b6c0-4bd5-9000-698cdca7c199','2025-05-16 03:34:14.791212+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_tracking_mode','Stock Tracking Mode','1','Physical'),
    ('a16e0369-8808-4a5c-8be9-eab8aea0ae51','2025-05-16 03:34:14.791212+00','00000000-0000-0000-0000-000000000000',NULL,NULL,NULL,NULL,'stock_tracking_mode','Stock Tracking Mode','2','Booking')
ON CONFLICT (id) DO NOTHING;
COMMIT;

-- ========================================
-- RLS POLICIES (from live via MCP)
-- ========================================

-- business_online_settings
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.business_online_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- businesses
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.businesses
    FOR INSERT
    WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.businesses
    FOR SELECT
    USING (true);

-- categories
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.categories
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- cities
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.cities
    FOR SELECT
    USING (true);

-- countries
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.countries
    FOR SELECT
    USING (true);

-- customer_loyalty_memberships
CREATE POLICY IF NOT EXISTS "Users can delete customer loyalty memberships for their busines" ON public.customer_loyalty_memberships
    FOR DELETE
    USING ((customer_id IN (
        SELECT c.id FROM public.customers c
        JOIN public.role_assignments ra ON c.business_id = ra.business_id
        WHERE ra.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can insert customer loyalty memberships for their busines" ON public.customer_loyalty_memberships
    FOR INSERT
    WITH CHECK ((customer_id IN (
        SELECT c.id FROM public.customers c
        JOIN public.role_assignments ra ON c.business_id = ra.business_id
        WHERE ra.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can update customer loyalty memberships for their busines" ON public.customer_loyalty_memberships
    FOR UPDATE
    USING ((customer_id IN (
        SELECT c.id FROM public.customers c
        JOIN public.role_assignments ra ON c.business_id = ra.business_id
        WHERE ra.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can view customer loyalty memberships for their business" ON public.customer_loyalty_memberships
    FOR SELECT
    USING ((customer_id IN (
        SELECT c.id FROM public.customers c
        JOIN public.role_assignments ra ON c.business_id = ra.business_id
        WHERE ra.user_id = auth.uid()
    )));

-- customers
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.customers
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- discounts
CREATE POLICY IF NOT EXISTS "Users can delete discounts for their business" ON public.discounts
    FOR DELETE
    USING ((business_id IN (
        SELECT role_assignments.business_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can insert discounts for their business" ON public.discounts
    FOR INSERT
    WITH CHECK ((business_id IN (
        SELECT role_assignments.business_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can update discounts for their business" ON public.discounts
    FOR UPDATE
    USING ((business_id IN (
        SELECT role_assignments.business_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can view discounts for their business" ON public.discounts
    FOR SELECT
    USING ((business_id IN (
        SELECT role_assignments.business_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));

-- expenses
CREATE POLICY IF NOT EXISTS "Users can delete expenses for their store" ON public.expenses
    FOR DELETE
    USING ((store_id IN (
        SELECT role_assignments.store_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can insert expenses for their store" ON public.expenses
    FOR INSERT
    WITH CHECK ((store_id IN (
        SELECT role_assignments.store_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can update expenses for their store" ON public.expenses
    FOR UPDATE
    USING ((store_id IN (
        SELECT role_assignments.store_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can view expenses for their store" ON public.expenses
    FOR SELECT
    USING ((store_id IN (
        SELECT role_assignments.store_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));

-- financial_transactions
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.financial_transactions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- inventory_transactions
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.inventory_transactions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- loyalty_programs
CREATE POLICY IF NOT EXISTS "Users can delete loyalty programs for their business" ON public.loyalty_programs
    FOR DELETE
    USING ((business_id IN (
        SELECT role_assignments.business_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can insert loyalty programs for their business" ON public.loyalty_programs
    FOR INSERT
    WITH CHECK ((business_id IN (
        SELECT role_assignments.business_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can update loyalty programs for their business" ON public.loyalty_programs
    FOR UPDATE
    USING ((business_id IN (
        SELECT role_assignments.business_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));
CREATE POLICY IF NOT EXISTS "Users can view loyalty programs for their business" ON public.loyalty_programs
    FOR SELECT
    USING ((business_id IN (
        SELECT role_assignments.business_id FROM public.role_assignments
        WHERE role_assignments.user_id = auth.uid()
    )));

-- options
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.options
    FOR SELECT
    USING (true);

-- payables
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.payables
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- payment_methods
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.payment_methods
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- payment_types
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.payment_types
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- products
CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users only" ON public.products
    FOR DELETE
    USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.products
    FOR INSERT
    WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.products
    FOR SELECT
    USING (true);
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" ON public.products
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "products_public_read" ON public.products
    FOR SELECT
    USING (((is_active = true) AND (availability_status = ANY (ARRAY['available'::text, 'preorder'::text]))));

-- profit_loss_items
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.profit_loss_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- provinces
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.provinces
    FOR SELECT
    USING (true);

-- purchases
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.purchases
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- purchases_items
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.purchases_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- receivables
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.receivables
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- role_assignments
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.role_assignments
    FOR INSERT
    WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.role_assignments
    FOR SELECT
    USING (true);

-- roles
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.roles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- sales
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.sales
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- sales_items
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.sales_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- stock_opname_items
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.stock_opname_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- stock_opname_sessions
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.stock_opname_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- store_carts
CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users only" ON public.store_carts
    FOR DELETE
    USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.store_carts
    FOR INSERT
    WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.store_carts
    FOR SELECT
    USING (true);
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" ON public.store_carts
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- store_payment_methods
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.store_payment_methods
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- stores
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.stores
    FOR INSERT
    WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.stores
    FOR SELECT
    USING (true);

-- suppliers
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.suppliers
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- users
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);


