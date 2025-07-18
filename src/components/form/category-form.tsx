"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PrimaryButton, PrimaryStrokeButton } from "@/components/button/button";

interface Category {
	id: string;
	name: string;
	description?: string;
	product_count: number;
	created_at: string;
	updated_at: string;
}

interface CategoryFormProps {
	category?: Category | null;
	isOpen: boolean;
	onClose: () => void;
	onSaveSuccess: (category: Category | null) => void;
	onError: (message: string) => void;
	businessId: string; // Required businessId prop
}

export default function CategoryForm({
	category,
	isOpen,
	onClose,
	onSaveSuccess,
	onError,
	businessId,
}: CategoryFormProps) {
	const [formData, setFormData] = useState({
		name: category?.name || "",
	});
	const [isAnimating, setIsAnimating] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.name.trim()) {
			setSaving(true);
			try {
				if (category) {
					// Update existing category
					const { error } = await supabase
						.from("categories")
						.update({
							name: formData.name.trim(),
							updated_at: new Date().toISOString(),
						})
						.eq("id", category.id)
						.eq("business_id", businessId); // Filter by business ID

					if (error) {
						console.error("Error updating category:", error);
						onError("Gagal memperbarui kategori!");
						return;
					}
				} else {
					// Add new category
					const { error } = await supabase.from("categories").insert([
						{
							name: formData.name.trim(),
							business_id: businessId,
						},
					]);

					if (error) {
						console.error("Error adding category:", error);
						onError("Gagal menambah kategori!");
						return;
					}
				}

				// Call parent callback for success handling
				onSaveSuccess(category || null);
				// Close form after successful save
				handleSuccessfulSave();
			} catch (error) {
				console.error("Error:", error);
				onError("Gagal menyimpan kategori!");
			} finally {
				setSaving(false);
			}
		}
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => {
			onClose();
			setFormData({ name: "" });
			setHasError(false);
		}, 300);
	};

	const handleSuccessfulSave = () => {
		setIsAnimating(false);
		onClose();
		setFormData({ name: "" });
		setHasError(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFormData({ ...formData, name: value });

		// Clear error when user starts typing
		if (hasError && value.trim()) {
			setHasError(false);
		}
	};

	const handleInputBlur = () => {
		if (!formData.name.trim()) {
			setHasError(true);
		}
	};

	const handleButtonSubmit = () => {
		if (formData.name.trim()) {
			// Create a mock event object with preventDefault method
			const mockEvent = {
				preventDefault: () => {},
			} as React.FormEvent;
			handleSubmit(mockEvent);
		}
	};

	// Handle show/hide animation
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			setIsAnimating(false);
			setTimeout(() => setShouldRender(false), 300);
		}
	}, [isOpen]);

	// Update form data when category changes
	useEffect(() => {
		if (category) {
			setFormData({ name: category.name });
		} else {
			setFormData({ name: "" });
		}
	}, [category]);

	if (!shouldRender) return null;

	return (
		<div className="fixed inset-0 z-[9998]">
			{/* Backdrop */}
			<div
				className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out ${
					isAnimating ? "opacity-100" : "opacity-0"
				}`}
				onClick={handleClose}
			/>

			{/* Slider Panel */}
			<div
				className={`absolute top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-10 transform transition-all duration-300 ease-out ${
					isAnimating ? "translate-x-0" : "translate-x-full"
				}`}>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between pl-8 pr-8 pt-4 pb-4 border-b border-gray-100">
						<div>
							<h2 className="text-2xl font-semibold text-[#191919] font-['Inter']">
								{category ? "Edit Kategori" : "Tambah Kategori"}
							</h2>
							<p className="text-[#6B7280] text-sm mt-1 font-['Inter']">
								{category
									? "Perbarui informasi kategori"
									: "Buat kategori baru untuk produk"}
							</p>
						</div>
						<button
							onClick={handleClose}
							disabled={saving}
							className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 group">
							<X className="w-5 h-5 text-[#6B7280] group-hover:text-[#374151] transition-colors" />
						</button>
					</div>

					{/* Form Content */}
					<div className="flex-1 p-8 overflow-y-auto">
						<form onSubmit={handleSubmit} className="space-y-8">
							<div className="space-y-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nama Kategori <span className="text-[#EF476F]">*</span>
								</label>
								<div className="relative group">
									<input
										type="text"
										value={formData.name}
										onChange={handleInputChange}
										onBlur={handleInputBlur}
										maxLength={50}
										className={`appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm ${
											hasError
												? "border-red-300 focus:ring-red-500 focus:border-red-500"
												: ""
										}`}
										placeholder="Contoh: Elektronik, Pakaian, Makanan..."
										required
										autoFocus
										disabled={saving}
									/>

									{/* Character count indicator */}
									{formData.name.length > 0 && (
										<div className="absolute -bottom-6 right-0 text-xs text-[#6B7280] font-['Inter']">
											<span
												className={
													formData.name.length > 40
														? "text-[#EF476F]"
														: "text-[#6B7280]"
												}>
												{formData.name.length}/50
											</span>
										</div>
									)}
								</div>
								{hasError && (
									<div className="flex items-center space-x-2 text-[#EF476F] text-sm">
										<AlertCircle className="w-4 h-4 animate-pulse" />
										<span className="font-['Inter']">
											Nama kategori wajib diisi
										</span>
									</div>
								)}
								<p className="text-[#6B7280] text-sm font-['Inter']">
									Buat nama yang jelas dan mudah diingat untuk mengelompokkan
									produk
								</p>
							</div>
						</form>
					</div>

					{/* Footer */}
					<div className="pl-8 pr-8 pt-4 pb-4 border-t border-gray-100 bg-gray-50/50">
						<div className="flex space-x-4">
							<PrimaryStrokeButton
								onClick={handleClose}
								disabled={saving}
								className="flex-1">
								Batal
							</PrimaryStrokeButton>
							<PrimaryButton
								onClick={handleButtonSubmit}
								disabled={!formData.name.trim() || saving}
								loading={saving}
								className="flex-1">
								{category ? "Perbarui Kategori" : "Simpan"}
							</PrimaryButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
