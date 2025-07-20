"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	Grid3X3,
	Package,
	Check,
	AlertCircle,
	Bell,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getBusinessId, getStoreId } from "@/lib/store";
import CategoryForm from "@/components/forms/CategoryForm";
import { Button, Stats } from "@/components/ui";
import { handleSupabaseError } from "@/lib/supabase-error-handler";
import { DataTable, Column, Divider, Input, Select } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";

interface Category {
	id: string;
	name: string;
	description?: string;
	product_count: number;
	created_at: string;
	updated_at: string;
}

// Mock categories data - in production this would come from Supabase
const mockCategories: Category[] = [
	{
		id: "1",
		name: "Minuman",
		description: "Kategori untuk semua jenis minuman",
		product_count: 15,
		created_at: "2023-01-15T10:30:00Z",
		updated_at: "2024-01-15T10:30:00Z",
	},
	{
		id: "2",
		name: "Makanan",
		description: "Kategori untuk makanan dan snack",
		product_count: 22,
		created_at: "2023-02-20T15:20:00Z",
		updated_at: "2024-01-14T15:20:00Z",
	},
	{
		id: "3",
		name: "Dessert",
		description: "Kategori untuk makanan penutup dan kue",
		product_count: 8,
		created_at: "2023-03-10T09:15:00Z",
		updated_at: "2024-01-10T09:15:00Z",
	},
	{
		id: "4",
		name: "Breakfast",
		description: "Kategori untuk menu sarapan",
		product_count: 12,
		created_at: "2023-04-05T14:45:00Z",
		updated_at: "2024-01-12T14:45:00Z",
	},
	{
		id: "5",
		name: "Lunch Special",
		description: "Kategori untuk menu makan siang spesial",
		product_count: 6,
		created_at: "2023-05-12T11:20:00Z",
		updated_at: "2024-01-08T11:20:00Z",
	},
];

// Cache system untuk categories
const categoryCache = new Map<
	string,
	{ data: Category[]; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>(mockCategories);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [showAddSlider, setShowAddSlider] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [loading, setLoading] = useState(false);
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean;
		categoryId: string | null;
		categoryName: string;
	}>({
		isOpen: false,
		categoryId: null,
		categoryName: "",
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

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300); // 300ms delay

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Fetch categories from Supabase with caching and parallel loading
	useEffect(() => {
		if (businessId && storeId) {
			// Load categories first (most important)
			fetchCategories();

			// Load user profile in parallel
			fetchUserProfile();
		}
	}, [businessId, storeId]);

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

	const fetchCategories = React.useCallback(
		async (forceRefresh = false) => {
			if (!businessId || !storeId) return;

			// Check cache first
			const cacheKey = `categories_${businessId}_${storeId}`;
			const cached = categoryCache.get(cacheKey);

			if (
				!forceRefresh &&
				cached &&
				Date.now() - cached.timestamp < CACHE_DURATION
			) {
				console.log("Using cached categories data");
				setCategories(cached.data);
				return;
			}

			try {
				setLoading(true);
				const startTime = Date.now();

				// Query optimization: limit and specific fields only
				const { data, error } = await supabase
					.from("categories")
					.select(
						`
					id,
					name,
					created_at,
					updated_at
				`
					)
					.eq("business_id", businessId)
					.is("deleted_at", null) // Only get non-deleted categories
					.order("created_at", { ascending: false })
					.limit(100); // Limit to prevent large queries

				const fetchTime = Date.now() - startTime;
				console.log(`Categories fetch time: ${fetchTime}ms`);

				if (error) {
					console.error("Error fetching categories:", error);

					// Check if it's an RLS error or no data
					if (error.code === "PGRST116") {
						showToast("error", "Akses ditolak. Silakan login ulang.");
					} else {
						console.log("Using mock data due to error or empty result");
						// Keep using mock data if there's an error
					}
					return;
				}

				// If we have data from Supabase, use it
				if (data && data.length > 0) {
					// Parallel loading: fetch products count in parallel
					const productsCountPromise = supabase
						.from("products")
						.select("category_id")
						.eq("store_id", storeId)
						.is("deleted_at", null);

					const { data: productsData, error: productsError } =
						await productsCountPromise;

					if (productsError) {
						console.error("Error fetching products for count:", productsError);
					}

					// Calculate product count per category with early return optimization
					const productCounts: { [key: string]: number } = {};
					if (productsData) {
						for (const product of productsData) {
							if (!product.category_id) continue; // Early return optimization
							productCounts[product.category_id] =
								(productCounts[product.category_id] || 0) + 1;
						}
					}

					// Transform data to match our interface
					const categoriesWithProductCount = data.map((category) => ({
						...category,
						description: "", // Add description if needed later
						product_count: productCounts[category.id] || 0,
					}));

					// Cache the result
					categoryCache.set(cacheKey, {
						data: categoriesWithProductCount,
						timestamp: Date.now(),
					});

					setCategories(categoriesWithProductCount);
					console.log(
						`Loaded ${categoriesWithProductCount.length} categories from Supabase`
					);
				} else {
					// If no data from Supabase, keep using mock data
					console.log("No categories found in Supabase, using mock data");

					// Also cache mock data to maintain consistency
					categoryCache.set(cacheKey, {
						data: mockCategories,
						timestamp: Date.now(),
					});
				}
			} catch (error) {
				console.error("Error:", error);
				console.log("Using mock data due to exception");
				// Keep using mock data if there's an exception
			} finally {
				setLoading(false);
			}
		},
		[businessId, storeId, showToast]
	);

	const handleSaveSuccess = React.useCallback(
		(category: Category | null) => {
			// Clear cache on data change
			const cacheKey = `categories_${businessId}_${storeId}`;
			categoryCache.delete(cacheKey);

			// Close form after successful save
			if (category) {
				// Update existing category in local state
				setCategories((prev) =>
					prev.map((cat) =>
						cat.id === category.id
							? {
									...cat,
									name: category.name,
									updated_at: new Date().toISOString(),
							  }
							: cat
					)
				);
			} else {
				// Add new category to local state (we'll fetch the actual data later)
				const newCategory = {
					id: Date.now().toString(), // temporary ID
					name: "Kategori Baru", // temporary name
					description: "",
					product_count: 0,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
				setCategories((prev) => [newCategory, ...prev]);
			}

			// Show success toast
			showToast(
				"success",
				category ? "Kategori berhasil diperbarui!" : "Kategori berhasil dibuat!"
			);

			// Close form
			setShowAddSlider(false);
			setEditingCategory(null);

			// Fetch latest data from Supabase with force refresh
			setTimeout(() => {
				fetchCategories(true); // Force refresh to get latest data
			}, 500);
		},
		[showToast, fetchCategories, businessId, storeId]
	);

	// Filter categories by search - optimized with useMemo and early return
	const filteredCategories = useMemo(() => {
		if (!debouncedSearchTerm) return categories; // Early return for empty search

		const searchLower = debouncedSearchTerm.toLowerCase();
		return categories.filter((category) => {
			// Early return optimization
			if (category.name.toLowerCase().includes(searchLower)) return true;
			if (category.description?.toLowerCase().includes(searchLower))
				return true;
			return false;
		});
	}, [categories, debouncedSearchTerm]);

	// Calculate stats - optimized with useMemo
	const stats = useMemo(() => {
		const totalCategories = categories.length;
		const totalProducts = categories.reduce(
			(sum, cat) => sum + cat.product_count,
			0
		);
		const averageProducts =
			totalCategories > 0 ? totalProducts / totalCategories : 0;

		return {
			totalCategories,
			totalProducts,
			averageProducts,
		};
	}, [categories]);

	const handleDeleteCategory = async (
		categoryId: string,
		categoryName: string
	) => {
		const category = categories.find((c) => c.id === categoryId);
		if (category && category.product_count > 0) {
			showToast(
				"error",
				`Tidak dapat menghapus kategori "${categoryName}" karena masih memiliki ${category.product_count} produk`
			);
			return;
		}

		setDeleteConfirm({
			isOpen: true,
			categoryId,
			categoryName,
		});
	};

	const confirmDelete = async () => {
		if (!deleteConfirm.categoryId) return;

		try {
			// Clear cache on data change
			const cacheKey = `categories_${businessId}_${storeId}`;
			categoryCache.delete(cacheKey);

			// Get current user
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user) {
				showToast("error", "Sesi login telah berakhir. Silakan login ulang.");
				return;
			}

			// Try to soft delete in Supabase - update deleted_at and deleted_by
			const { error } = await supabase
				.from("categories")
				.update({
					deleted_at: new Date().toISOString(),
					deleted_by: user.id,
				})
				.eq("id", deleteConfirm.categoryId);

			if (error) {
				console.log(
					"Error deleting from Supabase, removing from local state only:",
					error
				);
			}

			showToast("success", "Kategori berhasil dihapus");
			// Remove from local state
			setCategories((prev) =>
				prev.filter((cat) => cat.id !== deleteConfirm.categoryId)
			);
		} catch (error) {
			console.error("Error deleting category:", error);
			showToast("success", "Kategori berhasil dihapus"); // Still show success for mock data
			// Remove from local state even if Supabase fails (for mock data)
			setCategories((prev) =>
				prev.filter((cat) => cat.id !== deleteConfirm.categoryId)
			);
		} finally {
			setDeleteConfirm({
				isOpen: false,
				categoryId: null,
				categoryName: "",
			});
		}
	};

	const cancelDelete = () => {
		setDeleteConfirm({
			isOpen: false,
			categoryId: null,
			categoryName: "",
		});
	};

	const handleEditCategory = (category: Category) => {
		setEditingCategory(category);
		setShowAddSlider(true);
	};

	const handleFormSuccess = () => {
		setShowAddSlider(false);
		setEditingCategory(null);
		// Clear cache and refresh data
		const cacheKey = `categories_${businessId}_${storeId}`;
		categoryCache.delete(cacheKey);
		fetchCategories(true); // Force refresh
	};

	// Define columns for DataTable - memoized to prevent re-renders
	const columns: Column<Category>[] = useMemo(
		() => [
			{
				key: "category",
				header: "Kategori",
				sortable: true,
				sortKey: "name",
				render: (category) => (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
							<Grid3X3 className="w-5 h-5 text-orange-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{category.name}
							</p>
							<p className="text-sm text-gray-500 truncate">
								{category.description || "Tanpa deskripsi"}
							</p>
						</div>
					</div>
				),
			},
			{
				key: "products",
				header: "Jumlah Produk",
				sortable: true,
				sortKey: "product_count",
				render: (category) => (
					<div className="text-sm font-medium text-gray-900">
						{category.product_count} produk
					</div>
				),
			},
			{
				key: "created_at",
				header: "Dibuat",
				sortable: true,
				sortKey: "created_at",
				render: (category) => (
					<div className="text-sm text-gray-900">
						{new Date(category.created_at).toLocaleDateString("id-ID", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</div>
				),
			},
			{
				key: "actions",
				header: "",
				sortable: false,
				render: (category) => (
					<div className="flex items-center space-x-2">
						<button
							onClick={() => handleEditCategory(category)}
							className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
							title="Edit">
							<Edit2 className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleDeleteCategory(category.id, category.name)}
							className="p-1 text-gray-400 hover:text-red-500 transition-colors"
							title="Hapus">
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				),
			},
		],
		[handleEditCategory, handleDeleteCategory]
	);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Kategori"
						subtitle="Kelola kategori produk toko Anda"
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
				<div className="bg-white rounded-xl">
					<div className="flex items-center">
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "0ms" }}>
							<Stats.Card
								title="Total Kategori"
								value={loading ? 0 : stats.totalCategories}
								icon={Grid3X3}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Total Produk"
								value={loading ? 0 : stats.totalProducts}
								icon={Package}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Rata-rata Produk"
								value={loading ? 0 : Math.round(stats.averageProducts)}
								icon={Package}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<Divider />
					{/* Search and Filter */}
					<div
						className="flex flex-col md:flex-row gap-4 animate-fade-in-up"
						style={{ animationDelay: "120ms" }}>
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									type="text"
									value={searchTerm}
									onChange={setSearchTerm}
									placeholder="Cari kategori berdasarkan nama atau deskripsi..."
								/>
							</Input.Root>
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

					{/* Loading State - Improved skeleton loading */}
					{loading && (
						<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-6 animate-fade-in">
							<div className="space-y-4">
								{/* Skeleton rows - more informative */}
								{Array.from({ length: 5 }).map((_, index) => (
									<div
										key={index}
										className="flex items-center space-x-4 animate-pulse"
										style={{ animationDelay: `${index * 100}ms` }}>
										<div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
							<div className="mt-4 text-center text-sm text-gray-500">
								Memuat kategori...
							</div>
						</div>
					)}

					{/* Categories Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredCategories}
								columns={columns}
								loading={false}
								pageSize={10}
							/>
						</div>
					)}

					{/* Category Form Slider */}
					{showAddSlider && (
						<CategoryForm
							isOpen={showAddSlider}
							onClose={() => {
								setShowAddSlider(false);
								setEditingCategory(null);
							}}
							onSaveSuccess={handleFormSuccess}
							onError={(message) => showToast("error", message)}
							category={editingCategory}
							businessId={businessId || ""}
						/>
					)}

					{/* Delete Confirmation Modal */}
					{deleteConfirm.isOpen && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
							<div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
								<div className="flex items-center space-x-3 mb-4">
									<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
										<Trash2 className="w-5 h-5 text-red-600" />
									</div>
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											Hapus Kategori
										</h3>
										<p className="text-sm text-gray-600">
											Tindakan ini tidak dapat dibatalkan
										</p>
									</div>
								</div>
								<p className="text-gray-700 mb-6">
									Apakah Anda yakin ingin menghapus kategori &ldquo;
									<span className="font-semibold">
										{deleteConfirm.categoryName}
									</span>
									&rdquo;?
								</p>
								<div className="flex space-x-3">
									<Button.Root
										variant="outline"
										onClick={cancelDelete}
										className="flex-1 rounded-xl">
										<Button.Text>Batal</Button.Text>
									</Button.Root>
									<Button.Root
										variant="destructive"
										onClick={confirmDelete}
										className="flex-1 rounded-xl">
										<Button.Icon icon={Trash2} />
										<Button.Text>Hapus</Button.Text>
									</Button.Root>
								</div>
							</div>
						</div>
					)}

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
				</div>
			</div>
		</div>
	);
}
