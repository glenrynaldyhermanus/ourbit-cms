"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	TrendingUp,
	TrendingDown,
	Receipt,
	AlertTriangle,
	Clock,
	Bell,
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
import {
	getReceivables,
	getPayables,
	getDebtStats,
	DebtData,
} from "@/lib/debt";

export default function DebtReportPage() {
	const [debtData, setDebtData] = useState<DebtData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [partyTypeFilter, setPartyTypeFilter] = useState<string>("all");
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [userProfile, setUserProfile] = useState<{
		id: string;
		email?: string;
		name?: string;
		avatar?: string;
	} | null>(null);

	useEffect(() => {
		const currentBusinessId = getBusinessId();
		const currentStoreId = getStoreId();
		setBusinessId(currentBusinessId);
		setStoreId(currentStoreId);
	}, []);

	const fetchDebtData = useCallback(async () => {
		if (!businessId || !storeId) return;

		setLoading(true);
		try {
			const [receivables, payables] = await Promise.all([
				getReceivables(businessId, storeId),
				getPayables(businessId, storeId),
			]);
			setDebtData([...receivables, ...payables]);
		} catch (error) {
			console.error("Error fetching debt data:", error);
		} finally {
			setLoading(false);
		}
	}, [businessId, storeId]);

	useEffect(() => {
		if (businessId && storeId) {
			fetchDebtData();
			fetchUserProfile();
		}
	}, [businessId, storeId, fetchDebtData]);

	const fetchUserProfile = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setUserProfile(user);
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			// Search is handled by useMemo
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const filteredDebtData = useMemo(() => {
		return debtData.filter((debt) => {
			const matchesSearch =
				debt.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				debt.reference_number
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				debt.description.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesType =
				typeFilter === "all" || debt.transaction_type === typeFilter;
			const matchesStatus =
				statusFilter === "all" || debt.status === statusFilter;
			const matchesPartyType =
				partyTypeFilter === "all" || debt.party_type === partyTypeFilter;

			return matchesSearch && matchesType && matchesStatus && matchesPartyType;
		});
	}, [debtData, searchTerm, typeFilter, statusFilter, partyTypeFilter]);

	const stats = useMemo(async () => {
		if (!businessId || !storeId)
			return {
				totalReceivables: 0,
				totalPayables: 0,
				netPosition: 0,
				totalOverdueReceivables: 0,
				totalOverduePayables: 0,
				overdueReceivablesCount: 0,
				overduePayablesCount: 0,
			};

		try {
			return await getDebtStats(businessId, storeId);
		} catch (error) {
			console.error("Error fetching debt stats:", error);
			return {
				totalReceivables: 0,
				totalPayables: 0,
				netPosition: 0,
				totalOverdueReceivables: 0,
				totalOverduePayables: 0,
				overdueReceivablesCount: 0,
				overduePayablesCount: 0,
			};
		}
	}, [businessId, storeId]);

	const [statsData, setStatsData] = useState({
		totalReceivables: 0,
		totalPayables: 0,
		netPosition: 0,
		totalOverdueReceivables: 0,
		totalOverduePayables: 0,
		overdueReceivablesCount: 0,
		overduePayablesCount: 0,
	});

	// Calculate trend data
	const trendData = useMemo(() => {
		if (!debtData || debtData.length === 0) {
			return {
				receivablesTrend: { value: "0%", type: "neutral" as const },
				payablesTrend: { value: "0%", type: "neutral" as const },
				netPositionTrend: { value: "0%", type: "neutral" as const },
				overdueTrend: { value: "0%", type: "neutral" as const },
			};
		}

		// Get current month and previous month data
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		const currentMonthData = debtData.filter((debt) => {
			const debtDate = new Date(debt.date);
			return (
				debtDate.getMonth() === currentMonth &&
				debtDate.getFullYear() === currentYear
			);
		});

		const previousMonthData = debtData.filter((debt) => {
			const debtDate = new Date(debt.date);
			const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
			const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
			return (
				debtDate.getMonth() === prevMonth && debtDate.getFullYear() === prevYear
			);
		});

		// Calculate totals for current month
		const currentReceivables = currentMonthData
			.filter((d) => d.transaction_type === "receivable")
			.reduce((sum, d) => sum + d.remaining_amount, 0);
		const currentPayables = currentMonthData
			.filter((d) => d.transaction_type === "payable")
			.reduce((sum, d) => sum + d.remaining_amount, 0);
		const currentNetPosition = currentReceivables - currentPayables;
		const currentOverdue = currentMonthData.filter(
			(d) => d.status === "overdue"
		).length;

		// Calculate totals for previous month
		const previousReceivables = previousMonthData
			.filter((d) => d.transaction_type === "receivable")
			.reduce((sum, d) => sum + d.remaining_amount, 0);
		const previousPayables = previousMonthData
			.filter((d) => d.transaction_type === "payable")
			.reduce((sum, d) => sum + d.remaining_amount, 0);
		const previousNetPosition = previousReceivables - previousPayables;
		const previousOverdue = previousMonthData.filter(
			(d) => d.status === "overdue"
		).length;

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
			receivablesTrend: calculateTrend(currentReceivables, previousReceivables),
			payablesTrend: calculateTrend(currentPayables, previousPayables),
			netPositionTrend: calculateTrend(currentNetPosition, previousNetPosition),
			overdueTrend: calculateTrend(currentOverdue, previousOverdue),
		};
	}, [debtData]);

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

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "receivable":
				return "Piutang";
			case "payable":
				return "Hutang";
			default:
				return type;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "receivable":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "payable":
				return "bg-red-500/10 text-red-600 dark:text-red-400";
			default:
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
		}
	};

	const getPartyTypeLabel = (type: string) => {
		switch (type) {
			case "customer":
				return "Customer";
			case "supplier":
				return "Supplier";
			default:
				return type;
		}
	};

	const getPartyTypeColor = (type: string) => {
		switch (type) {
			case "customer":
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
			case "supplier":
				return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
			default:
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "partial":
				return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
			case "overdue":
				return "bg-red-500/10 text-red-600 dark:text-red-400";
			case "pending":
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
			default:
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "paid":
				return "Lunas";
			case "partial":
				return "Sebagian";
			case "overdue":
				return "Terlambat";
			case "pending":
				return "Pending";
			default:
				return status;
		}
	};

	const debtColumns: Column<DebtData>[] = [
		{
			key: "date",
			header: "Tanggal",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{formatDate(item.date)}
				</div>
			),
			sortable: true,
		},
		{
			key: "due_date",
			header: "Jatuh Tempo",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{formatDate(item.due_date)}
				</div>
			),
			sortable: true,
		},
		{
			key: "party_name",
			header: "Pihak",
			render: (item) => (
				<div className="text-[var(--foreground)]">{item.party_name}</div>
			),
			sortable: true,
		},
		{
			key: "party_type",
			header: "Tipe Pihak",
			render: (item) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPartyTypeColor(
						item.party_type
					)}`}>
					{getPartyTypeLabel(item.party_type)}
				</span>
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
			key: "reference_number",
			header: "No. Referensi",
			render: (item) => (
				<div className="text-[var(--foreground)]">{item.reference_number}</div>
			),
			sortable: true,
		},
		{
			key: "original_amount",
			header: "Jumlah Awal",
			render: (item) => (
				<div className="font-medium text-[var(--foreground)]">
					{formatCurrency(item.original_amount)}
				</div>
			),
			sortable: true,
		},
		{
			key: "paid_amount",
			header: "Sudah Bayar",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{formatCurrency(item.paid_amount)}
				</div>
			),
			sortable: true,
		},
		{
			key: "remaining_amount",
			header: "Sisa",
			render: (item) => (
				<div
					className={`font-medium ${
						item.remaining_amount > 0 ? "text-red-600" : "text-green-600"
					}`}>
					{formatCurrency(item.remaining_amount)}
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
			key: "days_overdue",
			header: "Hari Terlambat",
			render: (item) => (
				<div className="text-[var(--muted-foreground)]">
					{item.days_overdue && item.days_overdue > 0
						? `${item.days_overdue} hari`
						: "-"}
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
						title="Laporan Hutang Piutang"
						subtitle="Analisis hutang dan piutang toko"
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
							title="Total Piutang"
							value={formatCurrency(statsData.totalReceivables)}
							icon={TrendingUp}
							change={{
								value: trendData.receivablesTrend.value,
								type: trendData.receivablesTrend.type,
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Total Hutang"
							value={formatCurrency(statsData.totalPayables)}
							icon={TrendingDown}
							change={{
								value: trendData.payablesTrend.value,
								type: trendData.payablesTrend.type,
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Net Position"
							value={formatCurrency(statsData.netPosition)}
							icon={Receipt}
							change={{
								value: trendData.netPositionTrend.value,
								type: trendData.netPositionTrend.type,
								period: "vs bulan lalu",
							}}
						/>
						<Stats.Card
							title="Terlambat"
							value={`${
								statsData.overdueReceivablesCount +
								statsData.overduePayablesCount
							}`}
							icon={AlertTriangle}
							change={{
								value: trendData.overdueTrend.value,
								type: trendData.overdueTrend.type,
								period: "vs bulan lalu",
							}}
						/>
					</div>

					{/* Overdue Summary */}
					{(statsData.totalOverdueReceivables > 0 ||
						statsData.totalOverduePayables > 0) && (
						<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
							<div className="flex items-center space-x-2 mb-3">
								<Clock className="w-5 h-5 text-yellow-600" />
								<h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
									Ringkasan Terlambat
								</h3>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="bg-[var(--card)] rounded-lg p-3">
									<div className="text-sm text-[var(--muted-foreground)] mb-1">
										Piutang Terlambat
									</div>
									<div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
										{formatCurrency(statsData.totalOverdueReceivables)}
									</div>
									<div className="text-xs text-[var(--muted-foreground)]">
										{statsData.overdueReceivablesCount} transaksi
									</div>
								</div>
								<div className="bg-[var(--card)] rounded-lg p-3">
									<div className="text-sm text-[var(--muted-foreground)] mb-1">
										Hutang Terlambat
									</div>
									<div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
										{formatCurrency(statsData.totalOverduePayables)}
									</div>
									<div className="text-xs text-[var(--muted-foreground)]">
										{statsData.overduePayablesCount} transaksi
									</div>
								</div>
							</div>
						</div>
					)}

					<Divider />

					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									placeholder="Cari berdasarkan nama pihak, nomor referensi, atau deskripsi..."
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
									placeholder="Tipe Transaksi"
								/>
								<Select.Content>
									<Select.Item
										value="all"
										onClick={() => setTypeFilter("all")}
										selected={typeFilter === "all"}>
										Semua Tipe
									</Select.Item>
									<Select.Item
										value="receivable"
										onClick={() => setTypeFilter("receivable")}
										selected={typeFilter === "receivable"}>
										Piutang
									</Select.Item>
									<Select.Item
										value="payable"
										onClick={() => setTypeFilter("payable")}
										selected={typeFilter === "payable"}>
										Hutang
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div className="w-full sm:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										partyTypeFilter === "all"
											? "Semua Pihak"
											: getPartyTypeLabel(partyTypeFilter)
									}
									placeholder="Tipe Pihak"
								/>
								<Select.Content>
									<Select.Item
										value="all"
										onClick={() => setPartyTypeFilter("all")}
										selected={partyTypeFilter === "all"}>
										Semua Pihak
									</Select.Item>
									<Select.Item
										value="customer"
										onClick={() => setPartyTypeFilter("customer")}
										selected={partyTypeFilter === "customer"}>
										Customer
									</Select.Item>
									<Select.Item
										value="supplier"
										onClick={() => setPartyTypeFilter("supplier")}
										selected={partyTypeFilter === "supplier"}>
										Supplier
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
										value="paid"
										onClick={() => setStatusFilter("paid")}
										selected={statusFilter === "paid"}>
										Lunas
									</Select.Item>
									<Select.Item
										value="partial"
										onClick={() => setStatusFilter("partial")}
										selected={statusFilter === "partial"}>
										Sebagian
									</Select.Item>
									<Select.Item
										value="overdue"
										onClick={() => setStatusFilter("overdue")}
										selected={statusFilter === "overdue"}>
										Terlambat
									</Select.Item>
									<Select.Item
										value="pending"
										onClick={() => setStatusFilter("pending")}
										selected={statusFilter === "pending"}>
										Pending
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					{/* Loading State */}
					{loading && <Skeleton.Table rows={5} />}

					{/* Debt Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredDebtData}
								columns={debtColumns}
								loading={false}
								emptyMessage="Tidak ada data hutang piutang"
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
