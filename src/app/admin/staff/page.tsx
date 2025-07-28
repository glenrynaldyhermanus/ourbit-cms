"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Plus,
	Edit2,
	Trash2,
	Users,
	Bell,
	Check,
	AlertCircle,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import {
	DataTable,
	Column,
	Divider,
	Input,
	Button,
	Skeleton,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getBusinessId, getStoreId } from "@/lib/store";
import {
	getStaffMembers,
	deleteStaffAssignment,
	StaffMember,
} from "@/lib/staff";
import StaffForm from "@/components/forms/StaffForm";

export default function StaffPage() {
	const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);

	const showToast = React.useCallback(
		(type: "success" | "error", message: string) => {
			setToast({ type, message });
			setTimeout(() => setToast(null), 3000);
		},
		[]
	);

	useEffect(() => {
		const currentBusinessId = getBusinessId();
		const currentStoreId = getStoreId();
		setBusinessId(currentBusinessId);
		setStoreId(currentStoreId);
	}, []);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300); // 300ms delay

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const fetchStaffMembers = useCallback(async () => {
		try {
			setLoading(true);

			if (!businessId || !storeId) {
				console.error("Business ID or Store ID not found in localStorage");
				showToast(
					"error",
					"Business ID atau Store ID tidak ditemukan. Silakan login ulang."
				);
				return;
			}

			// Check if user is authenticated
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user) {
				console.error("User not authenticated:", authError);
				showToast("error", "Sesi login telah berakhir. Silakan login ulang.");
				return;
			}

			// Fetch staff members from database
			const staffData = await getStaffMembers(businessId, storeId);
			setStaffMembers(staffData);
		} catch (error) {
			console.error("Error:", error);
			showToast("error", "Terjadi kesalahan saat memuat data staff");
		} finally {
			setLoading(false);
		}
	}, [businessId, storeId, showToast]);

	const fetchUserProfile = useCallback(async () => {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				console.error("Error fetching user:", error);
				return;
			}

			setUserProfile({
				name:
					user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
				email: user.email || "user@example.com",
				avatar: user.user_metadata?.avatar_url,
			});
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	}, []);

	// Fetch staff members from Supabase
	useEffect(() => {
		if (businessId && storeId) {
			fetchStaffMembers();
			fetchUserProfile();
		}
	}, [businessId, storeId, fetchStaffMembers, fetchUserProfile]);

	// Filter staff by search - optimized with useMemo
	const filteredStaffMembers = useMemo(() => {
		return staffMembers.filter(
			(staff) =>
				staff.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
				staff.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
				staff.role?.name
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase())
		);
	}, [staffMembers, debouncedSearchTerm]);

	const handleDeleteStaff = useCallback(
		async (staffMember: StaffMember) => {
			if (!staffMember.role_assignment_id) {
				showToast("error", "Assignment ID tidak ditemukan!");
				return;
			}

			try {
				const success = await deleteStaffAssignment(
					staffMember.role_assignment_id
				);
				if (success) {
					setStaffMembers((prev) =>
						prev.filter(
							(staff) =>
								staff.role_assignment_id !== staffMember.role_assignment_id
						)
					);
					showToast("success", "Staff berhasil dihapus dari toko!");
				} else {
					showToast("error", "Gagal menghapus staff!");
				}
			} catch (error) {
				console.error("Error deleting staff:", error);
				showToast("error", "Terjadi kesalahan saat menghapus staff!");
			}
		},
		[showToast]
	);

	const handleEditStaff = useCallback((staffMember: StaffMember) => {
		setEditingStaff(staffMember);
		setShowAddModal(true);
	}, []);

	const handleStaffSaveSuccess = async (staffMember: StaffMember | null) => {
		// Refresh the staff list
		if (businessId && storeId) {
			const staffData = await getStaffMembers(businessId, storeId);
			setStaffMembers(staffData);
		}

		if (staffMember && editingStaff) {
			showToast("success", "Assignment staff berhasil diperbarui!");
		} else {
			showToast("success", "Staff berhasil ditambahkan ke toko!");
		}

		setShowAddModal(false);
		setEditingStaff(null);
	};

	const handleStaffSaveError = (message: string) => {
		showToast("error", message);
	};

	// Calculate stats - optimized with useMemo
	const stats = useMemo(() => {
		const totalStaff = staffMembers.length;
		const roleDistribution = staffMembers.reduce((acc, staff) => {
			const roleName = staff.role?.name || "No Role";
			acc[roleName] = (acc[roleName] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const topRole = Object.entries(roleDistribution).sort(
			([, a], [, b]) => b - a
		)[0];

		return {
			totalStaff,
			roleDistribution,
			topRole: topRole ? topRole[0] : "N/A",
			topRoleCount: topRole ? topRole[1] : 0,
		};
	}, [staffMembers]);

	// Define columns for DataTable - memoized to prevent re-renders
	const columns: Column<StaffMember>[] = useMemo(
		() => [
			{
				key: "user",
				header: "Staff",
				sortable: true,
				sortKey: "name",
				render: (staff) => (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
							<Users className="w-5 h-5 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-[var(--foreground)] truncate">
								{staff.name || "No Name"}
							</p>
							<p className="text-sm text-[var(--muted-foreground)] truncate">
								{staff.email}
							</p>
						</div>
					</div>
				),
			},
			{
				key: "phone",
				header: "Telepon",
				sortable: false,
				render: (staff) => (
					<div className="text-sm text-[var(--foreground)]">
						{staff.phone || "-"}
					</div>
				),
			},
			{
				key: "role",
				header: "Role",
				sortable: false,
				render: (staff) => (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
						{staff.role?.name || "No Role"}
					</span>
				),
			},
			{
				key: "created_at",
				header: "Bergabung",
				sortable: true,
				sortKey: "created_at",
				render: (staff) => (
					<div className="text-sm text-[var(--foreground)]">
						{new Date(staff.created_at).toLocaleDateString("id-ID", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</div>
				),
			},
			{
				key: "actions",
				header: "",
				sortable: false,
				render: (staff) => (
					<div className="flex items-center space-x-2">
						<button
							onClick={() => handleEditStaff(staff)}
							className="p-1 text-[var(--muted-foreground)] hover:text-orange-500 transition-colors"
							title="Edit Role">
							<Edit2 className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleDeleteStaff(staff)}
							className="p-1 text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
							title="Hapus dari Toko">
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				),
			},
		],
		[handleDeleteStaff, handleEditStaff]
	);

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Staff"
						subtitle="Kelola staff dan role di toko Anda"
						notificationButton={{
							icon: Bell,
							onClick: () => {
								console.log("Notification clicked");
							},
							count: 3,
						}}
						profileButton={{
							avatar: userProfile?.avatar,
							name: userProfile?.name,
							email: userProfile?.email,
							onClick: () => {
								window.location.href = "/admin/settings/profile";
							},
						}}
					/>
				</div>

				{/* Divider */}
				<div className="animate-fade-in" style={{ animationDelay: "30ms" }}>
					<Divider />
				</div>

				{/* Stats Cards */}
				<div className="rounded-xl">
					<div className="flex items-center">
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "0ms" }}>
							<Stats.Card
								title="Total Staff"
								value={loading ? 0 : stats.totalStaff}
								icon={Users}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Role Terbanyak"
								value={loading ? "-" : stats.topRole}
								icon={Users}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Jumlah Role"
								value={loading ? 0 : Object.keys(stats.roleDistribution).length}
								icon={Users}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<Divider />
					{/* Search and Filter */}
					<div
						className="flex flex-col md:flex-row gap-4 animate-fade-in-up"
						style={{ animationDelay: "120ms" }}>
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									type="text"
									value={searchTerm}
									onChange={setSearchTerm}
									placeholder="Cari staff berdasarkan nama, email, atau role..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-auto">
							<Button.Root
								variant="default"
								onClick={() => {
									setEditingStaff(null);
									setShowAddModal(true);
								}}
								disabled={loading}
								className="rounded-xl w-full md:w-auto">
								<Button.Icon icon={Plus} />
								<Button.Text>Tambah</Button.Text>
							</Button.Root>
						</div>
					</div>

					{/* Loading State */}
					{loading && <Skeleton.Table rows={5} />}

					{/* Staff Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredStaffMembers}
								columns={columns}
								loading={false}
								pageSize={10}
							/>
						</div>
					)}
				</div>

				{/* Staff Form Modal */}
				{showAddModal && businessId && storeId && (
					<StaffForm
						staffMember={editingStaff}
						isOpen={showAddModal}
						onClose={() => {
							setShowAddModal(false);
							setEditingStaff(null);
						}}
						onSaveSuccess={handleStaffSaveSuccess}
						onError={handleStaffSaveError}
						businessId={businessId}
						storeId={storeId}
					/>
				)}

				{/* Toast */}
				{toast && (
					<div className="fixed bottom-4 left-4 z-[9999] pointer-events-none transform transition-all duration-300 ease-out animate-slide-in-right">
						<div
							className={`px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 ease-out ${
								toast.type === "success"
									? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white"
									: "bg-gradient-to-r from-[#EF476F] to-[#DC2626] text-white"
							}`}>
							<div className="flex items-center space-x-3">
								<div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
									{toast.type === "success" ? (
										<Check className="w-3 h-3" />
									) : (
										<AlertCircle className="w-3 h-3" />
									)}
								</div>
								<span className="font-semibold font-['Inter']">
									{toast.message}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
