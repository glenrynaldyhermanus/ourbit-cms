import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

const SESSION_COOKIE = "ob_cart_session";

async function getSessionId(): Promise<string | null> {
	const jar = await cookies();
	return jar.get(SESSION_COOKIE)?.value ?? null;
}

function generateSaleNumber(): string {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	const t = String(now.getTime()).slice(-6);
	return `INV-${y}${m}${d}-${t}`;
}

type CheckoutBody = {
	storeId?: string;
	businessId?: string;
	shippingRateId?: string | null;
	promoCode?: string | null;
	customer?: {
		email?: string;
		name?: string;
		phone?: string;
		address?: string;
	} | null;
};

export async function POST(req: Request) {
	try {
		const sessionId = await getSessionId();
		if (!sessionId) {
			return NextResponse.json({ message: "No cart session" }, { status: 400 });
		}
		const body = (await req.json()) as CheckoutBody;
		const parsed = body ?? {};
		let storeId: string | undefined = parsed.storeId;
		const { businessId, shippingRateId, promoCode, customer } = parsed;
		// Resolve default store from business if storeId is missing
		if (!storeId) {
			if (!businessId) {
				return NextResponse.json(
					{ message: "storeId or businessId is required" },
					{ status: 400 }
				);
			}
			const { data: bos } = await supabase
				.from("business_online_settings")
				.select("default_online_store_id")
				.eq("business_id", businessId)
				.maybeSingle();
			type BOSDefault = { default_online_store_id: string | null };
			const bosRow = bos as BOSDefault | null;
			storeId = bosRow?.default_online_store_id ?? undefined;
			if (!storeId) {
				const { data: fallback } = await supabase
					.schema("common")
					.from("stores")
					.select("id")
					.eq("business_id", businessId)
					.order("created_at", { ascending: true })
					.limit(1)
					.maybeSingle();
				type StoreIdRow = { id: string };
				const fb = fallback as StoreIdRow | null;
				storeId = fb?.id ?? undefined;
			}
			if (!storeId) {
				return NextResponse.json(
					{ message: "No default store found for business" },
					{ status: 404 }
				);
			}
		}

		// 1) Load cart items
		const { data: cart, error: cartErr } = await supabase
			.from("carts")
			.select("id")
			.eq("store_id", storeId)
			.eq("session_id", sessionId)
			.maybeSingle();
		if (cartErr)
			return NextResponse.json({ message: cartErr.message }, { status: 500 });
		if (!cart)
			return NextResponse.json({ message: "Cart not found" }, { status: 404 });

		type CartItemRow = {
			id: string;
			product_id: string;
			variant_id: string | null;
			qty: number;
			price_snapshot: number;
			name_snapshot: string | null;
			variant_snapshot: string | null;
			weight_grams_snapshot: number | null;
		};

		const { data: itemsData, error: itemsErr } = await supabase
			.from("cart_items")
			.select(
				[
					"id",
					"product_id",
					"variant_id",
					"qty",
					"price_snapshot",
					"name_snapshot",
					"variant_snapshot",
					"weight_grams_snapshot",
				].join(",")
			)
			.eq("cart_id", cart.id);
		if (itemsErr)
			return NextResponse.json({ message: itemsErr.message }, { status: 500 });
		const items = (itemsData ?? []) as unknown as CartItemRow[];
		if (!items || items.length === 0) {
			return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
		}

		// 2) Subtotal
		const subtotal = items.reduce(
			(acc, it) => acc + Number(it.qty) * Number(it.price_snapshot),
			0
		);

		// 3) Store + business (for promo scoping)
		const { data: store, error: storeErr } = await supabase
			.schema("common")
			.from("stores")
			.select("id, business_id, default_tax_rate")
			.eq("id", storeId)
			.single();
		if (storeErr)
			return NextResponse.json({ message: storeErr.message }, { status: 500 });

		// 4) Promo code (optional) with usage_limit and max_discount_amount
		let discount = 0;
		if (promoCode) {
			type PromoRow = {
				type: string;
				value: number | string | null;
				min_purchase_amount?: number | string | null;
				max_discount_amount?: number | string | null;
				usage_limit?: number | string | null;
				used_count?: number | string | null;
				is_active: boolean;
				start_date?: string | null;
				end_date?: string | null;
				business_id: string;
			};
			const { data: promoData, error: promoErr } = await supabase
				.from("discounts")
				.select(
					[
						"type",
						"value",
						"min_purchase_amount",
						"max_discount_amount",
						"usage_limit",
						"used_count",
						"is_active",
						"start_date",
						"end_date",
						"business_id",
					].join(",")
				)
				.eq("code", promoCode)
				.maybeSingle();
			const promo = (promoData ?? null) as unknown as PromoRow | null;
			if (
				!promoErr &&
				promo &&
				promo.is_active &&
				promo.business_id === store.business_id
			) {
				const now = new Date();
				const startOk = !promo.start_date || new Date(promo.start_date) <= now;
				const endOk = !promo.end_date || new Date(promo.end_date) >= now;
				const minOk =
					!promo.min_purchase_amount ||
					subtotal >= Number(promo.min_purchase_amount);
				const usageOk =
					!promo.usage_limit ||
					Number(promo.used_count ?? 0) < Number(promo.usage_limit);
				if (startOk && endOk && minOk && usageOk) {
					const rawDiscount =
						promo.type === "percentage"
							? Math.round((subtotal * Number(promo.value ?? 0)) / 100)
							: Number(promo.value ?? 0);
					const maxCap = promo.max_discount_amount
						? Number(promo.max_discount_amount)
						: undefined;
					discount = Math.max(
						0,
						maxCap ? Math.min(rawDiscount, maxCap) : rawDiscount
					);
				}
			}
		}

		// 5) Shipping rate (optional) with per_kg support
		type ShippingRateRow = {
			amount: number | null;
			pricing_mode?: "flat" | "per_kg" | null;
			amount_per_kg?: number | null;
			is_active: boolean;
			store_id: string;
		};
		let shipping = 0;
		if (shippingRateId) {
			const { data: ship, error: shipErr } = await supabase
				.from("shipping_rates")
				.select("amount, pricing_mode, amount_per_kg, is_active, store_id")
				.eq("id", shippingRateId)
				.eq("store_id", storeId)
				.maybeSingle();
			if (shipErr)
				return NextResponse.json({ message: shipErr.message }, { status: 500 });
			const shipRow = (ship ?? null) as unknown as ShippingRateRow | null;
			if (!shipRow || !shipRow.is_active) {
				return NextResponse.json(
					{ message: "Shipping rate invalid" },
					{ status: 400 }
				);
			}
			if (shipRow.pricing_mode === "per_kg") {
				const totalWeightGrams = items.reduce(
					(acc, it) =>
						acc + Number(it.weight_grams_snapshot ?? 0) * Number(it.qty),
					0
				);
				const kg = Math.max(1, Math.ceil(totalWeightGrams / 1000));
				const perKg = Number(shipRow.amount_per_kg ?? 0);
				shipping = kg * perKg;
			} else {
				shipping = Number(shipRow.amount ?? 0);
			}
		}

		// 5.5) Validate stock availability for each cart item before proceeding
		const productIds = Array.from(new Set(items.map((it) => it.product_id)));
		const variantIds = Array.from(
			new Set(items.map((it) => it.variant_id).filter((v): v is string => !!v))
		);

		type ProductRow = {
			id: string;
			stock: number | null;
			is_active: boolean;
			availability_status?: string | null;
		};
		type VariantRow = {
			id: string;
			product_id: string;
			stock: number | null;
			is_active: boolean;
		};

		const [productsRes, variantsRes] = await Promise.all([
			supabase
				.from("products")
				.select("id, stock, is_active, availability_status")
				.in("id", productIds),
			variantIds.length
				? supabase
						.from("product_variants")
						.select("id, product_id, stock, is_active")
						.in("id", variantIds)
				: Promise.resolve({ data: [] as VariantRow[], error: null as null }),
		]);
		if (productsRes.error)
			return NextResponse.json(
				{ message: productsRes.error.message },
				{ status: 500 }
			);
		if (variantsRes.error)
			return NextResponse.json(
				{ message: variantsRes.error.message },
				{ status: 500 }
			);

		const products = (productsRes.data ?? []) as unknown as ProductRow[];
		const variants = (variantsRes.data ?? []) as unknown as VariantRow[];
		const productMap = new Map<string, ProductRow>(
			products.map((p) => [p.id, p])
		);
		const variantMap = new Map<string, VariantRow>(
			variants.map((v) => [v.id, v])
		);

		for (const it of items) {
			const prod = productMap.get(it.product_id);
			if (
				!prod ||
				!prod.is_active ||
				prod.availability_status === "out_of_stock"
			) {
				return NextResponse.json(
					{ message: "Item tidak tersedia" },
					{ status: 400 }
				);
			}
			if (it.variant_id) {
				const variant = variantMap.get(it.variant_id);
				if (!variant || !variant.is_active) {
					return NextResponse.json(
						{ message: "Varian tidak tersedia" },
						{ status: 400 }
					);
				}
				// If variant stock is tracked (not null), ensure sufficient
				if (
					variant.stock !== null &&
					typeof variant.stock === "number" &&
					Number(variant.stock) < Number(it.qty)
				) {
					return NextResponse.json(
						{ message: "Stok varian tidak mencukupi" },
						{ status: 400 }
					);
				}
			} else {
				if (Number(prod.stock ?? 0) < Number(it.qty)) {
					return NextResponse.json(
						{ message: "Stok produk tidak mencukupi" },
						{ status: 400 }
					);
				}
			}
		}

		// 6) Fee/Tax per store settings
		const { data: platform, error: platformErr } = await supabase
			.from("store_platform_settings")
			.select("fee_type, fee_value, tax_rate")
			.eq("store_id", storeId)
			.maybeSingle();
		if (platformErr)
			return NextResponse.json(
				{ message: platformErr.message },
				{ status: 500 }
			);

		const base = Math.max(0, subtotal - discount);
		const fee = platform
			? platform.fee_type === "percent"
				? Math.round((base * Number(platform.fee_value ?? 0)) / 100)
				: Number(platform.fee_value ?? 0)
			: 0;
		const beforeTax = base + shipping + fee;
		const taxRate = platform
			? Number(platform.tax_rate ?? 0)
			: Number(store.default_tax_rate ?? 0);
		const tax = Math.round(beforeTax * taxRate);
		const total = beforeTax + tax;

		// 7) Create sale (order)
		const saleNumber = generateSaleNumber();
		const { data: sale, error: saleErr } = await supabase
			.from("sales")
			.insert({
				store_id: storeId,
				sale_number: saleNumber,
				subtotal,
				discount_amount: discount,
				tax_amount: tax,
				total_amount: total,
				delivery_fee: shipping,
				fee_amount: fee,
				currency: "IDR",
				status: "pending",
				sale_source: "online",
				customer_email: customer?.email ?? null,
				customer_name: customer?.name ?? null,
				customer_phone: customer?.phone ?? null,
				delivery_address: customer?.address ?? null,
				promo_code: promoCode ?? null,
			})
			.select("id, sale_number")
			.single();
		if (saleErr)
			return NextResponse.json({ message: saleErr.message }, { status: 500 });

		// 8) Create sale items
		const saleItems = items.map((it) => ({
			sale_id: sale.id,
			product_id: it.product_id,
			quantity: it.qty,
			unit_price: it.price_snapshot,
			discount_amount: 0,
			tax_amount: 0,
			total_amount: Number(it.qty) * Number(it.price_snapshot),
			variant_id: it.variant_id ?? null,
			name_snapshot: it.name_snapshot ?? null,
			variant_snapshot: it.variant_snapshot ?? null,
			weight_grams_snapshot: it.weight_grams_snapshot ?? 0,
		}));
		const { error: saleItemsErr } = await supabase
			.from("sales_items")
			.insert(saleItems);
		if (saleItemsErr)
			return NextResponse.json(
				{ message: saleItemsErr.message },
				{ status: 500 }
			);

		// 9) Create payment link (Midtrans Snap Sandbox)
		let paymentUrl: string | null = null;
		const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
		if (midtransServerKey) {
			try {
				const snapRes = await fetch(
					"https://app.sandbox.midtrans.com/snap/v1/transactions",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Basic ${Buffer.from(
								midtransServerKey + ":"
							).toString("base64")}`,
						},
						body: JSON.stringify({
							transaction_details: {
								order_id: sale.sale_number,
								gross_amount: total,
							},
							credit_card: { secure: true },
							customer_details: {
								first_name: customer?.name ?? "",
								email: customer?.email ?? "",
								phone: customer?.phone ?? "",
							},
							enabled_payments: ["qris", "other_qris"],
						}),
					}
				);
				const json = await snapRes.json();
				if (snapRes.ok && json?.redirect_url) {
					paymentUrl = json.redirect_url as string;
				}
			} catch {
				// ignore, keep paymentUrl null
			}
		}

		// 10) Insert payment row
		const { error: payErr } = await supabase.from("payments").insert({
			sale_id: sale.id,
			provider: "midtrans",
			provider_ref: sale.sale_number, // use order_id as idempotent key
			amount: total,
			status: "pending",
			raw_json: null,
		});
		if (payErr)
			return NextResponse.json({ message: payErr.message }, { status: 500 });

		// 11) Queue notifications (order created)
		await supabase.from("notifications").insert({
			store_id: storeId,
			sale_id: sale.id,
			channel: "email",
			template: "order_created",
			recipient: customer?.email ?? "",
			payload_json: {
				sale_number: sale.sale_number,
				amount: total,
				subtotal,
				discount,
				shipping,
				tax,
				fee,
			},
			status: "pending",
		});

		// 12) Clear cart items (optional: keep until paid). We'll keep for now.

		return NextResponse.json({
			orderId: sale.id,
			saleNumber: sale.sale_number,
			payment_url: paymentUrl,
		});
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
