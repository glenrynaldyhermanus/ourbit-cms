"use client";

import React, { useState, useEffect } from "react";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	Package,
	ShoppingCart,
	DollarSign,
	Upload,
	X,
	Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
	id: string;
	name: string;
	description?: string;
	price: number;
	category_id?: string;
	category_name?: string;
	stock_quantity: number;
	sku: string;
	image_url?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

interface Category {
	id: string;
	name: string;
}

interface SupabaseProductData {
	id: string;
	name: string;
	description?: string;
	price: number;
	category_id?: string;
	stock_quantity: number;
	sku: string;
	image_url?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	categories?: { name: string } | null;
}

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [showAddSlider, setShowAddSlider] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Fetch products and categories from Supabase
	useEffect(() => {
		fetchProducts();
		fetchCategories();
	}, []);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("products")
				.select(
					`
					id,
					name,
					description,
					price,
					category_id,
					stock_quantity,
					sku,
					image_url,
					is_active,
					created_at,
					updated_at,
					categories!left (
						name
					)
				`
				)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching products:", error);
				return;
			}

			// Transform data to match our interface
			const productsWithCategory = (data || []).map((product: any) => ({
				...product,
				category_name: product.categories?.name || "Tanpa Kategori",
			}));

			setProducts(productsWithCategory);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCategories = async () => {
		try {
			const { data, error } = await supabase
				.from("categories")
				.select("id, name")
				.order("name", { ascending: true });

			if (error) {
				console.error("Error fetching categories:", error);
				return;
			}

			setCategories(data || []);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false);

		const matchesCategory =
			!selectedCategory || product.category_id === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	const totalValue = products.reduce(
		(sum, product) => sum + product.price * product.stock_quantity,
		0
	);

	const lowStockProducts = products.filter(
		(product) => product.stock_quantity <= 10
	).length;

	const handleDeleteProduct = async (productId: string) => {
		if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
			try {
				const { error } = await supabase
					.from("products")
					.delete()
					.eq("id", productId);

				if (error) {
					console.error("Error deleting product:", error);
					alert("Gagal menghapus produk!");
					return;
				}

				// Update local state
				setProducts(products.filter((p) => p.id !== productId));
			} catch (error) {
				console.error("Error:", error);
				alert("Gagal menghapus produk!");
			}
		}
	};

	const ProductSlider = ({
		product,
		isOpen,
		onClose,
	}: {
		product?: Product | null;
		isOpen: boolean;
		onClose: () => void;
	}) => {
		const [formData, setFormData] = useState({
			name: product?.name || "",
			description: product?.description || "",
			price: product?.price || 0,
			category_id: product?.category_id || "",
			stock_quantity: product?.stock_quantity || 0,
			sku: product?.sku || "",
			is_active: product?.is_active ?? true,
		});
		const [imageFile, setImageFile] = useState<File | null>(null);
		const [imagePreview, setImagePreview] = useState<string | null>(
			product?.image_url || null
		);
		const [uploadingImage, setUploadingImage] = useState(false);
		const [isAnimating, setIsAnimating] = useState(false);

		const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				if (file.size > 5 * 1024 * 1024) {
					// 5MB limit
					alert("File terlalu besar! Maksimal 5MB");
					return;
				}
				if (!file.type.startsWith("image/")) {
					alert("File harus berupa gambar!");
					return;
				}
				setImageFile(file);
				const reader = new FileReader();
				reader.onload = (e) => {
					setImagePreview(e.target?.result as string);
				};
				reader.readAsDataURL(file);
			}
		};

		const uploadImage = async (): Promise<string | null> => {
			if (!imageFile) return product?.image_url || null;

			setUploadingImage(true);
			try {
				const fileExt = imageFile.name.split(".").pop();
				const fileName = `${Date.now()}-${Math.random()
					.toString(36)
					.substring(2)}.${fileExt}`;
				const filePath = `users/uploads/products/${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from("merchants-products")
					.upload(filePath, imageFile);

				if (uploadError) {
					console.error("Error uploading image:", uploadError);
					return null;
				}

				const {
					data: { publicUrl },
				} = supabase.storage.from("merchants-products").getPublicUrl(filePath);

				return publicUrl;
			} catch (error) {
				console.error("Error uploading image:", error);
				return null;
			} finally {
				setUploadingImage(false);
			}
		};

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			if (formData.name.trim() && formData.sku.trim()) {
				setSaving(true);
				try {
					// Upload image if there's a new one
					const imageUrl = await uploadImage();

					const productData = {
						name: formData.name.trim(),
						description: formData.description.trim(),
						price: Number(formData.price),
						category_id: formData.category_id || null,
						stock_quantity: Number(formData.stock_quantity),
						sku: formData.sku.trim(),
						image_url: imageUrl,
						is_active: formData.is_active,
					};

					if (product) {
						// Update existing product
						const { error } = await supabase
							.from("products")
							.update({
								...productData,
								updated_at: new Date().toISOString(),
							})
							.eq("id", product.id);

						if (error) {
							console.error("Error updating product:", error);
							alert("Gagal memperbarui produk!");
							return;
						}
					} else {
						// Add new product - need to get store_id from current user's store
						const { error } = await supabase.from("products").insert([
							{
								...productData,
								store_id: "your-store-id", // TODO: Get from auth context
							},
						]);

						if (error) {
							console.error("Error adding product:", error);
							alert("Gagal menambah produk!");
							return;
						}
					}

					// Refresh products list
					await fetchProducts();
					onClose();
					resetForm();
				} catch (error) {
					console.error("Error:", error);
					alert("Gagal menyimpan produk!");
				} finally {
					setSaving(false);
				}
			}
		};

		const resetForm = () => {
			setFormData({
				name: "",
				description: "",
				price: 0,
				category_id: "",
				stock_quantity: 0,
				sku: "",
				is_active: true,
			});
			setImageFile(null);
			setImagePreview(null);
		};

		const handleClose = () => {
			setIsAnimating(false);
			setTimeout(() => {
				onClose();
				resetForm();
			}, 300);
		};

		// Trigger animation when opening
		React.useEffect(() => {
			if (isOpen) {
				setTimeout(() => setIsAnimating(true), 10);
			} else {
				setIsAnimating(false);
			}
		}, [isOpen]);

		// Update form data when product changes
		React.useEffect(() => {
			if (product) {
				setFormData({
					name: product.name,
					description: product.description || "",
					price: product.price,
					category_id: product.category_id || "",
					stock_quantity: product.stock_quantity,
					sku: product.sku,
					is_active: product.is_active,
				});
				setImagePreview(product.image_url || null);
			} else {
				resetForm();
			}
		}, [product]);

		if (!isOpen) return null;

		return (
			<div className="fixed inset-0 z-40">
				{/* Backdrop */}
				<div
					className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
						isAnimating ? "opacity-50" : "opacity-0"
					}`}
					onClick={handleClose}
				/>

				{/* Slider Panel */}
				<div
					className={`absolute top-0 right-0 h-full w-96 bg-white shadow-xl z-10 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
						isAnimating ? "translate-x-0" : "translate-x-full"
					}`}>
					<div className="flex flex-col h-full">
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
							<h2 className="text-xl font-medium text-[#191919] font-['Inter_Tight']">
								{product ? "Edit Produk" : "Tambah Produk"}
							</h2>
							<button
								onClick={handleClose}
								disabled={saving || uploadingImage}
								className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
								<X className="w-5 h-5 text-[#4A4A4A]" />
							</button>
						</div>

						{/* Form Content */}
						<div className="flex-1 p-6">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Image Upload */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Gambar Produk
									</label>
									<div className="border-2 border-dashed border-[#D1D5DB] rounded-lg p-4 text-center">
										{imagePreview ? (
											<div className="relative">
												<img
													src={imagePreview}
													alt="Preview"
													className="w-full h-32 object-cover rounded-lg"
												/>
												<button
													type="button"
													onClick={() => {
														setImagePreview(null);
														setImageFile(null);
													}}
													className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
													<X className="w-4 h-4" />
												</button>
											</div>
										) : (
											<div className="py-8">
												<ImageIcon className="w-12 h-12 text-[#4A4A4A] mx-auto mb-2" />
												<p className="text-sm text-[#4A4A4A] font-['Inter']">
													Drag & drop gambar atau{" "}
													<span className="text-[#FF5701] cursor-pointer">
														pilih file
													</span>
												</p>
											</div>
										)}
										<input
											type="file"
											accept="image/*"
											onChange={handleImageChange}
											className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
											disabled={saving || uploadingImage}
										/>
									</div>
									<p className="mt-1 text-xs text-[#4A4A4A] font-['Inter']">
										Format: JPG, PNG. Maksimal 5MB
									</p>
								</div>

								{/* Product Name */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Nama Produk <span className="text-[#EF476F]">*</span>
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
										placeholder="Masukkan nama produk"
										required
										disabled={saving || uploadingImage}
									/>
								</div>

								{/* Description */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Deskripsi
									</label>
									<textarea
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										rows={3}
										className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
										placeholder="Deskripsi produk (opsional)"
										disabled={saving || uploadingImage}
									/>
								</div>

								{/* Price and Category Row */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
											Harga <span className="text-[#EF476F]">*</span>
										</label>
										<input
											type="number"
											value={formData.price}
											onChange={(e) =>
												setFormData({
													...formData,
													price: Number(e.target.value),
												})
											}
											className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
											placeholder="0"
											min="0"
											step="0.01"
											required
											disabled={saving || uploadingImage}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
											Kategori
										</label>
										<select
											value={formData.category_id}
											onChange={(e) =>
												setFormData({
													...formData,
													category_id: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
											disabled={saving || uploadingImage}>
											<option value="">Pilih Kategori</option>
											{categories.map((category) => (
												<option key={category.id} value={category.id}>
													{category.name}
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Stock and SKU Row */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
											Stok <span className="text-[#EF476F]">*</span>
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
											className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
											placeholder="0"
											min="0"
											required
											disabled={saving || uploadingImage}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
											SKU <span className="text-[#EF476F]">*</span>
										</label>
										<input
											type="text"
											value={formData.sku}
											onChange={(e) =>
												setFormData({ ...formData, sku: e.target.value })
											}
											className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
											placeholder="SKU001"
											required
											disabled={saving || uploadingImage}
										/>
									</div>
								</div>

								{/* Active Status */}
								<div className="flex items-center">
									<input
										type="checkbox"
										id="is_active"
										checked={formData.is_active}
										onChange={(e) =>
											setFormData({ ...formData, is_active: e.target.checked })
										}
										className="h-4 w-4 text-[#FF5701] focus:ring-[#FF5701] border-[#D1D5DB] rounded"
										disabled={saving || uploadingImage}
									/>
									<label
										htmlFor="is_active"
										className="ml-2 text-sm text-[#191919] font-['Inter']">
										Produk aktif
									</label>
								</div>
							</form>
						</div>

						{/* Footer */}
						<div className="p-6 border-t border-gray-200 bg-white">
							<div className="flex space-x-3">
								<button
									onClick={handleClose}
									disabled={saving || uploadingImage}
									className="flex-1 px-4 py-2 text-[#4A4A4A] bg-[#F3F4F6] border border-[#D1D5DB] rounded-lg hover:bg-[#E5E7EB] transition-colors font-medium font-['Inter'] disabled:opacity-50">
									Batal
								</button>
								<button
									onClick={handleSubmit}
									disabled={
										!formData.name.trim() ||
										!formData.sku.trim() ||
										saving ||
										uploadingImage
									}
									className="flex-1 px-4 py-2 bg-[#FF5701] text-white rounded-lg hover:bg-[#E04E00] disabled:bg-[#D1D5DB] disabled:cursor-not-allowed transition-colors font-medium font-['Inter'] flex items-center justify-center">
									{saving || uploadingImage ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
											{uploadingImage
												? "Mengupload..."
												: product
												? "Memperbarui..."
												: "Menyimpan..."}
										</>
									) : product ? (
										"Perbarui"
									) : (
										"Simpan"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-[#EFEDED] p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-semibold text-[#191919] mb-2 font-['Inter_Tight']">
							Manajemen Produk
						</h1>
						<p className="text-[#4A4A4A] font-['Inter']">
							Kelola produk dan inventory toko Anda
						</p>
					</div>
					<button
						onClick={() => setShowAddSlider(true)}
						disabled={loading}
						className="bg-[#FF5701] text-white px-6 py-3 rounded-lg hover:bg-[#E04E00] transition-colors flex items-center space-x-2 font-medium font-['Inter'] disabled:opacity-50">
						<Plus className="w-5 h-5" />
						<span>Tambah Produk</span>
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Total Produk
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
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
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
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
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
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
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
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

				{/* Products Grid */}
				{!loading && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredProducts.map((product) => (
							<div
								key={product.id}
								className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] overflow-hidden hover:shadow-md transition-shadow">
								{/* Product Image */}
								<div className="h-48 bg-gray-100 relative">
									{product.image_url ? (
										<img
											src={product.image_url}
											alt={product.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="flex items-center justify-center h-full">
											<ImageIcon className="w-12 h-12 text-[#4A4A4A]/30" />
										</div>
									)}
									{!product.is_active && (
										<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
											<span className="text-white font-medium font-['Inter']">
												Tidak Aktif
											</span>
										</div>
									)}
									<div className="absolute top-2 right-2 flex space-x-1">
										<button
											onClick={() => setEditingProduct(product)}
											className="p-1.5 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded transition-colors">
											<Edit2 className="w-4 h-4" />
										</button>
										<button
											onClick={() => handleDeleteProduct(product.id)}
											className="p-1.5 text-white bg-red-500 bg-opacity-70 hover:bg-opacity-90 rounded transition-colors">
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>

								{/* Product Info */}
								<div className="p-4">
									<div className="flex items-start justify-between mb-2">
										<h3 className="text-lg font-medium text-[#191919] font-['Inter_Tight'] line-clamp-1">
											{product.name}
										</h3>
										<div
											className={`px-2 py-1 text-xs font-medium rounded-full font-['Inter'] ${
												product.stock_quantity <= 10
													? "bg-[#EF476F]/10 text-[#EF476F]"
													: "bg-[#249689]/10 text-[#249689]"
											}`}>
											{product.stock_quantity} stok
										</div>
									</div>

									{product.description && (
										<p className="text-[#4A4A4A] text-sm mb-2 font-['Inter'] line-clamp-2">
											{product.description}
										</p>
									)}

									<div className="flex items-center justify-between mb-2">
										<span className="text-xl font-semibold text-[#FF5701] font-['Inter_Tight']">
											{new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
											}).format(product.price)}
										</span>
										<span className="text-xs text-[#4A4A4A] font-['Inter']">
											SKU: {product.sku}
										</span>
									</div>

									<div className="flex items-center justify-between text-xs text-[#4A4A4A] font-['Inter']">
										<span>Kategori: {product.category_name}</span>
										<span>
											Nilai:{" "}
											{new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
											}).format(product.price * product.stock_quantity)}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Empty State */}
				{!loading && filteredProducts.length === 0 && (
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-12 text-center">
						<Package className="w-12 h-12 text-[#4A4A4A]/50 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-[#191919] mb-2 font-['Inter_Tight']">
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
							<button
								onClick={() => setShowAddSlider(true)}
								className="bg-[#FF5701] text-white px-6 py-2 rounded-lg hover:bg-[#E04E00] transition-colors font-medium font-['Inter']">
								Tambah Produk Pertama
							</button>
						)}
					</div>
				)}

				{/* Add/Edit Product Slider */}
				<ProductSlider
					product={editingProduct}
					isOpen={showAddSlider || !!editingProduct}
					onClose={() => {
						setShowAddSlider(false);
						setEditingProduct(null);
					}}
				/>
			</div>
		</div>
	);
}
