"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Wallet, Bell, TrendingUp, CreditCard } from "lucide-react";
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
import {
	getFinancialTransactions,
	getFinancialStats,
	FinancialTransactionData,
} from "@/lib/financial";

export default function FinanceReportPage() {
	const [financeData, setFinanceData] = useState<FinancialTransactionData[]>(
		[]
	);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
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

	const initializeData = useCallback(async () => {
		setLoading(true);
		try {
			await fetchUserProfile();
			setLoading(false);
		} catch (error) {
			console.error("Error initializing data:", error);
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchFinanceData = useCallback(async () => {
		if (!businessId || !storeId) return;

		setLoading(true);
		try {
			const transactions = await getFinancialTransactions(businessId, storeId);
			setFinanceData(transactions);
		} catch (error) {
			console.error("Error fetching finance data:", error);
		} finally {
			setLoading(false);
		}
	}, [businessId, storeId]);

	useEffect(() => {
		initializeData();
	}, [initializeData]);

	useEffect(() => {
		if (businessId && storeId) {
			fetchFinanceData();
		}
	}, [businessId, storeId, fetchFinanceData]);

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

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			// Search is handled by useMemo
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const filteredFinanceData = useMemo(() => {
		return financeData.filter((transaction) => {
			const matchesSearch =
				transaction.description
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
				transaction.reference_number
					?.toLowerCase()
					.includes(searchTerm.toLowerCase());

			const matchesType =
				typeFilter === "all" || transaction.transaction_type === typeFilter;
			const matchesCategory =
				categoryFilter === "all" || transaction.category === categoryFilter;
			const matchesStatus =
				statusFilter === "all" || transaction.status === statusFilter;

			return matchesSearch && matchesType && matchesCategory && matchesStatus;
		});
	}, [financeData, searchTerm, typeFilter, categoryFilter, statusFilter]);

	const [statsData, setStatsData] = useState({
		income: 0,
		expenses: 0,
		transfers: 0,
		netCashFlow: 0,
		totalTransactions: 0,
		pendingTransactions: 0,
		incomeTrend: 0,
		expensesTrend: 0,
		netCashFlowTrend: 0,
		totalTransactionsTrend: 0,
	});

	useEffect(() => {
		const loadStats = async () => {
			if (!businessId || !storeId) {
				setStatsData({
					income: 0,
					expenses: 0,
					transfers: 0,
					netCashFlow: 0,
					totalTransactions: 0,
					pendingTransactions: 0,
					incomeTrend: 0,
					expensesTrend: 0,
					netCashFlowTrend: 0,
					totalTransactionsTrend: 0,
				});
				return;
			}

			try {
				const result = await getFinancialStats(businessId, storeId);
				setStatsData(result);
			} catch (error) {
				console.error("Error fetching finance stats:", error);
				setStatsData({
					income: 0,
					expenses: 0,
					transfers: 0,
					netCashFlow: 0,
					totalTransactions: 0,
					pendingTransactions: 0,
					incomeTrend: 0,
					expensesTrend: 0,
					netCashFlowTrend: 0,
					totalTransactionsTrend: 0,
				});
			}
		};
		loadStats();
	}, [businessId, storeId]);

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

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "income":
				return "Pendapatan";
			case "expense":
				return "Pengeluaran";
			case "transfer":
				return "Transfer";
			default:
				return type;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "income":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "expense":
				return "bg-red-500/10 text-red-600 dark:text-red-400";
			case "transfer":
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
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

	const financeColumns: Column<FinancialTransactionData>[] = [
		{
			key: "transaction_date",
			header: "Tanggal",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{formatDate(item.transaction_date)}
				</div>
			),
			sortable: true,
		},
		{
			key: "transaction_type",
			header: "Tipe",
			render: (item) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
						item.transaction_type
					)}`}>
					{getTypeLabel(item.transaction_type)}
				</span>
			),
			sortable: true,
		},
		{
			key: "category",
			header: "Kategori",
			render: (item) => (
				<div className="text-[var(--foreground)]">{item.category}</div>
			),
			sortable: true,
		},
		{
			key: "description",
			header: "Deskripsi",
			render: (item) => (
				<div className="text-[var(--foreground)]">{item.description}</div>
			),
			sortable: true,
		},
		{
			key: "amount",
			header: "Jumlah",
			render: (item) => (
				<div
					className={`font-medium ${
						item.transaction_type === "expense"
							? "text-red-600"
							: "text-green-600"
					}`}>
					{formatCurrency(item.amount)}
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
			key: "account",
			header: "Akun",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{item.account || "-"}
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
	];

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div>
					<PageHeader
						title="Laporan Keuangan"
						subtitle="Analisis transaksi keuangan toko"
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
							title="Pendapatan"
							value={formatCurrency(statsData.income)}
							icon={TrendingUp}
							change={{
								value: `${
									statsData.incomeTrend >= 0 ? "+" : ""
								}${statsData.incomeTrend.toFixed(1)}%`,
								type: statsData.incomeTrend >= 0 ? "positive" : "negative",
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Pengeluaran"
							value={formatCurrency(statsData.expenses)}
							icon={TrendingUp}
							change={{
								value: `${
									statsData.expensesTrend >= 0 ? "+" : ""
								}${statsData.expensesTrend.toFixed(1)}%`,
								type: statsData.expensesTrend >= 0 ? "positive" : "negative",
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Net Cash Flow"
							value={formatCurrency(statsData.netCashFlow)}
							icon={Wallet}
							change={{
								value: `${
									statsData.netCashFlowTrend >= 0 ? "+" : ""
								}${statsData.netCashFlowTrend.toFixed(1)}%`,
								type: statsData.netCashFlowTrend >= 0 ? "positive" : "negative",
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Total Transaksi"
							value={statsData.totalTransactions.toString()}
							icon={CreditCard}
							change={{
								value: `${
									statsData.totalTransactionsTrend >= 0 ? "+" : ""
								}${statsData.totalTransactionsTrend.toFixed(1)}%`,
								type:
									statsData.totalTransactionsTrend >= 0
										? "positive"
										: "negative",
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
									placeholder="Cari berdasarkan deskripsi, kategori, atau nomor referensi..."
									value={searchTerm}
									onChange={setSearchTerm}
								/>
							</Input.Root>
						</div>
						<div className="w-full sm:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										typeFilter === "all"
											? "Semua Tipe"
											: getTypeLabel(typeFilter)
									}
									placeholder="Filter Tipe"
								/>
								<Select.Content>
									<Select.Item
										value="all"
										onClick={() => setTypeFilter("all")}
										selected={typeFilter === "all"}>
										Semua Tipe
									</Select.Item>
									<Select.Item
										value="income"
										onClick={() => setTypeFilter("income")}
										selected={typeFilter === "income"}>
										Pendapatan
									</Select.Item>
									<Select.Item
										value="expense"
										onClick={() => setTypeFilter("expense")}
										selected={typeFilter === "expense"}>
										Pengeluaran
									</Select.Item>
									<Select.Item
										value="transfer"
										onClick={() => setTypeFilter("transfer")}
										selected={typeFilter === "transfer"}>
										Transfer
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div className="w-full sm:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										categoryFilter === "all" ? "Semua Kategori" : categoryFilter
									}
									placeholder="Filter Kategori"
								/>
								<Select.Content>
									<Select.Item
										value="all"
										onClick={() => setCategoryFilter("all")}
										selected={categoryFilter === "all"}>
										Semua Kategori
									</Select.Item>
									<Select.Item
										value="sales"
										onClick={() => setCategoryFilter("sales")}
										selected={categoryFilter === "sales"}>
										Penjualan
									</Select.Item>
									<Select.Item
										value="purchase"
										onClick={() => setCategoryFilter("purchase")}
										selected={categoryFilter === "purchase"}>
										Pembelian
									</Select.Item>
									<Select.Item
										value="operational"
										onClick={() => setCategoryFilter("operational")}
										selected={categoryFilter === "operational"}>
										Operasional
									</Select.Item>
									<Select.Item
										value="marketing"
										onClick={() => setCategoryFilter("marketing")}
										selected={categoryFilter === "marketing"}>
										Marketing
									</Select.Item>
									<Select.Item
										value="other"
										onClick={() => setCategoryFilter("other")}
										selected={categoryFilter === "other"}>
										Lainnya
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
									placeholder="Filter Status"
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

					{/* Finance Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredFinanceData}
								columns={financeColumns}
								loading={false}
								emptyMessage="Tidak ada data transaksi keuangan"
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
