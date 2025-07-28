"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Plus,
	Users,
	Mail,
	Phone,
	Bell,
	Check,
	AlertCircle,
	Edit2,
	Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Stats } from "@/components/ui";
import { DataTable, Column, Divider, Input, Skeleton } from "@/components/ui";
import { getBusinessId, getStoreId } from "@/lib/store";
import PageHeader from "@/components/layout/PageHeader";
import { getCustomers, deleteCustomer } from "@/lib/customers";
import { Customer } from "@/types";
import CustomerForm from "@/components/forms/CustomerForm";

export default function CustomersPage() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [storeId, setStoreId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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

	const fetchCustomers = React.useCallback(async () => {
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

			// Fetch customers from database
			const customersData = await getCustomers(businessId);
			setCustomers(customersData);
		} catch (error) {
			console.error("Error:", error);
			showToast("error", "Terjadi kesalahan saat memuat data pelanggan");
		} finally {
			setLoading(false);
		}
	}, [businessId, showToast]);

	// Fetch customers from Supabase
	useEffect(() => {
		if (businessId && storeId) {
			fetchCustomers();
			fetchUserProfile();
		}
	}, [businessId, storeId, fetchCustomers, fetchUserProfile]);

	const handleDeleteCustomer = useCallback(
		async (customerId: string) => {
			try {
				const success = await deleteCustomer(customerId);
				if (success) {
					setCustomers((prev) =>
						prev.filter((customer) => customer.id !== customerId)
					);
					showToast("success", "Pelanggan berhasil dihapus!");
				} else {
					showToast("error", "Gagal menghapus pelanggan!");
				}
			} catch (error) {
				console.error("Error deleting customer:", error);
				showToast("error", "Terjadi kesalahan saat menghapus pelanggan!");
			}
		},
		[showToast]
	);

	const handleEditCustomer = (customer: Customer) => {
		setEditingCustomer(customer);
		setShowAddModal(true);
	};

	const handleCustomerSaveSuccess = async (customer: Customer | null) => {
		// Refresh the customers list
		if (businessId) {
			const customersData = await getCustomers(businessId);
			setCustomers(customersData);
		}

		if (customer && editingCustomer) {
			showToast("success", "Pelanggan berhasil diperbarui!");
		} else {
			showToast("success", "Pelanggan berhasil ditambahkan!");
		}

		setShowAddModal(false);
		setEditingCustomer(null);
	};

	const handleCustomerSaveError = (message: string) => {
		showToast("error", message);
	};

	// Calculate stats - optimized with useMemo
	const stats = useMemo(() => {
		const totalCustomers = customers.length;
		const activeCustomers = customers.filter((c) => c.is_active).length;
		const totalCreditLimit = customers.reduce(
			(sum, customer) => sum + (customer.credit_limit || 0),
			0
		);
		const averagePaymentTerms =
			customers.length > 0
				? customers.reduce(
						(sum, customer) => sum + (customer.payment_terms || 0),
						0
				  ) / customers.length
				: 0;

		return {
			totalCustomers,
			activeCustomers,
			totalCreditLimit,
			averagePaymentTerms: Math.round(averagePaymentTerms),
		};
	}, [customers]);

	// Filter customers by search - optimized with useMemo
	const filteredCustomers = useMemo(() => {
		return customers.filter(
			(customer) =>
				customer.name
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				(customer.email
					?.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ??
					false) ||
				(customer.phone
					?.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ??
					false)
		);
	}, [customers, debouncedSearchTerm]);

	// Define columns for DataTable - memoized to prevent re-renders
	const columns: Column<Customer>[] = useMemo(
		() => [
			{
				key: "customer",
				header: "Pelanggan",
				sortable: true,
				sortKey: "name",
				render: (customer) => (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
							<Users className="w-5 h-5 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-[var(--foreground)] truncate">
								{customer.name}
							</p>
							<p className="text-sm text-[var(--muted-foreground)] truncate">
								{customer.email || "Tanpa email"}
							</p>
						</div>
					</div>
				),
			},
			{
				key: "contact",
				header: "Kontak",
				sortable: false,
				render: (customer) => (
					<div className="space-y-1">
						{customer.phone && (
							<div className="flex items-center text-sm text-[var(--foreground)]">
								<Phone className="w-3 h-3 mr-1 text-[var(--muted-foreground)]" />
								{customer.phone}
							</div>
						)}
						{customer.email && (
							<div className="flex items-center text-sm text-[var(--muted-foreground)]">
								<Mail className="w-3 h-3 mr-1 text-[var(--muted-foreground)]" />
								{customer.email}
							</div>
						)}
					</div>
				),
			},
			{
				key: "customer_type",
				header: "Tipe",
				sortable: true,
				sortKey: "customer_type",
				render: (customer) => (
					<div className="text-sm font-medium text-[var(--foreground)]">
						{customer.customer_type === "retail"
							? "Retail"
							: customer.customer_type === "wholesale"
							? "Grosir"
							: customer.customer_type === "corporate"
							? "Korporat"
							: "Retail"}
					</div>
				),
			},
			{
				key: "credit_limit",
				header: "Limit Kredit",
				sortable: true,
				sortKey: "credit_limit",
				render: (customer) => (
					<div className="text-sm font-medium text-[var(--foreground)]">
						{new Intl.NumberFormat("id-ID", {
							style: "currency",
							currency: "IDR",
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}).format(customer.credit_limit || 0)}
					</div>
				),
			},
			{
				key: "payment_terms",
				header: "Term Pembayaran",
				sortable: true,
				sortKey: "payment_terms",
				render: (customer) => (
					<div className="text-sm font-medium text-[var(--foreground)]">
						{customer.payment_terms || 0} hari
					</div>
				),
			},
			{
				key: "status",
				header: "Status",
				sortable: true,
				sortKey: "is_active",
				render: (customer) => (
					<div className="flex flex-wrap gap-1">
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
								customer.is_active
									? "bg-green-500/10 text-green-600 dark:text-green-400"
									: "bg-red-500/10 text-red-600 dark:text-red-400"
							}`}>
							{customer.is_active ? "Aktif" : "Nonaktif"}
						</span>
					</div>
				),
			},
			{
				key: "actions",
				header: "",
				sortable: false,
				render: (customer) => (
					<div className="flex items-center space-x-2">
						<button
							onClick={() => handleEditCustomer(customer)}
							className="p-1 text-[var(--muted-foreground)] hover:text-orange-500 transition-colors"
							title="Edit">
							<Edit2 className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleDeleteCustomer(customer.id)}
							className="p-1 text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
							title="Hapus">
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				),
			},
		],
		[handleDeleteCustomer]
	);

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Pelanggan"
						subtitle="Kelola data pelanggan toko Anda"
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
								title="Total Pelanggan"
								value={loading ? 0 : stats.totalCustomers}
								icon={Users}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Pelanggan Aktif"
								value={loading ? 0 : stats.activeCustomers}
								icon={Users}
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
									loading
										? "Rp 0"
										: new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
										  }).format(stats.totalCreditLimit)
								}
								icon={Users}
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
								icon={Users}
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
									placeholder="Cari pelanggan berdasarkan nama, email, atau nomor telepon..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-auto">
							<Button.Root
								variant="default"
								onClick={() => {
									setEditingCustomer(null);
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

					{/* Customers Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredCustomers}
								columns={columns}
								loading={false}
								pageSize={10}
							/>
						</div>
					)}
				</div>

				{/* Customer Form Modal */}
				{showAddModal && businessId && (
					<CustomerForm
						customer={editingCustomer}
						isOpen={showAddModal}
						onClose={() => {
							setShowAddModal(false);
							setEditingCustomer(null);
						}}
						onSaveSuccess={handleCustomerSaveSuccess}
						onError={handleCustomerSaveError}
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
