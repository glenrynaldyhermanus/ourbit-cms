import { supabase } from "./supabase";
import { handleSupabaseError } from "./supabase-error-handler";
import { Store } from "@/types";

export async function getStores(businessId: string): Promise<Store[]> {
	try {
		const { data, error } = await supabase
			.from("stores")
			.select("*")
			.eq("business_id", businessId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "stores",
		});
		return [];
	}
}

export async function getStore(id: string): Promise<Store | null> {
	try {
		const { data, error } = await supabase
			.from("stores")
			.select("*")
			.eq("id", id)
			.is("deleted_at", null)
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "stores",
		});
		return null;
	}
}

export async function createStore(
	store: Omit<Store, "id" | "created_at" | "updated_at">
): Promise<Store | null> {
	try {
		const { data, error } = await supabase
			.from("stores")
			.insert(store)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "create",
			entity: "stores",
		});
		return null;
	}
}

export async function updateStore(
	id: string,
	store: Partial<Store>
): Promise<Store | null> {
	try {
		const { data, error } = await supabase
			.from("stores")
			.update(store)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "update",
			entity: "stores",
		});
		return null;
	}
}

export async function deleteStore(id: string): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("stores")
			.update({ deleted_at: new Date().toISOString() })
			.eq("id", id);

		if (error) throw error;
		return true;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "delete",
			entity: "stores",
		});
		return false;
	}
}
