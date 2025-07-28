"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	Minus,
	Plus,
	Bell,
	Download,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import {
	DataTable,
	Column,
	Divider,
	Skeleton,
	Input,
	Select,
	Button,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getProfitLossItems, getProfitLossStats } from "@/lib/profit-loss";
import type { ProfitLossItem, ProfitLossStats } from "@/types";
import { getStoreId } from "@/lib/store";

export default function ProfitLossPage() {
	const [profitLossData, setProfitLossData] = useState<ProfitLossItem[]>([]);
	const [profitLossStats, setProfitLossStats] = useState<ProfitLossStats>({
		total_revenue: 0,
		total_cost_of_goods: 0,
		total_operating_expenses: 0,
		total_other_income: 0,
		total_other_expenses: 0,
		gross_profit: 0,
		operating_profit: 0,
		net_profit: 0,
		gross_margin: 0,
		net_margin: 0,
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [loading, setLoading] = useState(false);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);

	const initializeData = useCallback(async () => {
		setLoading(true);
		try {
			await fetchUserProfile();
			setLoading(false);
		} catch (error) {
			console.error("Error initializing data:", error);
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		initializeData();
	}, [initializeData]);

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
			setDebouncedSearchTerm(searchTerm);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const fetchProfitLossData = React.useCallback(async () => {
		try {
			setLoading(true);

			// Get store_id from localStorage
			const storeId = getStoreId();

			if (!storeId) {
				console.error("Store ID not found in localStorage");
				return;
			}

			// Fetch profit loss data and stats
			const [profitLossItems, profitLossStatsData] = await Promise.all([
				getProfitLossItems(storeId),
				getProfitLossStats(storeId),
			]);

			setProfitLossData(profitLossItems);
			setProfitLossStats(profitLossStatsData);
		} catch (error) {
			console.error("Error fetching profit loss data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProfitLossData();
	}, [fetchProfitLossData]);

	// Filter data
	const filteredData = useMemo(() => {
		return profitLossData.filter((item) => {
			const matchesSearch =
				item.subcategory
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				item.description
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase());

			const matchesCategory =
				categoryFilter === "all" || item.category === categoryFilter;

			return matchesSearch && matchesCategory;
		});
	}, [profitLossData, debouncedSearchTerm, categoryFilter]);

	// Use profit loss stats from state
	const summary = useMemo(() => {
		return {
			revenue: profitLossStats.total_revenue,
			costOfGoods: profitLossStats.total_cost_of_goods,
			grossProfit: profitLossStats.gross_profit,
			operatingExpenses: profitLossStats.total_operating_expenses,
			operatingProfit: profitLossStats.operating_profit,
			otherIncome: profitLossStats.total_other_income,
			otherExpenses: profitLossStats.total_other_expenses,
			netProfit: profitLossStats.net_profit,
			grossMargin: profitLossStats.gross_margin,
			netMargin: profitLossStats.net_margin,
		};
	}, [profitLossStats]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getCategoryLabel = (category: string) => {
		switch (category) {
			case "revenue":
				return "Pendapatan";
			case "cost_of_goods":
				return "Harga Pokok Penjualan";
			case "operating_expense":
				return "Biaya Operasional";
			case "other_income":
				return "Pendapatan Lain";
			case "other_expense":
				return "Biaya Lain";
			default:
				return category;
		}
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "revenue":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "cost_of_goods":
				return "bg-red-500/10 text-red-600 dark:text-red-400";
			case "operating_expense":
				return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
			case "other_income":
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
			case "other_expense":
				return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
			default:
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
		}
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case "revenue":
				return <Plus className="w-3 h-3" />;
			case "cost_of_goods":
				return <Minus className="w-3 h-3" />;
			case "operating_expense":
				return <Minus className="w-3 h-3" />;
			case "other_income":
				return <Plus className="w-3 h-3" />;
			case "other_expense":
				return <Minus className="w-3 h-3" />;
			default:
				return <Minus className="w-3 h-3" />;
		}
	};

	// Define columns for DataTable
	const columns: Column<ProfitLossItem>[] = useMemo(
		() => [
			{
				key: "category",
				header: "Kategori",
				sortable: true,
				sortKey: "category",
				render: (item) => (
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
							item.category
						)}`}>
						{getCategoryIcon(item.category)}
						<span className="ml-1">{getCategoryLabel(item.category)}</span>
					</span>
				),
			},
			{
				key: "subcategory",
				header: "Sub Kategori",
				sortable: true,
				sortKey: "subcategory",
				render: (item) => (
					<div className="text-sm font-medium text-[var(--foreground)]">
						{item.subcategory}
					</div>
				),
			},
			{
				key: "description",
				header: "Deskripsi",
				sortable: true,
				sortKey: "description",
				render: (item) => (
					<div className="text-sm text-[var(--foreground)]">
						{item.description}
					</div>
				),
			},
			{
				key: "amount",
				header: "Jumlah",
				sortable: true,
				sortKey: "amount",
				render: (item) => (
					<div
						className={`text-sm font-medium ${
							item.amount >= 0 ? "text-green-600" : "text-red-600"
						}`}>
						{formatCurrency(item.amount)}
					</div>
				),
			},
			{
				key: "percentage",
				header: "% dari Revenue",
				sortable: false,
				render: (item) => (
					<div className="text-sm text-[var(--foreground)]">
						{profitLossStats.total_revenue > 0
							? `${(
									(Math.abs(item.amount) / profitLossStats.total_revenue) *
									100
							  ).toFixed(1)}%`
							: "-"}
					</div>
				),
			},
		],
		[profitLossStats.total_revenue]
	);

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Laporan Laba Rugi"
						subtitle="Analisis profitabilitas dan performa keuangan toko"
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

				{/* Summary Cards */}
				<div className="rounded-xl">
					<div className="flex items-center">
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "0ms" }}>
							<Stats.Card
								title="Total Revenue"
								value={formatCurrency(summary.revenue)}
								icon={DollarSign}
								change={{
									value: summary.revenue > 0 ? "+" : "-",
									type: summary.revenue > 0 ? "positive" : "negative",
								}}
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Gross Profit"
								value={formatCurrency(summary.grossProfit)}
								icon={TrendingUp}
								change={{
									value: summary.grossProfit > 0 ? "+" : "-",
									type: summary.grossProfit > 0 ? "positive" : "negative",
								}}
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Operating Expenses"
								value={formatCurrency(summary.operatingExpenses)}
								icon={TrendingDown}
								change={{
									value: "-",
									type: "negative",
								}}
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Net Profit"
								value={formatCurrency(summary.netProfit)}
								icon={summary.netProfit >= 0 ? TrendingUp : TrendingDown}
								change={{
									value: summary.netProfit >= 0 ? "+" : "-",
									type: summary.netProfit >= 0 ? "positive" : "negative",
								}}
							/>
						</div>
					</div>
				</div>

				{/* Profit Summary */}
				<div className="rounded-xl 	">
					<h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
						Ringkasan Laba Rugi
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-[var(--muted-foreground)]">
									Total Revenue
								</span>
								<span className="text-sm font-medium text-green-600">
									{formatCurrency(summary.revenue)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-[var(--muted-foreground)]">
									Cost of Goods Sold
								</span>
								<span className="text-sm font-medium text-red-600">
									-{formatCurrency(summary.costOfGoods)}
								</span>
							</div>
							<div className="flex justify-between items-center border-t border-dashed border-[var(--border)] pt-2">
								<span className="text-sm font-medium text-[var(--foreground)]">
									Gross Profit
								</span>
								<span className="text-sm font-bold text-blue-600">
									{formatCurrency(summary.grossProfit)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-[var(--muted-foreground)]">
									Operating Expenses
								</span>
								<span className="text-sm font-medium text-red-600">
									-{formatCurrency(summary.operatingExpenses)}
								</span>
							</div>
							<div className="flex justify-between items-center border-t border-dashed border-[var(--border)] pt-2">
								<span className="text-sm font-medium text-[var(--foreground)]">
									Operating Profit
								</span>
								<span className="text-sm font-bold text-purple-600">
									{formatCurrency(summary.operatingProfit)}
								</span>
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-[var(--muted-foreground)]">
									Other Income
								</span>
								<span className="text-sm font-medium text-green-600">
									{formatCurrency(summary.otherIncome)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-[var(--muted-foreground)]">
									Other Expenses
								</span>
								<span className="text-sm font-medium text-red-600">
									-{formatCurrency(summary.otherExpenses)}
								</span>
							</div>
							<div className="flex justify-between items-center border-t border-dashed border-[var(--border)] pt-2">
								<span className="text-sm font-bold text-[var(--foreground)]">
									Net Profit
								</span>
								<span
									className={`text-sm font-bold ${
										summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
									}`}>
									{formatCurrency(summary.netProfit)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-[var(--muted-foreground)]">
									Gross Margin
								</span>
								<span className="text-sm font-medium text-[var(--foreground)]">
									{summary.grossMargin.toFixed(1)}%
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-[var(--muted-foreground)]">
									Net Margin
								</span>
								<span
									className={`text-sm font-medium ${
										summary.netMargin >= 0 ? "text-green-600" : "text-red-600"
									}`}>
									{summary.netMargin.toFixed(1)}%
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<Divider />

					{/* Filters */}
					<div
						className="flex flex-col md:flex-row gap-4 animate-fade-in-up"
						style={{ animationDelay: "120ms" }}>
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									type="text"
									value={searchTerm}
									onChange={setSearchTerm}
									placeholder="Cari berdasarkan kategori atau deskripsi..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										categoryFilter === "all"
											? "Semua Kategori"
											: getCategoryLabel(categoryFilter)
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
										value="revenue"
										onClick={() => setCategoryFilter("revenue")}
										selected={categoryFilter === "revenue"}>
										Pendapatan
									</Select.Item>
									<Select.Item
										value="cost_of_goods"
										onClick={() => setCategoryFilter("cost_of_goods")}
										selected={categoryFilter === "cost_of_goods"}>
										Harga Pokok Penjualan
									</Select.Item>
									<Select.Item
										value="operating_expense"
										onClick={() => setCategoryFilter("operating_expense")}
										selected={categoryFilter === "operating_expense"}>
										Biaya Operasional
									</Select.Item>
									<Select.Item
										value="other_income"
										onClick={() => setCategoryFilter("other_income")}
										selected={categoryFilter === "other_income"}>
										Pendapatan Lain
									</Select.Item>
									<Select.Item
										value="other_expense"
										onClick={() => setCategoryFilter("other_expense")}
										selected={categoryFilter === "other_expense"}>
										Biaya Lain
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div className="md:w-auto">
							<Button.Root
								variant="outline"
								onClick={() => console.log("Export clicked")}
								className="rounded-xl w-full md:w-auto">
								<Button.Icon icon={Download} />
								<Button.Text>Export</Button.Text>
							</Button.Root>
						</div>
					</div>

					{/* Loading State */}
					{loading && <Skeleton.Table rows={5} />}

					{/* Profit Loss Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredData}
								columns={columns}
								loading={false}
								emptyMessage="Tidak ada data laba rugi"
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
