import { supabase } from "./supabase";
import { handleSupabaseError } from "./supabase-error-handler";
import { Role, User, RoleAssignment, StaffMember } from "@/types";

export type { StaffMember };

export async function getRoles(): Promise<Role[]> {
	try {
		const { data, error } = await supabase
			.from("roles")
			.select("*")
			.is("deleted_at", null)
			.order("name", { ascending: true });

		if (error) throw error;
		return data || [];
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "roles",
		});
		return [];
	}
}

export async function getStaffMembers(
	businessId: string,
	storeId: string
): Promise<StaffMember[]> {
	try {
		const { data, error } = await supabase
			.from("role_assignments")
			.select(
				`
				id,
				user_id,
				role_id,
				store_id,
				created_at,
				updated_at,
				users!inner(
					id,
					name,
					email,
					phone,
					created_at
				),
				roles!inner(
					id,
					name
				)
			`
			)
			.eq("business_id", businessId)
			.eq("store_id", storeId)
			.is("deleted_at", null);

		if (error) throw error;

		// Transform the data to match StaffMember interface
		const staffMembers: StaffMember[] = (data || []).map((assignment: any) => ({
			id: assignment.users.id,
			name: assignment.users.name,
			email: assignment.users.email,
			phone: assignment.users.phone,
			created_at: assignment.users.created_at,
			role: {
				id: assignment.roles.id,
				name: assignment.roles.name,
				created_at: assignment.created_at,
			},
			role_assignment_id: assignment.id,
			store_id: assignment.store_id,
		}));

		return staffMembers;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "get",
			entity: "staff",
		});
		return [];
	}
}

export async function createStaffAssignment(assignment: {
	user_id: string;
	business_id: string;
	role_id: string;
	store_id: string;
}): Promise<RoleAssignment | null> {
	try {
		const { data, error } = await supabase
			.from("role_assignments")
			.insert(assignment)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "create",
			entity: "role_assignment",
		});
		return null;
	}
}

export async function updateStaffAssignment(
	assignmentId: string,
	assignment: Partial<RoleAssignment>
): Promise<RoleAssignment | null> {
	try {
		const { data, error } = await supabase
			.from("role_assignments")
			.update(assignment)
			.eq("id", assignmentId)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "update",
			entity: "role_assignment",
		});
		return null;
	}
}

export async function deleteStaffAssignment(
	assignmentId: string
): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("role_assignments")
			.update({ deleted_at: new Date().toISOString() })
			.eq("id", assignmentId);

		if (error) throw error;
		return true;
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "delete",
			entity: "role_assignment",
		});
		return false;
	}
}

export async function searchUsers(email: string): Promise<User[]> {
	try {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.ilike("email", `%${email}%`)
			.is("deleted_at", null)
			.limit(10);

		if (error) throw error;
		return data || [];
	} catch (error) {
		handleSupabaseError(error as any, {
			operation: "search",
			entity: "users",
		});
		return [];
	}
}
