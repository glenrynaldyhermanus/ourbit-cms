"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthUser, AuthUtil } from "@/lib/auth";

interface AuthContextType {
	user: AuthUser | null;
	session: Session | null;
	loading: boolean;
	loadingMessage: string;
	mounted: boolean; // Add mounted state to prevent hydration mismatch
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
	const [loadingMessage, setLoadingMessage] = useState("Memuat aplikasi...");
	const [mounted, setMounted] = useState(false);

	const refreshUser = async () => {
		try {
			console.log("AuthProvider: Refreshing user details...");
			const currentUser = await AuthUtil.getCurrentUser();
			if (currentUser) {
				setUser(currentUser);
				console.log("AuthProvider: User details refreshed:", currentUser);
			} else {
				console.log("AuthProvider: No user found during refresh");
				setUser(null);
			}
		} catch (error) {
			console.error("AuthProvider: Error refreshing user:", error);
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

	// Set mounted state on client
	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		// Skip auth logic on server-side
		if (typeof window === "undefined") {
			setLoading(false);
			return;
		}

		// Quick token check first
		const quickTokenCheck = () => {
			try {
				// Check multiple possible token locations
				const hasToken =
					localStorage.getItem("supabase.auth.token") ||
					localStorage.getItem("sb-access-token") ||
					localStorage.getItem("sb-refresh-token") ||
					document.cookie.includes("sb-access-token") ||
					document.cookie.includes("sb-refresh-token") ||
					document.cookie.includes("supabase") ||
					// Check for any Supabase auth related items
					Object.keys(localStorage).some((key) => key.includes("supabase")) ||
					Object.keys(localStorage).some((key) => key.includes("sb-"));

				console.log("Quick token check result:", hasToken);
				return !!hasToken;
			} catch (error) {
				console.error("Error in quick token check:", error);
				return true; // If error, let the detailed check handle it
			}
		};

		// Get initial session
		const getInitialSession = async () => {
			try {
				setLoadingMessage("Memeriksa status login...");

				// Quick token check - log but don't redirect immediately
				const hasQuickToken = quickTokenCheck();
				if (!hasQuickToken) {
					console.log(
						"No token found in quick check, will verify with session..."
					);
					// Don't redirect immediately, let session check handle it
				}

				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error("Session error:", error);
					// Redirect to login if session is invalid
					if (
						typeof window !== "undefined" &&
						!window.location.pathname.includes("/sign-in")
					) {
						window.location.href = "/sign-in";
					}
					return;
				}

				setSession(session);

				if (session?.user) {
					// Set basic user info immediately to unblock UI
					const basicUser: AuthUser = {
						id: session.user.id,
						email: session.user.email || "",
						fullName: session.user.user_metadata?.full_name || "",
						phone: session.user.user_metadata?.phone || "",
						emailConfirmed: session.user.email_confirmed_at !== null,
					};
					setUser(basicUser);
					console.log("User set from session:", basicUser);
				} else {
					// No session, redirect to login if not already on public pages
					const publicPaths = [
						"/sign-in",
						"/sign-up",
						"/forgot-password",
						"/sign-up-success",
					];
					if (
						typeof window !== "undefined" &&
						!publicPaths.some((path) => window.location.pathname.includes(path))
					) {
						window.location.href = "/sign-in";
					}
				}
			} catch (error) {
				console.error("Error getting initial session:", error);
				// On any auth error, redirect to login
				if (
					typeof window !== "undefined" &&
					!window.location.pathname.includes("/sign-in")
				) {
					window.location.href = "/sign-in";
				}
			} finally {
				setLoading(false);
			}
		};

		getInitialSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log(
				"Auth state changed:",
				event,
				session ? "logged in" : "logged out"
			);

			setSession(session);

			if (event === "SIGNED_OUT" || !session?.user) {
				setUser(null);
				// Redirect to login on sign out
				if (
					typeof window !== "undefined" &&
					!window.location.pathname.includes("/sign-in")
				) {
					window.location.href = "/sign-in";
				}
			} else if (session?.user) {
				// Set user immediately from session data
				const basicUser: AuthUser = {
					id: session.user.id,
					email: session.user.email || "",
					fullName: session.user.user_metadata?.full_name || "",
					phone: session.user.user_metadata?.phone || "",
					emailConfirmed: session.user.email_confirmed_at !== null,
				};
				setUser(basicUser);
				console.log("User updated from auth change:", basicUser);
			}

			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const value = {
		user,
		session,
		loading,
		loadingMessage,
		mounted,
		signOut,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
