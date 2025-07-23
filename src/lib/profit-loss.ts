import { supabase } from "./supabase";
import { handleSupabaseError } from "./supabase-error-handler";
import type { ProfitLossItem, ProfitLossStats } from "@/types";

export async function getProfitLossItems(
	storeId: string
): Promise<ProfitLossItem[]> {
	try {
		const { data, error } = await supabase
			.from("profit_loss_items")
			.select("*")
			.eq("store_id", storeId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;

		const profitLossData: ProfitLossItem[] = (data || []).map(
			(item: {
				id: string;
				category: string;
				subcategory: string;
				description: string;
				amount: number;
				percentage_of_revenue?: number;
				created_at: string;
			}) => ({
				id: item.id,
				category: item.category as
					| "revenue"
					| "cost_of_goods"
					| "operating_expense"
					| "other_income"
					| "other_expense",
				subcategory: item.subcategory,
				description: item.description,
				amount: item.amount,
				percentage_of_revenue: item.percentage_of_revenue,
				created_at: item.created_at,
			})
		);

		return profitLossData;
	} catch (error) {
		handleSupabaseError(error as Error, {
			operation: "get",
			entity: "profit_loss_items",
		});
		return [];
	}
}

export async function getProfitLossStats(
	storeId: string
): Promise<ProfitLossStats> {
	try {
		const { data, error } = await supabase
			.from("profit_loss_items")
			.select("category, amount")
			.eq("store_id", storeId)
			.is("deleted_at", null);

		if (error) throw error;

		const items = data || [];
		const revenue = items
			.filter(
				(item: { category: string; amount: number }) =>
					item.category === "revenue"
			)
			.reduce(
				(sum: number, item: { category: string; amount: number }) =>
					sum + item.amount,
				0
			);

		const costOfGoods = Math.abs(
			items
				.filter(
					(item: { category: string; amount: number }) =>
						item.category === "cost_of_goods"
				)
				.reduce(
					(sum: number, item: { category: string; amount: number }) =>
						sum + item.amount,
					0
				)
		);

		const operatingExpenses = Math.abs(
			items
				.filter(
					(item: { category: string; amount: number }) =>
						item.category === "operating_expense"
				)
				.reduce(
					(sum: number, item: { category: string; amount: number }) =>
						sum + item.amount,
					0
				)
		);

		const otherIncome = items
			.filter(
				(item: { category: string; amount: number }) =>
					item.category === "other_income"
			)
			.reduce(
				(sum: number, item: { category: string; amount: number }) =>
					sum + item.amount,
				0
			);

		const otherExpenses = Math.abs(
			items
				.filter(
					(item: { category: string; amount: number }) =>
						item.category === "other_expense"
				)
				.reduce(
					(sum: number, item: { category: string; amount: number }) =>
						sum + item.amount,
					0
				)
		);

		const grossProfit = revenue - costOfGoods;
		const operatingProfit = grossProfit - operatingExpenses;
		const netProfit = operatingProfit + otherIncome - otherExpenses;

		const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
		const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

		return {
			total_revenue: revenue,
			total_cost_of_goods: costOfGoods,
			total_operating_expenses: operatingExpenses,
			total_other_income: otherIncome,
			total_other_expenses: otherExpenses,
			gross_profit: grossProfit,
			operating_profit: operatingProfit,
			net_profit: netProfit,
			gross_margin: grossMargin,
			net_margin: netMargin,
		};
	} catch (error) {
		handleSupabaseError(error as Error, {
			operation: "get",
			entity: "profit_loss_stats",
		});
		return {
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
		};
	}
}
