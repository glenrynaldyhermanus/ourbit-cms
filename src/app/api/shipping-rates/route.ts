export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const storeId = searchParams.get("storeId");
		if (!storeId) {
			return NextResponse.json(
				{ message: "storeId is required" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("shipping_rates")
			.select("id, name, amount, region, is_active")
			.eq("store_id", storeId)
			.eq("is_active", true)
			.order("amount", { ascending: true });

		if (error)
			return NextResponse.json({ message: error.message }, { status: 500 });
		return NextResponse.json({ rates: data ?? [] });
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
