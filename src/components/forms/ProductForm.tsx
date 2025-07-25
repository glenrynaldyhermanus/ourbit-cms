"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, AlertCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { PrimaryButton, OutlineButton, Input, Select } from "@/components/ui";
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
