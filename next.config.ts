import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Enable SSR (remove static export to support dynamic API routes)
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "qvpftwnywrgofzytkhya.supabase.co",
				port: "",
				pathname: "/storage/v1/object/public/**",
			},
		],
		unoptimized: true,
	},
	env: {
		CUSTOM_KEY: process.env.CUSTOM_KEY,
	},
	// Keep production optimizations
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	poweredByHeader: false,
	compress: true,
	// Migrate deprecated experimental option
	serverExternalPackages: [],
};

export default nextConfig;
