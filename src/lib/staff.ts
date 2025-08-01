import { supabase } from "./supabase";
import { handleSupabaseError, SupabaseError } from "./supabase-error-handler";
import { Role, User, RoleAssignment, StaffMember } from "@/types";

export type { StaffMember };

interface RoleAssignmentWithRelations {
	id: string;
	user_id: string;
	role_id: string;
	store_id: string;
	created_at: string;
	updated_at: string;
	users: {
		id: string;
		name: string;
		email: string;
		phone: string;
		created_at: string;
	}[];
	roles: {
		id: string;
		name: string;
	}[];
}

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
		handleSupabaseError(error as SupabaseError, {
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
		const staffMembers: StaffMember[] = (data || []).map(
			(assignment: RoleAssignmentWithRelations) => ({
				id: assignment.users[0]?.id || "",
				name: assignment.users[0]?.name || "",
				email: assignment.users[0]?.email || "",
				phone: assignment.users[0]?.phone || "",
				created_at: assignment.users[0]?.created_at || "",
				role: {
					id: assignment.roles[0]?.id || "",
					name: assignment.roles[0]?.name || "",
					created_at: assignment.created_at,
				},
				role_assignment_id: assignment.id,
				store_id: assignment.store_id,
			})
		);

		return staffMembers;
	} catch (error) {
		handleSupabaseError(error as SupabaseError, {
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
		handleSupabaseError(error as SupabaseError, {
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
		handleSupabaseError(error as SupabaseError, {
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
		handleSupabaseError(error as SupabaseError, {
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
		handleSupabaseError(error as SupabaseError, {
			operation: "search",
			entity: "users",
		});
		return [];
	}
}
