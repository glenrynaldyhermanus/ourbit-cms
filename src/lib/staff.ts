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
	users:
		| {
				id: string;
				name: string;
				email: string;
				phone: string;
				created_at: string;
		  }
		| {
				id: string;
				name: string;
				email: string;
				phone: string;
				created_at: string;
		  }[];
	roles:
		| {
				id: string;
				name: string;
		  }
		| {
				id: string;
				name: string;
		  }[];
}

export async function getRoles(): Promise<Role[]> {
	try {
		const { data, error } = await supabase
			.schema("common")
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
			.schema("common")
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
			(assignment: RoleAssignmentWithRelations) => {
				// Supabase can return joined relations as an object or array depending on join/cardinality.
				// Handle both shapes safely.
				const usersRel = assignment.users;
				const rolesRel = assignment.roles;
				const userObj = Array.isArray(usersRel) ? usersRel[0] : usersRel;
				const roleObj = Array.isArray(rolesRel) ? rolesRel[0] : rolesRel;

				return {
					id: userObj?.id || "",
					name: userObj?.name || "",
					email: userObj?.email || "",
					phone: userObj?.phone || "",
					created_at: userObj?.created_at || "",
					role: {
						id: roleObj?.id || "",
						name: roleObj?.name || "",
						created_at: assignment.created_at,
					},
					role_assignment_id: assignment.id,
					store_id: assignment.store_id,
				};
			}
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
			.schema("common")
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
			.schema("common")
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
			.schema("common")
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
			.schema("common")
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
