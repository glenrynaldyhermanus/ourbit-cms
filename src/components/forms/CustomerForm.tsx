"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PrimaryButton, OutlineButton, Input, Select } from "@/components/ui";
import { Customer } from "@/types";

interface CustomerFormProps {
	customer?: Customer | null;
	isOpen: boolean;
	onClose: () => void;
	onSaveSuccess: (customer: Customer | null) => void;
	onError: (message: string) => void;
	businessId: string;
}

export default function CustomerForm({
	customer,
	isOpen,
	onClose,
	onSaveSuccess,
	onError,
	businessId,
}: CustomerFormProps) {
	const [formData, setFormData] = useState({
		name: customer?.name || "",
		code: customer?.code || "",
		email: customer?.email || "",
		phone: customer?.phone || "",
		address: customer?.address || "",
		city_id: customer?.city_id || "",
		province_id: customer?.province_id || "",
		country_id: customer?.country_id || "",
		tax_number: customer?.tax_number || "",
		customer_type: customer?.customer_type || "retail",
		credit_limit: customer?.credit_limit || 0,
		payment_terms: customer?.payment_terms || 0,
		is_active: customer?.is_active ?? true,
		notes: customer?.notes || "",
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
				const customerData = {
					name: formData.name.trim(),
					code: formData.code.trim() || null,
					email: formData.email.trim() || null,
					phone: formData.phone.trim() || null,
					address: formData.address.trim() || null,
					city_id: formData.city_id || null,
					province_id: formData.province_id || null,
					country_id: formData.country_id || null,
					tax_number: formData.tax_number.trim() || null,
					customer_type: formData.customer_type || "retail",
					credit_limit: formData.credit_limit,
					payment_terms: formData.payment_terms,
					is_active: formData.is_active,
					notes: formData.notes.trim() || null,
					business_id: businessId,
				};

				if (customer) {
					// Update existing customer
					const { error } = await supabase
						.from("customers")
						.update({
							...customerData,
							updated_at: new Date().toISOString(),
						})
						.eq("id", customer.id)
						.eq("business_id", businessId);

					if (error) {
						console.error("Error updating customer:", error);
						onError("Gagal memperbarui pelanggan!");
						return;
					}
				} else {
					// Add new customer
					const { error } = await supabase
						.from("customers")
						.insert([customerData]);

					if (error) {
						console.error("Error adding customer:", error);
						onError("Gagal menambah pelanggan!");
						return;
					}
				}

				// Call parent callback for success handling
				onSaveSuccess(customer || null);
				// Close form after successful save
				handleSuccessfulSave();
			} catch (error) {
				console.error("Error:", error);
				onError("Gagal menyimpan pelanggan!");
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
				code: "",
				email: "",
				phone: "",
				address: "",
				city_id: "",
				province_id: "",
				country_id: "",
				tax_number: "",
				customer_type: "retail",
				credit_limit: 0,
				payment_terms: 0,
				is_active: true,
				notes: "",
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
				code: "",
				email: "",
				phone: "",
				address: "",
				city_id: "",
				province_id: "",
				country_id: "",
				tax_number: "",
				customer_type: "retail",
				credit_limit: 0,
				payment_terms: 0,
				is_active: true,
				notes: "",
			});
			setHasError(false);
		}, 300);
	};

	const handleInputBlur = () => {
		setHasError(false);
	};

	const handleButtonSubmit = () => {
		if (!formData.name.trim()) {
			setHasError(true);
		}
	};

	// Handle form data changes when customer prop changes
	useEffect(() => {
		if (customer) {
			setFormData({
				name: customer.name || "",
				code: customer.code || "",
				email: customer.email || "",
				phone: customer.phone || "",
				address: customer.address || "",
				city_id: customer.city_id || "",
				province_id: customer.province_id || "",
				country_id: customer.country_id || "",
				tax_number: customer.tax_number || "",
				customer_type: customer.customer_type || "retail",
				credit_limit: customer.credit_limit || 0,
				payment_terms: customer.payment_terms || 0,
				is_active: customer.is_active ?? true,
				notes: customer.notes || "",
			});
		}
	}, [customer]);

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
							{customer ? "Edit Pelanggan" : "Tambah Pelanggan"}
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
							{/* Nama */}
							<div>
								<Input.Root>
									<Input.Label>Nama Pelanggan *</Input.Label>
									<Input.Field
										type="text"
										value={formData.name}
										onChange={(value) =>
											setFormData({ ...formData, name: value })
										}
										onBlur={handleInputBlur}
										placeholder="Masukkan nama pelanggan"
										className={
											hasError && !formData.name.trim() ? "border-red-500" : ""
										}
									/>
									{hasError && !formData.name.trim() && (
										<Input.Error>Nama pelanggan wajib diisi</Input.Error>
									)}
								</Input.Root>
							</div>

							{/* Kode */}
							<div>
								<Input.Root>
									<Input.Label>Kode Pelanggan</Input.Label>
									<Input.Field
										type="text"
										value={formData.code}
										onChange={(value) =>
											setFormData({ ...formData, code: value })
										}
										placeholder="Contoh: CUST001"
									/>
								</Input.Root>
							</div>

							{/* Email */}
							<div>
								<Input.Root>
									<Input.Label>Email</Input.Label>
									<Input.Field
										type="email"
										value={formData.email}
										onChange={(value) =>
											setFormData({ ...formData, email: value })
										}
										placeholder="email@example.com"
									/>
								</Input.Root>
							</div>

							{/* Telepon */}
							<div>
								<Input.Root>
									<Input.Label>Nomor Telepon</Input.Label>
									<Input.Field
										type="tel"
										value={formData.phone}
										onChange={(value) =>
											setFormData({ ...formData, phone: value })
										}
										placeholder="+62 812-3456-7890"
									/>
								</Input.Root>
							</div>

							{/* Alamat */}
							<div>
								<Input.Root>
									<Input.Label>Alamat</Input.Label>
									<Input.Field
										type="text"
										value={formData.address}
										onChange={(value) =>
											setFormData({ ...formData, address: value })
										}
										placeholder="Masukkan alamat lengkap"
									/>
								</Input.Root>
							</div>

							{/* NPWP */}
							<div>
								<Input.Root>
									<Input.Label>NPWP</Input.Label>
									<Input.Field
										type="text"
										value={formData.tax_number}
										onChange={(value) =>
											setFormData({ ...formData, tax_number: value })
										}
										placeholder="12.345.678.9-123.000"
									/>
								</Input.Root>
							</div>

							{/* Customer Type */}
							<div>
								<Select.Root>
									<Select.Label>Tipe Pelanggan</Select.Label>
									<Select.Trigger
										value={
											formData.customer_type === "retail"
												? "Retail"
												: formData.customer_type === "wholesale"
												? "Grosir"
												: formData.customer_type === "corporate"
												? "Korporat"
												: "Retail"
										}
										placeholder="Pilih tipe pelanggan"
									/>
									<Select.Content>
										<Select.Item
											value="retail"
											onClick={() =>
												setFormData({ ...formData, customer_type: "retail" })
											}
											selected={formData.customer_type === "retail"}>
											Retail
										</Select.Item>
										<Select.Item
											value="wholesale"
											onClick={() =>
												setFormData({ ...formData, customer_type: "wholesale" })
											}
											selected={formData.customer_type === "wholesale"}>
											Grosir
										</Select.Item>
										<Select.Item
											value="corporate"
											onClick={() =>
												setFormData({ ...formData, customer_type: "corporate" })
											}
											selected={formData.customer_type === "corporate"}>
											Korporat
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>

							{/* Limit Kredit */}
							<div>
								<Input.Root>
									<Input.Label>Limit Kredit</Input.Label>
									<Input.Field
										type="number"
										value={formData.credit_limit}
										onChange={(value) =>
											setFormData({
												...formData,
												credit_limit: parseFloat(value) || 0,
											})
										}
										placeholder="0"
									/>
								</Input.Root>
							</div>

							{/* Term Pembayaran */}
							<div>
								<Input.Root>
									<Input.Label>Term Pembayaran (hari)</Input.Label>
									<Input.Field
										type="number"
										value={formData.payment_terms}
										onChange={(value) =>
											setFormData({
												...formData,
												payment_terms: parseInt(value) || 0,
											})
										}
										placeholder="30"
									/>
								</Input.Root>
							</div>

							{/* Status */}
							<div>
								<Select.Root>
									<Select.Label>Status</Select.Label>
									<Select.Trigger
										value={formData.is_active ? "Aktif" : "Nonaktif"}
										placeholder="Pilih status"
									/>
									<Select.Content>
										<Select.Item
											value="active"
											onClick={() =>
												setFormData({ ...formData, is_active: true })
											}
											selected={formData.is_active}>
											Aktif
										</Select.Item>
										<Select.Item
											value="inactive"
											onClick={() =>
												setFormData({ ...formData, is_active: false })
											}
											selected={!formData.is_active}>
											Nonaktif
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>

							{/* Catatan */}
							<div>
								<Input.Root>
									<Input.Label>Catatan</Input.Label>
									<Input.Field
										type="text"
										value={formData.notes}
										onChange={(value) =>
											setFormData({ ...formData, notes: value })
										}
										placeholder="Tambahkan catatan tentang pelanggan"
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
								{customer ? "Update Pelanggan" : "Simpan"}
							</PrimaryButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
