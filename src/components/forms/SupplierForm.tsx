"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PrimaryButton, OutlineButton, Input, Select } from "@/components/ui";
import { Supplier } from "@/types";

interface SupplierFormProps {
	supplier?: Supplier | null;
	isOpen: boolean;
	onClose: () => void;
	onSaveSuccess: (supplier: Supplier | null) => void;
	onError: (message: string) => void;
	businessId: string;
}

export default function SupplierForm({
	supplier,
	isOpen,
	onClose,
	onSaveSuccess,
	onError,
	businessId,
}: SupplierFormProps) {
	const [formData, setFormData] = useState({
		name: supplier?.name || "",
		code: supplier?.code || "",
		contact_person: supplier?.contact_person || "",
		email: supplier?.email || "",
		phone: supplier?.phone || "",
		address: supplier?.address || "",
		city_id: supplier?.city_id || "",
		province_id: supplier?.province_id || "",
		country_id: supplier?.country_id || "",
		tax_number: supplier?.tax_number || "",
		bank_name: supplier?.bank_name || "",
		bank_account_number: supplier?.bank_account_number || "",
		bank_account_name: supplier?.bank_account_name || "",
		credit_limit: supplier?.credit_limit || 0,
		payment_terms: supplier?.payment_terms || 0,
		is_active: supplier?.is_active ?? true,
		notes: supplier?.notes || "",
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
				const supplierData = {
					name: formData.name.trim(),
					code: formData.code.trim() || null,
					contact_person: formData.contact_person.trim() || null,
					email: formData.email.trim() || null,
					phone: formData.phone.trim() || null,
					address: formData.address.trim() || null,
					city_id: formData.city_id || null,
					province_id: formData.province_id || null,
					country_id: formData.country_id || null,
					tax_number: formData.tax_number.trim() || null,
					bank_name: formData.bank_name.trim() || null,
					bank_account_number: formData.bank_account_number.trim() || null,
					bank_account_name: formData.bank_account_name.trim() || null,
					credit_limit: formData.credit_limit,
					payment_terms: formData.payment_terms,
					is_active: formData.is_active,
					notes: formData.notes.trim() || null,
					business_id: businessId,
				};

				if (supplier) {
					// Update existing supplier
					const { error } = await supabase
						.from("suppliers")
						.update({
							...supplierData,
							updated_at: new Date().toISOString(),
						})
						.eq("id", supplier.id)
						.eq("business_id", businessId);

					if (error) {
						console.error("Error updating supplier:", error);
						onError("Gagal memperbarui supplier!");
						return;
					}
				} else {
					// Add new supplier
					const { error } = await supabase
						.from("suppliers")
						.insert([supplierData]);

					if (error) {
						console.error("Error adding supplier:", error);
						onError("Gagal menambah supplier!");
						return;
					}
				}

				// Call parent callback for success handling
				onSaveSuccess(supplier || null);
				// Close form after successful save
				handleSuccessfulSave();
			} catch (error) {
				console.error("Error:", error);
				onError("Gagal menyimpan supplier!");
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
				contact_person: "",
				email: "",
				phone: "",
				address: "",
				city_id: "",
				province_id: "",
				country_id: "",
				tax_number: "",
				bank_name: "",
				bank_account_number: "",
				bank_account_name: "",
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
				contact_person: "",
				email: "",
				phone: "",
				address: "",
				city_id: "",
				province_id: "",
				country_id: "",
				tax_number: "",
				bank_name: "",
				bank_account_number: "",
				bank_account_name: "",
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

	// Handle form data changes when supplier prop changes
	useEffect(() => {
		if (supplier) {
			setFormData({
				name: supplier.name || "",
				code: supplier.code || "",
				contact_person: supplier.contact_person || "",
				email: supplier.email || "",
				phone: supplier.phone || "",
				address: supplier.address || "",
				city_id: supplier.city_id || "",
				province_id: supplier.province_id || "",
				country_id: supplier.country_id || "",
				tax_number: supplier.tax_number || "",
				bank_name: supplier.bank_name || "",
				bank_account_number: supplier.bank_account_number || "",
				bank_account_name: supplier.bank_account_name || "",
				credit_limit: supplier.credit_limit || 0,
				payment_terms: supplier.payment_terms || 0,
				is_active: supplier.is_active ?? true,
				notes: supplier.notes || "",
			});
		}
	}, [supplier]);

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
						{supplier ? "Edit Supplier" : "Tambah Supplier"}
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
								<Input.Label>Nama Supplier *</Input.Label>
								<Input.Field
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									onBlur={handleInputBlur}
									placeholder="Masukkan nama supplier"
									className={
										hasError && !formData.name.trim() ? "border-red-500" : ""
									}
								/>
								{hasError && !formData.name.trim() && (
									<Input.Error>Nama supplier wajib diisi</Input.Error>
								)}
							</Input.Root>
						</div>

						{/* Kode */}
						<div>
							<Input.Root>
								<Input.Label>Kode Supplier</Input.Label>
								<Input.Field
									type="text"
									value={formData.code}
									onChange={(e) =>
										setFormData({ ...formData, code: e.target.value })
									}
									placeholder="Contoh: SUP001"
								/>
							</Input.Root>
						</div>

						{/* Contact Person */}
						<div>
							<Input.Root>
								<Input.Label>Contact Person</Input.Label>
								<Input.Field
									type="text"
									value={formData.contact_person}
									onChange={(e) =>
										setFormData({ ...formData, contact_person: e.target.value })
									}
									placeholder="Nama contact person"
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

						{/* Bank Name */}
						<div>
							<Input.Root>
								<Input.Label>Nama Bank</Input.Label>
								<Input.Field
									type="text"
									value={formData.bank_name}
									onChange={(e) =>
										setFormData({ ...formData, bank_name: e.target.value })
									}
									placeholder="Contoh: BCA, Mandiri"
								/>
							</Input.Root>
						</div>

						{/* Bank Account Number */}
						<div>
							<Input.Root>
								<Input.Label>Nomor Rekening</Input.Label>
								<Input.Field
									type="text"
									value={formData.bank_account_number}
									onChange={(e) =>
										setFormData({
											...formData,
											bank_account_number: e.target.value,
										})
									}
									placeholder="1234567890"
								/>
							</Input.Root>
						</div>

						{/* Bank Account Name */}
						<div>
							<Input.Root>
								<Input.Label>Nama Pemilik Rekening</Input.Label>
								<Input.Field
									type="text"
									value={formData.bank_account_name}
									onChange={(e) =>
										setFormData({
											...formData,
											bank_account_name: e.target.value,
										})
									}
									placeholder="Nama pemilik rekening"
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
									placeholder="Tambahkan catatan tentang supplier"
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
							{saving ? "Menyimpan..." : supplier ? "Update" : "Simpan"}
						</PrimaryButton>
					</div>
				</form>
			</div>
		</div>
	);
}
