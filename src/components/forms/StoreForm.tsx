"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PrimaryButton, OutlineButton, Input, Select } from "@/components/ui";
import { Store } from "@/types";

interface StoreFormProps {
	store?: Store | null;
	isOpen: boolean;
	onClose: () => void;
	onSaveSuccess: (store: Store | null) => void;
	onError: (message: string) => void;
	businessId: string;
}

export default function StoreForm({
	store,
	isOpen,
	onClose,
	onSaveSuccess,
	onError,
	businessId,
}: StoreFormProps) {
	const [formData, setFormData] = useState({
		name: store?.name || "",
		address: store?.address || "",
		latitude: store?.latitude || 0,
		longitude: store?.longitude || 0,
		phone_country_code: store?.phone_country_code || "+62",
		phone_number: store?.phone_number || "",
		phone_verified: store?.phone_verified ?? false,
		business_field: store?.business_field || "",
		business_description: store?.business_description || "",
		stock_setting: store?.stock_setting || "auto",
		currency: store?.currency || "IDR",
		default_tax_rate: store?.default_tax_rate || 0,
		motto: store?.motto || "",
		is_branch: store?.is_branch ?? true,
		country_id: store?.country_id || "",
		province_id: store?.province_id || "",
		city_id: store?.city_id || "",
	});
	const [isAnimating, setIsAnimating] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.name.trim() && formData.address.trim()) {
			setSaving(true);
			try {
				const storeData = {
					name: formData.name.trim(),
					address: formData.address.trim(),
					latitude: formData.latitude || null,
					longitude: formData.longitude || null,
					phone_country_code: formData.phone_country_code.trim() || "+62",
					phone_number: formData.phone_number.trim(),
					phone_verified: formData.phone_verified,
					business_field: formData.business_field.trim(),
					business_description: formData.business_description.trim() || null,
					stock_setting: formData.stock_setting,
					currency: formData.currency,
					default_tax_rate: formData.default_tax_rate,
					motto: formData.motto.trim() || null,
					is_branch: formData.is_branch,
					business_id: businessId,
					country_id: formData.country_id || "default-country",
					province_id: formData.province_id || "default-province",
					city_id: formData.city_id || "default-city",
				};

				if (store) {
					// Update existing store
					const { error } = await supabase
						.from("stores")
						.update({
							...storeData,
							updated_at: new Date().toISOString(),
						})
						.eq("id", store.id)
						.eq("business_id", businessId);

					if (error) {
						console.error("Error updating store:", error);
						onError("Gagal memperbarui toko!");
						return;
					}
				} else {
					// Add new store
					const { error } = await supabase.from("stores").insert([storeData]);

					if (error) {
						console.error("Error adding store:", error);
						onError("Gagal menambah toko!");
						return;
					}
				}

				// Call parent callback for success handling
				onSaveSuccess(store || null);
				// Close form after successful save
				handleSuccessfulSave();
			} catch (error) {
				console.error("Error:", error);
				onError("Gagal menyimpan toko!");
			} finally {
				setSaving(false);
			}
		}
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => {
			onClose();
			setFormData({
				name: "",
				address: "",
				latitude: 0,
				longitude: 0,
				phone_country_code: "+62",
				phone_number: "",
				phone_verified: false,
				business_field: "",
				business_description: "",
				stock_setting: "auto",
				currency: "IDR",
				default_tax_rate: 0,
				motto: "",
				is_branch: true,
				country_id: "",
				province_id: "",
				city_id: "",
			});
			setHasError(false);
		}, 300);
	};

	const handleSuccessfulSave = () => {
		setIsAnimating(false);
		setTimeout(() => {
			onClose();
			setFormData({
				name: "",
				address: "",
				latitude: 0,
				longitude: 0,
				phone_country_code: "+62",
				phone_number: "",
				phone_verified: false,
				business_field: "",
				business_description: "",
				stock_setting: "auto",
				currency: "IDR",
				default_tax_rate: 0,
				motto: "",
				is_branch: true,
				country_id: "",
				province_id: "",
				city_id: "",
			});
			setHasError(false);
		}, 300);
	};

	const handleInputBlur = () => {
		setHasError(false);
	};

	const handleButtonSubmit = () => {
		if (!formData.name.trim() || !formData.address.trim()) {
			setHasError(true);
		}
	};

	// Handle form data changes when store prop changes
	useEffect(() => {
		if (store) {
			setFormData({
				name: store.name || "",
				address: store.address || "",
				latitude: store.latitude || 0,
				longitude: store.longitude || 0,
				phone_country_code: store.phone_country_code || "+62",
				phone_number: store.phone_number || "",
				phone_verified: store.phone_verified ?? false,
				business_field: store.business_field || "",
				business_description: store.business_description || "",
				stock_setting: store.stock_setting || "auto",
				currency: store.currency || "IDR",
				default_tax_rate: store.default_tax_rate || 0,
				motto: store.motto || "",
				is_branch: store.is_branch ?? true,
				country_id: store.country_id || "",
				province_id: store.province_id || "",
				city_id: store.city_id || "",
			});
		}
	}, [store]);

	// Handle modal animation
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			setIsAnimating(false);
			setTimeout(() => setShouldRender(false), 300);
		}
	}, [isOpen]);

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
					isAnimating
						? "translate-x-0 opacity-100"
						: "translate-x-full opacity-0"
				}`}>
				<div className="h-full flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between pl-8 pr-8 pt-4 pb-4 border-b border-[var(--border)]">
						<h2 className="text-lg font-semibold text-[var(--foreground)]">
							{store ? "Edit Toko" : "Tambah Toko"}
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
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Nama Toko */}
							<div>
								<Input.Root>
									<Input.Label>Nama Toko *</Input.Label>
									<Input.Field
										type="text"
										value={formData.name}
										onChange={(value) =>
											setFormData({ ...formData, name: value })
										}
										onBlur={handleInputBlur}
										placeholder="Masukkan nama toko"
										className={
											hasError && !formData.name.trim() ? "border-red-500" : ""
										}
									/>
									{hasError && !formData.name.trim() && (
										<Input.Error>Nama toko wajib diisi</Input.Error>
									)}
								</Input.Root>
							</div>

							{/* Alamat */}
							<div>
								<Input.Root>
									<Input.Label>Alamat *</Input.Label>
									<Input.Field
										type="text"
										value={formData.address}
										onChange={(value) =>
											setFormData({ ...formData, address: value })
										}
										onBlur={handleInputBlur}
										placeholder="Masukkan alamat lengkap"
										className={
											hasError && !formData.address.trim()
												? "border-red-500"
												: ""
										}
									/>
									{hasError && !formData.address.trim() && (
										<Input.Error>Alamat toko wajib diisi</Input.Error>
									)}
								</Input.Root>
							</div>

							{/* Nomor Telepon */}
							<div>
								<Input.Root>
									<Input.Label>Nomor Telepon *</Input.Label>
									<Input.Field
										type="tel"
										value={formData.phone_number}
										onChange={(value) =>
											setFormData({ ...formData, phone_number: value })
										}
										placeholder="812-3456-7890"
									/>
								</Input.Root>
							</div>

							{/* Bidang Usaha */}
							<div>
								<Input.Root>
									<Input.Label>Bidang Usaha *</Input.Label>
									<Input.Field
										type="text"
										value={formData.business_field}
										onChange={(value) =>
											setFormData({ ...formData, business_field: value })
										}
										placeholder="Contoh: Retail, F&B, Fashion"
									/>
								</Input.Root>
							</div>

							{/* Deskripsi Bisnis */}
							<div>
								<Input.Root>
									<Input.Label>Deskripsi Bisnis</Input.Label>
									<Input.Field
										type="text"
										value={formData.business_description}
										onChange={(value) =>
											setFormData({ ...formData, business_description: value })
										}
										placeholder="Deskripsi singkat tentang bisnis"
									/>
								</Input.Root>
							</div>

							{/* Mata Uang */}
							<div>
								<Select.Root>
									<Select.Label>Mata Uang</Select.Label>
									<Select.Trigger
										value={formData.currency}
										placeholder="Pilih mata uang"
									/>
									<Select.Content>
										<Select.Item
											value="IDR"
											onClick={() =>
												setFormData({ ...formData, currency: "IDR" })
											}
											selected={formData.currency === "IDR"}>
											IDR (Rupiah)
										</Select.Item>
										<Select.Item
											value="USD"
											onClick={() =>
												setFormData({ ...formData, currency: "USD" })
											}
											selected={formData.currency === "USD"}>
											USD (Dollar)
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>

							{/* Pajak Default */}
							<div>
								<Input.Root>
									<Input.Label>Pajak Default (%)</Input.Label>
									<Input.Field
										type="number"
										value={formData.default_tax_rate}
										onChange={(value) =>
											setFormData({
												...formData,
												default_tax_rate: parseFloat(value) || 0,
											})
										}
										placeholder="0"
									/>
								</Input.Root>
							</div>

							{/* Stock Setting */}
							<div>
								<Select.Root>
									<Select.Label>Pengaturan Stok</Select.Label>
									<Select.Trigger
										value={
											formData.stock_setting === "auto"
												? "Otomatis"
												: formData.stock_setting === "manual"
												? "Manual"
												: "Tidak Ada"
										}
										placeholder="Pilih pengaturan stok"
									/>
									<Select.Content>
										<Select.Item
											value="auto"
											onClick={() =>
												setFormData({ ...formData, stock_setting: "auto" })
											}
											selected={formData.stock_setting === "auto"}>
											Otomatis
										</Select.Item>
										<Select.Item
											value="manual"
											onClick={() =>
												setFormData({ ...formData, stock_setting: "manual" })
											}
											selected={formData.stock_setting === "manual"}>
											Manual
										</Select.Item>
										<Select.Item
											value="none"
											onClick={() =>
												setFormData({ ...formData, stock_setting: "none" })
											}
											selected={formData.stock_setting === "none"}>
											Tidak Ada
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>

							{/* Tipe Toko */}
							<div>
								<Select.Root>
									<Select.Label>Tipe Toko</Select.Label>
									<Select.Trigger
										value={formData.is_branch ? "Cabang" : "Pusat"}
										placeholder="Pilih tipe toko"
									/>
									<Select.Content>
										<Select.Item
											value="main"
											onClick={() =>
												setFormData({ ...formData, is_branch: false })
											}
											selected={!formData.is_branch}>
											Pusat
										</Select.Item>
										<Select.Item
											value="branch"
											onClick={() =>
												setFormData({ ...formData, is_branch: true })
											}
											selected={formData.is_branch}>
											Cabang
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>

							{/* Motto */}
							<div>
								<Input.Root>
									<Input.Label>Motto Toko</Input.Label>
									<Input.Field
										type="text"
										value={formData.motto}
										onChange={(value) =>
											setFormData({ ...formData, motto: value })
										}
										placeholder="Motto atau tagline toko"
									/>
								</Input.Root>
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
								onClick={() =>
									handleSubmit(
										new Event("submit") as unknown as React.FormEvent
									)
								}
								disabled={saving}
								loading={saving}
								className="flex-1">
								{store ? "Update Toko" : "Simpan"}
							</PrimaryButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
