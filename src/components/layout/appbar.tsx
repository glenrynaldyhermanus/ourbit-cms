"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
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

	useEffect(() => {
		if (user) {
			loadBusinessAndStore();
		}
	}, [user]);

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
						<h1 className="text-lg font-medium text-[#191919] font-['Inter_Tight']">
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
					<div className="flex items-center space-x-3">
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
						<ChevronDown className="w-4 h-4 text-[#6B7280]" />
					</div>
				</div>
			</div>
		</div>
	);
}
