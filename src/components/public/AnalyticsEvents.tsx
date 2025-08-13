"use client";

import { useEffect } from "react";

export default function AnalyticsEvents({ storeId }: { storeId: string }) {
	useEffect(() => {
		fetch("/api/analytics/track", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ storeId, type: "page_view" }),
		}).catch(() => {});
	}, [storeId]);

	return null;
}
