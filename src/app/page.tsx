"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/AuthProvider";
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

export default function Dashboard() {
	const router = useRouter();
	const { user } = useAuthContext();
	const [checkingBusiness, setCheckingBusiness] = useState(true);

	useEffect(() => {
		checkUserBusiness();
	}, [user]);

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

			setCheckingBusiness(false);
		} catch (error) {
			console.error("Error checking user business:", error);
			setCheckingBusiness(false);
		}
	};

	if (checkingBusiness) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
					<div className="w-32 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
						<span className="text-white font-bold text-xl">OURBIT</span>
					</div>
					<p className="text-gray-600">Memuat dashboard...</p>
				</div>
			</div>
		);
	}

	// Redirect to dashboard since this is the root page
	useEffect(() => {
		if (!checkingBusiness && user) {
			router.push("/dashboard");
		}
	}, [checkingBusiness, user, router]);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-600">Welcome to your POS management system</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{stats.map((stat) => {
						const Icon = stat.icon;
						const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

						return (
							<div key={stat.name} className="bg-white rounded-lg shadow p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											{stat.name}
										</p>
										<p className="text-2xl font-bold text-gray-900">
											{stat.value}
										</p>
									</div>
									<div className="p-3 bg-blue-50 rounded-full">
										<Icon className="w-6 h-6 text-blue-600" />
									</div>
								</div>
								<div className="mt-4 flex items-center">
									<TrendIcon
										className={`w-4 h-4 mr-1 ${
											stat.trend === "up" ? "text-green-500" : "text-red-500"
										}`}
									/>
									<span
										className={`text-sm font-medium ${
											stat.trend === "up" ? "text-green-500" : "text-red-500"
										}`}>
										{stat.change}
									</span>
									<span className="text-sm text-gray-600 ml-1">
										vs yesterday
									</span>
								</div>
							</div>
						);
					})}
				</div>

				{/* Quick Actions */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						Quick Actions
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
							<Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
							<p className="text-sm font-medium text-gray-600">
								Add New Product
							</p>
						</button>
						<button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
							<ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
							<p className="text-sm font-medium text-gray-600">New Sale</p>
						</button>
						<button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
							<Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
							<p className="text-sm font-medium text-gray-600">Add Customer</p>
						</button>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						Recent Activity
					</h2>
					<div className="space-y-4">
						<div className="flex items-center p-3 bg-gray-50 rounded-lg">
							<div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
							<div>
								<p className="text-sm font-medium text-gray-900">
									New order #1234 completed
								</p>
								<p className="text-xs text-gray-600">2 minutes ago</p>
							</div>
						</div>
						<div className="flex items-center p-3 bg-gray-50 rounded-lg">
							<div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
							<div>
								<p className="text-sm font-medium text-gray-900">
									Product "Coffee Beans" updated
								</p>
								<p className="text-xs text-gray-600">15 minutes ago</p>
							</div>
						</div>
						<div className="flex items-center p-3 bg-gray-50 rounded-lg">
							<div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
							<div>
								<p className="text-sm font-medium text-gray-900">
									Low stock alert: "Tea Bags"
								</p>
								<p className="text-xs text-gray-600">1 hour ago</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
