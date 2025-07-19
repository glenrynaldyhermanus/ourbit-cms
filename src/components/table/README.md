# DataTable Component

Komponen tabel yang reusable untuk menampilkan data dengan fitur sorting, searching, dan pagination.

## Fitur

- ✅ **Sorting**: Sort berdasarkan kolom tertentu
- ✅ **Searching**: Pencarian real-time
- ✅ **Pagination**: Navigasi halaman dengan kontrol
- ✅ **Loading State**: Skeleton loading saat data dimuat
- ✅ **Responsive**: Tabel responsive dengan horizontal scroll
- ✅ **Customizable**: Kolom dan render function yang fleksibel
- ✅ **TypeScript**: Fully typed dengan generic support

## Penggunaan

### Basic Usage

```tsx
import { DataTable, Column } from "@/components/table/data-table";

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

const columns: Column<User>[] = [
	{
		key: "name",
		header: "Nama",
		sortable: true,
		sortKey: "name",
		render: (user) => <div>{user.name}</div>,
	},
	{
		key: "email",
		header: "Email",
		sortable: true,
		sortKey: "email",
		render: (user) => <div>{user.email}</div>,
	},
	{
		key: "role",
		header: "Role",
		sortable: true,
		sortKey: "role",
		render: (user) => <div>{user.role}</div>,
	},
];

function UserList() {
	const users: User[] = [
		{ id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
		{ id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
	];

	return (
		<DataTable
			data={users}
			columns={columns}
			searchKey="name"
			searchPlaceholder="Cari user..."
			pageSize={10}
		/>
	);
}
```

### Advanced Usage dengan Custom Render

```tsx
const columns: Column<Product>[] = [
	{
		key: "product",
		header: "Produk",
		sortable: true,
		sortKey: "name",
		render: (product) => (
			<div className="flex items-center space-x-3">
				<Image
					src={product.image_url}
					alt={product.name}
					width={40}
					height={40}
					className="rounded-lg"
				/>
				<div>
					<p className="font-medium">{product.name}</p>
					<p className="text-sm text-gray-500">{product.code}</p>
				</div>
			</div>
		),
	},
	{
		key: "price",
		header: "Harga",
		sortable: true,
		sortKey: "price",
		render: (product) => (
			<div className="font-medium">
				{new Intl.NumberFormat("id-ID", {
					style: "currency",
					currency: "IDR",
				}).format(product.price)}
			</div>
		),
	},
	{
		key: "status",
		header: "Status",
		sortable: true,
		sortKey: "is_active",
		render: (product) => (
			<span
				className={`px-2 py-1 rounded-full text-xs ${
					product.is_active
						? "bg-green-100 text-green-800"
						: "bg-red-100 text-red-800"
				}`}>
				{product.is_active ? "Aktif" : "Nonaktif"}
			</span>
		),
	},
	{
		key: "actions",
		header: "",
		sortable: false,
		render: (product) => (
			<div className="flex space-x-2">
				<button onClick={() => handleEdit(product)}>
					<Edit className="w-4 h-4" />
				</button>
				<button onClick={() => handleDelete(product.id)}>
					<Trash className="w-4 h-4" />
				</button>
			</div>
		),
	},
];
```

## Props

### DataTableProps<T>

| Prop                | Type          | Required | Default     | Description                      |
| ------------------- | ------------- | -------- | ----------- | -------------------------------- |
| `data`              | `T[]`         | ✅       | -           | Array data yang akan ditampilkan |
| `columns`           | `Column<T>[]` | ✅       | -           | Konfigurasi kolom tabel          |
| `loading`           | `boolean`     | ❌       | `false`     | Status loading                   |
| `searchKey`         | `keyof T`     | ❌       | -           | Key untuk pencarian              |
| `searchPlaceholder` | `string`      | ❌       | `"Cari..."` | Placeholder untuk input search   |
| `pageSize`          | `number`      | ❌       | `10`        | Jumlah item per halaman          |
| `className`         | `string`      | ❌       | `""`        | CSS class tambahan               |

### Column<T>

| Prop       | Type                           | Required | Description                                 |
| ---------- | ------------------------------ | -------- | ------------------------------------------- | ------------------------- |
| `key`      | `string`                       | ✅       | Unique key untuk kolom                      |
| `header`   | `string`                       | ✅       | Header text kolom                           |
| `render`   | `(item: T) => React.ReactNode` | ✅       | Function untuk render cell content          |
| `sortable` | `boolean`                      | ❌       | `false`                                     | Apakah kolom bisa di-sort |
| `sortKey`  | `keyof T`                      | ❌       | Key untuk sorting (jika berbeda dengan key) |

## Fitur Detail

### Sorting

- Klik header kolom untuk sort ascending/descending
- Icon chevron menunjukkan status sort
- Support untuk string, number, dan boolean values
- Handle null values dengan aman

### Searching

- Real-time search berdasarkan `searchKey`
- Case-insensitive search
- Handle null values dengan aman
- Placeholder text yang customizable

### Pagination

- Navigasi halaman dengan prev/next buttons
- Info "Menampilkan X-Y dari Z data"
- Reset ke halaman 1 saat search berubah

### Loading State

- Skeleton loading dengan animasi
- Disable interaction saat loading
- Consistent dengan design system

### Responsive Design

- Horizontal scroll untuk tabel lebar
- Maintain readability di mobile
- Consistent spacing dan typography

## Best Practices

1. **Type Safety**: Gunakan interface yang jelas untuk data type
2. **Performance**: Gunakan `useMemo` untuk data transformation yang berat
3. **Accessibility**: Pastikan semua interactive elements memiliki proper ARIA labels
4. **Consistency**: Gunakan design system yang konsisten untuk styling
5. **Error Handling**: Handle null/undefined values dengan aman

## Contoh Implementasi di Products Page

Lihat `src/app/admin/products/page.tsx` untuk contoh implementasi lengkap dengan:

- Custom column rendering
- Image handling
- Currency formatting
- Status badges
- Action buttons
- Error handling
