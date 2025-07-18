"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

interface Business {
	id: string;
	name: string;
}

interface Store {
	id: string;
	name: string;
}

export default function AppBar() {
	const { user } = useAuthContext();
	const router = useRouter();
	const [business, setBusiness] = useState<Business | null>(null);
	const [store, setStore] = useState<Store | null>(null);
	const [loading, setLoading] = useState(true);
	const [showUserMenu, setShowUserMenu] = useState(false);

	useEffect(() => {
		if (user) {
			loadBusinessAndStore();
		}
	}, [user]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (!target.closest(".user-menu-container")) {
				setShowUserMenu(false);
			}
		};

		if (showUserMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showUserMenu]);

	const loadBusinessAndStore = async () => {
		try {
			// Get user's role assignment
			const { data: roleAssignments, error: roleError } = await supabase
				.from("role_assignments")
				.select("business_id, store_id")
				.eq("user_id", user?.id)
				.single();

			if (roleError || !roleAssignments) {
				console.error("Error loading role assignments:", roleError);
				// Redirect to create store if no business found
				router.push("/create-store");
				return;
			}

			// Get business details
			const { data: businessData, error: businessError } = await supabase
				.from("businesses")
				.select("id, name")
				.eq("id", roleAssignments.business_id)
				.single();

			// Get store details
			const { data: storeData, error: storeError } = await supabase
				.from("stores")
				.select("id, name")
				.eq("id", roleAssignments.store_id)
				.single();

			if (businessData && !businessError) {
				setBusiness(businessData);
			}

			if (storeData && !storeError) {
				setStore(storeData);
			}
		} catch (error) {
			console.error("Error loading business and store:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error("Error logging out:", error);
				return;
			}

			// Clear localStorage
			localStorage.removeItem("store_id");
			localStorage.removeItem("business_id");

			// Close menu
			setShowUserMenu(false);

			// Redirect to home
			router.push("/");
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};

	if (loading) {
		return (
			<div className="w-full h-16 bg-white border-b border-[#D1D5DB] flex items-center justify-end px-6">
				<div className="animate-pulse flex space-x-4">
					<div className="h-4 bg-[#F3F4F6] rounded w-32"></div>
					<div className="h-8 w-8 bg-[#F3F4F6] rounded-full"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-16 bg-white border-b border-[#D1D5DB] shadow-sm">
			<div className="h-full flex items-center justify-between px-6">
				{/* Business & Store Info */}
				<div className="flex-1">
					<div className="flex flex-col">
						<h1 className="text-lg font-medium text-[#191919] font-['Inter']">
							{business?.name || "Ourbit Business"}
						</h1>
						<p className="text-sm text-[#4A4A4A] font-['Inter']">
							{store?.name || "Ourbit Store"}
						</p>
					</div>
				</div>

				{/* Right side - Notifications, User Info */}
				<div className="flex items-center space-x-4">
					{/* Notifications */}
					<button className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors duration-200 relative">
						<Bell className="w-5 h-5 text-[#6B7280]" />
						{/* Notification badge */}
						<div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF5701] rounded-full"></div>
					</button>

					{/* User Info */}
					<div className="relative user-menu-container">
						<button
							onClick={() => setShowUserMenu(!showUserMenu)}
							className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors duration-200">
							<div className="text-right">
								<p className="text-sm text-[#191919] font-medium font-['Inter']">
									{user?.email?.split("@")[0] || "User"}
								</p>
								<p className="text-xs text-[#4A4A4A] font-['Inter']">
									Administrator
								</p>
							</div>
							<div className="w-8 h-8 bg-[#FF5701]/10 rounded-full flex items-center justify-center border border-[#FF5701]/20">
								<img
									src="https://randomuser.me/api/portraits/men/57.jpg"
									alt="User Avatar"
									className="w-8 h-8 rounded-full object-cover"
								/>
							</div>
							<ChevronDown
								className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${
									showUserMenu ? "rotate-180" : ""
								}`}
							/>
						</button>

						{/* Dropdown Menu */}
						{showUserMenu && (
							<div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2 z-50">
								<div className="px-4 py-3 border-b border-[#F3F4F6]">
									<p className="text-sm font-medium text-[#191919] font-['Inter']">
										{user?.email || "user@example.com"}
									</p>
									<p className="text-xs text-[#6B7280] font-['Inter']">
										Administrator
									</p>
								</div>

								<div className="py-1">
									<button
										onClick={() => {
											setShowUserMenu(false);
											router.push("/admin/settings/profile");
										}}
										className="w-full flex items-center px-4 py-2 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors duration-200 font-['Inter']">
										<User className="w-4 h-4 mr-3 text-[#6B7280]" />
										Profile
									</button>

									<button
										onClick={() => {
											setShowUserMenu(false);
											router.push("/admin/settings");
										}}
										className="w-full flex items-center px-4 py-2 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors duration-200 font-['Inter']">
										<Settings className="w-4 h-4 mr-3 text-[#6B7280]" />
										Settings
									</button>
								</div>

								<div className="border-t border-[#F3F4F6] py-1">
									<button
										onClick={handleLogout}
										className="w-full flex items-center px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors duration-200 font-['Inter']">
										<LogOut className="w-4 h-4 mr-3" />
										Log Out
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
