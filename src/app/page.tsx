"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { setCurrentStore, setCurrentBusiness } from "@/lib/store";
// Note: Dashboard layout is now handled by (dashboard)/layout.tsx
import {
	DollarSign,
	Package,
	ShoppingCart,
	Users,
	TrendingUp,
	TrendingDown,
} from "lucide-react";

const stats = [
	{
		name: "Today's Revenue",
		value: "$2,450",
		change: "+12%",
		trend: "up" as const,
		icon: DollarSign,
	},
	{
		name: "Products Sold",
		value: "145",
		change: "+8%",
		trend: "up" as const,
		icon: Package,
	},
	{
		name: "Total Orders",
		value: "32",
		change: "-3%",
		trend: "down" as const,
		icon: ShoppingCart,
	},
	{
		name: "New Customers",
		value: "12",
		change: "+15%",
		trend: "up" as const,
		icon: Users,
	},
];

export default function HomePage() {
	const router = useRouter();
	const { user, loading } = useAuthContext();
	const [checkingBusiness, setCheckingBusiness] = useState(false);

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
	}, [user, loading, router]);

	const checkUserBusiness = async () => {
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
	};

	// Show loading while checking authentication and business
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
				<div className="w-32 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
					<span className="text-white font-bold text-xl">OURBIT</span>
				</div>
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
