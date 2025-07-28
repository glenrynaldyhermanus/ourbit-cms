import { supabase } from "./supabase";
import { handleSupabaseError, SupabaseError } from "./supabase-error-handler";

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

		const receivablesData: DebtData[] = (data || []).map(
			(receivable: unknown) => {
				const receivableData = receivable as {
					id: string;
					transaction_date: string;
					due_date: string;
					original_amount: number;
					paid_amount: number;
					remaining_amount: number;
					status: "paid" | "partial" | "overdue" | "pending";
					reference_number: string;
					notes?: string;
					created_at: string;
					customers?: { name: string };
				};

				const dueDate = new Date(receivableData.due_date);
				const today = new Date();
				const daysOverdue =
					dueDate < today && receivableData.status !== "paid"
						? Math.floor(
								(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
						  )
						: 0;

				return {
					id: receivableData.id,
					date: receivableData.transaction_date,
					due_date: receivableData.due_date,
					party_name: receivableData.customers?.name || "Unknown Customer",
					party_type: "customer",
					transaction_type: "receivable",
					reference_number: receivableData.reference_number,
					description: receivableData.notes || "Piutang penjualan",
					original_amount: receivableData.original_amount,
					paid_amount: receivableData.paid_amount,
					remaining_amount: receivableData.remaining_amount,
					status: receivableData.status,
					days_overdue: daysOverdue,
					created_at: receivableData.created_at,
				};
			}
		);

		return receivablesData;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
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

		const payablesData: DebtData[] = (data || []).map((payable: unknown) => {
			const payableData = payable as {
				id: string;
				transaction_date: string;
				due_date: string;
				original_amount: number;
				paid_amount: number;
				remaining_amount: number;
				status: "paid" | "partial" | "overdue" | "pending";
				reference_number: string;
				notes?: string;
				created_at: string;
				suppliers?: { name: string };
			};

			const dueDate = new Date(payableData.due_date);
			const today = new Date();
			const daysOverdue =
				dueDate < today && payableData.status !== "paid"
					? Math.floor(
							(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
					  )
					: 0;

			return {
				id: payableData.id,
				date: payableData.transaction_date,
				due_date: payableData.due_date,
				party_name: payableData.suppliers?.name || "Unknown Supplier",
				party_type: "supplier",
				transaction_type: "payable",
				reference_number: payableData.reference_number,
				description: payableData.notes || "Hutang pembelian",
				original_amount: payableData.original_amount,
				paid_amount: payableData.paid_amount,
				remaining_amount: payableData.remaining_amount,
				status: payableData.status,
				days_overdue: daysOverdue,
				created_at: payableData.created_at,
			};
		});

		return payablesData;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
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
		handleSupabaseError(error as SupabaseError, {
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
