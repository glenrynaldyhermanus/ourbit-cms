export const dynamic = "force-dynamic";
export const revalidate = 0;

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

const SESSION_COOKIE = "ob_cart_session";
const SESSION_TTL_DAYS = 30;

async function ensureSessionId(): Promise<string> {
	const jar = await cookies();
	let sessionId = jar.get(SESSION_COOKIE)?.value as string | undefined;
	if (!sessionId) {
		sessionId = crypto.randomUUID();
	}
	return sessionId;
}

async function getOrCreateCart(
	storeId: string,
	sessionId: string
): Promise<string> {
	const { data: existing, error: findErr } = await supabase
		.from("carts")
		.select("id")
		.eq("store_id", storeId)
		.eq("session_id", sessionId)
		.maybeSingle();

	if (findErr) throw findErr;
	if (existing) return existing.id as string;

	const { data: inserted, error: insertErr } = await supabase
		.from("carts")
		.insert({ store_id: storeId, session_id: sessionId })
		.select("id")
		.single();

	if (insertErr) throw insertErr;
	return inserted.id as string;
}

function withSessionCookie(resp: NextResponse, sessionId: string) {
	const expires = new Date();
	expires.setDate(expires.getDate() + SESSION_TTL_DAYS);
	resp.cookies.set(SESSION_COOKIE, sessionId, {
		httpOnly: true,
		sameSite: "lax",
		secure: true,
		expires,
		path: "/",
	});
	return resp;
}

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

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		let storeId = searchParams.get("storeId");
		if (!storeId) {
			const businessId = searchParams.get("businessId");
			if (!businessId) {
				return NextResponse.json(
					{ message: "storeId or businessId is required" },
					{ status: 400 }
				);
			}
			// Resolve default store from business
			const { data: bos } = await supabase
				.from("business_online_settings")
				.select("default_online_store_id")
				.eq("business_id", businessId)
				.maybeSingle();
			storeId = (bos as any)?.default_online_store_id ?? null;
			if (!storeId) {
				const { data: fallback } = await supabase
					.from("stores")
					.select("id")
					.eq("business_id", businessId)
					.order("created_at", { ascending: true })
					.limit(1)
					.maybeSingle();
				storeId = (fallback as any)?.id ?? null;
			}
			if (!storeId) {
				return NextResponse.json(
					{ message: "No default store found for business" },
					{ status: 404 }
				);
			}
		}
		const sessionId = await ensureSessionId();
		const cartId = await getOrCreateCart(storeId, sessionId);

		const { data: items, error: itemsErr } = await supabase
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
			.eq("cart_id", cartId);

		if (itemsErr) {
			return NextResponse.json({ message: itemsErr.message }, { status: 500 });
		}

		const typedItems = (items ?? []) as unknown as CartItemRow[];
		const subtotal = typedItems.reduce(
			(acc, it) => acc + Number(it.qty) * Number(it.price_snapshot),
			0
		);

		const resp = NextResponse.json({
			cartId,
			sessionId,
			items: typedItems,
			subtotal,
		});
		return withSessionCookie(resp, sessionId);
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

type ProductRow = {
	id: string;
	name: string;
	selling_price: number | null;
	stock: number | null;
	weight_grams: number | null;
	is_active: boolean;
	availability_status?: string | null;
};

type VariantRow = {
	id: string;
	name: string;
	price_override: number | null;
	stock: number | null;
	weight_grams: number | null;
	is_active: boolean;
};

type CartItemBasic = { id: string; qty: number };

export async function POST(req: Request) {
	try {
		const body = await req.json();
		let { storeId, productId, variantId, qty, businessId } = body ?? {};
		if (!productId || typeof qty !== "number" || qty <= 0) {
			return NextResponse.json(
				{ message: "productId and qty (>0) are required" },
				{ status: 400 }
			);
		}
		// Resolve default store if missing
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
			storeId = (bos as any)?.default_online_store_id ?? null;
			if (!storeId) {
				const { data: fallback } = await supabase
					.from("stores")
					.select("id")
					.eq("business_id", businessId)
					.order("created_at", { ascending: true })
					.limit(1)
					.maybeSingle();
				storeId = (fallback as any)?.id ?? null;
			}
			if (!storeId) {
				return NextResponse.json(
					{ message: "No default store found for business" },
					{ status: 404 }
				);
			}
		}
		const sessionId = await ensureSessionId();
		const cartId = await getOrCreateCart(storeId, sessionId);

		// Fetch product
		const { data: product, error: prodErr } = await supabase
			.from("products")
			.select(
				"id, name, selling_price, stock, weight_grams, is_active, availability_status"
			)
			.eq("id", productId)
			.single();
		if (prodErr || !product || !(product as ProductRow).is_active) {
			return NextResponse.json(
				{ message: "Product not available" },
				{ status: 400 }
			);
		}
		if ((product as ProductRow).availability_status === "out_of_stock") {
			return NextResponse.json({ message: "Out of stock" }, { status: 400 });
		}

		// Variant (optional)
		let variant: VariantRow | null = null;
		if (variantId) {
			const { data: v, error: vErr } = await supabase
				.from("product_variants")
				.select("id, name, price_override, stock, weight_grams, is_active")
				.eq("id", variantId)
				.eq("product_id", productId)
				.single();
			if (vErr || !v || !(v as VariantRow).is_active) {
				return NextResponse.json(
					{ message: "Variant not available" },
					{ status: 400 }
				);
			}
			variant = v as VariantRow;
		}

		const pRow = product as ProductRow;
		const price = (variant?.price_override ??
			pRow.selling_price ??
			0) as number;
		const weight = (variant?.weight_grams ?? pRow.weight_grams ?? 0) as number;

		// Check existing item (variant both null or equal)
		// Note: Supabase's `.is()` only checks null; we need two queries
		let existingItem: CartItemBasic | null = null;
		if (variantId) {
			const { data: e2 } = await supabase
				.from("cart_items")
				.select("id, qty")
				.eq("cart_id", cartId)
				.eq("product_id", productId)
				.eq("variant_id", variantId)
				.maybeSingle();
			existingItem = (e2 as CartItemBasic) ?? null;
		} else {
			const { data: e1 } = await supabase
				.from("cart_items")
				.select("id, qty")
				.eq("cart_id", cartId)
				.eq("product_id", productId)
				.is("variant_id", null)
				.maybeSingle();
			existingItem = (e1 as CartItemBasic) ?? null;
		}

		if (existingItem) {
			const newQty = Number(existingItem.qty) + Number(qty);
			const { error: upErr } = await supabase
				.from("cart_items")
				.update({ qty: newQty })
				.eq("id", existingItem.id);
			if (upErr) {
				return NextResponse.json({ message: upErr.message }, { status: 500 });
			}
		} else {
			const { error: insErr } = await supabase.from("cart_items").insert({
				cart_id: cartId,
				product_id: productId,
				variant_id: variantId ?? null,
				qty,
				price_snapshot: price,
				name_snapshot: product.name,
				variant_snapshot: variant?.name ?? null,
				weight_grams_snapshot: weight,
			});
			if (insErr) {
				return NextResponse.json({ message: insErr.message }, { status: 500 });
			}
		}

		const resp = NextResponse.json({ ok: true });
		return withSessionCookie(resp, sessionId);
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

export async function PUT(req: Request) {
	try {
		const body = await req.json();
		const { storeId, productId, variantId, qty } = body ?? {};
		if (!storeId || !productId || typeof qty !== "number") {
			return NextResponse.json(
				{ message: "storeId, productId, qty are required" },
				{ status: 400 }
			);
		}
		const sessionId = await ensureSessionId();
		const cartId = await getOrCreateCart(storeId, sessionId);

		let q = supabase
			.from("cart_items")
			.select("id")
			.eq("cart_id", cartId)
			.eq("product_id", productId);

		if (variantId) q = q.eq("variant_id", variantId);
		else q = q.is("variant_id", null);

		const { data: item, error: findErr } = await q.maybeSingle();
		if (findErr)
			return NextResponse.json({ message: findErr.message }, { status: 500 });
		if (!item)
			return NextResponse.json({ message: "Item not found" }, { status: 404 });

		if (qty <= 0) {
			const { error: delErr } = await supabase
				.from("cart_items")
				.delete()
				.eq("id", item.id);
			if (delErr)
				return NextResponse.json({ message: delErr.message }, { status: 500 });
		} else {
			const { error: upErr } = await supabase
				.from("cart_items")
				.update({ qty })
				.eq("id", item.id);
			if (upErr)
				return NextResponse.json({ message: upErr.message }, { status: 500 });
		}

		const resp = NextResponse.json({ ok: true });
		return withSessionCookie(resp, sessionId);
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

export async function DELETE(req: Request) {
	try {
		const body = await req.json();
		const { storeId, productId, variantId } = body ?? {};
		if (!storeId || !productId) {
			return NextResponse.json(
				{ message: "storeId and productId are required" },
				{ status: 400 }
			);
		}
		const sessionId = await ensureSessionId();
		const cartId = await getOrCreateCart(storeId, sessionId);

		let del = supabase
			.from("cart_items")
			.delete()
			.eq("cart_id", cartId)
			.eq("product_id", productId);
		if (variantId) del = del.eq("variant_id", variantId);
		else del = del.is("variant_id", null);

		const { error } = await del;
		if (error)
			return NextResponse.json({ message: error.message }, { status: 500 });

		const resp = NextResponse.json({ ok: true });
		return withSessionCookie(resp, sessionId);
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
