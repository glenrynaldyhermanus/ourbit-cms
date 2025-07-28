"use client";

import { Sidebar } from "@/components";
import { ReactNode, useEffect } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const { user, loading, loadingMessage } = useAuthContext();
	const router = useRouter();

	useEffect(() => {
		// If not loading and no user, redirect to sign-in
		if (!loading && !user) {
			console.log("No user found in admin layout, redirecting to sign-in");
			router.push("/sign-in");
		}
	}, [user, loading, router]);

	// Show loading state while checking auth
	if (loading) {
		return (
			<div className="flex h-screen bg-[var(--background)] items-center justify-center">
				<div className="text-center">
					<div className="relative">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5701] mx-auto mb-4"></div>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-8 h-8 bg-[#FF5701] rounded-full opacity-20 animate-pulse"></div>
						</div>
					</div>
					<p className="text-[var(--foreground)] font-['Inter'] font-medium mb-2">
						{loadingMessage}
					</p>
					<p className="text-[var(--muted-foreground)] font-['Inter'] text-sm">
						Mohon tunggu sebentar...
					</p>
				</div>
			</div>
		);
	}

	// If no user after loading, don't render (redirect is happening)
	if (!user) {
		return null;
	}

	return (
		<div className="flex h-screen bg-[var(--background)]">
			{/* Sidebar */}
			<Sidebar />

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Page Content */}
				<main className="flex-1 overflow-y-auto py-4 px-12 bg-[var(--background)] text-[var(--foreground)]">
					{children}
				</main>
			</div>
		</div>
	);
}
