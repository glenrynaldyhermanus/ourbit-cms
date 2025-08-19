import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	try {
		const { slug } = await params;
		const normalizedSlug = slug.replace(/^@/, "");
		if (!slug) {
			return NextResponse.json(
				{ message: "slug is required" },
				{ status: 400 }
			);
		}

		// 1) Resolve business via business_online_settings by subdomain (= slug)
		const { data: bos, error: bosError } = await supabase
			.from("business_online_settings")
			.select(
				[
					"id",
					"business_id",
					"subdomain",
					"description",
					"display_name",
					"avatar_url",
					"banner_url",
					"theme_json",
					"socials_json",
					"default_online_store_id",
				].join(",")
			)
			.eq("subdomain", normalizedSlug)
			.maybeSingle();

		if (bosError || !bos) {
			return NextResponse.json(
				{ message: "Business not found" },
				{ status: 404 }
			);
		}

		type BOSRow = {
			id: string;
			business_id: string;
			subdomain: string;
			description?: string | null;
			display_name?: string | null;
			avatar_url?: string | null;
			banner_url?: string | null;
			theme_json?: unknown;
			socials_json?: unknown;
			default_online_store_id?: string | null;
		};
		const bosRow = bos as unknown as BOSRow;

		// 2) Determine default store: prefer default_online_store_id, else first active store in business
		let targetStoreId: string | null = bosRow.default_online_store_id ?? null;
		if (!targetStoreId) {
			const { data: fallbackStore } = await supabase
				.schema("common")
				.from("stores")
				.select("id")
				.eq("business_id", bosRow.business_id)
				.order("created_at", { ascending: true })
				.limit(1)
				.maybeSingle();
			type StoreIdRow = { id: string };
			const fb = (fallbackStore ?? null) as unknown as StoreIdRow | null;
			targetStoreId = fb?.id ?? null;
		}

		if (!targetStoreId) {
			return NextResponse.json(
				{ message: "No store available for this business" },
				{ status: 404 }
			);
		}

		// 3) Products for default store (active). Order: pinned desc, sort_order asc, created_at desc
		const { data: products, error: productsError } = await supabase
			.from("products")
			.select(
				[
					"id",
					"name",
					"description",
					"selling_price",
					"stock",
					"weight_grams",
					"image_url",
					"availability_status",
					"is_pinned",
					"sort_order",
				].join(",")
			)
			.eq("store_id", targetStoreId)
			.eq("is_active", true)
			.order("is_pinned", { ascending: false })
			.order("sort_order", { ascending: true })
			.order("created_at", { ascending: false });

		if (productsError) {
			return NextResponse.json(
				{ message: productsError.message },
				{ status: 500 }
			);
		}

		type ProductRow = {
			id: string;
			name: string;
			description?: string | null;
			selling_price: number;
			stock: number;
			weight_grams: number;
			image_url?: string | null;
			availability_status: string;
			is_pinned: boolean;
			sort_order: number;
		};

		const typedProducts = (products ?? []) as unknown as ProductRow[];
		const productIds = typedProducts.map((p) => p.id);

		// 3) Product images (take first per product if exists)
		type ProductImageRow = {
			product_id: string;
			url: string;
			sort_order: number;
		};
		const firstImageByProduct: Record<string, string | null> = {};
		if (productIds.length > 0) {
			const { data: images, error: imagesError } = await supabase
				.from("product_images")
				.select("product_id, url, sort_order")
				.in("product_id", productIds)
				.order("sort_order", { ascending: true });

			if (!imagesError && images) {
				for (const img of images as unknown as ProductImageRow[]) {
					if (!firstImageByProduct[img.product_id]) {
						firstImageByProduct[img.product_id] = img.url;
					}
				}
			}
		}

		// 4) Shape payload (business-centric)
		const payload = {
			profile: {
				business_id: bosRow.business_id,
				store_id: targetStoreId,
				slug,
				display_name: bosRow.display_name ?? null,
				bio: bosRow.description ?? null,
				avatar_url: bosRow.avatar_url ?? null,
				banner_url: bosRow.banner_url ?? null,
				theme: bosRow.theme_json ?? null,
				socials: bosRow.socials_json ?? null,
			},
			products: typedProducts.map((p) => ({
				id: p.id,
				name: p.name,
				description: p.description,
				price: p.selling_price,
				stock: p.stock,
				weight_grams: p.weight_grams,
				image_url: firstImageByProduct[p.id] ?? p.image_url ?? null,
				availability_status: p.availability_status,
				is_pinned: p.is_pinned,
				sort_order: p.sort_order,
			})),
		};

		return NextResponse.json(payload);
	} catch (err: unknown) {
		const message =
			err instanceof Error ? err.message : "Internal Server Error";
		return NextResponse.json({ message }, { status: 500 });
	}
}
