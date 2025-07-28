import { supabase } from "./supabase";
import { Session } from "@supabase/supabase-js";

export interface AuthUser {
	id: string;
	email: string;
	fullName?: string;
	phone?: string;
	emailConfirmed: boolean;
}

export class AuthUtil {
	static async getCurrentUser(): Promise<AuthUser | null> {
		try {
			console.log("AuthUtil.getCurrentUser: Fetching user...");
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) {
				console.error("AuthUtil.getCurrentUser: Supabase error:", error);
				return null;
			}

			if (!user) {
				console.log("AuthUtil.getCurrentUser: No user found");
				return null;
			}

			console.log("AuthUtil.getCurrentUser: User found:", user.email);
			return {
				id: user.id,
				email: user.email || "",
				fullName: user.user_metadata?.full_name || "",
				phone: user.user_metadata?.phone || "",
				emailConfirmed: user.email_confirmed_at !== null,
			};
		} catch (error) {
			console.error("AuthUtil.getCurrentUser: Exception:", error);
			return null;
		}
	}

	static async signInWithEmail(email: string, password: string) {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			return data;
		} catch (error) {
			console.error("Error signing in:", error);
			throw error;
		}
	}

	static async signUpWithEmail(
		email: string,
		password: string,
		fullName?: string,
		phone?: string
	) {
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName || "",
						phone: phone || "",
					},
				},
			});

			if (error) {
				throw error;
			}

			return data;
		} catch (error) {
			console.error("Error signing up:", error);
			throw error;
		}
	}

	static async signOut() {
		try {
			const { error } = await supabase.auth.signOut();

			if (error) {
				throw error;
			}
		} catch (error) {
			console.error("Error signing out:", error);
			throw error;
		}
	}

	static async resetPassword(email: string) {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) {
				throw error;
			}
		} catch (error) {
			console.error("Error resetting password:", error);
			throw error;
		}
	}

	static async updatePassword(newPassword: string) {
		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) {
				throw error;
			}
		} catch (error) {
			console.error("Error updating password:", error);
			throw error;
		}
	}

	static onAuthStateChange(
		callback: (event: string, session: Session | null) => void
	) {
		return supabase.auth.onAuthStateChange(callback);
	}

	static async isAuthenticated(): Promise<boolean> {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			return !!user;
		} catch {
			return false;
		}
	}

	static async requireAuth(): Promise<AuthUser> {
		const user = await this.getCurrentUser();

		if (!user) {
			throw new Error("Authentication required");
		}

		return user;
	}
}

// Hook untuk React components
export function useAuth() {
	return {
		getCurrentUser: AuthUtil.getCurrentUser,
		signInWithEmail: AuthUtil.signInWithEmail,
		signUpWithEmail: AuthUtil.signUpWithEmail,
		signOut: AuthUtil.signOut,
		resetPassword: AuthUtil.resetPassword,
		updatePassword: AuthUtil.updatePassword,
		onAuthStateChange: AuthUtil.onAuthStateChange,
		isAuthenticated: AuthUtil.isAuthenticated,
		requireAuth: AuthUtil.requireAuth,
	};
}

export default AuthUtil;
