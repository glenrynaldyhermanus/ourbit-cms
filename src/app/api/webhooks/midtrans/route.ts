import { NextResponse } from "next/server";
import crypto from "crypto";
import supabase from "@/lib/supabase";

type MidtransBody = {
	order_id: string;
	status_code: string;
	gross_amount: string;
	signature_key: string;
	transaction_id?: string;
	transaction_status?: string;
};

function verifySignature(serverKey: string, body: MidtransBody): boolean {
	// Midtrans signature_key = sha512(order_id+status_code+gross_amount+server_key)
	const base = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
	const hash = crypto.createHash("sha512").update(base).digest("hex");
	return hash === body.signature_key;
}

export async function POST(req: Request) {
	try {
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		if (!serverKey)
			return NextResponse.json({ message: "No server key" }, { status: 400 });
		const body = (await req.json()) as MidtransBody;

		// Idempotency via webhook_events
		const eventId = body.transaction_id ?? body.order_id ?? crypto.randomUUID();
		const { data: existing, error: dupErr } = await supabase
			.schema("common")
			.from("webhook_events")
			.select("id")
			.eq("provider", "midtrans")
			.eq("event_id", eventId)
			.maybeSingle();
		if (dupErr)
			return NextResponse.json({ message: dupErr.message }, { status: 500 });
		if (existing) return NextResponse.json({ ok: true });

		// Verify signature
		if (!verifySignature(serverKey, body)) {
			return NextResponse.json(
				{ message: "Invalid signature" },
				{ status: 400 }
			);
		}

		// Persist webhook event
		const { data: wh, error: insErr } = await supabase
			.schema("common")
			.from("webhook_events")
			.insert({
				provider: "midtrans",
				event_id: eventId,
				raw_json: body,
				status: "received",
			})
			.select("id")
			.single();
		if (insErr)
			return NextResponse.json({ message: insErr.message }, { status: 500 });

		// Update payments + sales by provider_ref (we use sale_number as order_id)
		const saleNumber = body.order_id as string;
		const statusMap: Record<string, string> = {
			settlement: "paid",
			capture: "paid",
			pending: "pending",
			expire: "cancelled",
			deny: "cancelled",
			cancel: "cancelled",
		};
		const paymentStatus = (body.transaction_status ?? "pending") as string;
		const mappedStatus = statusMap[paymentStatus] ?? "pending";

		// Find sale by sale_number
		const { data: sale, error: saleErr } = await supabase
			.from("sales")
			.select("id, promo_code, status")
			.eq("sale_number", saleNumber)
			.maybeSingle();
		if (saleErr)
			return NextResponse.json({ message: saleErr.message }, { status: 500 });
		if (!sale)
			return NextResponse.json({ message: "Order not found" }, { status: 404 });

		const { error: payUpErr } = await supabase
			.from("payments")
			.update({ status: paymentStatus, raw_json: body })
			.eq("provider", "midtrans")
			.eq("provider_ref", saleNumber);
		if (payUpErr)
			return NextResponse.json({ message: payUpErr.message }, { status: 500 });

		// Idempotent order update + side-effects only when transitioning to paid
		if (mappedStatus === "paid" && sale.status !== "paid") {
			// 1) Decrement stock per item (if not already decremented)
			const { data: items, error: itemsErr } = await supabase
				.from("sales_items")
				.select("product_id, variant_id, quantity")
				.eq("sale_id", sale.id);
			if (itemsErr)
				return NextResponse.json(
					{ message: itemsErr.message },
					{ status: 500 }
				);

			if (items && items.length > 0) {
				for (const it of items) {
					if (it.variant_id) {
						const { data: v } = await supabase
							.from("product_variants")
							.select("id, stock")
							.eq("id", it.variant_id)
							.maybeSingle();
						if (v && v.stock !== null && typeof v.stock === "number") {
							const newStock = Math.max(
								0,
								Number(v.stock) - Number(it.quantity)
							);
							await supabase
								.from("product_variants")
								.update({ stock: newStock })
								.eq("id", it.variant_id);
						}
					} else {
						const { data: p } = await supabase
							.from("products")
							.select("id, stock")
							.eq("id", it.product_id)
							.maybeSingle();
						if (p && typeof p.stock === "number") {
							const newStock = Math.max(
								0,
								Number(p.stock) - Number(it.quantity)
							);
							await supabase
								.from("products")
								.update({ stock: newStock })
								.eq("id", it.product_id);
						}
					}
				}
			}

			// 2) Increment promo used_count if applicable (simple safe increment)
			if (sale.promo_code) {
				const { data: disc } = await supabase
					.from("discounts")
					.select("used_count")
					.eq("code", sale.promo_code)
					.maybeSingle();
				const nextCount = Number(disc?.used_count ?? 0) + 1;
				await supabase
					.from("discounts")
					.update({ used_count: nextCount })
					.eq("code", sale.promo_code);
			}

			// 3) Queue notification (order paid)
			const { data: saleDetail } = await supabase
				.from("sales")
				.select("store_id, sale_number, total_amount")
				.eq("id", sale.id)
				.maybeSingle();
			if (saleDetail?.store_id) {
				await supabase.from("notifications").insert({
					store_id: saleDetail.store_id,
					sale_id: sale.id,
					channel: "email",
					template: "order_paid",
					recipient: "",
					payload_json: {
						sale_number: saleDetail.sale_number,
						amount: saleDetail.total_amount,
					},
					status: "pending",
				});
			}
		}

		const { error: orderUpErr } = await supabase
			.from("sales")
			.update({ status: mappedStatus })
			.eq("id", sale.id);
		if (orderUpErr)
			return NextResponse.json(
				{ message: orderUpErr.message },
				{ status: 500 }
			);

		// Emit analytics purchase event when paid
		if (mappedStatus === "paid") {
			// Lookup store_id for sale
			const { data: saleDetail } = await supabase
				.from("sales")
				.select("store_id, total_amount")
				.eq("id", sale.id)
				.maybeSingle();
			if (saleDetail?.store_id) {
				await supabase.from("analytics_events").insert({
					store_id: saleDetail.store_id,
					session_id: null,
					type: "purchase",
					meta_json: {
						sale_id: sale.id,
						sale_number: saleNumber,
						total: saleDetail.total_amount,
					},
				});
			}
		}

		// Mark webhook processed
		await supabase
			.schema("common")
			.from("webhook_events")
			.update({ status: "processed", processed_at: new Date().toISOString() })
			.eq("id", wh.id);

		return NextResponse.json({ ok: true });
	} catch (err: unknown) {
		const message =
			err instanceof Error
				? err.message
				: typeof err === "string"
				? err
				: "Internal Error";
		return NextResponse.json({ message }, { status: 500 });
	}
}
