import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	distDir: "out",
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
};

export default nextConfig;
