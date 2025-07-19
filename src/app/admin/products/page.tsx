"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
	Plus,
	Search,
	Package,
	ShoppingCart,
	DollarSign,
	Image as ImageIcon,
	Check,
	AlertCircle,
	Edit2,
	Trash2,
	ChevronUp,
	ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductForm from "@/components/form/product-form";
import { PrimaryButton } from "@/components/button/button";
import { getBusinessId, getStoreId } from "@/lib/store";
import { handleSupabaseError } from "@/lib/supabase-error-handler";

interface Product {
	id: string;
	name: string;
	description?: string;
	selling_price: number;
	purchase_price: number;
	category_id?: string;
	category_name?: string;
	stock: number;
	code: string;
	image_url?: string;
	type: string;
	unit?: string;
	weight_grams: number;
	rack_location?: string;
	min_stock: number;
	is_active?: boolean;
	created_at: string;
	updated_at: string;
	store_id: string;
}

interface Category {
	id: string;
	name: string;
}

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [productTypes, setProductTypes] = useState<
		{ key: string; value: string }[]
	>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [showAddSlider, setShowAddSlider] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	} | null>(null);

	const showToast = React.useCallback(
		(type: "success" | "error", message: string) => {
			setToast({ type, message });
			setTimeout(() => setToast(null), 3000);
		},
		[]
	);

	// Get business ID and store ID from localStorage
	useEffect(() => {
		const currentBusinessId = getBusinessId();
		const currentStoreId = getStoreId();
		console.log("Business ID from localStorage:", currentBusinessId);
		console.log("Store ID from localStorage:", currentStoreId);
		setBusinessId(currentBusinessId);
		setStoreId(currentStoreId);
	}, []);

	// Fetch products and categories from Supabase
	useEffect(() => {
		if (businessId && storeId) {
			fetchProducts();
			fetchCategories();
			fetchProductTypes();
		}
	}, [businessId, storeId]);

	const fetchProducts = React.useCallback(async () => {
		try {
			setLoading(true);

			if (!storeId) {
				console.error("Store ID not found in localStorage");
				showToast("error", "Store ID tidak ditemukan. Silakan login ulang.");
				return;
			}

			// Check if user is authenticated
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();
			console.log("Auth check:", { user, authError });

			if (authError || !user) {
				console.error("User not authenticated:", authError);
				showToast("error", "Sesi login telah berakhir. Silakan login ulang.");
				return;
			}

			console.log("Fetching products for store ID:", storeId);

			// Try to get products with store filter
			const { data, error } = await supabase
				.from("products")
				.select(
					`
					id,
					name,
					description,
					selling_price,
					purchase_price,
					category_id,
					stock,
					code,
					image_url,
					type,
					unit,
					weight_grams,
					rack_location,
					min_stock,
					is_active,
					created_at,
					updated_at,
					store_id,
					categories!left (
						name
					)
				`
				)
				.eq("store_id", storeId)
				.order("created_at", { ascending: false });

			console.log("Products response:", { data, error });
			console.log("Sample product is_active:", data?.[0]?.is_active);

			const errorResult = handleSupabaseError(error, {
				operation: "memuat",
				entity: "produk",
				showToast: showToast,
			});

			if (!errorResult.success) {
				return;
			}

			// Transform data to match our interface
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const productsWithCategory = (data || []).map((product: any) => ({
				...product,
				category_name: product.categories?.name || "Tanpa Kategori",
				store_id: product.store_id || "",
			}));

			console.log("Transformed products:", productsWithCategory);
			setProducts(productsWithCategory);
		} catch (error) {
			console.error("Error:", error);
			showToast("error", "Terjadi kesalahan saat memuat produk");
		} finally {
			setLoading(false);
		}
	}, [storeId, showToast]);

	const fetchCategories = React.useCallback(async () => {
		try {
			if (!businessId) {
				console.error("Business ID not found in localStorage");
				return;
			}

			const { data, error } = await supabase
				.from("categories")
				.select("id, name")
				.eq("business_id", businessId)
				.order("name", { ascending: true });

			if (error) {
				console.error("Error fetching categories:", error);
				return;
			}

			setCategories(data || []);
		} catch (error) {
			console.error("Error:", error);
		}
	}, [businessId]);

	const fetchProductTypes = React.useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("options")
				.select("key, value")
				.eq("type", "product_type")
				.order("value", { ascending: true });

			if (error) {
				console.error("Error fetching product types:", error);
				return;
			}

			setProductTypes(data || []);
		} catch (error) {
			console.error("Error:", error);
		}
	}, []);

	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false);

		const matchesCategory =
			!selectedCategory ||
			(selectedCategory === "no-category"
				? !product.category_id
				: product.category_id === selectedCategory);

		return matchesSearch && matchesCategory;
	});

	const totalValue = products.reduce(
		(sum, product) => sum + product.selling_price * product.stock,
		0
	);

	const lowStockProducts = products.filter(
		(product) => product.stock <= 10
	).length;

	// Sorting function
	const handleSort = (key: string) => {
		let direction: "asc" | "desc" = "asc";

		if (
			sortConfig &&
			sortConfig.key === key &&
			sortConfig.direction === "asc"
		) {
			direction = "desc";
		}

		setSortConfig({ key, direction });
	};

	// Sort products
	const sortedProducts = React.useMemo(() => {
		if (!sortConfig) return filteredProducts;

		return [...filteredProducts].sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortConfig.key) {
				case "name":
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case "code":
					aValue = a.code.toLowerCase();
					bValue = b.code.toLowerCase();
					break;
				case "category":
					aValue = a.category_name?.toLowerCase() || "";
					bValue = b.category_name?.toLowerCase() || "";
					break;
				case "stock":
					aValue = a.stock;
					bValue = b.stock;
					break;
				case "selling_price":
					aValue = a.selling_price;
					bValue = b.selling_price;
					break;
				case "purchase_price":
					aValue = a.purchase_price;
					bValue = b.purchase_price;
					break;
				case "stock_value":
					aValue = a.selling_price * a.stock;
					bValue = b.selling_price * b.stock;
					break;
				case "is_active":
					aValue = a.is_active ? 1 : 0;
					bValue = b.is_active ? 1 : 0;
					break;
				default:
					return 0;
			}

			if (aValue < bValue) {
				return sortConfig.direction === "asc" ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.direction === "asc" ? 1 : -1;
			}
			return 0;
		});
	}, [filteredProducts, sortConfig]);

	// Sortable header component
	const SortableHeader = ({
		children,
		sortKey,
		className = "",
	}: {
		children: React.ReactNode;
		sortKey: string;
		className?: string;
	}) => {
		const isActive = sortConfig?.key === sortKey;
		const isAsc = isActive && sortConfig.direction === "asc";
		const isDesc = isActive && sortConfig.direction === "desc";

		return (
			<th
				className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
				onClick={() => handleSort(sortKey)}>
				<div className="flex items-center space-x-1">
					<span>{children}</span>
					<div className="flex flex-col -space-y-1">
						<ChevronUp
							className={`w-3 h-3 ${
								isAsc ? "text-[#FF5701]" : "text-gray-400"
							}`}
						/>
						<ChevronDown
							className={`w-3 h-3 ${
								isDesc ? "text-[#FF5701]" : "text-gray-400"
							}`}
						/>
					</div>
				</div>
			</th>
		);
	};

	// Toast Component sederhana tanpa animasi yang mempengaruhi layout
	const ToastComponent = React.useCallback(() => {
		if (!toast) return null;

		return (
			<div className="fixed bottom-4 left-4 z-[9999] pointer-events-none transform transition-all duration-300 ease-out">
				<div
					className={`px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-out ${
						toast.type === "success"
							? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white"
							: "bg-gradient-to-r from-[#EF476F] to-[#DC2626] text-white"
					}`}>
					<div className="flex items-center space-x-3">
						<div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
							{toast.type === "success" ? (
								<Check className="w-3 h-3" />
							) : (
								<AlertCircle className="w-3 h-3" />
							)}
						</div>
						<span className="font-semibold font-['Inter']">
							{toast.message}
						</span>
					</div>
				</div>
			</div>
		);
	}, [toast]);

	const handleDeleteProduct = async (productId: string) => {
		if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
			try {
				const { error } = await supabase
					.from("products")
					.delete()
					.eq("id", productId);

				const errorResult = handleSupabaseError(error, {
					operation: "menghapus",
					entity: "produk",
					showToast: showToast,
				});

				if (!errorResult.success) {
					return;
				}

				// Update local state
				setProducts(products.filter((p) => p.id !== productId));
				showToast("success", "Produk berhasil dihapus!");
			} catch (error) {
				console.error("Error:", error);
				showToast("error", "Gagal menghapus produk!");
			}
		}
	};

	return (
		<div className="min-h-screen bg-[#EFEDED] p-2">
			<div className="max-w mx-auto space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-semibold text-[#191919] mb-2 font-['Inter']">
							Manajemen Produk
						</h1>
						<p className="text-[#4A4A4A] font-['Inter']">
							Kelola produk dan inventory toko Anda
						</p>
					</div>
					<PrimaryButton
						onClick={() => setShowAddSlider(true)}
						disabled={loading}
						iconLeading={Plus}>
						Tambah
					</PrimaryButton>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Total Produk
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter']">
									{loading ? "..." : products.length}
								</p>
							</div>
							<div className="p-3 bg-[#FF5701]/10 rounded-full">
								<Package className="w-6 h-6 text-[#FF5701]" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Nilai Total Stok
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter']">
									{loading
										? "..."
										: new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
										  }).format(totalValue)}
								</p>
							</div>
							<div className="p-3 bg-[#249689]/10 rounded-full">
								<DollarSign className="w-6 h-6 text-[#249689]" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Stok Menipis
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter']">
									{loading ? "..." : lowStockProducts}
								</p>
							</div>
							<div className="p-3 bg-[#EF476F]/10 rounded-full">
								<ShoppingCart className="w-6 h-6 text-[#EF476F]" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Kategori
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter']">
									{loading ? "..." : categories.length}
								</p>
							</div>
							<div className="p-3 bg-[#FFD166]/10 rounded-full">
								<Package className="w-6 h-6 text-[#FFD166]" />
							</div>
						</div>
					</div>
				</div>

				{/* Search and Filter */}
				<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A4A4A] w-4 h-4" />
							<input
								type="text"
								placeholder="Cari produk, SKU, atau deskripsi..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								disabled={loading}
								className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter'] disabled:opacity-50"
							/>
						</div>
						<div className="md:w-64">
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								disabled={loading}
								className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter'] disabled:opacity-50">
								<option value="">Semua Kategori</option>
								<option value="no-category">Tanpa Kategori</option>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-12 text-center">
						<div className="w-8 h-8 border-2 border-[#FF5701] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<p className="text-[#4A4A4A] font-['Inter']">Memuat produk...</p>
					</div>
				)}

				{/* Products Table */}
				{!loading && (
					<div className="bg-white rounded-xl shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<SortableHeader sortKey="name">Produk</SortableHeader>
										<SortableHeader sortKey="category">Kategori</SortableHeader>
										<SortableHeader sortKey="stock">Stok</SortableHeader>
										<SortableHeader sortKey="selling_price">
											Harga Jual
										</SortableHeader>
										<SortableHeader sortKey="purchase_price">
											Harga Beli
										</SortableHeader>
										<SortableHeader sortKey="stock_value">
											Nilai Stok
										</SortableHeader>
										<SortableHeader sortKey="is_active">Status</SortableHeader>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{sortedProducts.map((product) => (
										<tr key={product.id} className="hover:bg-gray-50">
											<td className="px-6 py-4">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10">
														{product.image_url ? (
															<Image
																className="h-10 w-10 rounded-lg object-cover"
																src={product.image_url}
																alt={product.name}
																width={40}
																height={40}
															/>
														) : (
															<div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
																<ImageIcon className="h-6 w-6 text-gray-400" />
															</div>
														)}
													</div>
													<div className="ml-4 min-w-0 flex-1">
														<div className="text-sm font-medium text-gray-900 truncate">
															{product.name}
														</div>
														<div className="text-sm text-gray-500 truncate">
															SKU: {product.code}
														</div>
														{product.description && (
															<div className="text-xs text-gray-400 truncate">
																{product.description}
															</div>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="text-sm text-gray-900">
													{product.category_name}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-900">
													{product.stock} {product.unit || "pcs"}
												</div>
												<div className="text-xs text-gray-500">
													Min: {product.min_stock} {product.unit || "pcs"}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm font-medium text-gray-900">
													{new Intl.NumberFormat("id-ID", {
														style: "currency",
														currency: "IDR",
													}).format(product.selling_price)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-900">
													{new Intl.NumberFormat("id-ID", {
														style: "currency",
														currency: "IDR",
													}).format(product.purchase_price)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm font-medium text-gray-900">
													{new Intl.NumberFormat("id-ID", {
														style: "currency",
														currency: "IDR",
													}).format(product.selling_price * product.stock)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex flex-wrap gap-1">
													{/* Status Stok */}
													<span
														className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
															product.stock <= 10
																? "bg-red-100 text-red-800"
																: product.stock <= product.min_stock
																? "bg-yellow-100 text-yellow-800"
																: "bg-green-100 text-green-800"
														}`}>
														{product.stock <= 10
															? "Stok Habis"
															: product.stock <= product.min_stock
															? "Stok Menipis"
															: "Stok Normal"}
													</span>
													{/* Status Aktif */}
													<span
														className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
															product.is_active
																? "bg-green-100 text-green-800"
																: "bg-gray-100 text-gray-800"
														}`}>
														{product.is_active ? "Aktif" : "Tidak Aktif"}
													</span>
												</div>
											</td>
											<td className="px-6 py-4 text-sm font-medium">
												<div className="flex items-center space-x-2">
													<button
														onClick={() => setEditingProduct(product)}
														className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors">
														<Edit2 className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDeleteProduct(product.id)}
														className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors">
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Empty State */}
				{!loading && sortedProducts.length === 0 && (
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-12 text-center">
						<Package className="w-12 h-12 text-[#4A4A4A]/50 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-[#191919] mb-2 font-['Inter']">
							{searchTerm || selectedCategory
								? "Tidak ada produk ditemukan"
								: "Belum ada produk"}
						</h3>
						<p className="text-[#4A4A4A] mb-6 font-['Inter']">
							{searchTerm || selectedCategory
								? "Coba ubah kata kunci pencarian atau filter Anda."
								: "Mulai dengan menambahkan produk pertama untuk toko Anda."}
						</p>
						{!searchTerm && !selectedCategory && (
							<div className="flex justify-center">
								<PrimaryButton onClick={() => setShowAddSlider(true)}>
									Tambah Produk Pertama
								</PrimaryButton>
							</div>
						)}
					</div>
				)}

				{/* Add/Edit Product Form */}
				<ProductForm
					product={editingProduct}
					isOpen={showAddSlider || !!editingProduct}
					onClose={() => {
						setShowAddSlider(false);
						setEditingProduct(null);
					}}
					onSaveSuccess={async () => {
						await fetchProducts();
						setShowAddSlider(false);
						setEditingProduct(null);
						showToast("success", "Produk berhasil disimpan!");
					}}
					onError={(msg) => showToast("error", msg)}
					categories={categories}
					productTypes={productTypes}
					storeId={storeId || ""}
				/>
			</div>

			{/* Toast Component - di luar container utama */}
			<ToastComponent />
		</div>
	);
}
