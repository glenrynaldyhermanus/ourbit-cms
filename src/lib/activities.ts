import { supabase } from "./supabase";
import { handleSupabaseError, SupabaseError } from "./supabase-error-handler";

export interface ActivityData {
	id: string;
	type: "sale" | "product" | "customer" | "inventory" | "financial";
	title: string;
	description: string;
	amount?: number;
	status?: string;
	timestamp: string;
	icon: string;
	color: string;
}

interface SaleData {
	id: string;
	sale_number: string;
	total_amount: number;
	status: string;
	created_at: string;
	customers?: { name: string };
}

export async function getRecentActivities(
	businessId: string,
	storeId: string,
	limit: number = 10
): Promise<ActivityData[]> {
	try {
		const activities: ActivityData[] = [];

		// 1. Get recent sales
		const { data: recentSales, error: salesError } = await supabase
			.from("sales")
			.select(
				`
				id,
				sale_number,
				total_amount,
				status,
				created_at,
				customers!left(name)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (!salesError && recentSales) {
			recentSales.forEach((sale: unknown) => {
				const saleData = sale as SaleData;
				activities.push({
					id: saleData.id,
					type: "sale",
					title: `Pesanan baru #${saleData.sale_number} selesai`,
					description: `Pesanan dari ${
						saleData.customers?.name || "Walk-in Customer"
					}`,
					amount: saleData.total_amount,
					status: saleData.status,
					timestamp: saleData.created_at,
					icon: "shopping-cart",
					color: "green",
				});
			});
		}

		// 2. Get recent products added
		const { data: recentProducts, error: productsError } = await supabase
			.from("products")
			.select(
				`
				id,
				name,
				created_at
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (!productsError && recentProducts) {
			recentProducts.forEach((product) => {
				activities.push({
					id: product.id,
					type: "product",
					title: "Produk baru ditambahkan",
					description: product.name,
					timestamp: product.created_at,
					icon: "package",
					color: "blue",
				});
			});
		}

		// 3. Get recent customers added
		const { data: recentCustomers, error: customersError } = await supabase
			.from("customers")
			.select(
				`
				id,
				name,
				created_at
			`
			)
			.eq("business_id", businessId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (!customersError && recentCustomers) {
			recentCustomers.forEach((customer) => {
				activities.push({
					id: customer.id,
					type: "customer",
					title: "Pelanggan baru ditambahkan",
					description: customer.name,
					timestamp: customer.created_at,
					icon: "users",
					color: "purple",
				});
			});
		}

		// 4. Get low stock products
		const { data: lowStockProducts, error: inventoryError } = await supabase
			.from("products")
			.select(
				`
				id,
				name,
				stock_quantity,
				created_at
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.lte("stock_quantity", 10)
			.order("stock_quantity", { ascending: true })
			.limit(limit);

		if (!inventoryError && lowStockProducts) {
			lowStockProducts.forEach((product) => {
				activities.push({
					id: product.id,
					type: "inventory",
					title: "Stok produk menipis",
					description: `${product.name} (${product.stock_quantity} tersisa)`,
					timestamp: product.created_at,
					icon: "alert-triangle",
					color: "orange",
				});
			});
		}

		// 5. Get recent financial transactions
		const { data: recentFinancial, error: financialError } = await supabase
			.from("financial_transactions")
			.select(
				`
				id,
				transaction_type,
				description,
				amount,
				status,
				created_at
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (!financialError && recentFinancial) {
			recentFinancial.forEach((transaction) => {
				activities.push({
					id: transaction.id,
					type: "financial",
					title: `Transaksi ${
						transaction.transaction_type === "income"
							? "pemasukan"
							: "pengeluaran"
					}`,
					description: transaction.description,
					amount: transaction.amount,
					status: transaction.status,
					timestamp: transaction.created_at,
					icon: "dollar-sign",
					color: transaction.transaction_type === "income" ? "green" : "red",
				});
			});
		}

		// Sort all activities by timestamp and return the most recent ones
		return activities
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
			)
			.slice(0, limit);
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "get",
			entity: "recent_activities",
		});
		return [];
	}
}

export function formatTimeAgo(timestamp: string): string {
	const now = new Date();
	const activityTime = new Date(timestamp);
	const diffInSeconds = Math.floor(
		(now.getTime() - activityTime.getTime()) / 1000
	);

	if (diffInSeconds < 60) {
		return `${diffInSeconds} detik yang lalu`;
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} menit yang lalu`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} jam yang lalu`;
	} else {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days} hari yang lalu`;
	}
}
