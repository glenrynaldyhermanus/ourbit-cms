import { supabase } from "./supabase";
import { Customer } from "@/types";
import { handleSupabaseError, SupabaseError } from "./supabase-error-handler";

export async function getCustomers(businessId: string): Promise<Customer[]> {
	try {
		const { data, error } = await supabase
			.from("customers")
			.select("*")
			.eq("business_id", businessId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "get",
			entity: "customers",
		});
		return [];
	}
}

export async function getCustomer(id: string): Promise<Customer | null> {
	try {
		const { data, error } = await supabase
			.from("customers")
			.select("*")
			.eq("id", id)
			.is("deleted_at", null)
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "get",
			entity: "customers",
		});
		return null;
	}
}

export async function createCustomer(
	customer: Omit<Customer, "id" | "created_at" | "updated_at">
): Promise<Customer | null> {
	try {
		const { data, error } = await supabase
			.from("customers")
			.insert(customer)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "create",
			entity: "customers",
		});
		return null;
	}
}

export async function updateCustomer(
	id: string,
	customer: Partial<Customer>
): Promise<Customer | null> {
	try {
		const { data, error } = await supabase
			.from("customers")
			.update(customer)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "update",
			entity: "customers",
		});
		return null;
	}
}

export async function deleteCustomer(id: string): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("customers")
			.update({ deleted_at: new Date().toISOString() })
			.eq("id", id);

		if (error) throw error;
		return true;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "delete",
			entity: "customers",
		});
		return false;
	}
}
