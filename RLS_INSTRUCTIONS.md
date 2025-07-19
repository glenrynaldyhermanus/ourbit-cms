# Instruksi RLS Policies untuk Tabel Products

## Masalah

Update produk gagal karena Row Level Security (RLS) belum dikonfigurasi dengan benar.

## Solusi

Jalankan RLS policies berikut di Supabase Dashboard:

### Langkah 1: Buka Supabase Dashboard

1. Login ke [supabase.com](https://supabase.com)
2. Pilih project Anda
3. Buka menu **"SQL Editor"**

### Langkah 2: Jalankan RLS Policies

Copy dan paste SQL berikut ke SQL Editor:

```sql
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
```

### Langkah 3: Klik "Run"

Klik tombol "Run" untuk menjalankan policies.

## Penjelasan Policies

1. **SELECT Policy**: User hanya bisa melihat produk dari store mereka
2. **INSERT Policy**: User hanya bisa menambah produk ke store mereka
3. **UPDATE Policy**: User hanya bisa mengupdate produk dari store mereka
4. **DELETE Policy**: User hanya bisa menghapus produk dari store mereka

## Error Handling yang Sudah Ditambahkan

Sekarang aplikasi akan menampilkan pesan error yang jelas jika:

- RLS memblokir akses (PGRST116)
- Permission denied (42501)
- Error RLS lainnya

## Test Setelah RLS

Setelah menjalankan policies:

1. ✅ Update produk akan berfungsi
2. ✅ Status aktif/non-aktif akan tersimpan
3. ✅ Error handling akan menampilkan pesan yang jelas
4. ✅ Keamanan data terjaga per store
