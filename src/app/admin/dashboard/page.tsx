"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { DollarSign, Package, ShoppingCart, Users, Bell } from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { Divider } from "@/components/ui";
import { getBusinessId, getStoreId } from "@/lib/store";
import { getSalesStats } from "@/lib/sales";
import { getFinancialStats } from "@/lib/financial";
import { getCustomers } from "@/lib/customers";

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(amount);
};

export default function Dashboard() {
	const router = useRouter();
	const { user } = useAuthContext();
	const [checkingBusiness, setCheckingBusiness] = useState(true);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [dashboardStats, setDashboardStats] = useState({
		todayRevenue: 0,
		totalSales: 0,
		totalOrders: 0,
		newCustomers: 0,
	});

	const checkUserBusiness = useCallback(async () => {
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
	}, [user, router]);

	useEffect(() => {
		if (user) {
			checkUserBusiness();
			fetchUserProfile();
		}
	}, [user, checkUserBusiness]);

	useEffect(() => {
		const currentBusinessId = getBusinessId();
		const currentStoreId = getStoreId();
		setBusinessId(currentBusinessId);
		setStoreId(currentStoreId);
	}, []);

	useEffect(() => {
		if (businessId && storeId) {
			fetchDashboardData();
		}
	}, [businessId, storeId]);

	const fetchDashboardData = async () => {
		if (!businessId || !storeId) return;

		try {
			// Fetch sales stats
			const salesStats = await getSalesStats(businessId, storeId);

			// Fetch financial stats for today's revenue
			const financialStats = await getFinancialStats(businessId, storeId);

			// Fetch customers for new customers count
			const customers = await getCustomers(businessId);
			const newCustomers = customers.filter((customer) => {
				const customerDate = new Date(customer.created_at);
				const today = new Date();
				return customerDate.toDateString() === today.toDateString();
			}).length;

			setDashboardStats({
				todayRevenue: financialStats.income || 0,
				totalSales: salesStats.totalSales || 0,
				totalOrders: salesStats.totalSales || 0,
				newCustomers: newCustomers,
			});
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
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
			<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5701] mx-auto mb-4"></div>
					<div className="w-32 h-12 relative mb-4">
						<Image
							src="/logo-ourbit-orange.png"
							alt="Ourbit Logo"
							fill
							className="object-contain"
							priority
						/>
					</div>
					<p className="text-[var(--muted-foreground)] font-['Inter']">
						Memuat dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[var(--background)]">
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
				<div className="rounded-xl">
					<div className="flex items-center">
						{/* Pendapatan Hari Ini */}
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "0ms" }}>
							<Stats.Card
								title="Pendapatan Hari Ini"
								value={formatCurrency(dashboardStats.todayRevenue)}
								icon={DollarSign}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>

						{/* Total Penjualan */}
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Total Penjualan"
								value={dashboardStats.totalSales.toString()}
								icon={Package}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>

						{/* Total Pesanan */}
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Total Pesanan"
								value={dashboardStats.totalOrders.toString()}
								icon={ShoppingCart}
								iconColor="bg-red-500/10 text-red-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>

						{/* Pelanggan Baru */}
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Pelanggan Baru"
								value={dashboardStats.newCustomers.toString()}
								icon={Users}
								iconColor="bg-yellow-500/10 text-yellow-600"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<Divider />

					{/* Quick Actions */}
					<div
						className="rounded-xl shadow-sm border border-[var(--border)] p-6 animate-fade-in-up"
						style={{ animationDelay: "120ms" }}>
						<h2 className="text-xl font-medium text-[var(--foreground)] mb-4 font-['Inter']">
							Aksi Cepat
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<button className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
								<Package className="w-8 h-8 text-[var(--muted-foreground)] group-hover:text-[#FF5701] mx-auto mb-2 transition-colors" />
								<p className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] font-['Inter']">
									Tambah Produk Baru
								</p>
							</button>
							<button className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
								<ShoppingCart className="w-8 h-8 text-[var(--muted-foreground)] group-hover:text-[#FF5701] mx-auto mb-2 transition-colors" />
								<p className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] font-['Inter']">
									Penjualan Baru
								</p>
							</button>
							<button className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
								<Users className="w-8 h-8 text-[var(--muted-foreground)] group-hover:text-[#FF5701] mx-auto mb-2 transition-colors" />
								<p className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] font-['Inter']">
									Tambah Pelanggan
								</p>
							</button>
						</div>
					</div>

					{/* Recent Activity */}
					<div
						className="rounded-xl shadow-sm border border-[var(--border)] p-6 animate-fade-in-up"
						style={{ animationDelay: "150ms" }}>
						<h2 className="text-xl font-medium text-[var(--foreground)] mb-4 font-['Inter']">
							Aktivitas Terbaru
						</h2>
						<div className="space-y-4">
							<div className="flex items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
								<div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[var(--foreground)] font-['Inter']">
										Pesanan baru #1234 selesai
									</p>
									<p className="text-xs text-[var(--muted-foreground)] font-['Inter']">
										2 menit yang lalu
									</p>
								</div>
								<div className="text-sm font-medium text-green-600 dark:text-green-400">
									+Rp 150.000
								</div>
							</div>
							<div className="flex items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
								<div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[var(--foreground)] font-['Inter']">
										Produk baru ditambahkan
									</p>
									<p className="text-xs text-[var(--muted-foreground)] font-['Inter']">
										15 menit yang lalu
									</p>
								</div>
								<div className="text-sm font-medium text-blue-600 dark:text-blue-400">
									Produk Baru
								</div>
							</div>
							<div className="flex items-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
								<div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
								<div className="flex-1">
									<p className="text-sm font-medium text-[var(--foreground)] font-['Inter']">
										Stok produk menipis
									</p>
									<p className="text-xs text-[var(--muted-foreground)] font-['Inter']">
										1 jam yang lalu
									</p>
								</div>
								<div className="text-sm font-medium text-orange-600 dark:text-orange-400">
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
