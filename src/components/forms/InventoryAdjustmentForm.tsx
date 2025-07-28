"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle, Plus, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PrimaryButton, OutlineButton, Input, Select } from "@/components/ui";
import { InventoryItem } from "@/lib/inventory";
import { performStockAdjustment } from "@/lib/inventory";

interface InventoryAdjustmentFormProps {
	item: InventoryItem | null;
	isOpen: boolean;
	onClose: () => void;
	onSaveSuccess: () => void;
	onError: (message: string) => void;
	storeId: string;
}

export default function InventoryAdjustmentForm({
	item,
	isOpen,
	onClose,
	onSaveSuccess,
	onError,
	storeId,
}: InventoryAdjustmentFormProps) {
	const [formData, setFormData] = useState({
		adjustmentType: "add" as "add" | "subtract",
		quantity: 0,
		reason: "",
		note: "",
	});
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [saving, setSaving] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [reasonSelectOpen, setReasonSelectOpen] = useState(false);
	const reasonDropdownRef = React.useRef<HTMLDivElement>(null);

	const adjustmentReasons = [
		{ key: "damaged", value: "Barang Rusak" },
		{ key: "expired", value: "Kadaluarsa" },
		{ key: "lost", value: "Hilang" },
		{ key: "found", value: "Ditemukan" },
		{ key: "correction", value: "Koreksi Perhitungan" },
		{ key: "other", value: "Lainnya" },
	];

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
			setReasonSelectOpen(false);
		}
	}, [isOpen]);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;

			// Check if click is outside dropdown elements using refs
			const isOutsideReason =
				reasonDropdownRef.current &&
				!reasonDropdownRef.current.contains(target);

			if (isOutsideReason && reasonSelectOpen) {
				setReasonSelectOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, reasonSelectOpen]);

	// Reset form when item changes
	useEffect(() => {
		if (item) {
			setFormData({
				adjustmentType: "add",
				quantity: 0,
				reason: "",
				note: "",
			});
			setHasError(false);
		}
	}, [item]);

	const getReasonLabel = (reasonKey: string) => {
		if (!reasonKey) return "";
		const reason = adjustmentReasons.find((r) => r.key === reasonKey);
		return reason ? reason.value : "";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted with data:", formData);

		if (!item) {
			console.error("Item not found");
			onError("Item tidak ditemukan");
			return;
		}

		// Validate required fields
		if (!formData.quantity || formData.quantity <= 0) {
			console.error("Invalid quantity:", formData.quantity);
			setHasError(true);
			onError("Jumlah harus lebih dari 0");
			return;
		}

		if (!formData.reason) {
			console.error("No reason provided");
			setHasError(true);
			onError("Alasan penyesuaian wajib diisi");
			return;
		}

		try {
			console.log("Starting stock adjustment process...");
			setSaving(true);
			setHasError(false);

			// Get current user
			console.log("Getting current user...");
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user) {
				console.error("Authentication error:", authError);
				onError("User tidak terautentikasi");
				return;
			}

			console.log("User authenticated:", user.id);
			console.log("Calling performStockAdjustment with:", {
				itemId: item.id,
				adjustmentType: formData.adjustmentType,
				quantity: formData.quantity,
				reason: formData.reason,
				note: formData.note,
				currentStock: item.current_stock,
				userId: user.id,
				storeId: storeId,
			});

			const result = await performStockAdjustment(
				item.id,
				formData.adjustmentType,
				formData.quantity,
				formData.reason,
				formData.note,
				item.current_stock,
				user.id,
				storeId
			);

			console.log("Stock adjustment result:", result);

			if (result.success) {
				console.log("Stock adjustment successful, calling onSaveSuccess");
				onSaveSuccess();
				handleClose();
			} else {
				console.error("Stock adjustment failed:", result.error);
				onError(result.error || "Gagal melakukan penyesuaian stok");
			}
		} catch (error) {
			console.error("Error performing stock adjustment:", error);
			onError("Terjadi kesalahan saat melakukan penyesuaian stok");
		} finally {
			console.log("Setting saving to false");
			setSaving(false);
		}
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => {
			onClose();
			setFormData({
				adjustmentType: "add",
				quantity: 0,
				reason: "",
				note: "",
			});
			setHasError(false);
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
					isAnimating
						? "translate-x-0 opacity-100"
						: "translate-x-full opacity-0"
				}`}>
				<div className="h-full flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between pl-8 pr-8 pt-4 pb-4 border-b border-[var(--border)]">
						<h2 className="text-lg font-semibold text-[var(--foreground)]">
							Penyesuaian Stok
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
							{/* Product Info */}
							{item && (
								<div className="bg-[var(--muted)] rounded-lg p-4">
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
											<AlertCircle className="w-6 h-6 text-orange-600" />
										</div>
										<div className="flex-1">
											<p className="font-medium text-[var(--foreground)]">
												{item.product_name}
											</p>
											<p className="text-sm text-[var(--muted-foreground)]">
												{item.sku} • Stok saat ini: {item.current_stock}{" "}
												{item.unit}
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Adjustment Type */}
							<div>
								<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
									Jenis Penyesuaian
								</label>
								<div className="grid grid-cols-2 gap-2">
									<button
										type="button"
										onClick={() =>
											setFormData({ ...formData, adjustmentType: "add" })
										}
										className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
											formData.adjustmentType === "add"
												? "border-green-500 bg-green-50 text-green-700"
												: "border-[var(--border)] hover:bg-[var(--muted)]"
										}`}>
										<Plus className="w-4 h-4 mx-auto mb-1" />
										Tambah Stok
									</button>
									<button
										type="button"
										onClick={() =>
											setFormData({ ...formData, adjustmentType: "subtract" })
										}
										className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
											formData.adjustmentType === "subtract"
												? "border-red-500 bg-red-50 text-red-700"
												: "border-[var(--border)] hover:bg-[var(--muted)]"
										}`}>
										<Minus className="w-4 h-4 mx-auto mb-1" />
										Kurangi Stok
									</button>
								</div>
							</div>

							{/* Quantity */}
							<div>
								<Input.Root error={hasError && !formData.quantity}>
									<Input.Label required>Jumlah</Input.Label>
									<Input.Field
										type="number"
										value={formData.quantity || ""}
										onChange={(value: string) =>
											setFormData({ ...formData, quantity: Number(value) })
										}
										placeholder="Masukkan jumlah"
										required
										disabled={saving}
									/>
									{hasError && !formData.quantity && (
										<Input.Error>Jumlah harus lebih dari 0</Input.Error>
									)}
								</Input.Root>
							</div>

							{/* Reason */}
							<div ref={reasonDropdownRef} className="select-dropdown">
								<Select.Root>
									<Select.Label required>Alasan</Select.Label>
									<Select.Trigger
										value={getReasonLabel(formData.reason)}
										placeholder="Pilih alasan"
										disabled={saving}
										onClick={() => setReasonSelectOpen(!reasonSelectOpen)}
										open={reasonSelectOpen}
									/>
									<Select.Content open={reasonSelectOpen}>
										{adjustmentReasons.map((reason) => (
											<Select.Item
												key={reason.key}
												value={reason.key}
												onClick={() => {
													setFormData({ ...formData, reason: reason.key });
													setReasonSelectOpen(false);
												}}
												selected={formData.reason === reason.key}>
												{reason.value}
											</Select.Item>
										))}
									</Select.Content>
								</Select.Root>
							</div>

							{/* Note */}
							<div>
								<Input.Root>
									<Input.Label>Catatan</Input.Label>
									<Input.Field
										type="text"
										value={formData.note}
										onChange={(value: string) =>
											setFormData({ ...formData, note: value })
										}
										placeholder="Catatan tambahan (opsional)"
										disabled={saving}
									/>
								</Input.Root>
							</div>

							{/* Preview */}
							{item && (
								<div className="bg-blue-50 p-3 rounded-lg">
									<p className="text-sm text-blue-800">
										<strong>Stok setelah penyesuaian:</strong>{" "}
										{formData.adjustmentType === "add"
											? item.current_stock + formData.quantity
											: item.current_stock - formData.quantity}{" "}
										{item.unit}
									</p>
								</div>
							)}

							{/* Error Message */}
							{hasError && (
								<div className="flex items-center space-x-2 text-[#EF476F] text-sm">
									<AlertCircle className="w-4 h-4 animate-pulse" />
									<span className="font-['Inter']">
										{!formData.quantity
											? "Jumlah harus lebih dari 0"
											: !formData.reason
											? "Alasan penyesuaian wajib diisi"
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
									!formData.quantity ||
									formData.quantity <= 0 ||
									!formData.reason ||
									saving
								}
								loading={saving}
								className="flex-1">
								Simpan Penyesuaian
							</PrimaryButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
