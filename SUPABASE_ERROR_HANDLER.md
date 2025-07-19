# Supabase Error Handler Standard

## Overview

Error handler standar untuk semua query Supabase yang memberikan pesan error yang konsisten dan informatif.

## File Location

`src/lib/supabase-error-handler.ts`

## Usage

### Basic Usage

```typescript
import { handleSupabaseError } from "@/lib/supabase-error-handler";

const { data, error } = await supabase.from("table").select();

const errorResult = handleSupabaseError(error, {
	operation: "memuat",
	entity: "produk",
	showToast: showToast, // optional
});

if (!errorResult.success) {
	return; // Handle error
}
```

### With Success Handler

```typescript
import {
	handleSupabaseError,
	handleSupabaseSuccess,
} from "@/lib/supabase-error-handler";

const { data, error } = await supabase.from("table").insert(data);

const errorResult = handleSupabaseError(error, {
	operation: "menambah",
	entity: "produk",
	showToast: showToast,
});

if (!errorResult.success) {
	return;
}

// Success
handleSupabaseSuccess("menambah", "produk", showToast);
```

## Error Codes Handled

### RLS (Row Level Security) Errors

- **PGRST116**: Akses ditolak
- **42501**: Permission denied

### Database Constraint Errors

- **23503**: Foreign key violation
- **23505**: Unique constraint violation
- **23502**: Not null violation
- **23514**: Check constraint violation

### Connection Errors

- **PGRST301**: Connection lost
- **PGRST302**: Request timeout

### JWT Errors

- **PGRST301**: Session expired

## Error Messages

### RLS Errors

- "Akses ditolak. Anda tidak memiliki izin untuk [operation] [entity]."
- "Permission denied. Silakan hubungi administrator untuk mengatur RLS policy."
- "Row Level Security (RLS) memblokir akses. Silakan hubungi administrator."

### Database Errors

- "Data tidak dapat [operation] karena masih terhubung dengan data lain."
- "Data sudah ada. Silakan gunakan data yang berbeda."
- "Data wajib diisi. Silakan lengkapi semua field yang diperlukan."
- "Data tidak valid. Silakan periksa kembali input Anda."

### Connection Errors

- "Koneksi ke database terputus. Silakan coba lagi."
- "Request timeout. Silakan coba lagi."
- "Sesi login telah berakhir. Silakan login ulang."

## Options Interface

```typescript
interface ErrorHandlerOptions {
	operation: string; // "memuat", "menambah", "memperbarui", "menghapus"
	entity?: string; // "produk", "kategori", "pelanggan", etc.
	showToast?: (type: "success" | "error", message: string) => void;
	logError?: boolean; // default: true
}
```

## Benefits

1. **Konsistensi**: Semua error ditangani dengan cara yang sama
2. **User-Friendly**: Pesan error dalam bahasa Indonesia yang jelas
3. **Debugging**: Logging otomatis untuk debugging
4. **Maintainable**: Mudah menambah error code baru
5. **Type Safety**: TypeScript interface yang jelas

## Migration Guide

### Before (Manual Error Handling)

```typescript
if (error) {
	if (error.code === "PGRST116") {
		onError("Akses ditolak");
	} else {
		onError("Gagal update");
	}
	return;
}
```

### After (Standard Error Handler)

```typescript
const errorResult = handleSupabaseError(error, {
	operation: "memperbarui",
	entity: "produk",
	showToast: onError,
});

if (!errorResult.success) {
	return;
}
```

## Implementation Status

### ✅ Completed

- Product Form (create/update)
- Products Page (fetch/delete)
- Error handler utility
- Success handler utility

### 🔄 Pending

- Categories management
- Customers management
- Orders management
- Other CRUD operations

## Best Practices

1. **Always use error handler** for all Supabase queries
2. **Provide meaningful operation and entity names**
3. **Use showToast for user feedback**
4. **Check errorResult.success before proceeding**
5. **Add new error codes** to the handler when needed
