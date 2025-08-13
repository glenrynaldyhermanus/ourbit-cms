"use client";

import React from "react";

type Props = {
	subtotal: number;
	discount?: number;
	shipping?: number;
	fee?: number;
	tax?: number;
};

export default function CartBreakdown({
	subtotal,
	discount = 0,
	shipping = 0,
	fee = 0,
	tax = 0,
}: Props) {
	const total = Math.max(0, subtotal - discount) + shipping + fee + tax;
	const Row = ({
		label,
		value,
		bold = false,
	}: {
		label: string;
		value: number;
		bold?: boolean;
	}) => (
		<div className="flex items-center justify-between py-1">
			<div className="text-sm text-[var(--muted-foreground)]">{label}</div>
			<div className={`text-sm ${bold ? "font-semibold" : ""}`}>
				Rp {Number(value).toLocaleString("id-ID")}
			</div>
		</div>
	);

	return (
		<div className="space-y-1">
			<Row label="Subtotal" value={subtotal} />
			{discount > 0 && <Row label="Diskon" value={-discount} />}
			{shipping > 0 && <Row label="Ongkir" value={shipping} />}
			{fee > 0 && <Row label="Biaya Platform" value={fee} />}
			{tax > 0 && <Row label="Pajak" value={tax} />}
			<div className="border-t border-[var(--border)] my-2" />
			<Row label="Total" value={total} bold />
		</div>
	);
}
