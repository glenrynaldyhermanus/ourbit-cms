import { supabase } from "./supabase";
import { handleSupabaseError, SupabaseError } from "./supabase-error-handler";

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

export interface FinancialStats {
	income: number;
	expenses: number;
	transfers: number;
	netCashFlow: number;
	totalTransactions: number;
	pendingTransactions: number;
	incomeTrend: number;
	expensesTrend: number;
	netCashFlowTrend: number;
	totalTransactionsTrend: number;
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
			(transaction: unknown) => {
				const transactionData = transaction as {
					id: string;
					transaction_date: string;
					transaction_type: "income" | "expense" | "transfer";
					category: string;
					subcategory?: string;
					description: string;
					amount: number;
					account?: string;
					reference_number?: string;
					status: "completed" | "pending" | "cancelled";
					created_at: string;
					payment_methods?: { name: string };
				};

				return {
					id: transactionData.id,
					transaction_date: transactionData.transaction_date,
					transaction_type: transactionData.transaction_type,
					category: transactionData.category,
					subcategory: transactionData.subcategory,
					description: transactionData.description,
					amount: transactionData.amount,
					payment_method_name: transactionData.payment_methods?.name || "Tunai",
					account: transactionData.account,
					reference_number: transactionData.reference_number,
					status: transactionData.status,
					created_at: transactionData.created_at,
				};
			}
		);

		return transactionData;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "get",
			entity: "financial_transactions",
		});
		return [];
	}
}

export async function getFinancialStats(
	businessId: string,
	storeId: string
): Promise<FinancialStats> {
	try {
		if (!businessId || !storeId) {
			return {
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
			};
		}

		// Get current month data
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth();
		const currentYear = currentDate.getFullYear();

		const { data: currentData, error: currentError } = await supabase
			.from("financial_transactions")
			.select(
				`
				transaction_type,
				amount,
				status,
				transaction_date
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.gte(
				"transaction_date",
				new Date(currentYear, currentMonth, 1).toISOString()
			)
			.lte(
				"transaction_date",
				new Date(currentYear, currentMonth + 1, 0).toISOString()
			);

		if (currentError) throw currentError;

		// Get previous month data
		const { data: previousData, error: previousError } = await supabase
			.from("financial_transactions")
			.select(
				`
				transaction_type,
				amount,
				status,
				transaction_date
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.gte(
				"transaction_date",
				new Date(currentYear, currentMonth - 1, 1).toISOString()
			)
			.lte(
				"transaction_date",
				new Date(currentYear, currentMonth, 0).toISOString()
			);

		if (previousError) throw previousError;

		// Calculate current month stats
		const currentCompletedTransactions =
			currentData?.filter((t) => t.status === "completed") || [];
		const currentIncome = currentCompletedTransactions
			.filter((t) => t.transaction_type === "income")
			.reduce((sum, t) => sum + t.amount, 0);
		const currentExpenses = Math.abs(
			currentCompletedTransactions
				.filter((t) => t.transaction_type === "expense")
				.reduce((sum, t) => sum + t.amount, 0)
		);
		const currentTransfers = currentCompletedTransactions
			.filter((t) => t.transaction_type === "transfer")
			.reduce((sum, t) => sum + t.amount, 0);
		const currentNetCashFlow =
			currentIncome - currentExpenses + currentTransfers;
		const currentTotalTransactions = currentData?.length || 0;

		// Calculate previous month stats
		const previousCompletedTransactions =
			previousData?.filter((t) => t.status === "completed") || [];
		const previousIncome = previousCompletedTransactions
			.filter((t) => t.transaction_type === "income")
			.reduce((sum, t) => sum + t.amount, 0);
		const previousExpenses = Math.abs(
			previousCompletedTransactions
				.filter((t) => t.transaction_type === "expense")
				.reduce((sum, t) => sum + t.amount, 0)
		);
		const previousTransfers = previousCompletedTransactions
			.filter((t) => t.transaction_type === "transfer")
			.reduce((sum, t) => sum + t.amount, 0);
		const previousNetCashFlow =
			previousIncome - previousExpenses + previousTransfers;
		const previousTotalTransactions = previousData?.length || 0;

		// Calculate trends
		const calculateTrend = (current: number, previous: number) => {
			if (previous === 0) return current > 0 ? 100 : 0;
			return ((current - previous) / previous) * 100;
		};

		const incomeTrend = calculateTrend(currentIncome, previousIncome);
		const expensesTrend = calculateTrend(currentExpenses, previousExpenses);
		const netCashFlowTrend = calculateTrend(
			currentNetCashFlow,
			previousNetCashFlow
		);
		const totalTransactionsTrend = calculateTrend(
			currentTotalTransactions,
			previousTotalTransactions
		);

		return {
			income: currentIncome,
			expenses: currentExpenses,
			transfers: currentTransfers,
			netCashFlow: currentNetCashFlow,
			totalTransactions: currentTotalTransactions,
			pendingTransactions:
				currentData?.filter((t) => t.status === "pending").length || 0,
			incomeTrend,
			expensesTrend,
			netCashFlowTrend,
			totalTransactionsTrend,
		};
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
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
			incomeTrend: 0,
			expensesTrend: 0,
			netCashFlowTrend: 0,
			totalTransactionsTrend: 0,
		};
	}
}
