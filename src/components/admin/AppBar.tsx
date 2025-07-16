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
			<div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
				<div className="animate-pulse flex space-x-4">
					<div className="h-4 bg-gray-200 rounded w-32"></div>
					<div className="h-8 w-8 bg-gray-200 rounded-full"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-16 bg-white border-b border-gray-200">
			<div className="h-full flex items-center justify-between px-6">
				{/* Business & Store Info */}
				<div className="flex-1">
					<div className="flex flex-col">
						<h1 className="text-lg font-semibold text-gray-900">
							{business?.name || "Ourbit Business"}
						</h1>
						<p className="text-sm text-gray-500">
							{store?.name || "Ourbit Store"}
						</p>
					</div>
				</div>

				{/* Right side - Notifications, User Info */}
				<div className="flex items-center space-x-4">
					{/* Notifications */}
					<button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
						<Bell className="w-5 h-5 text-gray-500" />
					</button>

					{/* User Info */}
					<div className="flex items-center space-x-3">
						<span className="text-sm text-gray-600 font-medium">
							{user?.email}
						</span>
						<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
							<img
								src="https://randomuser.me/api/portraits/men/57.jpg"
								alt="User Avatar"
								className="w-8 h-8 rounded-full object-cover"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
