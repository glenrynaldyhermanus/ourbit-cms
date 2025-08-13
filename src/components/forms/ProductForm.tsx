"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, AlertCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
	PrimaryButton,
	OutlineButton,
	Input,
	Select,
	Button,
} from "@/components/ui";
import { Switch } from "@/components/ui";
import { Product } from "@/types";
import SKUGeneratorComponent from "./SKUGenerator";
import {
	formatCurrencyInput,
	parseCurrency,
	formatNumberInput,
	parseNumber,
} from "@/lib/utils";
import { handleSupabaseError } from "@/lib/supabase-error-handler";

interface ProductFormProps {
	product?: Product | null;
	isOpen: boolean;
	onClose: () => void;
	onSaveSuccess: (product: Product | null) => void;
	onError: (message: string) => void;
	categories: { id: string; name: string }[];
	productTypes: { key: string; value: string }[];
	storeId: string;
}

export default function ProductForm({
	product,
	isOpen,
	onClose,
	onSaveSuccess,
	onError,
	categories,
	productTypes,
	storeId,
}: ProductFormProps) {
	const [formData, setFormData] = useState({
		name: product?.name || "",
		code: product?.code || "",
		category_id: product?.category_id || null,
		selling_price: product?.selling_price || 0,
		purchase_price: product?.purchase_price || 0,
		stock: product?.stock || 0,
		description: product?.description || "",
		type: product?.type || "",
		unit: product?.unit || "",
		weight_grams: product?.weight_grams || 0,
		rack_location: product?.rack_location || "",
		min_stock: product?.min_stock || 0,
		is_active: product?.is_active ?? true,
	});
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(
		product?.image_url || null
	);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [saving, setSaving] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [skuValidation, setSkuValidation] = useState({
		isValid: false,
		message: "",
	});
	const [categorySelectOpen, setCategorySelectOpen] = useState(false);
	const [typeSelectOpen, setTypeSelectOpen] = useState(false);
	const categoryDropdownRef = React.useRef<HTMLDivElement>(null);
	const typeDropdownRef = React.useRef<HTMLDivElement>(null);

	// Variants & Images state
	type VariantRow = {
		id: string;
		name: string;
		price_override: number | null;
		stock: number | null;
		weight_grams: number | null;
		is_active: boolean;
	};
	const [variants, setVariants] = useState<VariantRow[]>([]);
	const [variantForm, setVariantForm] = useState<{
		id: string | null;
		name: string;
		price_override: number | null;
		stock: number | null;
		weight_grams: number | null;
		is_active: boolean;
	}>({
		id: null,
		name: "",
		price_override: null,
		stock: null,
		weight_grams: null,
		is_active: true,
	});
	const [variantSaving, setVariantSaving] = useState(false);
	const [variantError, setVariantError] = useState<string | null>(null);

	type GalleryImage = { id: string; url: string; sort_order: number };
	const [gallery, setGallery] = useState<GalleryImage[]>([]);
	const [galleryUploading, setGalleryUploading] = useState(false);

	// Helper functions to get display labels
	const getCategoryLabel = useCallback(
		(categoryId: string | null) => {
			if (!categoryId) return "";
			const category = categories.find((cat) => cat.id === categoryId);
			return category ? category.name : "";
		},
		[categories]
	);

	const getProductTypeLabel = useCallback(
		(typeKey: string) => {
			if (!typeKey) return "";
			const productType = productTypes.find((type) => type.key === typeKey);
			return productType ? productType.value : "";
		},
		[productTypes]
	);

	// Memoized callbacks for SKU Generator
	const handleSKUChange = useCallback((sku: string) => {
		setFormData((prev) => ({ ...prev, code: sku }));
	}, []);

	const handleSkuValidationChange = useCallback(
		(isValid: boolean, message: string) => {
			setSkuValidation({ isValid, message });
		},
		[]
	);

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			setIsAnimating(false);
			setTimeout(() => setShouldRender(false), 300);
		}
	}, [isOpen]);

	// Close dropdowns when form closes
	useEffect(() => {
		if (!isOpen) {
			setCategorySelectOpen(false);
			setTypeSelectOpen(false);
		}
	}, [isOpen]);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;

			// Check if click is outside dropdown elements using refs
			const isOutsideCategory =
				categoryDropdownRef.current &&
				!categoryDropdownRef.current.contains(target);
			const isOutsideType =
				typeDropdownRef.current && !typeDropdownRef.current.contains(target);

			if (isOutsideCategory && categorySelectOpen) {
				setCategorySelectOpen(false);
			}
			if (isOutsideType && typeSelectOpen) {
				setTypeSelectOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, categorySelectOpen, typeSelectOpen]);

	useEffect(() => {
		if (product) {
			console.log("Setting form data for product:", product);
			console.log("Product is_active:", product.is_active);
			setFormData({
				name: product.name,
				code: product.code,
				category_id: product.category_id || null,
				selling_price: product.selling_price,
				purchase_price: product.purchase_price,
				stock: product.stock,
				description: product.description || "",
				type: product.type,
				unit: product.unit || "",
				weight_grams: product.weight_grams,
				rack_location: product.rack_location || "",
				min_stock: product.min_stock,
				is_active: product.is_active ?? true,
			});
			setImagePreview(product.image_url || null);
			// Load variants and gallery when editing an existing product
			void (async () => {
				try {
					const { data: vData } = await supabase
						.from("product_variants")
						.select("id, name, price_override, stock, weight_grams, is_active")
						.eq("product_id", product.id)
						.order("name");
					setVariants((vData ?? []) as unknown as VariantRow[]);
					const { data: gData } = await supabase
						.from("product_images")
						.select("id, url, sort_order")
						.eq("product_id", product.id)
						.order("sort_order", { ascending: true });
					setGallery((gData ?? []) as unknown as GalleryImage[]);
				} catch {}
			})();
		} else {
			setFormData({
				name: "",
				code: "",
				category_id: null,
				selling_price: 0,
				purchase_price: 0,
				stock: 0,
				description: "",
				type: "",
				unit: "",
				weight_grams: 0,
				rack_location: "",
				min_stock: 0,
				is_active: true,
			});
			setImagePreview(null);
			setVariants([]);
			setVariantForm({
				id: null,
				name: "",
				price_override: null,
				stock: null,
				weight_grams: null,
				is_active: true,
			});
			setGallery([]);
		}
	}, [product]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				onError("File terlalu besar! Maksimal 5MB");
				return;
			}
			if (!file.type.startsWith("image/")) {
				onError("File harus berupa gambar!");
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
				onError("Gagal upload gambar!");
				return null;
			}
			const { data } = supabase.storage
				.from("merchants-products")
				.getPublicUrl(filePath);
			return data.publicUrl;
		} catch {
			onError("Gagal upload gambar!");
			return null;
		} finally {
			setUploadingImage(false);
		}
	};

	const uploadGalleryImages = async (files: File[]) => {
		if (!product) return; // only after product exists
		setGalleryUploading(true);
		try {
			let maxSort = gallery.reduce((m, g) => Math.max(m, g.sort_order), 0);
			for (const file of files) {
				const ext = file.name.split(".").pop();
				const fileName = `${Date.now()}-${Math.random()
					.toString(36)
					.substring(2)}.${ext}`;
				const filePath = `users/uploads/products/gallery/${fileName}`;
				const { error: upErr } = await supabase.storage
					.from("merchants-products")
					.upload(filePath, file);
				if (upErr) continue;
				const { data } = supabase.storage
					.from("merchants-products")
					.getPublicUrl(filePath);
				maxSort += 1;
				await supabase.from("product_images").insert({
					product_id: product.id,
					url: data.publicUrl,
					sort_order: maxSort,
				});
			}
			// reload gallery
			const { data: gData } = await supabase
				.from("product_images")
				.select("id, url, sort_order")
				.eq("product_id", product.id)
				.order("sort_order", { ascending: true });
			setGallery((gData ?? []) as unknown as GalleryImage[]);
		} finally {
			setGalleryUploading(false);
		}
	};

	const removeGalleryImage = async (id: string) => {
		if (!product) return;
		await supabase.from("product_images").delete().eq("id", id);
		setGallery((prev) => prev.filter((g) => g.id !== id));
	};

	const resetVariantForm = () =>
		setVariantForm({
			id: null,
			name: "",
			price_override: null,
			stock: null,
			weight_grams: null,
			is_active: true,
		});

	const editVariant = (v: VariantRow) => {
		setVariantForm({
			id: v.id,
			name: v.name,
			price_override: v.price_override,
			stock: v.stock,
			weight_grams: v.weight_grams,
			is_active: v.is_active,
		});
	};

	const deleteVariant = async (id: string) => {
		if (!product) return;
		await supabase.from("product_variants").delete().eq("id", id);
		setVariants((prev) => prev.filter((x) => x.id !== id));
		if (variantForm.id === id) resetVariantForm();
	};

	const saveVariant = async () => {
		if (!product) {
			setVariantError("Simpan produk terlebih dulu sebelum menambah varian");
			return;
		}
		if (!variantForm.name.trim()) {
			setVariantError("Nama varian wajib diisi");
			return;
		}
		setVariantSaving(true);
		setVariantError(null);
		try {
			if (variantForm.id) {
				const { error } = await supabase
					.from("product_variants")
					.update({
						name: variantForm.name.trim(),
						price_override: variantForm.price_override,
						stock: variantForm.stock,
						weight_grams: variantForm.weight_grams,
						is_active: variantForm.is_active,
					})
					.eq("id", variantForm.id);
				if (!error) {
					setVariants((prev) =>
						prev.map((v) =>
							v.id === variantForm.id
								? {
										...v,
										name: variantForm.name.trim(),
										price_override: variantForm.price_override,
										stock: variantForm.stock,
										weight_grams: variantForm.weight_grams,
										is_active: variantForm.is_active,
								  }
								: v
						)
					);
					resetVariantForm();
				}
			} else {
				const { data, error } = await supabase
					.from("product_variants")
					.insert({
						product_id: product.id,
						name: variantForm.name.trim(),
						price_override: variantForm.price_override,
						stock: variantForm.stock,
						weight_grams: variantForm.weight_grams,
						is_active: variantForm.is_active,
					})
					.select("id, name, price_override, stock, weight_grams, is_active")
					.single();
				if (!error && data) {
					setVariants((prev) => [...prev, data as unknown as VariantRow]);
					resetVariantForm();
				}
			}
		} finally {
			setVariantSaving(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!formData.name.trim() ||
			!formData.code.trim() ||
			!skuValidation.isValid
		) {
			setHasError(true);
			return;
		}
		setSaving(true);
		try {
			const imageUrl = await uploadImage();
			const productData = {
				name: formData.name.trim(),
				code: formData.code.trim(),
				category_id: formData.category_id,
				selling_price: Number(formData.selling_price),
				purchase_price: Number(formData.purchase_price),
				stock: Number(formData.stock),
				description: formData.description.trim(),
				type: formData.type,
				unit: formData.unit,
				weight_grams: Number(formData.weight_grams),
				rack_location: formData.rack_location,
				min_stock: Number(formData.min_stock),
				image_url: imageUrl,
				store_id: storeId,
				is_active: Boolean(formData.is_active),
			};
			if (product) {
				console.log("Updating product with data:", {
					...productData,
					updated_at: new Date().toISOString(),
				});
				console.log(
					"is_active value:",
					formData.is_active,
					"type:",
					typeof formData.is_active
				);

				// Check if we can read the product first
				const { data: checkData, error: checkError } = await supabase
					.from("products")
					.select("id, name, is_active, store_id")
					.eq("id", product.id)
					.single();

				console.log("Before update - product data:", checkData);
				console.log("Check error:", checkError);
				const { data: updateData, error } = await supabase
					.from("products")
					.update({ ...productData, updated_at: new Date().toISOString() })
					.eq("id", product.id)
					.select();
				const errorResult = handleSupabaseError(error, {
					operation: "memperbarui",
					entity: "produk",
					showToast: onError,
				});

				if (!errorResult.success) {
					return;
				}
				console.log("Update response:", updateData);
			} else {
				console.log("Inserting product with data:", productData);
				const { error } = await supabase.from("products").insert([productData]);
				const errorResult = handleSupabaseError(error, {
					operation: "menambah",
					entity: "produk",
					showToast: onError,
				});

				if (!errorResult.success) {
					return;
				}
			}
			// Verify the update by fetching the product again
			if (product) {
				const { data: verifyData, error: verifyError } = await supabase
					.from("products")
					.select("id, name, is_active")
					.eq("id", product.id)
					.single();

				if (verifyError) {
					console.error("Verify error:", verifyError);
				} else {
					console.log("Verified product data:", verifyData);
				}
			}

			onSaveSuccess(product || null);
			handleClose();
		} catch {
			onError("Gagal menyimpan produk!");
		} finally {
			setSaving(false);
		}
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => {
			onClose();
			setFormData({
				name: "",
				code: "",
				category_id: "",
				selling_price: 0,
				purchase_price: 0,
				stock: 0,
				description: "",
				type: "",
				unit: "",
				weight_grams: 0,
				rack_location: "",
				min_stock: 0,
				is_active: true,
			});
			setImageFile(null);
			setImagePreview(null);
			setHasError(false);
			setSkuValidation({ isValid: false, message: "" });
		}, 300);
	};

	if (!shouldRender) return null;

	return (
		<div className="fixed inset-0 z-[9999]">
			{/* Backdrop */}
			<div
				className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out ${
					isAnimating ? "opacity-100" : "opacity-0"
				}`}
				onClick={handleClose}
			/>
			{/* Slider Panel */}
			<div
				className={`absolute top-0 right-0 h-full w-[480px] bg-[var(--card)] shadow-2xl z-20 transform transition-all duration-300 ease-out ${
					isAnimating ? "translate-x-0" : "translate-x-full"
				}`}>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between pl-8 pr-8 pt-4 pb-4 border-b border-[var(--border)]">
						<div>
							<h2 className="text-lg font-semibold text-[var(--foreground)]">
								{product ? "Edit Produk" : "Tambah Produk"}
							</h2>
							<p className="text-[var(--muted-foreground)] text-sm mt-1 font-['Inter']">
								{product
									? "Perbarui informasi produk"
									: "Buat produk baru untuk toko Anda"}
							</p>
						</div>
						<button
							onClick={handleClose}
							disabled={saving}
							className="p-2 hover:bg-[var(--muted)] rounded-lg transition-all duration-200 disabled:opacity-50 group">
							<X className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
						</button>
					</div>
					{/* Form Content */}
					<div className="flex-1 p-8 overflow-y-auto">
						<form onSubmit={handleSubmit} className="space-y-8">
							{/* Image Upload */}
							<div>
								<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
									Gambar Produk
								</label>
								<div className="border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-center relative">
									{imagePreview ? (
										<div className="relative">
											<Image
												src={imagePreview}
												alt="Preview"
												width={400}
												height={128}
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
											<ImageIcon className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-2" />
											<p className="text-sm text-[var(--muted-foreground)] font-['Inter']">
												Drag & drop gambar atau{" "}
												<span className="text-[var(--primary)] cursor-pointer">
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
								<p className="mt-1 text-xs text-[var(--muted-foreground)] font-['Inter']">
									Format: JPG, PNG. Maksimal 5MB
								</p>
							</div>
							{/* Nama Produk */}
							<div>
								<Input.Root error={hasError && !formData.name.trim()}>
									<Input.Label required>Nama Produk</Input.Label>
									<Input.Field
										type="text"
										value={formData.name}
										onChange={(value: string) =>
											setFormData({ ...formData, name: value })
										}
										placeholder="Masukkan nama produk"
										required
										disabled={saving}
									/>
									{hasError && !formData.name.trim() && (
										<Input.Error>Nama produk wajib diisi</Input.Error>
									)}
								</Input.Root>
							</div>
							{/* Kategori dan Jenis Produk */}
							<div className="grid grid-cols-2 gap-4">
								<div ref={categoryDropdownRef} className="select-dropdown">
									<Select.Root>
										<Select.Label>Kategori</Select.Label>
										<Select.Trigger
											value={getCategoryLabel(formData.category_id)}
											placeholder="Tanpa Kategori"
											disabled={saving}
											onClick={() => setCategorySelectOpen(!categorySelectOpen)}
											open={categorySelectOpen}
										/>
										<Select.Content open={categorySelectOpen}>
											<Select.Item
												value=""
												onClick={() => {
													setFormData({
														...formData,
														category_id: null,
													});
													setCategorySelectOpen(false);
												}}
												selected={!formData.category_id}>
												Tanpa Kategori
											</Select.Item>
											{categories.map((category) => (
												<Select.Item
													key={category.id}
													value={category.id}
													onClick={() => {
														setFormData({
															...formData,
															category_id: category.id,
														});
														setCategorySelectOpen(false);
													}}
													selected={formData.category_id === category.id}>
													{category.name}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>
								</div>
								<div ref={typeDropdownRef} className="select-dropdown">
									<Select.Root>
										<Select.Label>Jenis Produk</Select.Label>
										<Select.Trigger
											value={getProductTypeLabel(formData.type)}
											placeholder="Pilih Jenis Produk"
											disabled={saving}
											onClick={() => setTypeSelectOpen(!typeSelectOpen)}
											open={typeSelectOpen}
										/>
										<Select.Content open={typeSelectOpen}>
											{productTypes.map((type) => (
												<Select.Item
													key={type.key}
													value={type.key}
													onClick={() => {
														setFormData({
															...formData,
															type: type.key,
														});
														setTypeSelectOpen(false);
													}}
													selected={formData.type === type.key}>
													{type.value}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>
								</div>
							</div>
							{/* SKU Generator */}
							<SKUGeneratorComponent
								productName={formData.name}
								categoryId={formData.category_id}
								categoryName={getCategoryLabel(formData.category_id)}
								storeId={storeId}
								currentSKU={formData.code}
								onSKUChange={handleSKUChange}
								onValidationChange={handleSkuValidationChange}
								disabled={saving}
								excludeId={product?.id}
							/>
							{/* Harga Jual dan Beli */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
										Harga Jual <span className="text-[var(--danger)]">*</span>
									</label>
									<input
										type="text"
										value={
											formData.selling_price
												? formatCurrencyInput(formData.selling_price.toString())
												: ""
										}
										onChange={(e) => {
											const rawValue = e.target.value;
											const numericValue = parseCurrency(rawValue);
											setFormData({
												...formData,
												selling_price: numericValue,
											});
										}}
										className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)] font-['Inter']"
										placeholder="0"
										required
										disabled={saving}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
										Harga Beli <span className="text-[var(--danger)]">*</span>
									</label>
									<input
										type="text"
										value={
											formData.purchase_price
												? formatCurrencyInput(
														formData.purchase_price.toString()
												  )
												: ""
										}
										onChange={(e) => {
											const rawValue = e.target.value;
											const numericValue = parseCurrency(rawValue);
											setFormData({
												...formData,
												purchase_price: numericValue,
											});
										}}
										className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)] font-['Inter']"
										placeholder="0"
										required
										disabled={saving}
									/>
								</div>
							</div>
							{/* Stok dan Minimum Stok */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
										Stok <span className="text-[var(--danger)]">*</span>
									</label>
									<input
										type="text"
										value={
											formData.stock
												? formatNumberInput(formData.stock.toString())
												: ""
										}
										onChange={(e) => {
											const rawValue = e.target.value;
											const numericValue = parseNumber(rawValue);
											setFormData({
												...formData,
												stock: numericValue,
											});
										}}
										className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)] font-['Inter']"
										placeholder="0"
										required
										disabled={saving}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
										Minimum Stok
									</label>
									<input
										type="text"
										value={
											formData.min_stock
												? formatNumberInput(formData.min_stock.toString())
												: ""
										}
										onChange={(e) => {
											const rawValue = e.target.value;
											const numericValue = parseNumber(rawValue);
											setFormData({
												...formData,
												min_stock: numericValue,
											});
										}}
										className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)] font-['Inter']"
										placeholder="0"
										disabled={saving}
									/>
								</div>
							</div>
							{/* Satuan dan Berat */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
										Satuan
									</label>
									<input
										type="text"
										value={formData.unit}
										onChange={(e) =>
											setFormData({ ...formData, unit: e.target.value })
										}
										className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)] font-['Inter']"
										placeholder="PCS, KG, LITER, dll"
										disabled={saving}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
										Berat (gram)
									</label>
									<input
										type="text"
										value={
											formData.weight_grams
												? formatNumberInput(formData.weight_grams.toString())
												: ""
										}
										onChange={(e) => {
											const rawValue = e.target.value;
											const numericValue = parseNumber(rawValue);
											setFormData({
												...formData,
												weight_grams: numericValue,
											});
										}}
										className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)] font-['Inter']"
										placeholder="0"
										disabled={saving}
									/>
								</div>
							</div>
							{/* Letak Rak */}
							<div>
								<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
									Letak Rak
								</label>
								<input
									type="text"
									value={formData.rack_location}
									onChange={(e) =>
										setFormData({ ...formData, rack_location: e.target.value })
									}
									className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)] font-['Inter']"
									placeholder="A1, B2, C3, dll"
									disabled={saving}
								/>
							</div>
							{/* Deskripsi */}
							<div>
								<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
									Deskripsi
								</label>
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={3}
									className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)] font-['Inter']"
									placeholder="Deskripsi produk (opsional)"
									disabled={saving}
								/>
							</div>

							{/* Variants Manager */}
							<div className="border border-[var(--border)] rounded-xl p-4">
								<div className="flex items-center justify-between mb-3">
									<div className="text-sm font-semibold">Varian Produk</div>
									<div className="text-xs text-[var(--muted-foreground)]">
										{product
											? "Kelola varian untuk produk ini"
											: "Simpan produk terlebih dahulu untuk menambah varian"}
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-5 gap-2">
									<Input.Root>
										<Input.Label>Nama Varian</Input.Label>
										<Input.Field
											value={variantForm.name}
											onChange={(v: string) =>
												setVariantForm({ ...variantForm, name: v })
											}
											placeholder="Contoh: Size M / Warna Hitam"
											disabled={!product || variantSaving}
										/>
									</Input.Root>
									<Input.Root>
										<Input.Label>Harga</Input.Label>
										<Input.Field
											type="number"
											value={variantForm.price_override ?? ""}
											onChange={(v: string) =>
												setVariantForm({
													...variantForm,
													price_override: v === "" ? null : Number(v),
												})
											}
											placeholder="Override harga (opsional)"
											disabled={!product || variantSaving}
										/>
									</Input.Root>
									<Input.Root>
										<Input.Label>Stok</Input.Label>
										<Input.Field
											type="number"
											value={variantForm.stock ?? ""}
											onChange={(v: string) =>
												setVariantForm({
													...variantForm,
													stock: v === "" ? null : Number(v),
												})
											}
											placeholder="Stok (opsional)"
											disabled={!product || variantSaving}
										/>
									</Input.Root>
									<Input.Root>
										<Input.Label>Berat (gram)</Input.Label>
										<Input.Field
											type="number"
											value={variantForm.weight_grams ?? ""}
											onChange={(v: string) =>
												setVariantForm({
													...variantForm,
													weight_grams: v === "" ? null : Number(v),
												})
											}
											placeholder="Berat (opsional)"
											disabled={!product || variantSaving}
										/>
									</Input.Root>
									<div className="flex items-end">
										<Button.Root
											variant="default"
											onClick={saveVariant}
											disabled={
												!product || variantSaving || !variantForm.name.trim()
											}
											className="w-full">
											<Button.Text>
												{variantForm.id ? "Update" : "Tambah"}
											</Button.Text>
										</Button.Root>
									</div>
								</div>
								{variantError && (
									<div className="text-xs text-[var(--danger)] mt-2">
										{variantError}
									</div>
								)}
								<div className="mt-4 space-y-2">
									{variants.length === 0 && (
										<div className="text-sm text-[var(--muted-foreground)]">
											Belum ada varian.
										</div>
									)}
									{variants.map((v) => (
										<div
											key={v.id}
											className="flex items-center justify-between p-2 border border-[var(--border)] rounded-lg">
											<div className="text-sm">
												<div className="font-medium">{v.name}</div>
												<div className="text-[var(--muted-foreground)] text-xs">
													Harga: {v.price_override ?? "-"} | Stok:{" "}
													{v.stock ?? "-"} | Berat: {v.weight_grams ?? "-"}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button.Root
													variant="outline"
													onClick={() => editVariant(v)}>
													<Button.Text>Edit</Button.Text>
												</Button.Root>
												<Button.Root
													variant="destructive"
													onClick={() => deleteVariant(v.id)}>
													<Button.Text>Hapus</Button.Text>
												</Button.Root>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Additional Images */}
							<div className="border border-[var(--border)] rounded-xl p-4">
								<div className="flex items-center justify-between mb-3">
									<div className="text-sm font-semibold">Gambar Tambahan</div>
									<div className="text-xs text-[var(--muted-foreground)]">
										{product
											? "Unggah beberapa gambar untuk galeri"
											: "Simpan produk terlebih dahulu untuk mengunggah gambar tambahan"}
									</div>
								</div>
								<div className="flex items-center gap-3">
									<input
										type="file"
										accept="image/*"
										multiple
										disabled={!product || galleryUploading}
										onChange={(e) => {
											const files = Array.from(e.target.files ?? []);
											if (files.length) void uploadGalleryImages(files);
											e.currentTarget.value = "";
										}}
									/>
									{galleryUploading && (
										<span className="text-xs text-[var(--muted-foreground)]">
											Mengunggah...
										</span>
									)}
								</div>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
									{gallery.map((g) => (
										<div key={g.id} className="relative group">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={g.url}
												alt="Gallery"
												className="w-full h-24 object-cover rounded-lg border border-[var(--border)]"
											/>
											<button
												type="button"
												onClick={() => removeGalleryImage(g.id)}
												className="absolute top-1 right-1 text-xs px-2 py-1 rounded bg-red-600 text-white opacity-0 group-hover:opacity-100 transition">
												Hapus
											</button>
										</div>
									))}
									{gallery.length === 0 && (
										<div className="text-sm text-[var(--muted-foreground)]">
											Belum ada gambar tambahan.
										</div>
									)}
								</div>
							</div>
							{/* Status Aktif */}
							<Switch
								checked={formData.is_active}
								onChange={(checked) =>
									setFormData({ ...formData, is_active: checked })
								}
								disabled={saving}
								label="Status Produk"
								description="Produk aktif akan ditampilkan di katalog dan dapat dibeli oleh pelanggan. Produk non-aktif akan disembunyikan dari katalog."
							/>
							{/* Error Message */}
							{hasError && (
								<div className="flex items-center space-x-2 text-[var(--danger)] text-sm">
									<AlertCircle className="w-4 h-4 animate-pulse" />
									<span className="font-['Inter']">
										{!formData.name.trim() || !formData.code.trim()
											? "Nama produk dan kode produk wajib diisi"
											: !skuValidation.isValid
											? skuValidation.message
											: "Terjadi kesalahan, silakan coba lagi"}
									</span>
								</div>
							)}
						</form>
					</div>
					{/* Footer */}
					<div className="pl-8 pr-8 pt-4 pb-4 border-t border-[var(--border)] bg-[var(--muted)]/50">
						<div className="flex space-x-4">
							<OutlineButton
								onClick={handleClose}
								disabled={saving}
								className="flex-1">
								Batal
							</OutlineButton>
							<PrimaryButton
								onClick={() =>
									handleSubmit(
										new Event("submit") as unknown as React.FormEvent
									)
								}
								disabled={
									!formData.name.trim() ||
									!formData.code.trim() ||
									!skuValidation.isValid ||
									saving
								}
								loading={saving}
								className="flex-1">
								{product ? "Perbarui Produk" : "Simpan"}
							</PrimaryButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
