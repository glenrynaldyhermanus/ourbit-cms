# 2025-08-13 – Online Store P0 Consolidation

## Perubahan Utama

- Public catalog by business slug

  - Update `src/app/api/public/[slug]/route.ts` untuk resolve bisnis via `business_online_settings.subdomain`, lalu pilih katalog dari `default_online_store_id` atau store pertama bisnis sebagai fallback.

- Schema

  - Tambah kolom `default_online_store_id UUID NULL REFERENCES public.stores(id)` ke `public.business_online_settings` secara idempotent di `database/schema.sql`.

- Admin Online Store

  - `src/app/admin/online-store/page.tsx`: Tambah selector “Default store untuk online” dan persist ke `business_online_settings.default_online_store_id`.

- Cart API

  - `src/app/api/cart/route.ts`: GET/POST mendukung `businessId` untuk fallback ke default store jika `storeId` tidak dikirim.

- Checkout API

  - `src/app/api/checkout/route.ts`: Body mendukung `businessId`; ketika `storeId` kosong, resolve ke default store.

- Branding di payload publik

  - `src/app/api/public/[slug]/route.ts`: payload `profile` kini menyertakan `display_name`, `avatar_url`, `banner_url`, `theme_json`, `socials_json` dari `business_online_settings` untuk dipakai UI publik.

## Catatan

- Ini tahap P0 tanpa nearest-store. Pemilihan store terdekat akan dilanjut P1.
