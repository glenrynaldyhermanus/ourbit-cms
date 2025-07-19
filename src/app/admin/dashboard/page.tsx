"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/AuthProvider";
// Layout is automatically applied by (dashboard)/layout.tsx
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

	useEffect(() => {
		if (user) {
			checkUserBusiness();
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
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-semibold text-[#191919] mb-2 font-['Inter']">
					Dashboard
				</h1>
				<p className="text-[#4A4A4A] font-['Inter']">
					Selamat datang di sistem manajemen POS Anda
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat) => {
					const Icon = stat.icon;
					const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

					return (
						<div
							key={stat.name}
							className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
										{stat.name}
									</p>
									<p className="text-2xl font-semibold text-[#191919] mt-1 font-['Inter']">
										{stat.value}
									</p>
								</div>
								<div className={`p-3 rounded-full ${getStatColor(stat.color)}`}>
									<Icon className="w-6 h-6" />
								</div>
							</div>
							<div className="mt-4 flex items-center">
								<TrendIcon
									className={`w-4 h-4 mr-1 ${
										stat.trend === "up" ? "text-[#249689]" : "text-[#EF476F]"
									}`}
								/>
								<span
									className={`text-sm font-medium ${
										stat.trend === "up" ? "text-[#249689]" : "text-[#EF476F]"
									} font-['Inter']`}>
									{stat.change}
								</span>
								<span className="text-sm text-[#4A4A4A] ml-1 font-['Inter']">
									vs kemarin
								</span>
							</div>
						</div>
					);
				})}
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
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
			<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
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
								Produk "Kopi Arabica" diperbarui
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
								Peringatan stok rendah: "Gula Pasir"
							</p>
							<p className="text-xs text-[#4A4A4A] font-['Inter']">
								1 jam yang lalu
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
