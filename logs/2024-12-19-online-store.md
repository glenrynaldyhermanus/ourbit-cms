# Fitur Toko Online - 19 Desember 2024

## Perubahan Database

### Tabel Baru

- `warehouses` - Tabel untuk gudang
- `warehouse_sales` - Penjualan dari gudang
- `warehouse_sales_items` - Item penjualan gudang

### Field Baru

- `stores.is_online_delivery_active` - Flag untuk store yang aktif pengiriman online
- `warehouses.is_online_delivery_active` - Flag untuk warehouse yang aktif pengiriman online
- `customers.auth_user_id` - Link ke auth account untuk customer hybrid
- `customers.customer_source` - Sumber customer (offline/online/hybrid)
- `customers.loyalty_points` - Point loyalty customer
- `sales.warehouse_id` - ID warehouse untuk sales dari gudang
- `sales.customer_name` - Nama customer untuk order online
- `sales.delivery_address` - Alamat pengiriman
- `sales.delivery_fee` - Biaya pengiriman
- `sales.tracking_number` - Nomor tracking pengiriman

## Halaman Baru

### Admin

- `/admin/online-store` - Pengaturan toko online
  - Toggle aktifkan toko online
  - Pengaturan subdomain
  - Pengaturan kontak dan social media
  - Toggle store/warehouse untuk pengiriman online

### Public

- `/[subdomain]` - Katalog online untuk customer
  - Tampilan produk dari store/warehouse aktif
  - Search produk
  - Informasi kontak dan lokasi pengiriman

## Middleware

- Menangani routing `ourbit.web.app/@subdomain`
- Redirect ke halaman katalog online

## Menu Sidebar

- Ditambahkan menu "Toko Online" di grup Organisasi

## Fitur Utama

### 1. Hybrid Customer System

- Customer offline dan online dalam satu tabel
- Loyalty points terakumulasi dari semua channel
- Auth account optional untuk customer offline

### 2. Unified Sales System

- Satu tabel `sales` untuk semua jenis penjualan
- Flag `sale_source` untuk membedakan offline/online
- Support sales dari store dan warehouse

### 3. Online Store Management

- Owner bisa aktifkan toko online per bisnis
- Subdomain format: `ourbit.web.app/@namabisnis`
- Toggle store/warehouse untuk pengiriman online

### 4. Public Catalog

- Katalog produk untuk customer
- Search dan filter produk
- Informasi kontak dan lokasi pengiriman

## Struktur URL

- Admin: `/admin/online-store`
- Public: `ourbit.web.app/@subdomain`

## Database Schema

- Minimal tables dengan flag approach
- Reuse existing tables (customers, sales)
- Clear separation store vs warehouse
- Future-ready untuk supply chain
