"use client";

import React, { useEffect, useState } from "react";
import CartBreakdown from "@/components/cart/CartBreakdown";
import Button from "@/components/ui/Button";
import AlignInput from "@/components/ui/Input";
import AlignSelect from "@/components/ui/Select";
import { useToast } from "@/components";

type CartItem = {
	id: string;
	product_id: string;
	variant_id?: string | null;
	qty: number;
	price_snapshot: number;
	name_snapshot?: string | null;
	variant_snapshot?: string | null;
};

type Props = {
	storeId: string;
};

export default function CartSheet({ storeId }: Props) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState<CartItem[]>([]);
	const [subtotal, setSubtotal] = useState(0);
	const [promoCode, setPromoCode] = useState("");
	const [rates, setRates] = useState<
		{ id: string; name: string; amount: number; region?: string | null }[]
	>([]);
	const [shippingRateId, setShippingRateId] = useState<string | null>(null);
	const [selectOpen, setSelectOpen] = useState(false);
	const { showToast } = useToast();

	const load = async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/cart?storeId=${storeId}`);
			const j = await res.json();
			if (!res.ok) throw new Error(j?.message ?? "Gagal memuat keranjang");
			setItems(j.items ?? []);
			setSubtotal(j.subtotal ?? 0);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (open) void load();
	}, [open, load]);

	useEffect(() => {
		if (!open) return;
		(async () => {
			try {
				const res = await fetch(`/api/shipping-rates?storeId=${storeId}`);
				const j = await res.json();
				if (res.ok) setRates(j.rates ?? []);
			} catch {}
		})();
	}, [open, storeId]);

	const handleCheckout = async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/checkout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					storeId,
					shippingRateId,
					promoCode: promoCode || null,
				}),
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j?.message ?? "Gagal membuat checkout");
			// analytics: checkout_start
			fetch("/api/analytics/track", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					storeId,
					type: "checkout_start",
					meta: { shippingRateId, promoCode: promoCode || null, subtotal },
				}),
			}).catch(() => {});
			if (j.payment_url) window.location.href = j.payment_url as string;
			else
				showToast({
					type: "info",
					title: "Order dibuat",
					message: "Silakan lanjutkan pembayaran",
				});
		} catch (e) {
			console.error(e);
			showToast({
				type: "error",
				title: "Checkout gagal",
				message: (e as Error).message,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateQty = async (itemId: string, newQty: number) => {
		try {
			const item = items.find((it) => it.id === itemId);
			if (!item) return;
			const res = await fetch("/api/cart", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					storeId,
					productId: item.product_id,
					variantId: item.variant_id,
					qty: newQty,
				}),
			});
			if (!res.ok) throw new Error("Gagal update qty");
			load();
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		}
	};

	const handleRemoveItem = async (itemId: string) => {
		try {
			const item = items.find((it) => it.id === itemId);
			if (!item) return;
			const res = await fetch("/api/cart", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					storeId,
					productId: item.product_id,
					variantId: item.variant_id,
				}),
			});
			if (!res.ok) throw new Error("Gagal hapus item");
			load();
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		}
	};

	return (
		<div className="fixed bottom-4 right-4">
			<Button size="lg" onClick={() => setOpen((v) => !v)}>
				Keranjang
			</Button>
			{open && (
				<div className="mt-3 w-[360px] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="text-lg font-semibold">Keranjang</div>
						<button
							onClick={() => setOpen(false)}
							className="text-sm text-[var(--muted-foreground)]">
							Tutup
						</button>
					</div>
					<div className="space-y-3 max-h-64 overflow-auto pr-2">
						{items.length === 0 && (
							<div className="text-sm text-[var(--muted-foreground)]">
								Belum ada item.
							</div>
						)}
						{items.map((it) => (
							<div
								key={it.id}
								className="flex items-center justify-between p-2 border border-[var(--border)] rounded-lg">
								<div>
									<div className="text-sm font-medium">
										{it.name_snapshot ?? "Produk"}
									</div>
									{it.variant_snapshot && (
										<div className="text-xs text-[var(--muted-foreground)]">
											{it.variant_snapshot}
										</div>
									)}
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1">
										<button
											onClick={() => handleUpdateQty(it.id, it.qty - 1)}
											className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center text-sm hover:bg-[var(--accent)]">
											-
										</button>
										<span className="text-sm w-8 text-center">{it.qty}</span>
										<button
											onClick={() => handleUpdateQty(it.id, it.qty + 1)}
											className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center text-sm hover:bg-[var(--accent)]">
											+
										</button>
									</div>
									<div className="text-sm">
										Rp {Number(it.price_snapshot).toLocaleString("id-ID")}
									</div>
									<button
										onClick={() => handleRemoveItem(it.id)}
										className="text-xs text-[var(--destructive)] hover:underline">
										Hapus
									</button>
								</div>
							</div>
						))}
					</div>
					<div className="mt-3 space-y-3">
						<div>
							<AlignInput.Label>Promo Code</AlignInput.Label>
							<AlignInput.Field
								value={promoCode}
								onChange={setPromoCode}
								placeholder="Masukkan kode"
							/>
						</div>
						<div>
							<AlignSelect.Label>Metode Pengiriman</AlignSelect.Label>
							<AlignSelect.Root>
								<AlignSelect.Trigger
									value={
										shippingRateId
											? `${
													rates.find((r) => r.id === shippingRateId)?.name
											  } - Rp ${Number(
													rates.find((r) => r.id === shippingRateId)?.amount ??
														0
											  ).toLocaleString("id-ID")}`
											: "Pilih pengiriman"
									}
									onClick={() => setSelectOpen((v) => !v)}
									open={selectOpen}
								/>
								<AlignSelect.Content open={selectOpen}>
									{rates.map((r) => (
										<AlignSelect.Item
											key={r.id}
											value={r.id}
											onClick={() => {
												setShippingRateId(r.id);
												setSelectOpen(false);
											}}
											selected={shippingRateId === r.id}>
											<div className="flex items-center justify-between w-full">
												<span>{r.name}</span>
												<span>
													Rp {Number(r.amount).toLocaleString("id-ID")}
												</span>
											</div>
										</AlignSelect.Item>
									))}
								</AlignSelect.Content>
							</AlignSelect.Root>
						</div>
						<CartBreakdown subtotal={subtotal} />
						<Button
							className="w-full mt-3"
							loading={loading}
							onClick={handleCheckout}>
							Checkout
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
