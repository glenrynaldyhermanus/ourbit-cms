import { supabase } from "./supabase";
import { handleSupabaseError } from "./supabase-error-handler";

export interface DebtData {
	id: string;
	date: string;
	due_date: string;
	party_name: string;
	party_type: "customer" | "supplier";
	transaction_type: "receivable" | "payable";
	reference_number: string;
	description: string;
	original_amount: number;
	paid_amount: number;
	remaining_amount: number;
	status: "paid" | "partial" | "overdue" | "pending";
	days_overdue?: number;
	created_at: string;
}

export async function getReceivables(
	businessId: string,
	storeId: string
): Promise<DebtData[]> {
	try {
		const { data, error } = await supabase
			.from("receivables")
			.select(
				`
				id,
				transaction_date,
				due_date,
				original_amount,
				paid_amount,
				remaining_amount,
				status,
				reference_number,
				notes,
				created_at,
				customers!left(
					name
				)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;

		const receivablesData: DebtData[] = (data || []).map((receivable: any) => {
			const dueDate = new Date(receivable.due_date);
			const today = new Date();
			const daysOverdue =
				dueDate < today && receivable.status !== "paid"
					? Math.floor(
							(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
					  )
					: 0;

			return {
				id: receivable.id,
				date: receivable.transaction_date,
				due_date: receivable.due_date,
				party_name: receivable.customers?.name || "Unknown Customer",
				party_type: "customer",
				transaction_type: "receivable",
				reference_number: receivable.reference_number,
				description: receivable.notes || "Piutang penjualan",
				original_amount: receivable.original_amount,
				paid_amount: receivable.paid_amount,
				remaining_amount: receivable.remaining_amount,
				status: receivable.status,
				days_overdue: daysOverdue,
				created_at: receivable.created_at,
			};
		});

		return receivablesData;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "receivables",
		});
		return [];
	}
}

export async function getPayables(
	businessId: string,
	storeId: string
): Promise<DebtData[]> {
	try {
		const { data, error } = await supabase
			.from("payables")
			.select(
				`
				id,
				transaction_date,
				due_date,
				original_amount,
				paid_amount,
				remaining_amount,
				status,
				reference_number,
				notes,
				created_at,
				suppliers!left(
					name
				)
			`
			)
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;

		const payablesData: DebtData[] = (data || []).map((payable: any) => {
			const dueDate = new Date(payable.due_date);
			const today = new Date();
			const daysOverdue =
				dueDate < today && payable.status !== "paid"
					? Math.floor(
							(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
					  )
					: 0;

			return {
				id: payable.id,
				date: payable.transaction_date,
				due_date: payable.due_date,
				party_name: payable.suppliers?.name || "Unknown Supplier",
				party_type: "supplier",
				transaction_type: "payable",
				reference_number: payable.reference_number,
				description: payable.notes || "Hutang pembelian",
				original_amount: payable.original_amount,
				paid_amount: payable.paid_amount,
				remaining_amount: payable.remaining_amount,
				status: payable.status,
				days_overdue: daysOverdue,
				created_at: payable.created_at,
			};
		});

		return payablesData;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "payables",
		});
		return [];
	}
}

export async function getDebtStats(businessId: string, storeId: string) {
	try {
		const [receivables, payables] = await Promise.all([
			getReceivables(businessId, storeId),
			getPayables(businessId, storeId),
		]);

		const totalReceivables = receivables.reduce(
			(sum, r) => sum + r.remaining_amount,
			0
		);
		const totalPayables = payables.reduce(
			(sum, p) => sum + p.remaining_amount,
			0
		);
		const netPosition = totalReceivables - totalPayables;

		const overdueReceivables = receivables.filter(
			(r) => r.status === "overdue"
		);
		const overduePayables = payables.filter((p) => p.status === "overdue");

		const totalOverdueReceivables = overdueReceivables.reduce(
			(sum, r) => sum + r.remaining_amount,
			0
		);
		const totalOverduePayables = overduePayables.reduce(
			(sum, p) => sum + p.remaining_amount,
			0
		);

		return {
			totalReceivables,
			totalPayables,
			netPosition,
			totalOverdueReceivables,
			totalOverduePayables,
			overdueReceivablesCount: overdueReceivables.length,
			overduePayablesCount: overduePayables.length,
		};
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "debt_stats",
		});
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
}
