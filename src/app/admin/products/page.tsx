"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
	Plus,
	Package,
	ShoppingCart,
	DollarSign,
	Image as ImageIcon,
	Check,
	AlertCircle,
	Edit2,
	Trash2,
	TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductForm from "@/components/form/product-form";
import { PrimaryButton } from "@/components/button/button";
import { getBusinessId, getStoreId } from "@/lib/store";
import { handleSupabaseError } from "@/lib/supabase-error-handler";
import { DataTable, Column } from "@/components/table/data-table";

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
	const [showAddSlider, setShowAddSlider] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
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
				.select("*")
				.eq("business_id", businessId)
				.order("name");

			const errorResult = handleSupabaseError(error, {
				operation: "memuat",
				entity: "kategori",
				showToast: showToast,
			});

			if (!errorResult.success) {
				return;
			}

			setCategories(data || []);
		} catch (error) {
			console.error("Error fetching categories:", error);
			showToast("error", "Terjadi kesalahan saat memuat kategori");
		}
	}, [businessId, showToast]);

	const fetchProductTypes = React.useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("options")
				.select("*")
				.eq("type", "product_type")
				.order("name");

			const errorResult = handleSupabaseError(error, {
				operation: "memuat",
				entity: "tipe produk",
				showToast: showToast,
			});

			if (!errorResult.success) {
				return;
			}

			const types = (data || []).map((option) => ({
				key: option.key,
				value: option.name,
			}));
			setProductTypes(types);
		} catch (error) {
			console.error("Error fetching product types:", error);
			showToast("error", "Terjadi kesalahan saat memuat tipe produk");
		}
	}, [showToast]);

	const handleDeleteProduct = async (productId: string) => {
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

			showToast("success", "Produk berhasil dihapus");
			fetchProducts();
		} catch (error) {
			console.error("Error deleting product:", error);
			showToast("error", "Terjadi kesalahan saat menghapus produk");
		}
	};

	const handleEditProduct = (product: Product) => {
		setEditingProduct(product);
		setShowAddSlider(true);
	};

	const handleFormSuccess = () => {
		setShowAddSlider(false);
		setEditingProduct(null);
		fetchProducts();
	};

	// Filter products by category and search
	const filteredProducts = products.filter((product) => {
		// Category filter
		const categoryMatch =
			!selectedCategory ||
			(selectedCategory === "no-category"
				? !product.category_id
				: product.category_id === selectedCategory);

		// Search filter
		const searchMatch =
			!searchTerm ||
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false) ||
			(product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false);

		return categoryMatch && searchMatch;
	});

	// Calculate total stock value
	const totalValue = products.reduce(
		(sum, product) => sum + product.selling_price * product.stock,
		0
	);

	// Define columns for DataTable
	const columns: Column<Product>[] = [
		{
			key: "product",
			header: "Produk",
			sortable: true,
			sortKey: "name",
			render: (product) => (
				<div className="flex items-center space-x-3">
					<div className="flex-shrink-0">
						{product.image_url ? (
							<Image
								src={product.image_url}
								alt={product.name}
								width={48}
								height={48}
								className="w-12 h-12 rounded-lg object-cover"
							/>
						) : (
							<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
								<ImageIcon className="w-6 h-6 text-gray-400" />
							</div>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{product.name}
						</p>
						<p className="text-sm text-gray-500 truncate">
							{product.code || "Tanpa Kode"}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "category",
			header: "Kategori",
			sortable: true,
			sortKey: "category_name",
			render: (product) => (
				<div className="text-sm text-gray-900">
					{product.category_name || "Tanpa Kategori"}
				</div>
			),
		},
		{
			key: "stock",
			header: "Stok",
			sortable: true,
			sortKey: "stock",
			render: (product) => (
				<div className="text-sm text-gray-900">
					<div className="font-medium">
						{product.stock} {product.unit || "pcs"}
					</div>
					<div className="text-xs text-gray-500">
						Min: {product.min_stock} {product.unit || "pcs"}
					</div>
				</div>
			),
		},
		{
			key: "selling_price",
			header: "Harga Jual",
			sortable: true,
			sortKey: "selling_price",
			render: (product) => (
				<div className="text-sm font-medium text-gray-900">
					{new Intl.NumberFormat("id-ID", {
						style: "currency",
						currency: "IDR",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}).format(product.selling_price)}
				</div>
			),
		},
		{
			key: "purchase_price",
			header: "Harga Beli",
			sortable: true,
			sortKey: "purchase_price",
			render: (product) => (
				<div className="text-sm text-gray-900">
					{new Intl.NumberFormat("id-ID", {
						style: "currency",
						currency: "IDR",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}).format(product.purchase_price)}
				</div>
			),
		},
		{
			key: "stock_value",
			header: "Nilai Stok",
			sortable: false,
			render: (product) => (
				<div className="text-sm font-medium text-gray-900">
					{new Intl.NumberFormat("id-ID", {
						style: "currency",
						currency: "IDR",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}).format(product.selling_price * product.stock)}
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			sortKey: "is_active",
			render: (product) => (
				<div className="flex flex-wrap gap-1">
					{/* Status Aktif */}
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
							product.is_active
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}>
						{product.is_active ? (
							<>
								<Check className="w-3 h-3 mr-1" />
								Aktif
							</>
						) : (
							<>
								<AlertCircle className="w-3 h-3 mr-1" />
								Nonaktif
							</>
						)}
					</span>

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
				</div>
			),
		},
		{
			key: "actions",
			header: "",
			sortable: false,
			render: (product) => (
				<div className="flex items-center space-x-2">
					<button
						onClick={() => handleEditProduct(product)}
						className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
						title="Edit">
						<Edit2 className="w-4 h-4" />
					</button>
					<button
						onClick={() => handleDeleteProduct(product.id)}
						className="p-1 text-gray-400 hover:text-red-500 transition-colors"
						title="Hapus">
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			),
		},
	];

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
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
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
									{loading
										? "..."
										: products.filter((product) => product.stock <= 10).length}
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
				<div className="bg-white rounded-lg border border-[#D1D5DB] p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Cari produk berdasarkan nama, kode, atau deskripsi..."
								className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
							/>
						</div>
						<div className="md:w-64">
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']">
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
					<DataTable
						data={filteredProducts}
						columns={columns}
						loading={false}
						pageSize={10}
					/>
				)}

				{/* Product Form Slider */}
				{showAddSlider && (
					<ProductForm
						isOpen={showAddSlider}
						onClose={() => {
							setShowAddSlider(false);
							setEditingProduct(null);
						}}
						onSaveSuccess={handleFormSuccess}
						onError={(message) => showToast("error", message)}
						product={editingProduct}
						categories={categories}
						productTypes={productTypes}
						storeId={storeId || ""}
					/>
				)}

				{/* Toast */}
				{toast && (
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
				)}
			</div>
		</div>
	);
}
