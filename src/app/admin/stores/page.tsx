"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
	Plus,
	Edit2,
	Trash2,
	Store,
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
import { getStores, deleteStore } from "@/lib/stores";
import { Store as StoreType } from "@/types";
import StoreForm from "@/components/forms/StoreForm";

export default function StoresPage() {
	const [stores, setStores] = useState<StoreType[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingStore, setEditingStore] = useState<StoreType | null>(null);
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

	useEffect(() => {
		if (businessId && storeId) {
			fetchStores();
			fetchUserProfile();
		}
	}, [businessId, storeId]);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300); // 300ms delay

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const fetchStores = React.useCallback(async () => {
		try {
			setLoading(true);

			if (!businessId) {
				console.error("Business ID not found in localStorage");
				showToast("error", "Business ID tidak ditemukan. Silakan login ulang.");
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

			// Fetch stores from database
			const storesData = await getStores(businessId);
			setStores(storesData);
		} catch (error) {
			console.error("Error:", error);
			showToast("error", "Terjadi kesalahan saat memuat data toko");
		} finally {
			setLoading(false);
		}
	}, [businessId, showToast]);

	const fetchUserProfile = React.useCallback(async () => {
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

	// Filter stores by search - optimized with useMemo
	const filteredStores = useMemo(() => {
		return stores.filter(
			(store) =>
				store.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
				store.address
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				store.business_field
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase())
		);
	}, [stores, debouncedSearchTerm]);

	const handleDeleteStore = async (storeId: string) => {
		try {
			const success = await deleteStore(storeId);
			if (success) {
				setStores((prev) => prev.filter((store) => store.id !== storeId));
				showToast("success", "Toko berhasil dihapus!");
			} else {
				showToast("error", "Gagal menghapus toko!");
			}
		} catch (error) {
			console.error("Error deleting store:", error);
			showToast("error", "Terjadi kesalahan saat menghapus toko!");
		}
	};

	const handleEditStore = (store: StoreType) => {
		setEditingStore(store);
		setShowAddModal(true);
	};

	const handleStoreSaveSuccess = async (store: StoreType | null) => {
		// Refresh the stores list
		if (businessId) {
			const storesData = await getStores(businessId);
			setStores(storesData);
		}

		if (store && editingStore) {
			showToast("success", "Toko berhasil diperbarui!");
		} else {
			showToast("success", "Toko berhasil ditambahkan!");
		}

		setShowAddModal(false);
		setEditingStore(null);
	};

	const handleStoreSaveError = (message: string) => {
		showToast("error", message);
	};

	// Calculate stats - optimized with useMemo
	const stats = useMemo(() => {
		const totalStores = stores.length;
		const branchStores = stores.filter((s) => s.is_branch).length;
		const mainStores = stores.filter((s) => !s.is_branch).length;

		return {
			totalStores,
			branchStores,
			mainStores,
		};
	}, [stores]);

	// Define columns for DataTable - memoized to prevent re-renders
	const columns: Column<StoreType>[] = useMemo(
		() => [
			{
				key: "store",
				header: "Toko",
				sortable: true,
				sortKey: "name",
				render: (store) => (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
							<Store className="w-5 h-5 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-[var(--foreground)] truncate">
								{store.name}
							</p>
							<p className="text-sm text-[var(--muted-foreground)] truncate">
								{store.business_field}
							</p>
						</div>
					</div>
				),
			},
			{
				key: "address",
				header: "Alamat",
				sortable: false,
				render: (store) => (
					<div className="text-sm text-[var(--foreground)] max-w-xs truncate">
						{store.address}
					</div>
				),
			},
			{
				key: "phone",
				header: "Telepon",
				sortable: false,
				render: (store) => (
					<div className="text-sm text-[var(--foreground)]">
						{store.phone_country_code} {store.phone_number}
					</div>
				),
			},
			{
				key: "type",
				header: "Tipe",
				sortable: true,
				sortKey: "is_branch",
				render: (store) => (
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
							store.is_branch
								? "bg-green-500/10 text-green-600 dark:text-green-400"
								: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
						}`}>
						{store.is_branch ? "Cabang" : "Pusat"}
					</span>
				),
			},
			{
				key: "currency",
				header: "Mata Uang",
				sortable: true,
				sortKey: "currency",
				render: (store) => (
					<div className="text-sm font-medium text-[var(--foreground)]">
						{store.currency}
					</div>
				),
			},
			{
				key: "actions",
				header: "",
				sortable: false,
				render: (store) => (
					<div className="flex items-center space-x-2">
						<button
							onClick={() => handleEditStore(store)}
							className="p-1 text-[var(--muted-foreground)] hover:text-orange-500 transition-colors"
							title="Edit">
							<Edit2 className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleDeleteStore(store.id)}
							className="p-1 text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
							title="Hapus">
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				),
			},
		],
		[]
	);

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Toko"
						subtitle="Kelola data toko dan cabang Anda"
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
								title="Total Toko"
								value={loading ? 0 : stats.totalStores}
								icon={Store}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Toko Pusat"
								value={loading ? 0 : stats.mainStores}
								icon={Store}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Cabang"
								value={loading ? 0 : stats.branchStores}
								icon={Store}
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
									placeholder="Cari toko berdasarkan nama, alamat, atau bidang usaha..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-auto">
							<Button.Root
								variant="default"
								onClick={() => {
									setEditingStore(null);
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

					{/* Stores Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredStores}
								columns={columns}
								loading={false}
								pageSize={10}
							/>
						</div>
					)}
				</div>

				{/* Store Form Modal */}
				{showAddModal && businessId && (
					<StoreForm
						store={editingStore}
						isOpen={showAddModal}
						onClose={() => {
							setShowAddModal(false);
							setEditingStore(null);
						}}
						onSaveSuccess={handleStoreSaveSuccess}
						onError={handleStoreSaveError}
						businessId={businessId}
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
