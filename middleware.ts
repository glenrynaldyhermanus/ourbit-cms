import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	// Get the pathname of the request (e.g. /, /sign-in, /dashboard)
	const path = req.nextUrl.pathname;

	// Normalize public store route: support /@slug by rewriting to /slug
	if (path.startsWith("/@")) {
		const cleanedPath = path.replace(/^\/@/, "/");
		const url = new URL(cleanedPath + req.nextUrl.search, req.url);
		return NextResponse.rewrite(url);
	}

	// Define paths that are considered public (accessible without authentication)
	const isPublicPath =
		path === "/" ||
		path === "/sign-in" ||
		path === "/sign-up" ||
		path === "/sign-up-success" ||
		path === "/terms" ||
		path === "/privacy" ||
		path === "/forgot-password" ||
		path === "/create-store" ||
		path === "/store" ||
		path.startsWith("/store") ||
		path.startsWith("/online-store") ||
		path.startsWith("/cashier") ||
		path.startsWith("/ui-demo");

	// Get the token from the request headers or cookies
	const token =
		req.cookies.get("sb-access-token")?.value ||
		req.cookies.get("supabase-access-token")?.value ||
		req.cookies.get("sb-ourbit-9ac6d-auth-token")?.value;

	// Check if user is authenticated
	const isAuthenticated = !!token;

	// Log for debugging
	if (!isAuthenticated && !isPublicPath) {
		console.log("No auth token found, redirecting to sign-in. Path:", path);
	}

	// Redirect to login if accessing a protected route without authentication
	if (!isPublicPath && !isAuthenticated) {
		return NextResponse.redirect(new URL("/sign-in", req.url));
	}

	// Redirect to home if accessing auth pages while authenticated
	if (isPublicPath && isAuthenticated && path !== "/sign-up-success") {
		return NextResponse.redirect(new URL("/", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files (images, etc.)
		 * - api routes
		 */
		"/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
	],
};
