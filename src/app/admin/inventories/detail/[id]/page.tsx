"use client";

import { useState, useEffect, useMemo, use } from "react";
import {
	Package,
	ArrowLeft,
	Bell,
	TrendingUp,
	TrendingDown,
	Calendar,
	User,
	FileText,
	ArrowUpRight,
	ArrowDownRight,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable, Column, Divider, Button, Skeleton } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { Product, InventoryTransaction } from "@/types";
import { useRouter } from "next/navigation";

interface DetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function InventoryDetailPage({ params }: DetailPageProps) {
	const router = useRouter();
	const { id } = use(params);

	const [product, setProduct] = useState<Product | null>(null);
	const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);

	useEffect(() => {
		initializeData();
		fetchUserProfile();
	}, [id]);

	const initializeData = async () => {
		setLoading(true);
		try {
			await Promise.all([fetchProductDetails(), fetchInventoryTransactions()]);
		} catch (error) {
			console.error("Error initializing data:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchProductDetails = async () => {
		try {
			const { data, error } = await supabase
				.from("products")
				.select(
					`
					*,
					categories:category_id (
						id,
						name
					)
				`
				)
				.eq("id", id)
				.single();

			if (error) {
				console.error("Error fetching product:", error);
				return;
			}

			setProduct({
				...data,
				category_name: data.categories?.name || "Tidak Berkategori",
			});
		} catch (error) {
			console.error("Error fetching product details:", error);
		}
	};

	const fetchInventoryTransactions = async () => {
		try {
			const { data, error } = await supabase
				.from("inventory_transactions")
				.select("*")
				.eq("product_id", id)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching inventory transactions:", error);
				return;
			}

			setTransactions(data || []);
		} catch (error) {
			console.error("Error fetching inventory transactions:", error);
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

	const getTransactionTypeLabel = (type: number) => {
		switch (type) {
			case 1:
				return "Penyesuaian";
			case 2:
				return "Penjualan";
			case 3:
				return "Pembelian";
			case 4:
				return "Stock Opname";
			case 5:
				return "Transfer";
			default:
				return "Lainnya";
		}
	};

	const getTransactionTypeColor = (type: number) => {
		switch (type) {
			case 1:
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
			case 2:
				return "bg-red-500/10 text-red-600 dark:text-red-400";
			case 3:
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case 4:
				return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
			case 5:
				return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
			default:
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
		}
	};

	const getTransactionIcon = (type: number, quantity: number) => {
		if (quantity > 0) {
			return ArrowUpRight;
		} else {
			return ArrowDownRight;
		}
	};

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
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Calculate stats from transactions
	const stats = useMemo(() => {
		const totalIn = transactions
			.filter((t) => t.quantity > 0)
			.reduce((sum, t) => sum + t.quantity, 0);
		const totalOut = transactions
			.filter((t) => t.quantity < 0)
			.reduce((sum, t) => sum + Math.abs(t.quantity), 0);
		const totalTransactions = transactions.length;
		const lastTransaction = transactions[0]?.created_at || null;

		return {
			totalIn,
			totalOut,
			totalTransactions,
			lastTransaction,
		};
	}, [transactions]);

	// Define columns for transaction table
	const transactionColumns: Column<InventoryTransaction>[] = useMemo(
		() => [
			{
				key: "date",
				header: "Tanggal",
				sortable: true,
				sortKey: "created_at",
				render: (transaction) => (
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
							<Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
						</div>
						<div>
							<p className="text-sm font-medium text-[var(--foreground)]">
								{formatDate(transaction.created_at)}
							</p>
						</div>
					</div>
				),
			},
			{
				key: "type",
				header: "Jenis Transaksi",
				sortable: true,
				sortKey: "type",
				render: (transaction) => (
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
							transaction.type
						)}`}>
						{getTransactionTypeLabel(transaction.type)}
					</span>
				),
			},
			{
				key: "quantity",
				header: "Perubahan Stok",
				sortable: true,
				sortKey: "quantity",
				render: (transaction) => {
					const Icon = getTransactionIcon(
						transaction.type,
						transaction.quantity
					);
					const isPositive = transaction.quantity > 0;

					return (
						<div className="flex items-center space-x-2">
							<Icon
								className={`w-4 h-4 ${
									isPositive
										? "text-green-600 dark:text-green-400"
										: "text-red-600 dark:text-red-400"
								}`}
							/>
							<span
								className={`font-medium ${
									isPositive
										? "text-green-600 dark:text-green-400"
										: "text-red-600 dark:text-red-400"
								}`}>
								{isPositive ? "+" : ""}
								{transaction.quantity} {product?.unit || "pcs"}
							</span>
						</div>
					);
				},
			},
			{
				key: "stock_change",
				header: "Stok Sebelum/Sesudah",
				sortable: false,
				render: (transaction) => (
					<div className="text-sm text-[var(--foreground)]">
						<div className="flex items-center space-x-2">
							<span>{transaction.previous_qty || "-"}</span>
							<span className="text-[var(--muted-foreground)]">→</span>
							<span className="font-medium">{transaction.new_qty || "-"}</span>
						</div>
					</div>
				),
			},
			{
				key: "reference",
				header: "Referensi",
				sortable: false,
				render: (transaction) => (
					<div className="text-sm text-[var(--foreground)]">
						{transaction.reference || "-"}
					</div>
				),
			},
			{
				key: "note",
				header: "Catatan",
				sortable: false,
				render: (transaction) => (
					<div className="text-sm text-[var(--muted-foreground)] max-w-xs truncate">
						{transaction.note || "-"}
					</div>
				),
			},
		],
		[product]
	);

	if (loading) {
		return (
			<div className="min-h-screen bg-[var(--background)]">
				<div className="max-w mx-auto space-y-4">
					<div className="space-y-8">
						<Skeleton.Item className="h-8 w-1/4" />
						<Skeleton.Item className="h-4 w-1/2" />
						<div className="grid grid-cols-4 gap-6">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton.Item key={i} className="h-24 rounded-xl" />
							))}
						</div>
						<Skeleton.Item className="h-96 rounded-xl" />
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="min-h-screen bg-[var(--background)]">
				<div className="max-w mx-auto space-y-4">
					<div className="text-center py-12">
						<Package className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
						<h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
							Produk tidak ditemukan
						</h3>
						<p className="text-[var(--muted-foreground)] mb-4">
							Produk dengan ID tersebut tidak ditemukan.
						</p>
						<Button.Root
							variant="outline"
							onClick={() => router.push("/admin/inventories")}>
							<Button.Icon icon={ArrowLeft} />
							<Button.Text>Kembali ke Inventori</Button.Text>
						</Button.Root>
					</div>
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
						title={`Detail Inventori - ${product.name}`}
						subtitle={`${product.code} • ${product.category_name}`}
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

				{/* Product Info Card */}
				<div
					className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 animate-fade-in-up"
					style={{ animationDelay: "60ms" }}>
					<div className="flex items-start space-x-6">
						{product.image_url ? (
							<img
								src={product.image_url}
								alt={product.name}
								className="w-24 h-24 bg-[var(--muted)] rounded-xl object-cover"
							/>
						) : (
							<div className="w-24 h-24 bg-orange-100 rounded-xl flex items-center justify-center">
								<Package className="w-12 h-12 text-orange-600" />
							</div>
						)}
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
								{product.name}
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
								<div>
									<p className="text-[var(--muted-foreground)]">SKU</p>
									<p className="font-medium text-[var(--foreground)]">
										{product.code}
									</p>
								</div>
								<div>
									<p className="text-[var(--muted-foreground)]">
										Stok Saat Ini
									</p>
									<p className="font-medium text-[var(--foreground)]">
										{product.stock} {product.unit || "pcs"}
									</p>
								</div>
								<div>
									<p className="text-[var(--muted-foreground)]">Harga Beli</p>
									<p className="font-medium text-[var(--foreground)]">
										{formatCurrency(product.purchase_price)}
									</p>
								</div>
								<div>
									<p className="text-[var(--muted-foreground)]">Harga Jual</p>
									<p className="font-medium text-[var(--foreground)]">
										{formatCurrency(product.selling_price)}
									</p>
								</div>
							</div>
							{product.description && (
								<div className="mt-4">
									<p className="text-[var(--muted-foreground)] text-sm">
										Deskripsi
									</p>
									<p className="text-[var(--foreground)]">
										{product.description}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="rounded-xl">
					<div className="flex items-center">
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "0ms" }}>
							<Stats.Card
								title="Total Masuk"
								value={stats.totalIn}
								icon={TrendingUp}
								iconColor="bg-green-500/10 text-green-600 dark:text-green-400"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Total Keluar"
								value={stats.totalOut}
								icon={TrendingDown}
								iconColor="bg-red-500/10 text-red-600 dark:text-red-400"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Total Transaksi"
								value={stats.totalTransactions}
								icon={FileText}
								iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Transaksi Terakhir"
								value={
									stats.lastTransaction
										? formatDate(stats.lastTransaction)
										: "Belum ada"
								}
								icon={Calendar}
								iconColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<Divider />

					{/* Transaction History Table */}
					<div
						className="animate-fade-in-up"
						style={{ animationDelay: "120ms" }}>
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
								Riwayat Transaksi Inventori
							</h3>
							<p className="text-sm text-[var(--muted-foreground)]">
								Log lengkap perubahan stok untuk produk ini
							</p>
						</div>

						{transactions.length === 0 ? (
							<div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
								<FileText className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
								<p className="text-[var(--muted-foreground)]">
									Belum ada transaksi untuk produk ini
								</p>
							</div>
						) : (
							<DataTable
								data={transactions}
								columns={transactionColumns}
								loading={false}
								pageSize={20}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
