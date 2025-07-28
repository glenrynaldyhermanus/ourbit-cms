"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Plus,
	Edit2,
	Trash2,
	Building2,
	Mail,
	Phone,
	Calendar,
	DollarSign,
	Star,
	X,
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
	Select,
	Button,
	Skeleton,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getBusinessId, getStoreId } from "@/lib/store";
import { getSuppliers, deleteSupplier } from "@/lib/suppliers";
import { Supplier } from "@/types";
import SupplierForm from "@/components/forms/SupplierForm";

export default function SuppliersPage() {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loading, setLoading] = useState(true);
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const showToast = React.useCallback(
		(type: "success" | "error", message: string) => {
			setToast({ type, message });
			setTimeout(() => setToast(null), 3000);
		},
		[]
	);

	// Get business ID and store ID from localStorage
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

	const fetchSuppliers = useCallback(async () => {
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

			// Fetch suppliers from database
			const suppliersData = await getSuppliers(businessId);
			setSuppliers(suppliersData);
		} catch (error) {
			console.error("Error:", error);
			showToast("error", "Terjadi kesalahan saat memuat data supplier");
		} finally {
			setLoading(false);
		}
	}, [businessId, showToast]);

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

	// Fetch suppliers from Supabase
	useEffect(() => {
		if (businessId && storeId) {
			fetchSuppliers();
			fetchUserProfile();
		}
	}, [businessId, storeId, fetchSuppliers, fetchUserProfile]);

	// Filter suppliers by search and status - optimized with useMemo
	const filteredSuppliers = useMemo(() => {
		return suppliers.filter((supplier) => {
			const matchesSearch =
				supplier.name
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				supplier.code
					?.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				supplier.contact_person
					?.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				supplier.email
					?.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "active" && supplier.is_active) ||
				(statusFilter === "inactive" && !supplier.is_active);
			return matchesSearch && matchesStatus;
		});
	}, [suppliers, debouncedSearchTerm, statusFilter]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "inactive":
				return "bg-red-500/10 text-red-600 dark:text-red-400";
			default:
				return "bg-gray-500/10 text-[var(--muted-foreground)]";
		}
	};

	const handleDeleteSupplier = async (supplierId: string) => {
		try {
			const success = await deleteSupplier(supplierId);
			if (success) {
				setSuppliers((prev) =>
					prev.filter((supplier) => supplier.id !== supplierId)
				);
				showToast("success", "Supplier berhasil dihapus!");
			} else {
				showToast("error", "Gagal menghapus supplier!");
			}
		} catch (error) {
			console.error("Error deleting supplier:", error);
			showToast("error", "Terjadi kesalahan saat menghapus supplier!");
		}
	};

	const handleEditSupplier = (supplier: Supplier) => {
		setEditingSupplier(supplier);
		setShowAddModal(true);
	};

	const handleSupplierSaveSuccess = async (supplier: Supplier | null) => {
		// Refresh the suppliers list
		if (businessId) {
			const suppliersData = await getSuppliers(businessId);
			setSuppliers(suppliersData);
		}

		if (supplier && editingSupplier) {
			showToast("success", "Supplier berhasil diperbarui!");
		} else {
			showToast("success", "Supplier berhasil ditambahkan!");
		}

		setShowAddModal(false);
		setEditingSupplier(null);
	};

	const handleSupplierSaveError = (message: string) => {
		showToast("error", message);
	};

	// Calculate stats - optimized with useMemo
	const stats = useMemo(() => {
		const totalSuppliers = suppliers.length;
		const activeSuppliers = suppliers.filter((s) => s.is_active).length;
		const totalCreditLimit = suppliers.reduce(
			(sum, supplier) => sum + (supplier.credit_limit || 0),
			0
		);
		const averagePaymentTerms =
			suppliers.length > 0
				? suppliers.reduce(
						(sum, supplier) => sum + (supplier.payment_terms || 0),
						0
				  ) / suppliers.length
				: 0;

		return {
			totalSuppliers,
			activeSuppliers,
			totalCreditLimit,
			averagePaymentTerms: Math.round(averagePaymentTerms),
		};
	}, [suppliers]);

	// Define columns for DataTable - memoized to prevent re-renders
	const columns: Column<Supplier>[] = useMemo(
		() => [
			{
				key: "supplier",
				header: "Supplier",
				sortable: true,
				sortKey: "name",
				render: (supplier) => (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
							<Building2 className="w-5 h-5 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-[var(--foreground)] truncate">
								{supplier.name}
							</p>
							<p className="text-sm text-[var(--muted-foreground)] truncate">
								{supplier.contact_person || "Tanpa kontak"}
							</p>
						</div>
					</div>
				),
			},
			{
				key: "contact",
				header: "Kontak",
				sortable: false,
				render: (supplier) => (
					<div className="space-y-1">
						{supplier.email && (
							<div className="flex items-center text-sm text-[var(--foreground)]">
								<Mail className="w-3 h-3 mr-1 text-[var(--muted-foreground)]" />
								{supplier.email}
							</div>
						)}
						{supplier.phone && (
							<div className="flex items-center text-sm text-[var(--muted-foreground)]">
								<Phone className="w-3 h-3 mr-1 text-[var(--muted-foreground)]" />
								{supplier.phone}
							</div>
						)}
					</div>
				),
			},
			{
				key: "credit_limit",
				header: "Limit Kredit",
				sortable: true,
				sortKey: "credit_limit",
				render: (supplier) => (
					<div className="text-sm font-medium text-[var(--foreground)]">
						{formatCurrency(supplier.credit_limit || 0)}
					</div>
				),
			},
			{
				key: "payment_terms",
				header: "Term Pembayaran",
				sortable: true,
				sortKey: "payment_terms",
				render: (supplier) => (
					<div className="text-sm font-medium text-[var(--foreground)]">
						{supplier.payment_terms || 0} hari
					</div>
				),
			},
			{
				key: "status",
				header: "Status",
				sortable: true,
				sortKey: "is_active",
				render: (supplier) => (
					<div className="flex items-center space-x-2">
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
								supplier.is_active ? "active" : "inactive"
							)}`}>
							{supplier.is_active ? (
								<>
									<Check className="w-3 h-3 mr-1" />
									Aktif
								</>
							) : (
								<>
									<X className="w-3 h-3 mr-1" />
									Nonaktif
								</>
							)}
						</span>
					</div>
				),
			},
			{
				key: "created_at",
				header: "Tanggal Dibuat",
				sortable: true,
				sortKey: "created_at",
				render: (supplier) => (
					<div className="text-sm text-[var(--foreground)]">
						{formatDate(supplier.created_at)}
					</div>
				),
			},
			{
				key: "actions",
				header: "",
				sortable: false,
				render: (supplier) => (
					<div className="flex items-center space-x-2">
						<button
							onClick={() => handleEditSupplier(supplier)}
							className="p-1 text-[var(--muted-foreground)] hover:text-orange-500 transition-colors"
							title="Edit">
							<Edit2 className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleDeleteSupplier(supplier.id)}
							className="p-1 text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
							title="Hapus">
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				),
			},
		],
		[handleDeleteSupplier, handleEditSupplier]
	);

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Supplier"
						subtitle="Kelola data supplier dan vendor toko Anda"
						notificationButton={{
							icon: Bell,
							onClick: () => {
								// Handle notification click
								console.log("Notification clicked");
							},
							count: 3, // Example notification count
						}}
						profileButton={{
							avatar: userProfile?.avatar,
							name: userProfile?.name,
							email: userProfile?.email,
							onClick: () => {
								// Handle profile click - redirect to profile page
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
								title="Total Supplier"
								value={loading ? 0 : stats.totalSuppliers}
								icon={Building2}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Supplier Aktif"
								value={loading ? 0 : stats.activeSuppliers}
								icon={Building2}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Total Limit Kredit"
								value={
									loading ? "Rp 0" : formatCurrency(stats.totalCreditLimit)
								}
								icon={DollarSign}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Rata-rata Term"
								value={`${loading ? 0 : stats.averagePaymentTerms} hari`}
								icon={Calendar}
								iconColor="bg-yellow-500/10 text-yellow-600"
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
									placeholder="Cari supplier berdasarkan nama, perusahaan, atau kontak..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										statusFilter === "all"
											? "Semua Status"
											: statusFilter === "active"
											? "Aktif"
											: "Nonaktif"
									}
									placeholder="Filter Status"
								/>
								<Select.Content>
									<Select.Item
										value="all"
										onClick={() => setStatusFilter("all")}
										selected={statusFilter === "all"}>
										Semua Status
									</Select.Item>
									<Select.Item
										value="active"
										onClick={() => setStatusFilter("active")}
										selected={statusFilter === "active"}>
										Aktif
									</Select.Item>
									<Select.Item
										value="inactive"
										onClick={() => setStatusFilter("inactive")}
										selected={statusFilter === "inactive"}>
										Nonaktif
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div className="md:w-auto">
							<Button.Root
								variant="default"
								onClick={() => {
									setEditingSupplier(null);
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

					{/* Suppliers Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredSuppliers}
								columns={columns}
								loading={false}
								pageSize={10}
							/>
						</div>
					)}
				</div>

				{/* Supplier Form Modal */}
				{showAddModal && businessId && (
					<SupplierForm
						supplier={editingSupplier}
						isOpen={showAddModal}
						onClose={() => {
							setShowAddModal(false);
							setEditingSupplier(null);
						}}
						onSaveSuccess={handleSupplierSaveSuccess}
						onError={handleSupplierSaveError}
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
