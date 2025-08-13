"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AlignInput from "@/components/ui/Input";
import { useToast } from "@/components";
import supabase from "@/lib/supabase";

type ShippingRate = {
	id: string;
	name: string;
	amount: number;
	pricing_mode?: "flat" | "per_kg" | null;
	amount_per_kg?: number | null;
	region?: string | null;
	is_active: boolean;
	store_id: string;
};

export default function ShippingRatesPage() {
	const [rates, setRates] = useState<ShippingRate[]>([]);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		amount: "",
		pricing_mode: "flat" as "flat" | "per_kg",
		amount_per_kg: "",
		region: "",
	});
	const [editingId, setEditingId] = useState<string | null>(null);
	const { showToast } = useToast();

	const loadRates = async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("shipping_rates")
				.select(
					"id, name, amount, pricing_mode, amount_per_kg, region, is_active, store_id"
				)
				.order("amount", { ascending: true });
			if (error) throw error;
			setRates(data || []);
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadRates();
	}, [loadRates]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name || !formData.amount) {
			showToast({
				type: "error",
				title: "Error",
				message: "Nama dan jumlah harus diisi",
			});
			return;
		}
		if (formData.pricing_mode === "per_kg" && !formData.amount_per_kg) {
			showToast({
				type: "error",
				title: "Error",
				message: "Amount per kg wajib diisi untuk mode per_kg",
			});
			return;
		}

		try {
			const payload: {
				name: string;
				amount: number;
				pricing_mode: "flat" | "per_kg";
				amount_per_kg: number | null;
				region: string | null;
				is_active: boolean;
			} = {
				name: formData.name,
				amount: Number(formData.amount),
				pricing_mode: formData.pricing_mode,
				amount_per_kg:
					formData.pricing_mode === "per_kg"
						? Number(formData.amount_per_kg || 0)
						: null,
				region: formData.region || null,
				is_active: true,
			};

			if (editingId) {
				const { error } = await supabase
					.from("shipping_rates")
					.update(payload)
					.eq("id", editingId);
				if (error) throw error;
				showToast({
					type: "success",
					title: "Berhasil",
					message: "Rate berhasil diupdate",
				});
			} else {
				const { error } = await supabase.from("shipping_rates").insert(payload);
				if (error) throw error;
				showToast({
					type: "success",
					title: "Berhasil",
					message: "Rate berhasil ditambah",
				});
			}

			setFormData({
				name: "",
				amount: "",
				pricing_mode: "flat",
				amount_per_kg: "",
				region: "",
			});
			setEditingId(null);
			loadRates();
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		}
	};

	const handleEdit = (rate: ShippingRate) => {
		setFormData({
			name: rate.name,
			amount: rate.amount.toString(),
			pricing_mode: (rate.pricing_mode ?? "flat") as "flat" | "per_kg",
			amount_per_kg: (rate.amount_per_kg ?? "").toString(),
			region: rate.region || "",
		});
		setEditingId(rate.id);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Yakin ingin menghapus rate ini?")) return;
		try {
			const { error } = await supabase
				.from("shipping_rates")
				.delete()
				.eq("id", id);
			if (error) throw error;
			showToast({
				type: "success",
				title: "Berhasil",
				message: "Rate berhasil dihapus",
			});
			loadRates();
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		}
	};

	const handleToggleActive = async (id: string, currentActive: boolean) => {
		try {
			const { error } = await supabase
				.from("shipping_rates")
				.update({ is_active: !currentActive })
				.eq("id", id);
			if (error) throw error;
			showToast({
				type: "success",
				title: "Berhasil",
				message: "Status berhasil diubah",
			});
			loadRates();
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Kelola Shipping Rates</h1>
				<p className="text-[var(--muted-foreground)] mt-2">
					Atur metode pengiriman dan biaya ongkir untuk toko online
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Card>
					<CardHeader>
						<CardTitle>
							{editingId ? "Edit Rate" : "Tambah Rate Baru"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<AlignInput.Label required>Nama Metode</AlignInput.Label>
								<AlignInput.Field
									value={formData.name}
									onChange={(v) =>
										setFormData((prev) => ({ ...prev, name: v }))
									}
									placeholder="Contoh: Regular, Express, Same Day"
									required
								/>
							</div>
							<div>
								<AlignInput.Label required>Biaya (Rp)</AlignInput.Label>
								<AlignInput.Field
									type="number"
									value={formData.amount}
									onChange={(v) =>
										setFormData((prev) => ({ ...prev, amount: v }))
									}
									placeholder="0"
									required
								/>
							</div>
							<div>
								<AlignInput.Label>Mode Perhitungan</AlignInput.Label>
								<div className="flex gap-3">
									<label className="flex items-center gap-2 text-sm">
										<input
											type="radio"
											name="pricing_mode"
											checked={formData.pricing_mode === "flat"}
											onChange={() =>
												setFormData((p) => ({ ...p, pricing_mode: "flat" }))
											}
										/>
										Flat
									</label>
									<label className="flex items-center gap-2 text-sm">
										<input
											type="radio"
											name="pricing_mode"
											checked={formData.pricing_mode === "per_kg"}
											onChange={() =>
												setFormData((p) => ({ ...p, pricing_mode: "per_kg" }))
											}
										/>
										Per Kg
									</label>
								</div>
							</div>
							{formData.pricing_mode === "per_kg" && (
								<div>
									<AlignInput.Label required>
										Biaya per Kg (Rp)
									</AlignInput.Label>
									<AlignInput.Field
										type="number"
										value={formData.amount_per_kg}
										onChange={(v) =>
											setFormData((prev) => ({ ...prev, amount_per_kg: v }))
										}
										placeholder="0"
										required
									/>
								</div>
							)}
							<div>
								<AlignInput.Label>Region (Opsional)</AlignInput.Label>
								<AlignInput.Field
									value={formData.region}
									onChange={(v) =>
										setFormData((prev) => ({ ...prev, region: v }))
									}
									placeholder="Contoh: Jakarta, Jawa Barat"
								/>
							</div>
							<div className="flex gap-2">
								<Button type="submit" loading={loading}>
									{editingId ? "Update" : "Tambah"}
								</Button>
								{editingId && (
									<Button
										variant="outline"
										onClick={() => {
											setFormData({
												name: "",
												amount: "",
												pricing_mode: "flat",
												amount_per_kg: "",
												region: "",
											});
											setEditingId(null);
										}}>
										Batal
									</Button>
								)}
							</div>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Daftar Shipping Rates</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="text-center py-4">Loading...</div>
						) : rates.length === 0 ? (
							<div className="text-center py-4 text-[var(--muted-foreground)]">
								Belum ada shipping rate
							</div>
						) : (
							<div className="space-y-3">
								{rates.map((rate) => (
									<div
										key={rate.id}
										className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
										<div>
											<div className="font-medium">{rate.name}</div>
											<div className="text-sm text-[var(--muted-foreground)]">
												Rp {Number(rate.amount).toLocaleString("id-ID")}
												{rate.region && ` • ${rate.region}`}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												size="sm"
												variant={rate.is_active ? "default" : "outline"}
												onClick={() =>
													handleToggleActive(rate.id, rate.is_active)
												}>
												{rate.is_active ? "Aktif" : "Nonaktif"}
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleEdit(rate)}>
												Edit
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() => handleDelete(rate.id)}>
												Hapus
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
