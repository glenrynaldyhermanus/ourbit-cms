# Ourbit CMS - Sistem Manajemen Toko Terintegrasi

**Ourbit CMS** adalah sistem manajemen toko (Point of Sale) yang komprehensif dan modern yang dibangun dengan teknologi Next.js 15, TypeScript, dan Supabase. Aplikasi ini dirancang khusus untuk bisnis retail yang membutuhkan solusi manajemen toko yang terintegrasi dan mudah digunakan.

## Fitur Utama

### 🏪 Dashboard Admin

Panel kontrol lengkap dengan statistik penjualan, pendapatan harian, dan aktivitas terbaru yang memberikan gambaran real-time tentang performa bisnis.

### 💰 Sistem Kasir

Interface POS yang interaktif untuk memproses transaksi dengan berbagai metode pembayaran termasuk tunai, EDC, e-wallet, dan transfer bank.

### 📦 Manajemen Produk

Sistem inventori lengkap dengan tracking stok, kategori produk, dan SKU generator otomatis untuk memudahkan pengelolaan produk.

### 👥 Manajemen Pelanggan

Database pelanggan dengan informasi lengkap dan riwayat transaksi untuk meningkatkan layanan pelanggan.

### 🏢 Manajemen Supplier

Sistem vendor management dengan tracking hutang dan pembelian untuk mengoptimalkan rantai pasok.

### 📊 Laporan Keuangan

Laporan penjualan, pembelian, laba-rugi, dan piutang/hutang yang detail untuk analisis bisnis yang mendalam.

### 📋 Stock Opname

Sistem inventarisasi stok dengan variance tracking untuk memastikan akurasi inventori.

### 🏬 Multi-Store

Dukungan untuk multiple toko dengan manajemen terpusat untuk bisnis dengan cabang.

### 🔐 Role-Based Access

Sistem keamanan berbasis peran untuk staff dan admin dengan kontrol akses yang granular.

## Arsitektur Teknis

### Frontend

- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript untuk type safety
- **Styling**: Tailwind CSS dengan custom Neumah components
- **UI Components**: Radix UI primitives dengan design system konsisten

### Backend

- **Database**: Supabase (PostgreSQL) dengan real-time capabilities
- **Authentication**: Supabase Auth dengan role-based permissions
- **API**: RESTful API dengan TypeScript interfaces

### Deployment

- **Hosting**: Firebase Hosting
- **CI/CD**: Automated deployment pipeline
- **Environment**: Production-ready dengan optimasi performa

## Database Schema

Aplikasi menggunakan skema database yang kompleks dengan 20+ tabel termasuk:

### Core Business Tables

- `businesses` - Manajemen entitas bisnis
- `stores` - Manajemen toko/cabang
- `users` - Manajemen pengguna
- `roles` & `role_assignments` - Sistem keamanan

### Product Management

- `products` - Data produk dengan tracking stok
- `categories` - Kategori produk
- `inventory_transactions` - Riwayat transaksi inventori
- `stock_opname_sessions` & `stock_opname_items` - Sistem stock opname

### Transaction Management

- `sales` & `sales_items` - Transaksi penjualan
- `purchases` & `purchases_items` - Transaksi pembelian
- `payment_methods` & `payment_types` - Metode pembayaran

### Financial Management

- `financial_transactions` - Transaksi keuangan
- `receivables` - Piutang pelanggan
- `payables` - Hutang supplier
- `profit_loss_items` - Item laba rugi

### Master Data

- `customers` - Data pelanggan
- `suppliers` - Data supplier
- `countries`, `provinces`, `cities` - Data lokasi

## Target Pengguna

### 🎯 Primary Users

- **Pemilik toko retail** yang membutuhkan sistem manajemen terintegrasi
- **Bisnis dengan multiple outlet** yang memerlukan kontrol terpusat
- **Toko yang membutuhkan laporan keuangan** dan inventori yang akurat
- **Bisnis yang ingin digitalisasi** operasional mereka

### 💼 Business Benefits

- **Efisiensi operasional** dengan otomatisasi proses
- **Akurasi data** dengan real-time tracking
- **Kontrol inventori** yang lebih baik
- **Laporan keuangan** yang komprehensif
- **Multi-store management** yang terintegrasi

## Teknologi yang Digunakan

### Core Technologies

- **Next.js 15** - React framework dengan App Router
- **TypeScript** - Type safety dan developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service dengan PostgreSQL

### UI/UX Libraries

- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icon library
- **Custom Neumah Components** - Design system khusus

### Development Tools

- **ESLint** - Code linting
- **Firebase** - Hosting dan deployment
- **Git** - Version control

## Fitur Khusus

### 🎨 Neumah Design System

Komponen UI custom dengan prefix "Neumah" yang memberikan konsistensi visual dan user experience yang unik.

### 📱 Responsive Design

Interface yang responsif untuk desktop, tablet, dan mobile dengan optimasi UX untuk setiap device.

### 🔄 Real-time Updates

Sinkronisasi data real-time menggunakan Supabase subscriptions untuk update instan.

### 📈 Advanced Reporting

Laporan keuangan yang detail dengan analisis tren dan performa bisnis.

### 🔐 Security Features

- Role-based access control
- Secure authentication
- Data encryption
- Audit trails

## Deployment & Maintenance

### 🚀 Deployment

- Automated CI/CD pipeline
- Firebase hosting dengan CDN
- Environment-specific configurations
- Performance monitoring

### 🔧 Maintenance

- Regular security updates
- Database optimization
- Performance monitoring
- Backup strategies

---

**Ourbit CMS** menekankan pada user experience yang intuitif, data real-time, dan laporan yang komprehensif untuk membantu pemilik bisnis membuat keputusan yang tepat berdasarkan data yang akurat. Aplikasi ini dirancang untuk menjadi solusi end-to-end bagi bisnis retail yang ingin mengoptimalkan operasional mereka dengan teknologi modern.
