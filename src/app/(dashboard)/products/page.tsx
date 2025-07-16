"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import {
	Plus,
	Search,
	Filter,
	Edit2,
	Trash2,
	Package,
	Eye,
	AlertCircle,
} from "lucide-react";

// Mock products data - replace with Supabase data later
const mockProducts: Product[] = [
	{
		id: "1",
		name: "Coffee Arabica",
		price: 25000,
		category: "Beverages",
		stock_quantity: 100,
		sku: "BEV001",
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
	{
		id: "2",
		name: "Croissant",
		price: 15000,
		category: "Bakery",
		stock_quantity: 50,
		sku: "BAK001",
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
	{
		id: "3",
		name: "Green Tea",
		price: 20000,
		category: "Beverages",
		stock_quantity: 75,
		sku: "BEV002",
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
	{
		id: "4",
		name: "Sandwich",
		price: 35000,
		category: "Food",
		stock_quantity: 30,
		sku: "FOO001",
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
	{
		id: "5",
		name: "Cappuccino",
		price: 30000,
		category: "Beverages",
		stock_quantity: 5, // Low stock
		sku: "BEV003",
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
];

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>(mockProducts);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	const categories = [
		"all",
		...Array.from(new Set(products.map((p) => p.category))),
	];

	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.sku.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || product.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getStockStatus = (quantity: number) => {
		if (quantity === 0)
			return { label: "Habis", color: "text-red-600 bg-red-50" };
		if (quantity <= 10)
			return { label: "Sedikit", color: "text-yellow-600 bg-yellow-50" };
		return { label: "Tersedia", color: "text-green-600 bg-green-50" };
	};

	const handleDeleteProduct = (productId: string) => {
		if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
			setProducts(products.filter((p) => p.id !== productId));
		}
	};

	const ProductForm = ({
		product,
		onClose,
		onSave,
	}: {
		product?: Product | null;
		onClose: () => void;
		onSave: (product: Partial<Product>) => void;
	}) => {
		const [formData, setFormData] = useState({
			name: product?.name || "",
			price: product?.price || 0,
			category: product?.category || "",
			stock_quantity: product?.stock_quantity || 0,
			sku: product?.sku || "",
		});

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			onSave(formData);
			onClose();
		};

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-md w-full p-6">
					<h3 className="text-lg font-semibold mb-4">
						{product ? "Edit Produk" : "Tambah Produk Baru"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Nama Produk
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Harga
							</label>
							<input
								type="number"
								value={formData.price}
								onChange={(e) =>
									setFormData({ ...formData, price: Number(e.target.value) })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Kategori
							</label>
							<input
								type="text"
								value={formData.category}
								onChange={(e) =>
									setFormData({ ...formData, category: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Stok
							</label>
							<input
								type="number"
								value={formData.stock_quantity}
								onChange={(e) =>
									setFormData({
										...formData,
										stock_quantity: Number(e.target.value),
									})
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								SKU
							</label>
							<input
								type="text"
								value={formData.sku}
								onChange={(e) =>
									setFormData({ ...formData, sku: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div className="flex space-x-2 pt-4">
							<button
								type="submit"
								className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
								{product ? "Update" : "Tambah"}
							</button>
							<button
								type="button"
								onClick={onClose}
								className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors">
								Batal
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Manajemen Produk</h1>
					<p className="text-gray-600">Kelola inventory dan produk toko Anda</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
					<Plus className="w-4 h-4" />
					<span>Tambah Produk</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Produk</p>
							<p className="text-2xl font-bold text-gray-900">
								{products.length}
							</p>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<Package className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Kategori</p>
							<p className="text-2xl font-bold text-gray-900">
								{categories.length - 1}
							</p>
						</div>
						<div className="p-3 bg-green-50 rounded-full">
							<Filter className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Stok Rendah</p>
							<p className="text-2xl font-bold text-gray-900">
								{products.filter((p) => p.stock_quantity <= 10).length}
							</p>
						</div>
						<div className="p-3 bg-yellow-50 rounded-full">
							<AlertCircle className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Habis</p>
							<p className="text-2xl font-bold text-gray-900">
								{products.filter((p) => p.stock_quantity === 0).length}
							</p>
						</div>
						<div className="p-3 bg-red-50 rounded-full">
							<AlertCircle className="w-6 h-6 text-red-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<input
							type="text"
							placeholder="Cari produk atau SKU..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
						{categories.map((category) => (
							<option key={category} value={category}>
								{category === "all" ? "Semua Kategori" : category}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Products Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Produk
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									SKU
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Kategori
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Harga
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Stok
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredProducts.map((product) => {
								const stockStatus = getStockStatus(product.stock_quantity);
								return (
									<tr key={product.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
													<Package className="w-5 h-5 text-gray-600" />
												</div>
												<div>
													<div className="text-sm font-medium text-gray-900">
														{product.name}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{product.sku}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
												{product.category}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatCurrency(product.price)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{product.stock_quantity}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
												{stockStatus.label}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() => setEditingProduct(product)}
													className="text-blue-600 hover:text-blue-900">
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDeleteProduct(product.id)}
													className="text-red-600 hover:text-red-900">
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{filteredProducts.length === 0 && (
					<div className="text-center py-12">
						<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Tidak ada produk ditemukan
						</h3>
						<p className="text-gray-600">
							Coba ubah filter atau tambah produk baru.
						</p>
					</div>
				)}
			</div>

			{/* Add/Edit Product Modal */}
			{(showAddModal || editingProduct) && (
				<ProductForm
					product={editingProduct}
					onClose={() => {
						setShowAddModal(false);
						setEditingProduct(null);
					}}
					onSave={(productData) => {
						if (editingProduct) {
							// Update existing product
							setProducts(
								products.map((p) =>
									p.id === editingProduct.id
										? {
												...p,
												...productData,
												updated_at: new Date().toISOString(),
										  }
										: p
								)
							);
						} else {
							// Add new product
							const newProduct: Product = {
								id: Date.now().toString(),
								...productData,
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							} as Product;
							setProducts([...products, newProduct]);
						}
					}}
				/>
			)}
		</div>
	);
}
