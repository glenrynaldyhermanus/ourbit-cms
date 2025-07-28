"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Bell, TrendingUp, ShoppingCart, Users, Package } from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import {
	DataTable,
	Column,
	Divider,
	Input,
	Select,
	Skeleton,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getBusinessId, getStoreId } from "@/lib/store";
import { getSales, getSalesStats, SalesData } from "@/lib/sales";

export default function SalesReportPage() {
	const [salesData, setSalesData] = useState<SalesData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);

	useEffect(() => {
		const currentBusinessId = getBusinessId();
		const currentStoreId = getStoreId();
		setBusinessId(currentBusinessId);
		setStoreId(currentStoreId);
	}, []);

	const fetchSalesData = useCallback(async () => {
		if (!businessId || !storeId) return;

		setLoading(true);
		try {
			const data = await getSales(businessId, storeId);
			setSalesData(data);
		} catch (error) {
			console.error("Error fetching sales data:", error);
		} finally {
			setLoading(false);
		}
	}, [businessId, storeId]);

	const fetchUserProfile = useCallback(async () => {
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
	}, []);

	useEffect(() => {
		if (businessId && storeId) {
			fetchSalesData();
			fetchUserProfile();
		}
	}, [businessId, storeId, fetchSalesData, fetchUserProfile]);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			// Search is handled by useMemo
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const filteredSalesData = useMemo(() => {
		return salesData.filter((sale) => {
			const matchesSearch =
				sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
				sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				sale.cashier_name?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesCustomerType =
				customerTypeFilter === "all" ||
				sale.customer_type === customerTypeFilter;
			const matchesStatus =
				statusFilter === "all" || sale.status === statusFilter;

			return matchesSearch && matchesCustomerType && matchesStatus;
		});
	}, [salesData, searchTerm, customerTypeFilter, statusFilter]);

	const stats = useMemo(async () => {
		if (!businessId || !storeId)
			return {
				totalSales: 0,
				totalRevenue: 0,
				totalItems: 0,
				avgOrderValue: 0,
			};

		try {
			return await getSalesStats(businessId, storeId);
		} catch (error) {
			console.error("Error fetching sales stats:", error);
			return {
				totalSales: 0,
				totalRevenue: 0,
				totalItems: 0,
				avgOrderValue: 0,
			};
		}
	}, [businessId, storeId]);

	const [statsData, setStatsData] = useState({
		totalSales: 0,
		totalRevenue: 0,
		totalItems: 0,
		avgOrderValue: 0,
	});

	useEffect(() => {
		const loadStats = async () => {
			const result = await stats;
			setStatsData(result);
		};
		loadStats();
	}, [stats]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getCustomerTypeLabel = (type: string) => {
		switch (type) {
			case "retail":
				return "Retail";
			case "wholesale":
				return "Grosir";
			case "corporate":
				return "Korporat";
			default:
				return "Retail";
		}
	};

	const getCustomerTypeColor = (type: string) => {
		switch (type) {
			case "retail":
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
			case "wholesale":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "corporate":
				return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
			default:
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "pending":
				return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
			case "cancelled":
				return "bg-red-500/10 text-red-600 dark:text-red-400";
			default:
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "completed":
				return "Selesai";
			case "pending":
				return "Pending";
			case "cancelled":
				return "Dibatalkan";
			default:
				return status;
		}
	};

	const salesColumns: Column<SalesData>[] = [
		{
			key: "sale_number",
			header: "No. Penjualan",
			render: (item) => (
				<div className="font-medium text-[var(--foreground)]">
					{item.sale_number}
				</div>
			),
			sortable: true,
		},
		{
			key: "sale_date",
			header: "Tanggal",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{formatDate(item.sale_date)}
				</div>
			),
			sortable: true,
		},
		{
			key: "customer_name",
			header: "Customer",
			render: (item) => (
				<div className="text-[var(--foreground)]">{item.customer_name}</div>
			),
			sortable: true,
		},
		{
			key: "customer_type",
			header: "Tipe",
			render: (item) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerTypeColor(
						item.customer_type || "retail"
					)}`}>
					{getCustomerTypeLabel(item.customer_type || "retail")}
				</span>
			),
			sortable: true,
		},
		{
			key: "items_count",
			header: "Items",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">{item.items_count}</div>
			),
			sortable: true,
		},
		{
			key: "total_amount",
			header: "Total",
			render: (item) => (
				<div className="font-medium text-[var(--foreground)]">
					{formatCurrency(item.total_amount)}
				</div>
			),
			sortable: true,
		},
		{
			key: "payment_method_name",
			header: "Metode Bayar",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{item.payment_method_name}
				</div>
			),
			sortable: true,
		},
		{
			key: "status",
			header: "Status",
			render: (item) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
						item.status
					)}`}>
					{getStatusLabel(item.status)}
				</span>
			),
			sortable: true,
		},
		{
			key: "cashier_name",
			header: "Kasir",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{item.cashier_name}
				</div>
			),
			sortable: true,
		},
	];

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Laporan Penjualan"
						subtitle="Analisis data penjualan toko"
						notificationButton={{
							icon: Bell,
							onClick: () => {
								console.log("Notification clicked");
							},
							count: 3,
						}}
						profileButton={{
							avatar: userProfile?.avatar,
							name: userProfile?.name,
							email: userProfile?.email,
							onClick: () => {
								window.location.href = "/admin/settings/profile";
							},
						}}
					/>
				</div>

				{/* Divider */}
				<div className="animate-fade-in" style={{ animationDelay: "30ms" }}>
					<Divider />
				</div>

				<div className="space-y-6">
					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Stats.Card
							title="Total Penjualan"
							value={statsData.totalSales.toString()}
							icon={ShoppingCart}
						/>
						<Stats.Card
							title="Total Pendapatan"
							value={formatCurrency(statsData.totalRevenue)}
							icon={TrendingUp}
						/>
						<Stats.Card
							title="Total Items"
							value={statsData.totalItems.toString()}
							icon={Package}
						/>
						<Stats.Card
							title="Rata-rata Order"
							value={formatCurrency(statsData.avgOrderValue)}
							icon={Users}
						/>
					</div>

					<Divider />

					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									placeholder="Cari nomor penjualan, customer, atau kasir..."
									value={searchTerm}
									onChange={setSearchTerm}
								/>
							</Input.Root>
						</div>
						<div className="w-full sm:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										customerTypeFilter === "all"
											? "Semua Tipe"
											: getCustomerTypeLabel(customerTypeFilter)
									}
									placeholder="Tipe Customer"
								/>
								<Select.Content>
									<Select.Item
										value="all"
										onClick={() => setCustomerTypeFilter("all")}
										selected={customerTypeFilter === "all"}>
										Semua Tipe
									</Select.Item>
									<Select.Item
										value="retail"
										onClick={() => setCustomerTypeFilter("retail")}
										selected={customerTypeFilter === "retail"}>
										Retail
									</Select.Item>
									<Select.Item
										value="wholesale"
										onClick={() => setCustomerTypeFilter("wholesale")}
										selected={customerTypeFilter === "wholesale"}>
										Grosir
									</Select.Item>
									<Select.Item
										value="corporate"
										onClick={() => setCustomerTypeFilter("corporate")}
										selected={customerTypeFilter === "corporate"}>
										Korporat
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div className="w-full sm:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										statusFilter === "all"
											? "Semua Status"
											: getStatusLabel(statusFilter)
									}
									placeholder="Status"
								/>
								<Select.Content>
									<Select.Item
										value="all"
										onClick={() => setStatusFilter("all")}
										selected={statusFilter === "all"}>
										Semua Status
									</Select.Item>
									<Select.Item
										value="completed"
										onClick={() => setStatusFilter("completed")}
										selected={statusFilter === "completed"}>
										Selesai
									</Select.Item>
									<Select.Item
										value="pending"
										onClick={() => setStatusFilter("pending")}
										selected={statusFilter === "pending"}>
										Pending
									</Select.Item>
									<Select.Item
										value="cancelled"
										onClick={() => setStatusFilter("cancelled")}
										selected={statusFilter === "cancelled"}>
										Dibatalkan
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					{/* Loading State */}
					{loading && <Skeleton.Table rows={5} />}

					{/* Sales Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredSalesData}
								columns={salesColumns}
								loading={false}
								emptyMessage="Tidak ada data penjualan"
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
