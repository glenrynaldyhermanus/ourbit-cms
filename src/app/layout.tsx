import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, ToastProvider, ThemeProvider } from "@/components";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const interTight = Inter({
	variable: "--font-inter-tight",
	subsets: ["latin"],
	display: "swap",
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "Ourbit Kasir - Point of Sale Management System",
	description: "Modern Point of Sale Content Management System",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="id" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${interTight.variable} font-inter antialiased`}
				suppressHydrationWarning>
				<ThemeProvider>
					<ToastProvider>
						<AuthProvider>{children}</AuthProvider>
					</ToastProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
