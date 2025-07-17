"use client";

import React, { useState, useEffect } from "react";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	Grid3X3,
	Package,
	Eye,
	Check,
	AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getStoreId } from "@/lib/store";
import CategoryForm from "@/components/form/category-form";

interface Category {
	id: string;
	name: string;
	description?: string;
	product_count: number;
	created_at: string;
	updated_at: string;
}

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddSlider, setShowAddSlider] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [loading, setLoading] = useState(true);
	const [storeId, setStoreId] = useState<string | null>(null);
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

	// Get store ID from localStorage
	useEffect(() => {
		const currentStoreId = getStoreId();
		setStoreId(currentStoreId);
	}, []);

	// Fetch categories from Supabase
	useEffect(() => {
		if (storeId) {
			fetchCategories();
		}
	}, [storeId]);

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

	const handleSaveSuccess = React.useCallback(
		(category: Category | null) => {
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
		},
		[showToast]
	);

	const fetchCategories = React.useCallback(async () => {
		try {
			setLoading(true);

			if (!storeId) {
				console.error("Store ID not found in localStorage");
				showToast("error", "Store ID tidak ditemukan. Silakan login ulang.");
				return;
			}

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
				.eq("store_id", storeId)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching categories:", error);
				return;
			}

			// Transform data to match our interface
			const categoriesWithProductCount = data.map((category) => ({
				...category,
				description: "", // Add description if needed later
				product_count: 0, // TODO: Calculate actual product count from products table
			}));

			setCategories(categoriesWithProductCount);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	}, [storeId]);

	const filteredCategories = categories.filter(
		(category) =>
			category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false)
	);

	const totalProducts = categories.reduce(
		(sum, cat) => sum + cat.product_count,
		0
	);

	const handleDeleteCategory = async (categoryId: string) => {
		const category = categories.find((c) => c.id === categoryId);
		if (category && category.product_count > 0) {
			alert("Tidak dapat menghapus kategori yang masih memiliki produk!");
			return;
		}

		if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
			try {
				if (!storeId) {
					console.error("Store ID not found in localStorage");
					showToast("error", "Store ID tidak ditemukan. Silakan login ulang.");
					return;
				}

				const { error } = await supabase
					.from("categories")
					.delete()
					.eq("id", categoryId)
					.eq("store_id", storeId);

				if (error) {
					console.error("Error deleting category:", error);
					alert("Gagal menghapus kategori!");
					return;
				}

				// Update local state
				setCategories(categories.filter((c) => c.id !== categoryId));
			} catch (error) {
				console.error("Error:", error);
				alert("Gagal menghapus kategori!");
			}
		}
	};

	return (
		<>
			<div className="h-screen bg-[#EFEDED] p-6">
				<div className="max-w-7xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-semibold text-[#191919] mb-2 font-['Inter_Tight']">
								Manajemen Kategori
							</h1>
							<p className="text-[#4A4A4A] font-['Inter']">
								Kelola kategori produk untuk mengorganisir inventory
							</p>
						</div>
						<button
							onClick={() => setShowAddSlider(true)}
							disabled={loading}
							className="bg-[#FF5701] text-white px-4 py-2 rounded-lg hover:bg-[#E04E00] transition-colors flex items-center space-x-2 font-medium font-['Inter'] disabled:opacity-50">
							<Plus className="w-4 h-4" />
							<span>Tambah Kategori</span>
						</button>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
										Total Kategori
									</p>
									<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
										{loading ? "..." : categories.length}
									</p>
								</div>
								<div className="p-3 bg-[#FF5701]/10 rounded-full">
									<Grid3X3 className="w-6 h-6 text-[#FF5701]" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
										Total Produk
									</p>
									<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
										{loading ? "..." : totalProducts}
									</p>
								</div>
								<div className="p-3 bg-[#249689]/10 rounded-full">
									<Package className="w-6 h-6 text-[#249689]" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
										Rata-rata Produk per Kategori
									</p>
									<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
										{loading
											? "..."
											: categories.length > 0
											? Math.round(totalProducts / categories.length)
											: 0}
									</p>
								</div>
								<div className="p-3 bg-[#FFD166]/10 rounded-full">
									<Package className="w-6 h-6 text-[#FFD166]" />
								</div>
							</div>
						</div>
					</div>

					{/* Search */}
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A4A4A] w-4 h-4" />
							<input
								type="text"
								placeholder="Cari kategori..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								disabled={loading}
								className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter'] disabled:opacity-50"
							/>
						</div>
					</div>

					{/* Loading State */}
					{loading && (
						<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-12 text-center">
							<div className="w-8 h-8 border-2 border-[#FF5701] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-[#4A4A4A] font-['Inter']">
								Memuat kategori...
							</p>
						</div>
					)}

					{/* Categories Grid */}
					{!loading && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredCategories.map((category) => (
								<div
									key={category.id}
									className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6 hover:shadow-md transition-shadow">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<h3 className="text-lg font-medium text-[#191919] font-['Inter_Tight']">
												{category.name}
											</h3>
											{category.description && (
												<p className="text-[#4A4A4A] text-sm mt-1 font-['Inter']">
													{category.description}
												</p>
											)}
										</div>
										<div className="flex space-x-2">
											<button
												onClick={() => setEditingCategory(category)}
												className="p-1.5 text-[#4A4A4A] hover:text-[#FF5701] hover:bg-[#FF5701]/10 rounded transition-colors">
												<Edit2 className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleDeleteCategory(category.id)}
												className="p-1.5 text-[#4A4A4A] hover:text-[#EF476F] hover:bg-[#EF476F]/10 rounded transition-colors">
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center text-sm text-[#4A4A4A] font-['Inter']">
											<Package className="w-4 h-4 mr-1" />
											<span>{category.product_count} produk</span>
										</div>
										<div className="px-2 py-1 bg-[#249689]/10 text-[#249689] text-xs font-medium rounded-full font-['Inter']">
											{category.product_count}
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Empty State */}
					{!loading && filteredCategories.length === 0 && (
						<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-12 text-center">
							<Grid3X3 className="w-12 h-12 text-[#4A4A4A]/50 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-[#191919] mb-2 font-['Inter_Tight']">
								{searchTerm
									? "Tidak ada kategori ditemukan"
									: "Belum ada kategori"}
							</h3>
							<p className="text-[#4A4A4A] mb-6 font-['Inter']">
								{searchTerm
									? "Coba ubah kata kunci pencarian Anda."
									: "Mulai dengan menambahkan kategori pertama untuk mengorganisir produk Anda."}
							</p>
							{!searchTerm && (
								<button
									onClick={() => setShowAddSlider(true)}
									className="bg-[#FF5701] text-white px-6 py-2 rounded-lg hover:bg-[#E04E00] transition-colors font-medium font-['Inter']">
									Tambah Kategori Pertama
								</button>
							)}
						</div>
					)}

					{/* Add/Edit Category Form */}
					<CategoryForm
						category={editingCategory}
						isOpen={showAddSlider || !!editingCategory}
						onClose={React.useCallback(() => {
							setShowAddSlider(false);
							setEditingCategory(null);
						}, [])}
						onSaveSuccess={handleSaveSuccess}
						onError={React.useCallback(
							(message: string) => showToast("error", message),
							[showToast]
						)}
						storeId={storeId || ""}
					/>
				</div>
			</div>

			{/* Toast Component - di luar container utama */}
			<ToastComponent />
		</>
	);
}
