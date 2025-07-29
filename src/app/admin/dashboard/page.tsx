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
import {
	getRecentActivities,
	formatTimeAgo,
	ActivityData,
} from "@/lib/activities";
import ProductForm from "@/components/forms/ProductForm";
import CustomerForm from "@/components/forms/CustomerForm";

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
	const [recentActivities, setRecentActivities] = useState<ActivityData[]>([]);
	const [showProductForm, setShowProductForm] = useState(false);
	const [showCustomerForm, setShowCustomerForm] = useState(false);
	const [categories, setCategories] = useState<{ id: string; name: string }[]>(
		[]
	);
	const [productTypes, setProductTypes] = useState<
		{ key: string; value: string }[]
	>([]);

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

	const fetchDashboardData = useCallback(async () => {
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

			// Fetch recent activities
			const activities = await getRecentActivities(businessId, storeId, 5);

			// Fetch categories and product types for forms
			const { data: categoriesData } = await supabase
				.from("categories")
				.select("id, name")
				.eq("business_id", businessId)
				.is("deleted_at", null)
				.order("name");

			const { data: productTypesData } = await supabase
				.from("product_types")
				.select("key, value")
				.eq("business_id", businessId)
				.is("deleted_at", null)
				.order("value");

			setDashboardStats({
				todayRevenue: financialStats.income || 0,
				totalSales: salesStats.totalSales || 0,
				totalOrders: salesStats.totalSales || 0,
				newCustomers: newCustomers,
			});
			setRecentActivities(activities);
			setCategories(categoriesData || []);
			setProductTypes(productTypesData || []);
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		}
	}, [businessId, storeId]);

	useEffect(() => {
		if (businessId && storeId) {
			fetchDashboardData();
		}
	}, [businessId, storeId, fetchDashboardData]);

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

	// Quick action handlers
	const handleAddProduct = () => {
		setShowProductForm(true);
	};

	const handleNewSale = () => {
		router.push("/cashier");
	};

	const handleAddCustomer = () => {
		setShowCustomerForm(true);
	};

	const handleProductFormSuccess = () => {
		setShowProductForm(false);
		// Refresh dashboard data
		fetchDashboardData();
	};

	const handleProductFormError = (message: string) => {
		console.error("Product form error:", message);
		// You can add toast notification here if needed
	};

	const handleCustomerFormSuccess = () => {
		setShowCustomerForm(false);
		// Refresh dashboard data
		fetchDashboardData();
	};

	const handleCustomerFormError = (message: string) => {
		console.error("Customer form error:", message);
		// You can add toast notification here if needed
	};

	if (checkingBusiness) {
		return (
			<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
				<div className="text-center">
					<div className="relative">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5701] mx-auto mb-4"></div>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-8 h-8 bg-[#FF5701] rounded-full opacity-20 animate-pulse"></div>
						</div>
					</div>
					<div className="w-32 h-12 relative mb-4">
						<Image
							src="/logo-ourbit-orange.png"
							alt="Ourbit Logo"
							fill
							className="object-contain"
							priority
						/>
					</div>
					<p className="text-[var(--foreground)] font-['Inter'] font-medium mb-2">
						Memuat dashboard...
					</p>
					<p className="text-[var(--muted-foreground)] font-['Inter'] text-sm">
						Memeriksa data bisnis dan toko...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div>
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
							<button
								onClick={handleAddProduct}
								className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
								<Package className="w-8 h-8 text-[var(--muted-foreground)] group-hover:text-[#FF5701] mx-auto mb-2 transition-colors" />
								<p className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] font-['Inter']">
									Tambah Produk Baru
								</p>
							</button>
							<button
								onClick={handleNewSale}
								className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
								<ShoppingCart className="w-8 h-8 text-[var(--muted-foreground)] group-hover:text-[#FF5701] mx-auto mb-2 transition-colors" />
								<p className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] font-['Inter']">
									Penjualan Baru
								</p>
							</button>
							<button
								onClick={handleAddCustomer}
								className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg hover:border-[#FF5701] hover:bg-[#FF5701]/5 transition-colors group">
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
							{recentActivities.length > 0 ? (
								recentActivities.map((activity) => {
									const getActivityColor = (color: string) => {
										switch (color) {
											case "green":
												return "bg-green-500/10 border-green-500/20";
											case "blue":
												return "bg-blue-500/10 border-blue-500/20";
											case "orange":
												return "bg-orange-500/10 border-orange-500/20";
											case "purple":
												return "bg-purple-500/10 border-purple-500/20";
											case "red":
												return "bg-red-500/10 border-red-500/20";
											default:
												return "bg-gray-500/10 border-gray-500/20";
										}
									};

									const getActivityDotColor = (color: string) => {
										switch (color) {
											case "green":
												return "bg-green-500";
											case "blue":
												return "bg-blue-500";
											case "orange":
												return "bg-orange-500";
											case "purple":
												return "bg-purple-500";
											case "red":
												return "bg-red-500";
											default:
												return "bg-gray-500";
										}
									};

									const getActivityTextColor = (color: string) => {
										switch (color) {
											case "green":
												return "text-green-600 dark:text-green-400";
											case "blue":
												return "text-blue-600 dark:text-blue-400";
											case "orange":
												return "text-orange-600 dark:text-orange-400";
											case "purple":
												return "text-purple-600 dark:text-purple-400";
											case "red":
												return "text-red-600 dark:text-red-400";
											default:
												return "text-gray-600 dark:text-gray-400";
										}
									};

									return (
										<div
											key={activity.id}
											className={`flex items-center p-3 rounded-lg border ${getActivityColor(
												activity.color
											)}`}>
											<div
												className={`w-2 h-2 rounded-full mr-3 ${getActivityDotColor(
													activity.color
												)}`}></div>
											<div className="flex-1">
												<p className="text-sm font-medium text-[var(--foreground)] font-['Inter']">
													{activity.title}
												</p>
												<p className="text-xs text-[var(--muted-foreground)] font-['Inter']">
													{activity.description}
												</p>
												<p className="text-xs text-[var(--muted-foreground)] font-['Inter'] mt-1">
													{formatTimeAgo(activity.timestamp)}
												</p>
											</div>
											{activity.amount && (
												<div
													className={`text-sm font-medium ${getActivityTextColor(
														activity.color
													)}`}>
													{activity.type === "sale" ||
													activity.type === "financial"
														? `+${formatCurrency(activity.amount)}`
														: activity.status || "Selesai"}
												</div>
											)}
										</div>
									);
								})
							) : (
								<div className="text-center py-8">
									<p className="text-[var(--muted-foreground)] font-['Inter']">
										Belum ada aktivitas terbaru
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Product Form Modal */}
			{showProductForm && (
				<ProductForm
					product={null}
					isOpen={showProductForm}
					onClose={() => setShowProductForm(false)}
					onSaveSuccess={handleProductFormSuccess}
					onError={handleProductFormError}
					categories={categories}
					productTypes={productTypes}
					storeId={storeId || ""}
				/>
			)}

			{/* Customer Form Modal */}
			{showCustomerForm && (
				<CustomerForm
					customer={null}
					isOpen={showCustomerForm}
					onClose={() => setShowCustomerForm(false)}
					onSaveSuccess={handleCustomerFormSuccess}
					onError={handleCustomerFormError}
					businessId={businessId || ""}
				/>
			)}
		</div>
	);
}
