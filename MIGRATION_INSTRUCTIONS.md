# Instruksi Migration untuk Menambahkan Field is_active

## Masalah

Field `is_active` belum ada di tabel `products` di database Supabase, sehingga update form tidak berfungsi.

## Solusi

Jalankan migration SQL berikut di Supabase Dashboard:

### Langkah 1: Buka Supabase Dashboard

1. Login ke [supabase.com](https://supabase.com)
2. Pilih project Anda
3. Buka menu "SQL Editor"

### Langkah 2: Jalankan Migration

Copy dan paste SQL berikut ke SQL Editor:

```sql
-- Menambahkan field is_active ke tabel products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Menambahkan comment untuk field
COMMENT ON COLUMN public.products.is_active IS 'Status aktif produk (true = aktif, false = non-aktif)';
```

### Langkah 3: Klik "Run"

Klik tombol "Run" untuk menjalankan migration.

## Verifikasi

Setelah migration berhasil:

1. Field `is_active` akan tersedia di tabel `products`
2. Form edit produk akan bisa mengupdate status aktif/non-aktif
3. Status akan ditampilkan di tabel produk

## Troubleshooting

Jika ada error:

1. Pastikan Anda memiliki permission untuk mengubah struktur tabel
2. Cek apakah field `is_active` sudah ada dengan query:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'products' AND column_name = 'is_active';
   ```
