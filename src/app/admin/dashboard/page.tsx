"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/providers/AuthProvider";
import {
	DollarSign,
	Package,
	ShoppingCart,
	Users,
	TrendingUp,
	TrendingDown,
	Bell,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { Divider } from "@/components/ui";

const stats = [
	{
		name: "Pendapatan Hari Ini",
		value: "Rp 2.450.000",
		change: "+12%",
		trend: "up" as const,
		icon: DollarSign,
		color: "success",
	},
	{
		name: "Produk Terjual",
		value: "145",
		change: "+8%",
		trend: "up" as const,
		icon: Package,
		color: "primary",
	},
	{
		name: "Total Pesanan",
		value: "32",
		change: "-3%",
		trend: "down" as const,
		icon: ShoppingCart,
		color: "warning",
	},
	{
		name: "Pelanggan Baru",
		value: "12",
		change: "+15%",
		trend: "up" as const,
		icon: Users,
		color: "info",
	},
];

export default function Dashboard() {
	const router = useRouter();
	const { user } = useAuthContext();
	const [checkingBusiness, setCheckingBusiness] = useState(true);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);

	useEffect(() => {
		if (user) {
			checkUserBusiness();
			fetchUserProfile();
		}
	}, [user]);

	const checkUserBusiness = async () => {
		try {
			// Check if user has a business/store
			const { data: roleAssignments, error } = await supabase
				.from("role_assignments")
				.select("business_id, store_id")
				.eq("user_id", user?.id)
				.single();

			if (error || !roleAssignments) {
				// User doesn't have a business, redirect to create store
				router.push("/create-store");
				return;
			}

			setCheckingBusiness(false);
		} catch (error) {
			console.error("Error checking user business:", error);
			setCheckingBusiness(false);
		}
	};

	const fetchUserProfile = async () => {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				console.error("Error fetching user:", error);
				return;
			}

			setUserProfile({
				name:
					user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
				email: user.email || "user@example.com",
				avatar: user.user_metadata?.avatar_url,
			});
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	if (checkingBusiness) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5701] mx-auto mb-4"></div>
					<div className="w-32 h-12 bg-[#FF5701] rounded-lg flex items-center justify-center mb-4">
						<span className="text-white font-semibold text-xl font-['Inter']">
							OURBIT
						</span>
					</div>
					<p className="text-[#4A4A4A] font-['Inter']">Memuat dashboard...</p>
				</div>
			</div>
		);
	}

	const getStatColor = (color: string) => {
		switch (color) {
			case "success":
				return "bg-[#249689]/10 text-[#249689]";
			case "primary":
				return "bg-[#FF5701]/10 text-[#FF5701]";
			case "warning":
				return "bg-[#FFD166]/10 text-[#FFD166]";
			case "info":
				return "bg-[#17C3B2]/10 text-[#17C3B2]";
			default:
				return "bg-[#F3F4F6] text-[#6B7280]";
		}
	};

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Dashboard"
						subtitle="Selamat datang di sistem manajemen POS Anda"
						notificationButton={{
							icon: Bell,
							onClick: () => {
								// Handle notification click
								console.log("Notification clicked");
							},
							count: 3, // Example notification count
						}}
						profileButton={{
							avatar: userProfile?.avatar,
							name: userProfile?.name,
							email: userProfile?.email,
							onClick: () => {
								// Handle profile click - redirect to profile page
								window.location.href = "/admin/settings/profile";
							},
						}}
					/>
				</div>

				{/* Divider */}
				<div className="animate-fade-in" style={{ animationDelay: "30ms" }}>
					<Divider />
				</div>

				{/* Stats Cards */}
				<Stats.Grid>
					{stats.map((stat, index) => {
						const Icon = stat.icon;
						const delay = index * 30; // 30ms delay between each card

						return (
							<div
								key={stat.name}
								className="animate-fade-in-left"
								style={{ animationDelay: `${delay}ms` }}>
								<Stats.Card
									title={stat.name}
									value={stat.value}
									icon={Icon}
									iconColor={getStatColor(stat.color)}
									change={{
										value: stat.change,
										type: stat.trend === "up" ? "positive" : "negative",
										period: "vs kemarin",
									}}
								/>
							</div>
						);
					})}
				</Stats.Grid>

				<div className="space-y-8">
					<Divider />

					{/* Quick Actions */}
					<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-6">
						<h2 className="text-xl font-medium text-[#191919] mb-4 font-['Inter']">
							Aksi Cepat
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<button className="p-4 border-2 border-dashed border-[#D1D5DB] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
								<Package className="w-8 h-8 text-[#6B7280] group-hover:text-[#FF5701] mx-auto mb-2 transition-colors" />
								<p className="text-sm font-medium text-[#4A4A4A] group-hover:text-[#191919] font-['Inter']">
									Tambah Produk Baru
								</p>
							</button>
							<button className="p-4 border-2 border-dashed border-[#D1D5DB] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
								<ShoppingCart className="w-8 h-8 text-[#6B7280] group-hover:text-[#FF5701] mx-auto mb-2 transition-colors" />
								<p className="text-sm font-medium text-[#4A4A4A] group-hover:text-[#191919] font-['Inter']">
									Penjualan Baru
								</p>
							</button>
							<button className="p-4 border-2 border-dashed border-[#D1D5DB] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
								<Users className="w-8 h-8 text-[#6B7280] group-hover:text-[#FF5701] mx-auto mb-2 transition-colors" />
								<p className="text-sm font-medium text-[#4A4A4A] group-hover:text-[#191919] font-['Inter']">
									Tambah Pelanggan
								</p>
							</button>
						</div>
					</div>

					{/* Recent Activity */}
					<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-6">
						<h2 className="text-xl font-medium text-[#191919] mb-4 font-['Inter']">
							Aktivitas Terbaru
						</h2>
						<div className="space-y-4">
							<div className="flex items-center p-3 bg-[#249689]/5 rounded-lg border border-[#249689]/10">
								<div className="w-2 h-2 bg-[#249689] rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[#191919] font-['Inter']">
										Pesanan baru #1234 selesai
									</p>
									<p className="text-xs text-[#4A4A4A] font-['Inter']">
										2 menit yang lalu
									</p>
								</div>
							</div>
							<div className="flex items-center p-3 bg-[#FF5701]/5 rounded-lg border border-[#FF5701]/10">
								<div className="w-2 h-2 bg-[#FF5701] rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[#191919] font-['Inter']">
										Produk &quot;Kopi Arabica&quot; diperbarui
									</p>
									<p className="text-xs text-[#4A4A4A] font-['Inter']">
										15 menit yang lalu
									</p>
								</div>
							</div>
							<div className="flex items-center p-3 bg-[#FFD166]/5 rounded-lg border border-[#FFD166]/10">
								<div className="w-2 h-2 bg-[#FFD166] rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[#191919] font-['Inter']">
										Peringatan stok rendah: &quot;Gula Pasir&quot;
									</p>
									<p className="text-xs text-[#4A4A4A] font-['Inter']">
										1 jam yang lalu
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
