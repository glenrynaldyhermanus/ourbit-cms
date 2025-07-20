"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
	Plus,
	Users,
	Mail,
	Phone,
	MapPin,
	Bell,
	Check,
	AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/supabase-error-handler";
import { Button, Stats } from "@/components/ui";
import { DataTable, Column, Divider, Input } from "@/components/ui";
import { getBusinessId, getStoreId } from "@/lib/store";
import PageHeader from "@/components/layout/PageHeader";

interface Customer {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	address?: string;
	total_orders: number;
	total_spent: number;
	created_at: string;
	store_id: string;
}

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

	// Fetch customers from Supabase
	useEffect(() => {
		if (businessId && storeId) {
			fetchCustomers();
			fetchUserProfile();
		}
	}, [businessId, storeId]);

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

			if (!storeId) {
				console.error("Store ID not found in localStorage");
				showToast("error", "Store ID tidak ditemukan. Silakan login ulang.");
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

			// Fetch customers with mock data for demonstration
			const mockCustomers: Customer[] = [
				{
					id: "1",
					name: "John Doe",
					email: "john@example.com",
					phone: "+62 812-3456-7890",
					address: "Jl. Sudirman No. 123, Jakarta",
					total_orders: 15,
					total_spent: 2500000,
					created_at: "2024-01-15T10:30:00Z",
					store_id: storeId,
				},
				{
					id: "2",
					name: "Jane Smith",
					email: "jane@example.com",
					phone: "+62 813-4567-8901",
					address: "Jl. Thamrin No. 456, Jakarta",
					total_orders: 8,
					total_spent: 1200000,
					created_at: "2024-02-20T14:45:00Z",
					store_id: storeId,
				},
				{
					id: "3",
					name: "Ahmad Rahman",
					email: "ahmad@example.com",
					phone: "+62 814-5678-9012",
					address: "Jl. Gatot Subroto No. 789, Jakarta",
					total_orders: 22,
					total_spent: 3800000,
					created_at: "2024-01-10T09:15:00Z",
					store_id: storeId,
				},
			];

			setCustomers(mockCustomers);
		} catch (error) {
			console.error("Error:", error);
			showToast("error", "Terjadi kesalahan saat memuat data pelanggan");
		} finally {
			setLoading(false);
		}
	}, [storeId, showToast]);

	// Calculate stats - optimized with useMemo
	const stats = useMemo(() => {
		const totalCustomers = customers.length;
		const totalRevenue = customers.reduce(
			(sum, customer) => sum + customer.total_spent,
			0
		);
		const averageOrders =
			customers.length > 0
				? customers.reduce((sum, customer) => sum + customer.total_orders, 0) /
				  customers.length
				: 0;
		const averageSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

		return {
			totalCustomers,
			totalRevenue,
			averageOrders: Math.round(averageOrders),
			averageSpent: Math.round(averageSpent),
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
						<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<Users className="w-5 h-5 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{customer.name}
							</p>
							<p className="text-sm text-gray-500 truncate">
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
							<div className="flex items-center text-sm text-gray-900">
								<Phone className="w-3 h-3 mr-1 text-gray-400" />
								{customer.phone}
							</div>
						)}
						{customer.email && (
							<div className="flex items-center text-sm text-gray-600">
								<Mail className="w-3 h-3 mr-1 text-gray-400" />
								{customer.email}
							</div>
						)}
					</div>
				),
			},
			{
				key: "address",
				header: "Alamat",
				sortable: false,
				render: (customer) => (
					<div className="flex items-start text-sm text-gray-900">
						<MapPin className="w-3 h-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
						<span className="truncate">
							{customer.address || "Alamat tidak tersedia"}
						</span>
					</div>
				),
			},
			{
				key: "orders",
				header: "Total Order",
				sortable: true,
				sortKey: "total_orders",
				render: (customer) => (
					<div className="text-sm font-medium text-gray-900">
						{customer.total_orders} order
					</div>
				),
			},
			{
				key: "spent",
				header: "Total Belanja",
				sortable: true,
				sortKey: "total_spent",
				render: (customer) => (
					<div className="text-sm font-medium text-gray-900">
						{new Intl.NumberFormat("id-ID", {
							style: "currency",
							currency: "IDR",
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}).format(customer.total_spent)}
					</div>
				),
			},
			{
				key: "status",
				header: "Status",
				sortable: false,
				render: (customer) => (
					<div className="flex flex-wrap gap-1">
						{/* Status Pelanggan */}
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
								customer.total_orders >= 10
									? "bg-green-100 text-green-800"
									: customer.total_orders >= 5
									? "bg-yellow-100 text-yellow-800"
									: "bg-gray-100 text-gray-800"
							}`}>
							{customer.total_orders >= 10
								? "Pelanggan Setia"
								: customer.total_orders >= 5
								? "Pelanggan Aktif"
								: "Pelanggan Baru"}
						</span>
					</div>
				),
			},
		],
		[]
	);

	return (
		<div className="min-h-screen bg-white">
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
				<div className="bg-white rounded-xl">
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
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Total Pendapatan"
								value={
									loading
										? "Rp 0"
										: new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
										  }).format(stats.totalRevenue)
								}
								icon={Users}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Rata-rata Order"
								value={loading ? 0 : stats.averageOrders}
								icon={Users}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Rata-rata Belanja"
								value={
									loading
										? "Rp 0"
										: new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
										  }).format(stats.averageSpent)
								}
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
									// Handle add customer
									console.log("Add customer clicked");
								}}
								disabled={loading}
								className="rounded-xl w-full md:w-auto">
								<Button.Icon icon={Plus} />
								<Button.Text>Tambah</Button.Text>
							</Button.Root>
						</div>
					</div>

					{/* Loading State */}
					{loading && (
						<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-6 animate-fade-in">
							<div className="space-y-4">
								{/* Skeleton rows */}
								{Array.from({ length: 5 }).map((_, index) => (
									<div
										key={index}
										className="flex items-center space-x-4 animate-pulse">
										<div className="w-10 h-10 bg-gray-200 rounded-full"></div>
										<div className="flex-1 space-y-2">
											<div className="h-4 bg-gray-200 rounded w-3/4"></div>
											<div className="h-3 bg-gray-200 rounded w-1/2"></div>
										</div>
										<div className="h-4 bg-gray-200 rounded w-20"></div>
										<div className="h-4 bg-gray-200 rounded w-24"></div>
										<div className="h-4 bg-gray-200 rounded w-20"></div>
									</div>
								))}
							</div>
						</div>
					)}

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
