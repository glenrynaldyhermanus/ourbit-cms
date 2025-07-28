"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import {
	PageHeader,
	PrimaryButton,
	OutlineButton,
	Input,
	Stats,
	Skeleton,
} from "@/components";

interface StockOpnameItem {
	id: string;
	product_id: string;
	product_name: string;
	product_code: string;
	expected_qty: number;
	actual_qty: number;
	qty_variance: number;
	note: string;
}

// interface StockOpnameSession {
// 	id: string;
// 	store_id: string;
// 	started_at: string;
// 	status: string;
// 	total_items: number;
// 	items_counted: number;
// }

export default function StockOpnameInputPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session_id");

	// const [session, setSession] = useState<StockOpnameSession | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [stockOpnameItems, setStockOpnameItems] = useState<StockOpnameItem[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [progress, setProgress] = useState(0);

	const initializeData = useCallback(async () => {
		setLoading(true);
		try {
			// Get session details
			const { data: sessionData, error: sessionError } = await supabase
				.from("stock_opname_sessions")
				.select("*")
				.eq("id", sessionId)
				.single();

			if (sessionError) {
				console.error("Error fetching session:", sessionError);
				return;
			}

			// setSession(sessionData);

			// Get products for this store
			const { data: productsData, error: productsError } = await supabase
				.from("products")
				.select("*")
				.eq("store_id", sessionData.store_id)
				.eq("is_active", true)
				.order("name");

			if (productsError) {
				console.error("Error fetching products:", productsError);
				return;
			}

			setProducts(productsData || []);

			// Get existing stock opname items
			const { data: itemsData, error: itemsError } = await supabase
				.from("stock_opname_items")
				.select(
					`
					*,
					products (
						name,
						code
					)
				`
				)
				.eq("session_id", sessionId);

			if (itemsError) {
				console.error("Error fetching items:", itemsError);
				return;
			}

			// Initialize stock opname items
			const initializedItems: StockOpnameItem[] = productsData.map(
				(product) => {
					const existingItem = itemsData?.find(
						(item) => item.product_id === product.id
					);
					return {
						id: existingItem?.id || "",
						product_id: product.id,
						product_name: product.name,
						product_code: product.code || "",
						expected_qty: existingItem?.expected_qty || product.stock || 0,
						actual_qty: existingItem?.actual_qty || 0,
						qty_variance: existingItem?.qty_variance || 0,
						note: existingItem?.note || "",
					};
				}
			);

			setStockOpnameItems(initializedItems);
			updateProgress(initializedItems);
		} catch (error) {
			console.error("Error initializing data:", error);
		} finally {
			setLoading(false);
		}
	}, [sessionId]);

	useEffect(() => {
		if (sessionId) {
			initializeData();
		}
	}, [sessionId, initializeData]);

	const updateProgress = (items: StockOpnameItem[]) => {
		const counted = items.filter((item) => item.actual_qty > 0).length;
		const total = items.length;
		setProgress(Math.round((counted / total) * 100));
	};

	const handleActualQtyChange = (productId: string, value: string) => {
		const numValue = parseFloat(value) || 0;
		setStockOpnameItems((prev) => {
			const updated = prev.map((item) =>
				item.product_id === productId
					? {
							...item,
							actual_qty: numValue,
							qty_variance: numValue - item.expected_qty,
					  }
					: item
			);
			updateProgress(updated);
			return updated;
		});
	};

	const handleNoteChange = (productId: string, value: string) => {
		setStockOpnameItems((prev) =>
			prev.map((item) =>
				item.product_id === productId ? { ...item, note: value } : item
			)
		);
	};

	const handleSaveItem = async (item: StockOpnameItem) => {
		try {
			const { error } = await supabase.from("stock_opname_items").upsert({
				session_id: sessionId,
				product_id: item.product_id,
				expected_qty: item.expected_qty,
				actual_qty: item.actual_qty,
				note: item.note,
			});

			if (error) {
				console.error("Error saving item:", error);
			}
		} catch (error) {
			console.error("Error saving item:", error);
		}
	};

	const handleSaveAll = async () => {
		setSaving(true);
		try {
			// Save all items
			const itemsToSave = stockOpnameItems.filter(
				(item) => item.actual_qty > 0
			);

			for (const item of itemsToSave) {
				await handleSaveItem(item);
			}

			// Update session progress
			const countedItems = stockOpnameItems.filter(
				(item) => item.actual_qty > 0
			).length;
			const { error: sessionError } = await supabase
				.from("stock_opname_sessions")
				.update({
					items_counted: countedItems,
					total_items: products.length,
				})
				.eq("id", sessionId);

			if (sessionError) {
				console.error("Error updating session:", sessionError);
			}

			// Show success message
			console.log("Stock opname items saved successfully");
		} catch (error) {
			console.error("Error saving all items:", error);
		} finally {
			setSaving(false);
		}
	};

	const handleFinishSession = async () => {
		setSaving(true);
		try {
			// Update session status to finished
			const { error } = await supabase
				.from("stock_opname_sessions")
				.update({
					status: "2", // Finished
					finished_at: new Date().toISOString(),
				})
				.eq("id", sessionId);

			if (error) {
				console.error("Error finishing session:", error);
			} else {
				// Redirect back to stock opname page
				router.push("/admin/inventories/opname");
			}
		} catch (error) {
			console.error("Error finishing session:", error);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[var(--background)]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Skeleton.Table rows={5} />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<PageHeader
					title="Input Stock Opname"
					subtitle={`Session #${sessionId?.slice(0, 8)}`}
				/>

				{/* Progress Stats */}
				<div className="mb-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<Stats.Card
							title="Progress"
							value={`${progress}%`}
							icon={CheckCircle}
							iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
						/>
						<Stats.Card
							title="Total Produk"
							value={products.length}
							icon={AlertCircle}
							iconColor="bg-gray-500/10 text-[var(--muted-foreground)]"
						/>
						<Stats.Card
							title="Sudah Dihitung"
							value={
								stockOpnameItems.filter((item) => item.actual_qty > 0).length
							}
							icon={CheckCircle}
							iconColor="bg-green-500/10 text-green-600 dark:text-green-400"
						/>
						<Stats.Card
							title="Belum Dihitung"
							value={
								stockOpnameItems.filter((item) => item.actual_qty === 0).length
							}
							icon={AlertCircle}
							iconColor="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
						/>
					</div>
				</div>

				{/* Stock Opname Form */}
				<div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] p-6">
					<div className="space-y-6">
						{stockOpnameItems.map((item) => (
							<div
								key={item.product_id}
								className={`p-4 rounded-lg border ${
									item.actual_qty > 0
										? "border-green-500/30 bg-green-500/10"
										: "border-[var(--border)]"
								}`}>
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
									{/* Product Info */}
									<div className="md:col-span-2">
										<h3 className="font-medium text-[var(--foreground)]">
											{item.product_name}
										</h3>
										<p className="text-sm text-[var(--muted-foreground)]">
											Kode: {item.product_code || "Tanpa Kode"}
										</p>
									</div>

									{/* Expected Qty */}
									<div>
										<label className="block text-sm font-medium text-[var(--foreground)] mb-1">
											Stock Sistem
										</label>
										<div className="text-sm text-[var(--foreground)] font-medium">
											{item.expected_qty}
										</div>
									</div>

									{/* Actual Qty */}
									<div>
										<label className="block text-sm font-medium text-[var(--foreground)] mb-1">
											Stock Aktual
										</label>
										<Input.Root>
											<Input.Field
												type="number"
												value={item.actual_qty || ""}
												onChange={(value) =>
													handleActualQtyChange(item.product_id, value)
												}
												placeholder="0"
												className="w-full"
											/>
										</Input.Root>
									</div>
								</div>

								{/* Variance & Note */}
								{item.actual_qty > 0 && (
									<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-[var(--foreground)] mb-1">
												Selisih
											</label>
											<div
												className={`text-sm font-medium ${
													item.qty_variance > 0
														? "text-green-600 dark:text-green-400"
														: item.qty_variance < 0
														? "text-red-600 dark:text-red-400"
														: "text-[var(--muted-foreground)]"
												}`}>
												{item.qty_variance > 0 ? "+" : ""}
												{item.qty_variance}
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-[var(--foreground)] mb-1">
												Catatan
											</label>
											<Input.Root>
												<Input.Field
													type="text"
													value={item.note}
													onChange={(value) =>
														handleNoteChange(item.product_id, value)
													}
													placeholder="Catatan (opsional)"
													className="w-full"
												/>
											</Input.Root>
										</div>
									</div>
								)}
							</div>
						))}
					</div>

					{/* Action Buttons */}
					<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
						<OutlineButton
							onClick={() => router.push("/admin/inventories/opname")}
							className="w-full sm:w-auto">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Batal
						</OutlineButton>
						<PrimaryButton
							onClick={handleSaveAll}
							disabled={saving}
							className="w-full sm:w-auto">
							<Save className="w-4 h-4 mr-2" />
							{saving ? "Menyimpan..." : "Simpan Progress"}
						</PrimaryButton>
						<PrimaryButton
							onClick={handleFinishSession}
							disabled={saving || progress < 100}
							className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
							<CheckCircle className="w-4 h-4 mr-2" />
							{saving ? "Menyelesaikan..." : "Selesaikan Stock Opname"}
						</PrimaryButton>
					</div>
				</div>
			</div>
		</div>
	);
}
