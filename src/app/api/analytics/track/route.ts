import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

type Body = {
	storeId: string;
	type:
		| "page_view"
		| "link_click"
		| "add_to_cart"
		| "checkout_start"
		| "purchase";
	sessionId?: string | null;
	meta?: Record<string, unknown> | null;
};

function isBot(ua: string | null): boolean {
	if (!ua) return false;
	const s = ua.toLowerCase();
	return /bot|crawler|spider|curl|wget|headless|facebook|instagram|tiktok/.test(
		s
	);
}

export async function POST(req: Request) {
	try {
		const ua = req.headers.get("user-agent");
		if (isBot(ua)) return NextResponse.json({ ok: true });

		const body = (await req.json()) as Body;
		const { storeId, type, sessionId, meta } = body ?? {};
		if (!storeId || !type) {
			return NextResponse.json(
				{ message: "storeId and type are required" },
				{ status: 400 }
			);
		}

		// Simple per-session rate limiting (per minute)
		// - Skips if no sessionId provided
		// - 60/min for page_view, 20/min for other events
		if (sessionId) {
			const sinceIso = new Date(Date.now() - 60_000).toISOString();
			const limitPerMinute = type === "page_view" ? 60 : 20;
			const { count, error: countErr } = await supabase
				.from("analytics_events")
				.select("id", { count: "exact", head: true })
				.eq("store_id", storeId)
				.eq("session_id", sessionId)
				.gte("created_at", sinceIso);
			if (!countErr && (count ?? 0) >= limitPerMinute) {
				return NextResponse.json({ ok: true }, { status: 429 });
			}
		}

		const { error } = await supabase.from("analytics_events").insert({
			store_id: storeId,
			session_id: sessionId ?? null,
			type,
			meta_json: meta ?? null,
		});
		if (error)
			return NextResponse.json({ message: error.message }, { status: 500 });
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
