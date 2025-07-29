# Deploy Fitur Online Store - 19 Desember 2024

## Ringkasan

Fitur "Bisnis Go Online" berhasil di-deploy ke Firebase Hosting dengan URL: https://ourbit2.web.app

## Fitur yang Diimplementasikan

### 1. Database Schema

- **Table `business_online_settings`**: Untuk menyimpan pengaturan toko online per bisnis
- **Table `warehouses`**: Untuk gudang yang bisa aktif untuk pengiriman online
- **Modifikasi table `stores`**: Menambahkan flag `is_online_delivery_active`
- **Modifikasi table `customers`**: Hybrid approach untuk customer offline dan online
- **Modifikasi table `sales`**: Unified sales table dengan flag `sale_source` dan nullable `warehouse_id`

### 2. Halaman Admin

- **`/admin/online-store`**: Halaman pengaturan toko online untuk business owner
- Fitur:
  - Aktivasi/deaktivasi toko online
  - Pengaturan subdomain
  - Informasi kontak dan social media
  - Pilihan store/warehouse untuk pengiriman online

### 3. Halaman Publik

- **`/online-store?store=subdomain`**: Halaman katalog publik
- Fitur:
  - Tampilan produk dari store/warehouse yang aktif
  - Search produk
  - Informasi kontak dan lokasi pengiriman
  - Social media links

### 4. Middleware

- **`src/middleware.ts`**: Handle routing subdomain `ourbit.web.app/@namabisnis`
- Redirect ke `/online-store?store=subdomain`

### 5. Navigation

- **Sidebar**: Menambahkan menu "Toko Online" di bawah "Organisasi"

## Technical Details

### Database Changes

```sql
-- Table warehouses
CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    is_online_delivery_active BOOLEAN DEFAULT false,
    -- ... other fields
);

-- Modifikasi stores
ALTER TABLE stores ADD COLUMN is_online_delivery_active BOOLEAN DEFAULT false;

-- Modifikasi customers
ALTER TABLE customers ADD COLUMN auth_user_id UUID;
ALTER TABLE customers ADD COLUMN customer_source VARCHAR DEFAULT 'offline';
ALTER TABLE customers ADD UNIQUE (phone);
ALTER TABLE customers ADD UNIQUE (email);

-- Modifikasi sales
ALTER TABLE sales ALTER COLUMN store_id DROP NOT NULL;
ALTER TABLE sales ADD COLUMN warehouse_id UUID;
ALTER TABLE sales ADD COLUMN sale_source VARCHAR DEFAULT 'offline';
```

### File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── online-store/
│   │       └── page.tsx          # Admin settings page
│   └── online-store/
│       └── page.tsx              # Public catalog page
├── components/
│   └── layout/
│       └── Sidebar.tsx           # Updated with online store menu
└── middleware.ts                  # Subdomain routing
```

## URL Structure

- **Admin**: `ourbit.web.app/admin/online-store`
- **Public Catalog**: `ourbit.web.app/@namabisnis` → `ourbit.web.app/online-store?store=namabisnis`

## Deployment

- **Build**: `npm run build` ✅
- **Deploy**: `npm run deploy` ✅
- **URL**: https://ourbit2.web.app ✅

## Status

✅ **BERHASIL DEPLOY**

Fitur online store sudah siap digunakan. Business owner dapat:

1. Mengakses menu "Toko Online" di admin panel
2. Mengaktifkan toko online dengan subdomain
3. Memilih store/warehouse untuk pengiriman
4. Customer dapat mengakses katalog via `ourbit.web.app/@namabisnis`
