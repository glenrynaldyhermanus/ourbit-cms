# SKU Generator Features - OurBit CMS

## Overview

Fitur SKU Generator yang advanced untuk otomatis generate kode produk dengan berbagai pola dan validasi real-time.

## Fitur Utama

### 1. Auto SKU Generation

- **Toggle Auto/Manual**: User bisa pilih antara auto-generate atau input manual
- **Real-time Generation**: SKU otomatis update ketika nama produk atau kategori berubah
- **Minimum 3 karakter**: SKU hanya generate setelah nama produk minimal 3 karakter

### 2. Multiple Pattern Options

#### A. Category + Sequential (Default)

- Format: `{CATEGORY}-{SEQUENTIAL}`
- Contoh: `ELEC-001`, `FOOD-002`, `CLTH-003`
- Kode kategori otomatis dari 3 huruf pertama nama kategori

#### B. Name-based

- Format: `{NAME_INITIALS}-{SEQUENTIAL}`
- Contoh: `LHP-001` (Laptop HP), `SU-002` (Susu Ultra)
- Mengambil huruf pertama dari setiap kata nama produk

#### C. Date-based

- Format: `{DATE}-{SEQUENTIAL}`
- Contoh: `240101-001`, `240101-002`
- Menggunakan format YYMMDD + sequential number

#### D. Custom Pattern

- Format: `{PREFIX}-{CUSTOM}-{SEQUENTIAL}{SUFFIX}`
- Contoh: `PROD-ABC-001`, `ITEM-XYZ-2024`
- User bisa set prefix dan suffix custom

### 3. Advanced Features

#### Real-time Validation

- **Format validation**: Cek karakter yang diperbolehkan (alphanumeric, dash, underscore)
- **Length validation**: Min 3 karakter, max 20 karakter
- **Uniqueness check**: Cek duplikasi dengan produk lain di store yang sama
- **Visual feedback**: Icon dan warna berbeda untuk valid/invalid

#### Smart Sequential Numbering

- **Per kategori**: Jika pattern category-based, sequential number terpisah per kategori
- **Per store**: Sequential number terpisah per store
- **Auto increment**: Otomatis ambil nomor terakhir + 1

#### User Experience

- **Loading state**: Spinner saat generate SKU
- **Refresh button**: Manual refresh SKU jika diperlukan
- **Pattern info**: Tooltip dan contoh untuk setiap pattern
- **Advanced settings**: Collapsible section untuk custom pattern

## Technical Implementation

### File Structure

```
src/
├── lib/
│   └── sku-generator.ts          # Core SKU generation logic
├── components/
│   └── forms/
│       ├── ProductForm.tsx       # Main product form
│       └── SKUGenerator.tsx      # SKU generator component
```

### Key Classes & Interfaces

#### SKUGenerator Class

```typescript
class SKUGenerator {
	static async generateSKU(
		productName: string,
		categoryId: string | null,
		categoryName: string | null,
		storeId: string,
		options: SKUOptions
	): Promise<string>;

	static validateSKU(sku: string): { isValid: boolean; message: string };

	static async checkSKUUniqueness(
		sku: string,
		storeId: string,
		excludeId?: string
	): Promise<boolean>;
}
```

#### SKUOptions Interface

```typescript
interface SKUOptions {
	autoGenerate: boolean;
	pattern: "category-sequential" | "name-based" | "custom" | "date-based";
	prefix?: string;
	suffix?: string;
	includeDate?: boolean;
	categoryCode?: string;
	sequentialLength?: number;
}
```

## Database Schema

### Products Table

```sql
CREATE TABLE public.products (
  -- existing fields...
  auto_sku BOOLEAN NOT NULL DEFAULT true,  -- Auto SKU flag
  code VARCHAR UNIQUE,                      -- SKU field
  -- other fields...
);
```

## Usage Examples

### Basic Usage

1. Buka form tambah/edit produk
2. Toggle "Auto SKU" ke ON
3. Pilih pattern yang diinginkan
4. Input nama produk (min 3 karakter)
5. SKU otomatis generate dengan format yang dipilih

### Custom Pattern

1. Pilih pattern "Kustom"
2. Klik "Pengaturan Lanjutan"
3. Set prefix (contoh: "PROD")
4. Set suffix (contoh: "2024")
5. SKU akan generate dengan format: `PROD-{CATEGORY}-0012024`

### Manual Override

1. Toggle "Auto SKU" ke OFF
2. Input SKU manual di field
3. Validasi real-time akan tetap berjalan
4. Uniqueness check tetap aktif

## Benefits vs KasirPintar.id

### Keunggulan OurBit CMS:

1. **Multiple Patterns**: 4 pola berbeda vs 1 pola di KasirPintar
2. **Real-time Validation**: Instant feedback vs validation setelah submit
3. **Custom Options**: Prefix/suffix custom vs fixed pattern
4. **Better UX**: Visual feedback, loading states, pattern info
5. **Flexibility**: Toggle auto/manual vs auto-only
6. **Advanced Features**: Date-based, name-based patterns

### Similar Features:

1. **Auto-generation**: Sama-sama generate otomatis
2. **Sequential numbering**: Sama-sama increment per kategori
3. **Minimum character**: Sama-sama require min 3 karakter

## Future Enhancements

### Planned Features:

1. **Bulk SKU Generation**: Import Excel dengan auto-generate SKU
2. **SKU Templates**: Save custom patterns sebagai template
3. **SKU History**: Track perubahan SKU untuk audit
4. **Advanced Patterns**: Barcode integration, QR code generation
5. **SKU Analytics**: Report penggunaan pattern dan duplikasi

### Technical Improvements:

1. **Caching**: Cache sequential numbers untuk performance
2. **Batch Operations**: Optimize untuk bulk operations
3. **API Endpoints**: Dedicated API untuk SKU generation
4. **Webhooks**: Notify external systems saat SKU berubah

## Configuration

### Environment Variables

```env
# SKU Generator Settings
SKU_MAX_LENGTH=20
SKU_MIN_LENGTH=3
SKU_DEFAULT_PATTERN=category-sequential
```

### Store Settings

```typescript
interface StoreSettings {
	skuPattern: string;
	skuPrefix: string;
	skuSuffix: string;
	autoSkuEnabled: boolean;
}
```

## Testing

### Unit Tests

```typescript
describe("SKUGenerator", () => {
	test("should generate category-sequential SKU", async () => {
		const sku = await SKUGenerator.generateSKU(
			"Laptop HP",
			"cat-123",
			"Electronics",
			"store-456",
			{ autoGenerate: true, pattern: "category-sequential" }
		);
		expect(sku).toMatch(/^ELE-\d{3}$/);
	});
});
```

### Integration Tests

- Test SKU generation dengan database
- Test uniqueness validation
- Test pattern switching
- Test manual override

## Performance Considerations

### Database Queries

- **Optimized sequential lookup**: Index pada `code` field
- **Caching**: Cache sequential numbers per category/store
- **Batch operations**: Bulk SKU generation untuk import

### Frontend Performance

- **Debounced validation**: Delay validation untuk reduce API calls
- **Lazy loading**: Load SKU patterns on demand
- **Memoization**: Cache generated SKUs untuk similar inputs

## Security

### Input Validation

- **SQL Injection**: Parameterized queries
- **XSS Prevention**: Sanitize SKU input
- **Length Limits**: Prevent buffer overflow
- **Character Validation**: Only allow safe characters

### Access Control

- **Store Isolation**: SKU unique per store
- **User Permissions**: Check user can modify products
- **Audit Trail**: Log SKU changes

## Troubleshooting

### Common Issues

#### SKU Not Generating

- Check nama produk minimal 3 karakter
- Verify kategori sudah dipilih (untuk category-based pattern)
- Check network connection untuk database queries

#### SKU Duplication

- Verify uniqueness check berjalan
- Check store_id filter
- Clear browser cache jika perlu

#### Performance Issues

- Check database indexes
- Monitor API response times
- Consider caching sequential numbers

### Debug Mode

```typescript
// Enable debug logging
const DEBUG_SKU = process.env.NODE_ENV === "development";

if (DEBUG_SKU) {
	console.log("SKU Generation:", { productName, categoryId, pattern });
}
```

## Migration Guide

### From Manual SKU to Auto SKU

1. Update existing products dengan SKU yang valid
2. Enable auto_sku flag di database
3. Set default pattern per store
4. Train users dengan pattern yang dipilih

### From KasirPintar Pattern

1. Map existing SKUs ke pattern yang sesuai
2. Migrate sequential numbers
3. Update UI untuk multiple patterns
4. Test uniqueness validation

## Support

### Documentation

- [API Reference](./API_REFERENCE.md)
- [Pattern Examples](./PATTERN_EXAMPLES.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

### Contact

- Technical issues: tech@ourbit.com
- Feature requests: product@ourbit.com
- Documentation: docs@ourbit.com
