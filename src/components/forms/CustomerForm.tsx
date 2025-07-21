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
					customer_type: formData.customer_type,
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
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
					isAnimating ? "opacity-100" : "opacity-0"
				}`}
				onClick={handleClose}
			/>

			{/* Modal */}
			<div
				className={`relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl transition-all duration-300 ${
					isAnimating
						? "opacity-100 scale-100 translate-y-0"
						: "opacity-0 scale-95 translate-y-4"
				}`}>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">
						{customer ? "Edit Pelanggan" : "Tambah Pelanggan"}
					</h2>
					<button
						onClick={handleClose}
						className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Nama */}
						<div className="md:col-span-2">
							<Input.Root>
								<Input.Label>Nama Pelanggan *</Input.Label>
								<Input.Field
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
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
									onChange={(e) =>
										setFormData({ ...formData, code: e.target.value })
									}
									placeholder="Contoh: CUST001"
								/>
							</Input.Root>
						</div>

						{/* Tipe Pelanggan */}
						<div>
							<Select.Root>
								<Select.Label>Tipe Pelanggan</Select.Label>
								<Select.Trigger
									value={
										formData.customer_type === "retail"
											? "Retail"
											: formData.customer_type === "wholesale"
											? "Grosir"
											: "Korporat"
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

						{/* Email */}
						<div>
							<Input.Root>
								<Input.Label>Email</Input.Label>
								<Input.Field
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
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
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									placeholder="+62 812-3456-7890"
								/>
							</Input.Root>
						</div>

						{/* Alamat */}
						<div className="md:col-span-2">
							<Input.Root>
								<Input.Label>Alamat</Input.Label>
								<Input.Field
									type="text"
									value={formData.address}
									onChange={(e) =>
										setFormData({ ...formData, address: e.target.value })
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
									onChange={(e) =>
										setFormData({ ...formData, tax_number: e.target.value })
									}
									placeholder="12.345.678.9-123.000"
								/>
							</Input.Root>
						</div>

						{/* Limit Kredit */}
						<div>
							<Input.Root>
								<Input.Label>Limit Kredit</Input.Label>
								<Input.Field
									type="number"
									value={formData.credit_limit}
									onChange={(e) =>
										setFormData({
											...formData,
											credit_limit: parseFloat(e.target.value) || 0,
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
									onChange={(e) =>
										setFormData({
											...formData,
											payment_terms: parseInt(e.target.value) || 0,
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
						<div className="md:col-span-2">
							<Input.Root>
								<Input.Label>Catatan</Input.Label>
								<Input.Field
									type="text"
									value={formData.notes}
									onChange={(e) =>
										setFormData({ ...formData, notes: e.target.value })
									}
									placeholder="Tambahkan catatan tentang pelanggan"
								/>
							</Input.Root>
						</div>
					</div>

					{/* Buttons */}
					<div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
						<OutlineButton
							type="button"
							onClick={handleClose}
							disabled={saving}>
							Batal
						</OutlineButton>
						<PrimaryButton
							type="submit"
							onClick={handleButtonSubmit}
							disabled={saving}>
							{saving ? "Menyimpan..." : customer ? "Update" : "Simpan"}
						</PrimaryButton>
					</div>
				</form>
			</div>
		</div>
	);
}
