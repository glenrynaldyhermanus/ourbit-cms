"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components";

type Props = {
	storeId: string;
	productId: string;
	variantId?: string | null;
	qty?: number;
	onAdded?: () => void;
};

export default function AddToCartButton({
	storeId,
	productId,
	variantId,
	qty = 1,
	onAdded,
}: Props) {
	const [loading, setLoading] = useState(false);
	const { showToast } = useToast();

	const handleClick = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/cart", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					storeId,
					productId,
					variantId: variantId ?? null,
					qty,
				}),
			});
			if (!res.ok) {
				const j = await res.json().catch(() => ({}));
				throw new Error(j?.message ?? "Failed to add to cart");
			}
			onAdded?.();
			showToast({
				type: "success",
				title: "Ditambahkan",
				message: "Produk masuk keranjang",
			});
			fetch("/api/analytics/track", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					storeId,
					type: "add_to_cart",
					meta: { productId, variantId },
				}),
			}).catch(() => {});
		} catch (e) {
			console.error(e);
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button size="sm" loading={loading} onClick={handleClick}>
			Tambah
		</Button>
	);
}
