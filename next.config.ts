import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "qvpftwnywrgofzytkhya.supabase.co",
				port: "",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
	output: "export",
	trailingSlash: true,
	distDir: "out",
	env: {
		CUSTOM_KEY: process.env.CUSTOM_KEY,
	},
};

export default nextConfig;
