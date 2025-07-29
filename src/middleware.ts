import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip middleware for admin routes, static files, API routes, and store
	if (
		pathname.startsWith("/admin") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/store") ||
		pathname.startsWith("/online-store") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// Handle subdomain routing for online stores
	// Format: ourbit.web.app/@subdomain - redirect to store with param
	if (pathname.startsWith("/@")) {
		const subdomain = pathname.substring(2); // Remove /@

		// Redirect to store page with subdomain param
		const url = request.nextUrl.clone();
		url.pathname = `/store`;
		url.searchParams.set("subdomain", subdomain);
		return NextResponse.redirect(url);
	}

	// Handle any other single path as potential subdomain
	// Only if it's not a known route
	const pathSegments = pathname.split("/").filter(Boolean);
	if (pathSegments.length === 1) {
		const potentialSubdomain = pathSegments[0];

		// Skip known routes
		const knownRoutes = [
			"sign-in",
			"sign-up",
			"sign-up-success",
			"forgot-password",
			"create-store",
			"cashier",
			"ui-demo",
		];

		if (!knownRoutes.includes(potentialSubdomain)) {
			// Redirect to store page with subdomain param
			const url = request.nextUrl.clone();
			url.pathname = `/store`;
			url.searchParams.set("subdomain", potentialSubdomain);
			return NextResponse.redirect(url);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
