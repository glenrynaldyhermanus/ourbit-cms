"use client";

import React, { useState, useEffect, useMemo } from "react";
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
	Bell,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductForm from "@/components/forms/ProductForm";
import { Button, Stats } from "@/components/ui";
import { getBusinessId, getStoreId } from "@/lib/store";
import { handleSupabaseError } from "@/lib/supabase-error-handler";
import { DataTable, Column, Divider, Input, Select } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";

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

// Cache untuk menyimpan data sementara
const productCache = new Map<string, { data: Product[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

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
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [isSelectOpen, setIsSelectOpen] = useState(false);
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;

			// Check if click is outside the dropdown
			if (
				isSelectOpen &&
				dropdownRef.current &&
				!dropdownRef.current.contains(target)
			) {
				setIsSelectOpen(false);
			}
		};

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isSelectOpen) {
				setIsSelectOpen(false);
			}
		};

		// Add event listeners when dropdown is open
		if (isSelectOpen) {
			// Use setTimeout to ensure the event listener is added after the dropdown is rendered
			setTimeout(() => {
				document.addEventListener("mousedown", handleClickOutside);
				document.addEventListener("keydown", handleEscapeKey);
			}, 0);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isSelectOpen]);
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean;
		productId: string | null;
		productName: string;
	}>({
		isOpen: false,
		productId: null,
		productName: "",
	});

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

	const fetchProducts = React.useCallback(
		async (forceRefresh = false) => {
			try {
				if (!storeId) {
					console.error("Store ID not found in localStorage");
					showToast("error", "Store ID tidak ditemukan. Silakan login ulang.");
					return;
				}

				// Check cache first
				const cacheKey = `products_${storeId}`;
				const cached = productCache.get(cacheKey);

				if (
					!forceRefresh &&
					cached &&
					Date.now() - cached.timestamp < CACHE_DURATION
				) {
					console.log("Using cached products data");
					setProducts(cached.data);
					setLoading(false);
					return;
				}

				setLoading(true);

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

				// Optimized query - hanya ambil field yang diperlukan
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
					.is("deleted_at", null)
					.order("created_at", { ascending: false })
					.limit(1000); // Tambahkan limit untuk mencegah query terlalu besar

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

				// Cache the result
				productCache.set(cacheKey, {
					data: productsWithCategory,
					timestamp: Date.now(),
				});

				setProducts(productsWithCategory);
			} catch (error) {
				console.error("Error:", error);
				showToast("error", "Terjadi kesalahan saat memuat produk");
			} finally {
				setLoading(false);
			}
		},
		[storeId, showToast]
	);

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
				value: option.value,
			}));
			setProductTypes(types);
		} catch (error) {
			console.error("Error fetching product types:", error);
			showToast("error", "Terjadi kesalahan saat memuat tipe produk");
		}
	}, [showToast]);

	const fetchUserProfile = React.useCallback(async () => {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				console.error("Error fetching user:", error);
				return;
			}

			setUserProfile({
				name:
					user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
				email: user.email || "user@example.com",
				avatar: user.user_metadata?.avatar_url,
			});
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	}, []);

	// Fetch products and categories from Supabase - parallel loading
	useEffect(() => {
		if (businessId && storeId) {
			// Load products first (most important)
			fetchProducts();

			// Load other data in parallel
			Promise.all([
				fetchCategories(),
				fetchProductTypes(),
				fetchUserProfile(),
			]).catch((error) => {
				console.error("Error loading parallel data:", error);
			});
		}
	}, [
		businessId,
		storeId,
		fetchProducts,
		fetchCategories,
		fetchProductTypes,
		fetchUserProfile,
	]);

	const handleDeleteProduct = async (
		productId: string,
		productName: string
	) => {
		setDeleteConfirm({
			isOpen: true,
			productId,
			productName,
		});
	};

	const confirmDelete = async () => {
		if (!deleteConfirm.productId) return;

		try {
			// Get current user
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user) {
				showToast("error", "Sesi login telah berakhir. Silakan login ulang.");
				return;
			}

			// Soft delete - update deleted_at and deleted_by
			const { error } = await supabase
				.from("products")
				.update({
					deleted_at: new Date().toISOString(),
					deleted_by: user.id,
				})
				.eq("id", deleteConfirm.productId);

			const errorResult = handleSupabaseError(error, {
				operation: "menghapus",
				entity: "produk",
				showToast: showToast,
			});

			if (!errorResult.success) {
				return;
			}

			showToast("success", "Produk berhasil dihapus");
			// Clear cache and refresh
			productCache.clear();
			fetchProducts(true);
		} catch (error) {
			console.error("Error deleting product:", error);
			showToast("error", "Terjadi kesalahan saat menghapus produk");
		} finally {
			setDeleteConfirm({
				isOpen: false,
				productId: null,
				productName: "",
			});
		}
	};

	const cancelDelete = () => {
		setDeleteConfirm({
			isOpen: false,
			productId: null,
			productName: "",
		});
	};

	const handleEditProduct = (product: Product) => {
		setEditingProduct(product);
		setShowAddSlider(true);
	};

	const handleFormSuccess = () => {
		setShowAddSlider(false);
		setEditingProduct(null);
		fetchProducts(true); // Force refresh after form submission
	};

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300); // 300ms delay

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Filter products by category and search - optimized with useMemo
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			// Category filter
			const categoryMatch =
				!selectedCategory ||
				(selectedCategory === "no-category"
					? !product.category_id
					: product.category_id === selectedCategory);

			// Search filter - optimized with early return
			if (debouncedSearchTerm) {
				const searchLower = debouncedSearchTerm.toLowerCase();
				const nameMatch = product.name.toLowerCase().includes(searchLower);
				const codeMatch =
					product.code?.toLowerCase().includes(searchLower) ?? false;
				const descMatch =
					product.description?.toLowerCase().includes(searchLower) ?? false;

				if (!nameMatch && !codeMatch && !descMatch) {
					return false;
				}
			}

			return categoryMatch;
		});
	}, [products, selectedCategory, debouncedSearchTerm]);

	// Calculate total stock value - optimized with useMemo
	const totalValue = useMemo(() => {
		return products.reduce(
			(sum, product) => sum + product.selling_price * product.stock,
			0
		);
	}, [products]);

	// Calculate low stock count - optimized with useMemo
	const lowStockCount = useMemo(() => {
		return products.filter((product) => product.stock <= 10).length;
	}, [products]);

	// Define columns for DataTable - memoized to prevent re-renders
	const columns: Column<Product>[] = useMemo(
		() => [
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
									loading="lazy"
									placeholder="blur"
									blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
							onClick={() => handleDeleteProduct(product.id, product.name)}
							className="p-1 text-gray-400 hover:text-red-500 transition-colors"
							title="Hapus">
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				),
			},
		],
		[]
	);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Produk"
						subtitle="Kelola produk dan inventory toko Anda"
						notificationButton={{
							icon: Bell,
							onClick: () => {
								// Handle notification click
								console.log("Notification clicked");
							},
							count: 3, // Example notification count
						}}
						profileButton={{
							avatar: userProfile?.avatar,
							name: userProfile?.name,
							email: userProfile?.email,
							onClick: () => {
								// Handle profile click - redirect to profile page
								window.location.href = "/admin/settings/profile";
							},
						}}
					/>
				</div>

				{/* Divider */}
				<div className="animate-fade-in" style={{ animationDelay: "30ms" }}>
					<Divider />
				</div>

				{/* Stats Cards */}
				<Stats.Grid>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "0ms" }}>
						<Stats.Card
							title="Total Produk"
							value={loading ? 0 : products.length}
							icon={Package}
							iconColor="bg-orange-500/10 text-orange-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "30ms" }}>
						<Stats.Card
							title="Nilai Total Stok"
							value={
								loading
									? "Rp 0"
									: new Intl.NumberFormat("id-ID", {
											style: "currency",
											currency: "IDR",
											minimumFractionDigits: 0,
											maximumFractionDigits: 0,
									  }).format(totalValue)
							}
							icon={DollarSign}
							iconColor="bg-green-500/10 text-green-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "60ms" }}>
						<Stats.Card
							title="Stok Menipis"
							value={loading ? 0 : lowStockCount}
							icon={ShoppingCart}
							iconColor="bg-red-500/10 text-red-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "90ms" }}>
						<Stats.Card
							title="Kategori"
							value={loading ? 0 : categories.length}
							icon={Package}
							iconColor="bg-yellow-500/10 text-yellow-600"
						/>
					</div>
				</Stats.Grid>

				<div className="space-y-8">
					<Divider />
					{/* Search and Filter */}
					<div
						className="flex flex-col md:flex-row gap-4 animate-fade-in-up relative z-20"
						style={{ animationDelay: "120ms" }}>
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									type="text"
									value={searchTerm}
									onChange={setSearchTerm}
									placeholder="Cari produk berdasarkan nama, kode, atau deskripsi..."
								/>
							</Input.Root>
						</div>
						<div
							ref={dropdownRef}
							className="md:w-64 select-dropdown relative z-30">
							<Select.Root>
								<Select.Trigger
									value={selectedCategory}
									placeholder="Semua Kategori"
									onClick={() => setIsSelectOpen(!isSelectOpen)}
									open={isSelectOpen}
								/>
								<Select.Content open={isSelectOpen}>
									<Select.Item
										value=""
										onClick={() => {
											setSelectedCategory("");
											setIsSelectOpen(false);
										}}
										selected={selectedCategory === ""}>
										Semua Kategori
									</Select.Item>
									<Select.Item
										value="no-category"
										onClick={() => {
											setSelectedCategory("no-category");
											setIsSelectOpen(false);
										}}
										selected={selectedCategory === "no-category"}>
										Tanpa Kategori
									</Select.Item>
									{categories.map((category) => (
										<Select.Item
											key={category.id}
											value={category.id}
											onClick={() => {
												setSelectedCategory(category.id);
												setIsSelectOpen(false);
											}}
											selected={selectedCategory === category.id}>
											{category.name}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</div>
						<div className="md:w-auto">
							<Button.Root
								variant="default"
								onClick={() => setShowAddSlider(true)}
								disabled={loading}
								className="rounded-xl w-full md:w-auto">
								<Button.Icon icon={Plus} />
								<Button.Text>Tambah</Button.Text>
							</Button.Root>
						</div>
					</div>

					{/* Loading State */}
					{loading && (
						<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-6 animate-fade-in">
							<div className="space-y-4">
								{/* Skeleton rows */}
								{Array.from({ length: 5 }).map((_, index) => (
									<div
										key={index}
										className="flex items-center space-x-4 animate-pulse">
										<div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
										<div className="flex-1 space-y-2">
											<div className="h-4 bg-gray-200 rounded w-3/4"></div>
											<div className="h-3 bg-gray-200 rounded w-1/2"></div>
										</div>
										<div className="h-4 bg-gray-200 rounded w-20"></div>
										<div className="h-4 bg-gray-200 rounded w-24"></div>
										<div className="h-4 bg-gray-200 rounded w-20"></div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Products Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredProducts}
								columns={columns}
								loading={false}
								pageSize={10}
							/>
						</div>
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
				</div>

				{/* Toast */}
				{toast && (
					<div className="fixed bottom-4 left-4 z-[9999] pointer-events-none transform transition-all duration-300 ease-out animate-slide-in-right">
						<div
							className={`px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 ease-out ${
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

				{/* Delete Confirmation Modal */}
				{deleteConfirm.isOpen && (
					<div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
						<div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
									<AlertCircle className="w-5 h-5 text-red-600" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Konfirmasi Hapus
									</h3>
									<p className="text-sm text-gray-500">
										Tindakan ini tidak dapat dibatalkan
									</p>
								</div>
							</div>
							<div className="mb-6">
								<p className="text-gray-700">
									Apakah Anda yakin ingin menghapus produk{" "}
									<span className="font-semibold text-gray-900">
										&ldquo;{deleteConfirm.productName}&rdquo;
									</span>
									?
								</p>
								<p className="text-sm text-gray-500 mt-2">
									Produk akan dihapus dari sistem tetapi data tetap tersimpan
									untuk keperluan audit.
								</p>
							</div>
							<div className="flex space-x-3">
								<Button.Root
									variant="outline"
									onClick={cancelDelete}
									className="flex-1">
									<Button.Text>Batal</Button.Text>
								</Button.Root>
								<Button.Root
									variant="destructive"
									onClick={confirmDelete}
									className="flex-1">
									<Button.Text>Hapus</Button.Text>
								</Button.Root>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
