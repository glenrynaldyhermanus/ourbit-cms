import { supabase } from "./supabase";
import { handleSupabaseError } from "./supabase-error-handler";

export interface TransactionData {
	id: string;
	transaction_date: string;
	transaction_type: "sale" | "purchase" | "adjustment" | "transfer";
	reference_number: string;
	description: string;
	quantity: number;
	unit_price: number;
	total_amount: number;
	status: "completed" | "pending" | "cancelled";
	created_by_name?: string;
	product_name?: string;
	created_at: string;
}

export async function getTransactions(
	businessId: string,
	storeId: string
): Promise<TransactionData[]> {
	try {
		const { data, error } = await supabase
			.from("inventory_transactions")
			.select(
				`
				id,
				type,
				quantity,
				reference,
				note,
				unit_cost,
				total_cost,
				created_at,
				created_by,
				products!left(
					name
				)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;

		const transactionData: TransactionData[] = (data || []).map(
			(transaction: {
				id: string;
				type: number;
				quantity: number;
				reference?: string;
				note?: string;
				unit_cost?: number;
				total_cost?: number;
				created_at: string;
				created_by: string;
				products?: { name: string }[];
			}) => {
				// Map transaction type
				let transactionType: "sale" | "purchase" | "adjustment" | "transfer";
				switch (transaction.type) {
					case 1:
						transactionType = "sale";
						break;
					case 2:
						transactionType = "purchase";
						break;
					case 3:
						transactionType = "adjustment";
						break;
					case 4:
						transactionType = "transfer";
						break;
					default:
						transactionType = "adjustment";
				}

				return {
					id: transaction.id,
					transaction_date: transaction.created_at,
					transaction_type: transactionType,
					reference_number:
						transaction.reference || "TRX-" + transaction.id.slice(-8),
					description: transaction.note || "Transaksi inventori",
					quantity: transaction.quantity,
					unit_price: transaction.unit_cost || 0,
					total_amount: transaction.total_cost || 0,
					status: "completed", // Default status for inventory transactions
					created_by_name: "System", // Default since we can't join with users
					product_name: transaction.products?.[0]?.name || "Unknown Product",
					created_at: transaction.created_at,
				};
			}
		);

		return transactionData;
	} catch (error) {
		handleSupabaseError(error as Error, {
			operation: "get",
			entity: "transactions",
		});
		return [];
	}
}

export async function getTransactionStats(businessId: string, storeId: string) {
	try {
		const { data, error } = await supabase
			.from("inventory_transactions")
			.select(
				`
				type,
				quantity,
				total_cost
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null);

		if (error) throw error;

		const totalTransactions = data?.length || 0;
		const completedTransactions = totalTransactions; // All inventory transactions are considered completed
		const totalValue =
			data?.reduce((sum, t) => sum + (t.total_cost || 0), 0) || 0;
		const totalQuantity =
			data?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0;

		return {
			totalTransactions,
			completedTransactions,
			totalValue,
			totalQuantity,
		};
	} catch (error) {
		handleSupabaseError(error as Error, {
			operation: "get",
			entity: "transaction_stats",
		});
		return {
			totalTransactions: 0,
			completedTransactions: 0,
			totalValue: 0,
			totalQuantity: 0,
		};
	}
}
