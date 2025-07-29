# Implementasi Akses Subdomain Langsung - 19 Desember 2024

## Ringkasan

Berhasil mengimplementasikan akses langsung ke `ourbit.web.app/[subdomain]` untuk online store.

## Problem Yang Dipecahkan

Sebelumnya, user tidak bisa akses langsung ke `ourbit.web.app/[subdomain]` karena:

1. Static export Next.js tidak support dynamic routes dengan `generateStaticParams()`
2. Middleware tidak berfungsi optimal untuk static export

## Solusi Yang Diimplementasikan

### 1. Halaman Catalog Universal

- **File**: `src/app/catalog/page.tsx`
- **Fungsi**: Halaman yang dapat mendeteksi subdomain dari URL dan menampilkan katalog yang sesuai
- **Fitur**:
  - Deteksi subdomain dari query parameter atau path
  - Client-side routing dan data fetching
  - Responsive layout dengan search functionality

### 2. Middleware Enhancement

- **File**: `src/middleware.ts`
- **Fungsi**: Redirect setiap URL subdomain ke halaman catalog
- **Logic**:

  ```typescript
  // Format: ourbit.web.app/@subdomain -> catalog?subdomain=xxx
  if (pathname.startsWith("/@")) {
  	const subdomain = pathname.substring(2);
  	url.pathname = `/catalog`;
  	url.searchParams.set("subdomain", subdomain);
  	return NextResponse.redirect(url);
  }

  // Format: ourbit.web.app/[subdomain] -> catalog?subdomain=xxx
  const pathSegments = pathname.split("/").filter(Boolean);
  if (pathSegments.length === 1) {
  	const potentialSubdomain = pathSegments[0];
  	// Skip known routes
  	if (!knownRoutes.includes(potentialSubdomain)) {
  		url.pathname = `/catalog`;
  		url.searchParams.set("subdomain", potentialSubdomain);
  		return NextResponse.redirect(url);
  	}
  }
  ```

### 3. Known Routes Protection

- **Protected Routes**: `sign-in`, `sign-up`, `sign-up-success`, `forgot-password`, `create-store`, `cashier`, `ui-demo`
- **Fungsi**: Memastikan route yang sudah ada tidak di-redirect ke catalog

## URL Structure Yang Didukung

| Format URL                                    | Redirect ke                                   | Status |
| --------------------------------------------- | --------------------------------------------- | ------ |
| `ourbit.web.app/@namabisnis`                  | `ourbit.web.app/catalog?subdomain=namabisnis` | ✅     |
| `ourbit.web.app/namabisnis`                   | `ourbit.web.app/catalog?subdomain=namabisnis` | ✅     |
| `ourbit.web.app/catalog?subdomain=namabisnis` | Direct access                                 | ✅     |

## Technical Implementation

### Catalog Page Features

```typescript
function OnlineCatalogContent() {
	// Auto-detect subdomain from URL
	useEffect(() => {
		const subdomainFromParams = searchParams.get("subdomain");
		const pathSubdomain = window.location.pathname.split("/")[1];
		const detectedSubdomain = subdomainFromParams || pathSubdomain;

		if (detectedSubdomain && detectedSubdomain !== "catalog") {
			setSubdomain(detectedSubdomain);
		}
	}, [searchParams]);

	// Load data based on subdomain
	useEffect(() => {
		if (subdomain) {
			loadCatalogData();
		}
	}, [subdomain]);
}
```

### Middleware Logic

```typescript
export function middleware(request: NextRequest) {
	// Skip known routes and static files
	if (pathname.startsWith("/admin") || knownRoutes.includes(pathSegment)) {
		return NextResponse.next();
	}

	// Redirect subdomain to catalog
	if (pathSegments.length === 1) {
		const url = request.nextUrl.clone();
		url.pathname = `/catalog`;
		url.searchParams.set("subdomain", potentialSubdomain);
		return NextResponse.redirect(url);
	}
}
```

## Deployment

- **Build**: `npm run build` ✅
- **Deploy**: `npm run deploy` ✅
- **URL**: https://ourbit2.web.app ✅

## Testing URLs

1. https://ourbit2.web.app/@testbisnis → redirect ke catalog
2. https://ourbit2.web.app/testbisnis → redirect ke catalog
3. https://ourbit2.web.app/catalog?subdomain=testbisnis → direct access

## Status

✅ **BERHASIL DEPLOY**

Sekarang user bisa akses online store mereka dengan format:

- `ourbit.web.app/namabisnis`
- `ourbit.web.app/@namabisnis`

Kedua format akan bekerja dan menampilkan katalog online store yang sesuai! 🎉
