import { supabase } from "./supabase";
import { handleSupabaseError } from "./supabase-error-handler";

export interface PurchaseData {
	id: string;
	purchase_number: string;
	purchase_date: string;
	supplier_name?: string;
	supplier_type?: string;
	items_count: number;
	subtotal: number;
	discount_amount: number;
	tax_amount: number;
	total_amount: number;
	payment_method_name?: string;
	payment_terms: number;
	status: "completed" | "pending" | "cancelled" | "partial";
	received_by_name?: string;
	due_date?: string;
	created_at: string;
}

export async function getPurchases(
	businessId: string,
	storeId: string
): Promise<PurchaseData[]> {
	try {
		const { data, error } = await supabase
			.from("purchases")
			.select(
				`
				id,
				purchase_number,
				purchase_date,
				subtotal,
				discount_amount,
				tax_amount,
				total_amount,
				payment_terms,
				status,
				due_date,
				created_at,
				suppliers!left(
					name,
					contact_person
				),
				payment_methods!left(
					name
				),
				users!left(
					name
				),
				purchases_items(
					id
				)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;

		const purchaseData: PurchaseData[] = (data || []).map((purchase: any) => ({
			id: purchase.id,
			purchase_number: purchase.purchase_number,
			purchase_date: purchase.purchase_date,
			supplier_name: purchase.suppliers?.name || "Unknown Supplier",
			supplier_type: "product", // Default type, bisa diubah sesuai kebutuhan
			items_count: purchase.purchases_items?.length || 0,
			subtotal: purchase.subtotal,
			discount_amount: purchase.discount_amount,
			tax_amount: purchase.tax_amount,
			total_amount: purchase.total_amount,
			payment_method_name: purchase.payment_methods?.name || "Bank Transfer",
			payment_terms: purchase.payment_terms,
			status: purchase.status,
			received_by_name: purchase.users?.name || "Staff",
			due_date: purchase.due_date,
			created_at: purchase.created_at,
		}));

		return purchaseData;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "purchases",
		});
		return [];
	}
}

export async function getPurchasesStats(businessId: string, storeId: string) {
	try {
		const { data, error } = await supabase
			.from("purchases")
			.select(
				`
				total_amount,
				status,
				purchases_items(
					id
				)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null);

		if (error) throw error;

		const completedPurchases =
			data?.filter((p) => p.status === "completed") || [];
		const totalPurchases = data?.length || 0;
		const totalExpenses = completedPurchases.reduce(
			(sum, p) => sum + p.total_amount,
			0
		);
		const totalItems = completedPurchases.reduce(
			(sum, p) => sum + (p.purchases_items?.length || 0),
			0
		);
		const avgPurchaseValue =
			completedPurchases.length > 0
				? totalExpenses / completedPurchases.length
				: 0;

		return {
			totalPurchases,
			totalExpenses,
			totalItems,
			avgPurchaseValue,
		};
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "purchases_stats",
		});
		return {
			totalPurchases: 0,
			totalExpenses: 0,
			totalItems: 0,
			avgPurchaseValue: 0,
		};
	}
}
