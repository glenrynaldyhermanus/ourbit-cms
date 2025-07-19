"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthUser, AuthUtil } from "@/lib/auth";

interface AuthContextType {
	user: AuthUser | null;
	session: Session | null;
	loading: boolean;
	signOut: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	const refreshUser = async () => {
		try {
			const currentUser = await AuthUtil.getCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error("Error refreshing user:", error);
			setUser(null);
		}
	};

	const signOut = async () => {
		try {
			await AuthUtil.signOut();
			setUser(null);
			setSession(null);
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				setSession(session);

				if (session?.user) {
					const currentUser = await AuthUtil.getCurrentUser();
					setUser(currentUser);
				}
			} catch (error) {
				console.error("Error getting initial session:", error);
			} finally {
				setLoading(false);
			}
		};

		getInitialSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			setSession(session);

			if (session?.user) {
				const currentUser = await AuthUtil.getCurrentUser();
				setUser(currentUser);
			} else {
				setUser(null);
			}

			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const value = {
		user,
		session,
		loading,
		signOut,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
