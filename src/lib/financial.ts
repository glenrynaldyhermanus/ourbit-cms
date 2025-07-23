import { supabase } from "./supabase";
import { handleSupabaseError } from "./supabase-error-handler";

export interface FinancialTransactionData {
	id: string;
	transaction_date: string;
	transaction_type: "income" | "expense" | "transfer";
	category: string;
	subcategory?: string;
	description: string;
	amount: number;
	payment_method_name?: string;
	account?: string;
	reference_number?: string;
	status: "completed" | "pending" | "cancelled";
	created_at: string;
}

export async function getFinancialTransactions(
	businessId: string,
	storeId: string
): Promise<FinancialTransactionData[]> {
	try {
		const { data, error } = await supabase
			.from("financial_transactions")
			.select(
				`
				id,
				transaction_date,
				transaction_type,
				category,
				subcategory,
				description,
				amount,
				account,
				reference_number,
				status,
				created_at,
				payment_methods!left(
					name
				)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("transaction_date", { ascending: false });

		if (error) throw error;

		const transactionData: FinancialTransactionData[] = (data || []).map(
			(transaction: any) => ({
				id: transaction.id,
				transaction_date: transaction.transaction_date,
				transaction_type: transaction.transaction_type,
				category: transaction.category,
				subcategory: transaction.subcategory,
				description: transaction.description,
				amount: transaction.amount,
				payment_method_name: transaction.payment_methods?.name || "Tunai",
				account: transaction.account,
				reference_number: transaction.reference_number,
				status: transaction.status,
				created_at: transaction.created_at,
			})
		);

		return transactionData;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "financial_transactions",
		});
		return [];
	}
}

export async function getFinancialStats(businessId: string, storeId: string) {
	try {
		const { data, error } = await supabase
			.from("financial_transactions")
			.select(
				`
				transaction_type,
				amount,
				status
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null);

		if (error) throw error;

		const completedTransactions =
			data?.filter((t) => t.status === "completed") || [];
		const income = completedTransactions
			.filter((t) => t.transaction_type === "income")
			.reduce((sum, t) => sum + t.amount, 0);
		const expenses = Math.abs(
			completedTransactions
				.filter((t) => t.transaction_type === "expense")
				.reduce((sum, t) => sum + t.amount, 0)
		);
		const transfers = completedTransactions
			.filter((t) => t.transaction_type === "transfer")
			.reduce((sum, t) => sum + t.amount, 0);

		const netCashFlow = income - expenses + transfers;
		const totalTransactions = data?.length || 0;
		const pendingTransactions =
			data?.filter((t) => t.status === "pending").length || 0;

		return {
			income,
			expenses,
			transfers,
			netCashFlow,
			totalTransactions,
			pendingTransactions,
		};
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "financial_stats",
		});
		return {
			income: 0,
			expenses: 0,
			transfers: 0,
			netCashFlow: 0,
			totalTransactions: 0,
			pendingTransactions: 0,
		};
	}
}
