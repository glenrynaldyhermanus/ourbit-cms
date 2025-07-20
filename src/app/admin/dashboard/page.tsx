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
	Check,
	AlertCircle,
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
				return "bg-green-500/10 text-green-600";
			case "primary":
				return "bg-orange-500/10 text-orange-600";
			case "warning":
				return "bg-yellow-500/10 text-yellow-600";
			case "info":
				return "bg-blue-500/10 text-blue-600";
			default:
				return "bg-gray-500/10 text-gray-600";
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
				<div className="bg-white rounded-xl">
					<div className="flex items-center">
						{stats.map((stat, index) => {
							const Icon = stat.icon;
							const delay = index * 30; // 30ms delay between each card

							return (
								<div
									key={stat.name}
									className="flex-1 animate-fade-in-left"
									style={{ animationDelay: `${delay}ms` }}>
									<Stats.Card
										title={stat.name}
										value={stat.value}
										icon={Icon}
										iconColor={getStatColor(stat.color)}
									/>
									{index < stats.length - 1 && (
										<div className="w-px h-16 bg-gray-200"></div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				<div className="space-y-8">
					<Divider />

					{/* Quick Actions */}
					<div
						className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-6 animate-fade-in-up"
						style={{ animationDelay: "120ms" }}>
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
					<div
						className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-6 animate-fade-in-up"
						style={{ animationDelay: "150ms" }}>
						<h2 className="text-xl font-medium text-[#191919] mb-4 font-['Inter']">
							Aktivitas Terbaru
						</h2>
						<div className="space-y-4">
							<div className="flex items-center p-3 bg-green-100/50 rounded-lg border border-green-200">
								<div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[#191919] font-['Inter']">
										Pesanan baru #1234 selesai
									</p>
									<p className="text-xs text-[#4A4A4A] font-['Inter']">
										2 menit yang lalu
									</p>
								</div>
								<div className="text-sm font-medium text-green-600">
									+Rp 150.000
								</div>
							</div>
							<div className="flex items-center p-3 bg-blue-100/50 rounded-lg border border-blue-200">
								<div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[#191919] font-['Inter']">
										Produk baru ditambahkan
									</p>
									<p className="text-xs text-[#4A4A4A] font-['Inter']">
										15 menit yang lalu
									</p>
								</div>
								<div className="text-sm font-medium text-blue-600">
									Produk Baru
								</div>
							</div>
							<div className="flex items-center p-3 bg-orange-100/50 rounded-lg border border-orange-200">
								<div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[#191919] font-['Inter']">
										Stok produk menipis
									</p>
									<p className="text-xs text-[#4A4A4A] font-['Inter']">
										1 jam yang lalu
									</p>
								</div>
								<div className="text-sm font-medium text-orange-600">
									Perlu Restock
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
