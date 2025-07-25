"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PrimaryButton, OutlineButton, Input } from "@/components/ui";

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
				className={`absolute top-0 right-0 h-full w-[420px] bg-[var(--card)] shadow-2xl z-10 transform transition-all duration-300 ease-out ${
					isAnimating
						? "translate-x-0 opacity-100"
						: "translate-x-full opacity-0"
				}`}>
				<div className="h-full flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between pl-8 pr-8 pt-4 pb-4 border-b border-[var(--border)]">
						<h2 className="text-lg font-semibold text-[var(--foreground)]">
							{category ? "Edit Kategori" : "Tambah Kategori"}
						</h2>
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
							<div className="space-y-4">
								<Input.Root error={hasError}>
									<Input.Label required>Nama Kategori</Input.Label>
									<Input.Field
										type="text"
										value={formData.name}
										onChange={(value: string) => {
											setFormData({ ...formData, name: value });
											if (hasError && value.trim()) {
												setHasError(false);
											}
										}}
										onBlur={handleInputBlur}
										placeholder="Contoh: Elektronik, Pakaian, Makanan..."
										required
										autoFocus
										disabled={saving}
										maxLength={50}
									/>
									{/* Character count indicator */}
									{formData.name.length > 0 && (
										<div className="absolute -bottom-6 right-0 text-xs text-[var(--muted-foreground)]">
											<span
												className={
													formData.name.length > 40
														? "text-destructive"
														: "text-[var(--muted-foreground)]"
												}>
												{formData.name.length}/50
											</span>
										</div>
									)}
									{hasError && (
										<Input.Error>Nama kategori wajib diisi</Input.Error>
									)}
								</Input.Root>
								<p className="text-[var(--muted-foreground)] text-sm">
									Buat nama yang jelas dan mudah diingat untuk mengelompokkan
									produk
								</p>
							</div>
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
