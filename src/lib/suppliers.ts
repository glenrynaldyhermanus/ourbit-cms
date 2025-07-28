import { supabase } from "./supabase";
import { Supplier } from "@/types";
import { handleSupabaseError, SupabaseError } from "./supabase-error-handler";

export async function getSuppliers(businessId: string): Promise<Supplier[]> {
	try {
		const { data, error } = await supabase
			.from("suppliers")
			.select("*")
			.eq("business_id", businessId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "get",
			entity: "suppliers",
		});
		return [];
	}
}

export async function getSupplier(id: string): Promise<Supplier | null> {
	try {
		const { data, error } = await supabase
			.from("suppliers")
			.select("*")
			.eq("id", id)
			.is("deleted_at", null)
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "get",
			entity: "suppliers",
		});
		return null;
	}
}

export async function createSupplier(
	supplier: Omit<Supplier, "id" | "created_at" | "updated_at">
): Promise<Supplier | null> {
	try {
		const { data, error } = await supabase
			.from("suppliers")
			.insert(supplier)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "create",
			entity: "suppliers",
		});
		return null;
	}
}

export async function updateSupplier(
	id: string,
	supplier: Partial<Supplier>
): Promise<Supplier | null> {
	try {
		const { data, error } = await supabase
			.from("suppliers")
			.update(supplier)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "update",
			entity: "suppliers",
		});
		return null;
	}
}

export async function deleteSupplier(id: string): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("suppliers")
			.update({ deleted_at: new Date().toISOString() })
			.eq("id", id);

		if (error) throw error;
		return true;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
			operation: "delete",
			entity: "suppliers",
		});
		return false;
	}
}
