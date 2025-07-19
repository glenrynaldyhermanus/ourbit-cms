"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/supabase-error-handler";
import { PrimaryButton } from "@/components/ui";
import { DataTable, Column } from "@/components/ui";
import { getBusinessId, getStoreId } from "@/lib/store";

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

	// Fetch customers from Supabase
	useEffect(() => {
		if (businessId && storeId) {
			fetchCustomers();
		}
	}, [businessId, storeId]);

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

	// Calculate stats
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

	// Define columns for DataTable
	const columns: Column<Customer>[] = [
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
			key: "joined",
			header: "Bergabung",
			sortable: true,
			sortKey: "created_at",
			render: (customer) => (
				<div className="text-sm text-gray-900">
					{new Date(customer.created_at).toLocaleDateString("id-ID", {
						year: "numeric",
						month: "short",
						day: "numeric",
					})}
				</div>
			),
		},
	];

	return (
		<div className="p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
				<p className="text-gray-600">Kelola data pelanggan toko Anda</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-blue-100 rounded-lg">
							<Users className="w-6 h-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Total Pelanggan
							</p>
							<p className="text-2xl font-semibold text-gray-900">
								{loading ? "..." : totalCustomers}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-green-100 rounded-lg">
							<Mail className="w-6 h-6 text-green-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Rata-rata Order
							</p>
							<p className="text-2xl font-semibold text-gray-900">
								{loading ? "..." : averageOrders.toFixed(1)}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-orange-100 rounded-lg">
							<Phone className="w-6 h-6 text-orange-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Total Revenue</p>
							<p className="text-2xl font-semibold text-gray-900">
								{loading
									? "..."
									: new Intl.NumberFormat("id-ID", {
											style: "currency",
											currency: "IDR",
											minimumFractionDigits: 0,
											maximumFractionDigits: 0,
									  }).format(totalRevenue)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Add Customer Button */}
			<div className="mb-6">
				<PrimaryButton
					onClick={() =>
						showToast("success", "Fitur tambah pelanggan akan segera hadir!")
					}
					iconLeading={Plus}>
					Tambah Pelanggan
				</PrimaryButton>
			</div>

			{/* Customers Table */}
			<DataTable
				data={customers}
				columns={columns}
				loading={loading}
				searchKey="name"
				searchPlaceholder="Cari pelanggan..."
				pageSize={10}
			/>

			{/* Toast */}
			{toast && (
				<div className="fixed bottom-4 left-4 z-[9999] pointer-events-none transform transition-all duration-300 ease-out">
					<div
						className={`px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-out ${
							toast.type === "success"
								? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white"
								: toast.type === "error"
								? "bg-gradient-to-r from-[#EF476F] to-[#DC2626] text-white"
								: "bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white"
						}`}>
						<div className="flex items-center space-x-3">
							<div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
								{toast.type === "success" ? (
									<Users className="w-3 h-3" />
								) : toast.type === "error" ? (
									<Mail className="w-3 h-3" />
								) : (
									<Phone className="w-3 h-3" />
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
	);
}
