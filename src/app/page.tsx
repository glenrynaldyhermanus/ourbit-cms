"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { setCurrentStore, setCurrentBusiness } from "@/lib/store";
// Note: Dashboard layout is now handled by (dashboard)/layout.tsx

export default function HomePage() {
	const router = useRouter();
	const { user, loading } = useAuthContext();
	const [checkingBusiness, setCheckingBusiness] = useState(false);

	// Check user business function
	const checkUserBusiness = useCallback(async () => {
		if (!user) return;

		try {
			const { data: userBusinesses, error } = await supabase
				.from("role_assignments")
				.select("*")
				.eq("user_id", user.id);

			if (error) throw error;

			if (!userBusinesses || userBusinesses.length === 0) {
				router.push("/create-store");
				return;
			}

			// Ambil business_id dan store_id dari baris pertama
			const { business_id, store_id } = userBusinesses[0];
			if (business_id) {
				setCurrentBusiness(business_id);
			}
			if (store_id) {
				setCurrentStore(store_id);
			}

			// User has business, redirect to admin dashboard
			router.push("/admin/dashboard");
		} catch (error) {
			console.error("Error checking user business:", error);
			router.push("/admin/dashboard"); // Fallback to admin dashboard
		} finally {
			setCheckingBusiness(false);
		}
	}, [user, router]);

	// Handle authentication and routing
	useEffect(() => {
		if (loading) return; // Wait for auth to initialize

		if (!user) {
			// User not logged in, redirect to sign-in
			router.push("/sign-in");
			return;
		}

		// User is logged in, check business
		setCheckingBusiness(true);
		checkUserBusiness();
	}, [user, loading, router, checkUserBusiness]);

	// Show loading while checking authentication and business
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
				<p className="text-gray-600">
					{loading
						? "Memuat..."
						: checkingBusiness
						? "Memeriksa data bisnis..."
						: "Mengarahkan..."}
				</p>
			</div>
		</div>
	);
}
