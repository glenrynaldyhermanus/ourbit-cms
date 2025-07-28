"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Bell,
	TrendingDown,
	ShoppingBag,
	Building2,
	Package,
} from "lucide-react";
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
import { getPurchases, getPurchasesStats, PurchaseData } from "@/lib/purchases";

export default function PurchaseReportPage() {
	const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [supplierTypeFilter, setSupplierTypeFilter] = useState<string>("all");
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

	const fetchPurchaseData = useCallback(async () => {
		if (!businessId || !storeId) return;

		setLoading(true);
		try {
			const data = await getPurchases(businessId, storeId);
			setPurchaseData(data);
		} catch (error) {
			console.error("Error fetching purchase data:", error);
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
			fetchPurchaseData();
			fetchUserProfile();
		}
	}, [businessId, storeId, fetchPurchaseData, fetchUserProfile]);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			// Search is handled by useMemo
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const filteredPurchaseData = useMemo(() => {
		return purchaseData.filter((purchase) => {
			const matchesSearch =
				purchase.purchase_number
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				purchase.supplier_name
					?.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				purchase.received_by_name
					?.toLowerCase()
					.includes(searchTerm.toLowerCase());

			const matchesSupplierType =
				supplierTypeFilter === "all" ||
				purchase.supplier_type === supplierTypeFilter;
			const matchesStatus =
				statusFilter === "all" || purchase.status === statusFilter;

			return matchesSearch && matchesSupplierType && matchesStatus;
		});
	}, [purchaseData, searchTerm, supplierTypeFilter, statusFilter]);

	const stats = useMemo(async () => {
		if (!businessId || !storeId)
			return {
				totalPurchases: 0,
				totalExpenses: 0,
				totalItems: 0,
				avgPurchaseValue: 0,
			};

		try {
			return await getPurchasesStats(businessId, storeId);
		} catch (error) {
			console.error("Error fetching purchase stats:", error);
			return {
				totalPurchases: 0,
				totalExpenses: 0,
				totalItems: 0,
				avgPurchaseValue: 0,
			};
		}
	}, [businessId, storeId]);

	const [statsData, setStatsData] = useState({
		totalPurchases: 0,
		totalExpenses: 0,
		totalItems: 0,
		avgPurchaseValue: 0,
	});

	// Calculate trend data
	const trendData = useMemo(() => {
		if (!purchaseData || purchaseData.length === 0) {
			return {
				purchasesTrend: { value: "0%", type: "neutral" as const },
				expensesTrend: { value: "0%", type: "neutral" as const },
				itemsTrend: { value: "0%", type: "neutral" as const },
				avgTrend: { value: "0%", type: "neutral" as const },
			};
		}

		// Get current month and previous month data
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		const currentMonthData = purchaseData.filter((purchase) => {
			const purchaseDate = new Date(purchase.purchase_date);
			return (
				purchaseDate.getMonth() === currentMonth &&
				purchaseDate.getFullYear() === currentYear &&
				purchase.status === "completed"
			);
		});

		const previousMonthData = purchaseData.filter((purchase) => {
			const purchaseDate = new Date(purchase.purchase_date);
			const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
			const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
			return (
				purchaseDate.getMonth() === prevMonth &&
				purchaseDate.getFullYear() === prevYear &&
				purchase.status === "completed"
			);
		});

		// Calculate totals
		const currentPurchases = currentMonthData.length;
		const previousPurchases = previousMonthData.length;
		const currentExpenses = currentMonthData.reduce(
			(sum, p) => sum + p.total_amount,
			0
		);
		const previousExpenses = previousMonthData.reduce(
			(sum, p) => sum + p.total_amount,
			0
		);
		const currentItems = currentMonthData.reduce(
			(sum, p) => sum + p.items_count,
			0
		);
		const previousItems = previousMonthData.reduce(
			(sum, p) => sum + p.items_count,
			0
		);
		const currentAvg =
			currentPurchases > 0 ? currentExpenses / currentPurchases : 0;
		const previousAvg =
			previousPurchases > 0 ? previousExpenses / previousPurchases : 0;

		// Calculate percentage changes
		const calculateTrend = (current: number, previous: number) => {
			if (previous === 0)
				return current > 0
					? { value: "+100%", type: "positive" as const }
					: { value: "0%", type: "neutral" as const };
			const change = ((current - previous) / previous) * 100;
			return {
				value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
				type:
					change > 0
						? ("positive" as const)
						: change < 0
						? ("negative" as const)
						: ("neutral" as const),
			};
		};

		return {
			purchasesTrend: calculateTrend(currentPurchases, previousPurchases),
			expensesTrend: calculateTrend(currentExpenses, previousExpenses),
			itemsTrend: calculateTrend(currentItems, previousItems),
			avgTrend: calculateTrend(currentAvg, previousAvg),
		};
	}, [purchaseData]);

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

	const getSupplierTypeLabel = (type: string) => {
		switch (type) {
			case "material":
				return "Material";
			case "product":
				return "Produk";
			case "service":
				return "Jasa";
			default:
				return "Produk";
		}
	};

	const getSupplierTypeColor = (type: string) => {
		switch (type) {
			case "material":
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
			case "product":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "service":
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
			case "partial":
				return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
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
			case "partial":
				return "Sebagian";
			case "cancelled":
				return "Dibatalkan";
			default:
				return status;
		}
	};

	const purchaseColumns: Column<PurchaseData>[] = [
		{
			key: "purchase_number",
			header: "No. Pembelian",
			render: (item) => (
				<div className="font-medium text-[var(--foreground)]">
					{item.purchase_number}
				</div>
			),
			sortable: true,
		},
		{
			key: "purchase_date",
			header: "Tanggal",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{formatDate(item.purchase_date)}
				</div>
			),
			sortable: true,
		},
		{
			key: "supplier_name",
			header: "Supplier",
			render: (item) => (
				<div className="text-[var(--foreground)]">{item.supplier_name}</div>
			),
			sortable: true,
		},
		{
			key: "supplier_type",
			header: "Tipe",
			render: (item) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSupplierTypeColor(
						item.supplier_type || "product"
					)}`}>
					{getSupplierTypeLabel(item.supplier_type || "product")}
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
			key: "received_by_name",
			header: "Diterima Oleh",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{item.received_by_name}
				</div>
			),
			sortable: true,
		},
	];

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div>
					<PageHeader
						title="Laporan Pembelian"
						subtitle="Analisis data pembelian toko"
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
							title="Total Pembelian"
							value={statsData.totalPurchases.toString()}
							icon={ShoppingBag}
							change={{
								value: trendData.purchasesTrend.value,
								type: trendData.purchasesTrend.type,
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Total Pengeluaran"
							value={formatCurrency(statsData.totalExpenses)}
							icon={TrendingDown}
							change={{
								value: trendData.expensesTrend.value,
								type: trendData.expensesTrend.type,
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Total Items"
							value={statsData.totalItems.toString()}
							icon={Package}
							change={{
								value: trendData.itemsTrend.value,
								type: trendData.itemsTrend.type,
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Rata-rata Pembelian"
							value={formatCurrency(statsData.avgPurchaseValue)}
							icon={Building2}
							change={{
								value: trendData.avgTrend.value,
								type: trendData.avgTrend.type,
								period: "vs bulan lalu",
							}}
						/>
					</div>

					<Divider />

					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									placeholder="Cari nomor pembelian, supplier, atau penerima..."
									value={searchTerm}
									onChange={setSearchTerm}
								/>
							</Input.Root>
						</div>
						<div className="w-full sm:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										supplierTypeFilter === "all"
											? "Semua Tipe"
											: getSupplierTypeLabel(supplierTypeFilter)
									}
									placeholder="Tipe Supplier"
								/>
								<Select.Content>
									<Select.Item
										value="all"
										onClick={() => setSupplierTypeFilter("all")}
										selected={supplierTypeFilter === "all"}>
										Semua Tipe
									</Select.Item>
									<Select.Item
										value="material"
										onClick={() => setSupplierTypeFilter("material")}
										selected={supplierTypeFilter === "material"}>
										Material
									</Select.Item>
									<Select.Item
										value="product"
										onClick={() => setSupplierTypeFilter("product")}
										selected={supplierTypeFilter === "product"}>
										Produk
									</Select.Item>
									<Select.Item
										value="service"
										onClick={() => setSupplierTypeFilter("service")}
										selected={supplierTypeFilter === "service"}>
										Jasa
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
										value="partial"
										onClick={() => setStatusFilter("partial")}
										selected={statusFilter === "partial"}>
										Sebagian
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

					{/* Purchase Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredPurchaseData}
								columns={purchaseColumns}
								loading={false}
								emptyMessage="Tidak ada data pembelian"
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
