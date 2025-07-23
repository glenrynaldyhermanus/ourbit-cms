import { supabase } from "./supabase";
import { handleSupabaseError } from "./supabase-error-handler";

export interface SalesData {
	id: string;
	sale_number: string;
	sale_date: string;
	customer_name?: string;
	customer_type?: string;
	items_count: number;
	subtotal: number;
	discount_amount: number;
	tax_amount: number;
	total_amount: number;
	payment_method_name?: string;
	status: "completed" | "pending" | "cancelled";
	cashier_name?: string;
	created_at: string;
}

export async function getSales(
	businessId: string,
	storeId: string
): Promise<SalesData[]> {
	try {
		const { data, error } = await supabase
			.from("sales")
			.select(
				`
				id,
				sale_number,
				sale_date,
				subtotal,
				discount_amount,
				tax_amount,
				total_amount,
				status,
				created_at,
				customers!left(
					name,
					customer_type
				),
				payment_methods!left(
					name
				),
				users!left(
					name
				),
				sales_items(
					id
				)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;

		const salesData: SalesData[] = (data || []).map((sale: any) => ({
			id: sale.id,
			sale_number: sale.sale_number,
			sale_date: sale.sale_date,
			customer_name: sale.customers?.name || "Walk-in Customer",
			customer_type: sale.customers?.customer_type || "retail",
			items_count: sale.sales_items?.length || 0,
			subtotal: sale.subtotal,
			discount_amount: sale.discount_amount,
			tax_amount: sale.tax_amount,
			total_amount: sale.total_amount,
			payment_method_name: sale.payment_methods?.name || "Tunai",
			status: sale.status,
			cashier_name: sale.users?.name || "Cashier",
			created_at: sale.created_at,
		}));

		return salesData;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "sales",
		});
		return [];
	}
}

export async function getSalesStats(businessId: string, storeId: string) {
	try {
		const { data, error } = await supabase
			.from("sales")
			.select(
				`
				total_amount,
				status,
				sales_items(
					id
				)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null);

		if (error) throw error;

		const completedSales = data?.filter((s) => s.status === "completed") || [];
		const totalSales = completedSales.length;
		const totalRevenue = completedSales.reduce(
			(sum, s) => sum + s.total_amount,
			0
		);
		const totalItems = completedSales.reduce(
			(sum, s) => sum + (s.sales_items?.length || 0),
			0
		);
		const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

		return {
			totalSales,
			totalRevenue,
			totalItems,
			avgOrderValue,
		};
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "sales_stats",
		});
		return {
			totalSales: 0,
			totalRevenue: 0,
			totalItems: 0,
			avgOrderValue: 0,
		};
	}
}
