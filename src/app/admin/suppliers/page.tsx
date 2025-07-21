"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	Building2,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Package,
	DollarSign,
	TrendingUp,
	Star,
	X,
	User,
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
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import {
	getSuppliers,
	createSupplier,
	updateSupplier,
	deleteSupplier,
} from "@/lib/suppliers";
import { Supplier } from "@/types";

// Using Supplier type from @/types instead of local interface

// Mock data - replace with Supabase data later
const mockSuppliers: Supplier[] = [
	{
		id: "1",
		name: "CV Kopi Nusantara",
		code: "SUP001",
		email: "info@kopinusantara.com",
		phone: "+62 21-5555-1234",
		address: "Jl. Gatot Subroto No. 45, Jakarta Selatan",
		contact_person: "Budi Santoso",
		city_id: "city1",
		province_id: "province1",
		country_id: "country1",
		tax_number: "123456789",
		bank_name: "BCA",
		bank_account_number: "1234567890",
		bank_account_name: "CV Kopi Nusantara",
		credit_limit: 100000000,
		payment_terms: 30,
		is_active: true,
		notes: "Supplier kopi terpercaya",
		business_id: "business1",
		created_at: "2023-01-15T10:30:00Z",
		updated_at: "2024-01-15T10:30:00Z",
	},
	{
		id: "2",
		name: "PT Bakery Supplies",
		code: "SUP002",
		email: "sales@bakerysupplies.co.id",
		phone: "+62 21-5555-5678",
		address: "Jl. Sudirman No. 123, Jakarta Pusat",
		contact_person: "Siti Rahayu",
		city_id: "city2",
		province_id: "province2",
		country_id: "country1",
		tax_number: "987654321",
		bank_name: "Mandiri",
		bank_account_number: "0987654321",
		bank_account_name: "PT Bakery Supplies",
		credit_limit: 75000000,
		payment_terms: 14,
		is_active: true,
		notes: "Supplier bahan bakery",
		business_id: "business1",
		created_at: "2023-02-20T15:20:00Z",
		updated_at: "2024-01-14T15:20:00Z",
	},
	{
		id: "3",
		name: "PT Gula Manis",
		code: "SUP003",
		email: "order@gulamanis.com",
		phone: "+62 21-5555-9012",
		address: "Jl. Thamrin No. 567, Jakarta Pusat",
		contact_person: "Ahmad Rahman",
		city_id: "city3",
		province_id: "province3",
		country_id: "country1",
		tax_number: "456789123",
		bank_name: "BNI",
		bank_account_number: "4567891230",
		bank_account_name: "PT Gula Manis",
		credit_limit: 50000000,
		payment_terms: 7,
		is_active: true,
		notes: "Supplier gula premium",
		business_id: "business1",
		created_at: "2023-03-10T09:15:00Z",
		updated_at: "2024-01-10T09:15:00Z",
	},
	{
		id: "4",
		name: "CV Kemasan Kreatif",
		code: "SUP004",
		email: "info@kemasankreatif.com",
		phone: "+62 21-5555-3456",
		address: "Jl. Ahmad Yani No. 789, Bekasi",
		contact_person: "Maya Dewi",
		city_id: "city4",
		province_id: "province4",
		country_id: "country1",
		tax_number: "789123456",
		bank_name: "BRI",
		bank_account_number: "7891234560",
		bank_account_name: "CV Kemasan Kreatif",
		credit_limit: 25000000,
		payment_terms: 21,
		is_active: false,
		notes: "Supplier kemasan",
		business_id: "business1",
		created_at: "2023-04-05T14:45:00Z",
		updated_at: "2024-01-05T14:45:00Z",
	},
];

export default function SuppliersPage() {
	const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
		null
	);
	const [loading, setLoading] = useState(false);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);

	useEffect(() => {
		fetchUserProfile();
	}, []);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300); // 300ms delay

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const fetchUserProfile = async () => {
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
	};

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
				return "bg-green-100 text-green-800";
			case "inactive":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getRatingStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={i}
				className={`w-3 h-3 ${
					i < Math.floor(rating)
						? "text-yellow-400 fill-current"
						: "text-gray-300"
				}`}
			/>
		));
	};

	const handleDeleteSupplier = (supplierId: string) => {
		setSuppliers((prev) =>
			prev.filter((supplier) => supplier.id !== supplierId)
		);
	};

	const handleEditSupplier = (supplier: Supplier) => {
		setEditingSupplier(supplier);
		setShowAddModal(true);
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
						<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<Building2 className="w-5 h-5 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{supplier.name}
							</p>
							<p className="text-sm text-gray-500 truncate">
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
							<div className="flex items-center text-sm text-gray-900">
								<Mail className="w-3 h-3 mr-1 text-gray-400" />
								{supplier.email}
							</div>
						)}
						{supplier.phone && (
							<div className="flex items-center text-sm text-gray-600">
								<Phone className="w-3 h-3 mr-1 text-gray-400" />
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
					<div className="text-sm font-medium text-gray-900">
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
					<div className="text-sm font-medium text-gray-900">
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
					<div className="text-sm text-gray-900">
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
							className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
							title="Edit">
							<Edit2 className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleDeleteSupplier(supplier.id)}
							className="p-1 text-gray-400 hover:text-red-500 transition-colors"
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
		<div className="min-h-screen bg-white">
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
				<div className="bg-white rounded-xl">
					<div className="flex items-center">
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "0ms" }}>
							<Stats.Card
								title="Total Supplier"
								value={stats.totalSuppliers}
								icon={Building2}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Supplier Aktif"
								value={stats.activeSuppliers}
								icon={Building2}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Total Limit Kredit"
								value={formatCurrency(stats.totalCreditLimit)}
								icon={DollarSign}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Rata-rata Term"
								value={`${stats.averagePaymentTerms} hari`}
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
								onClick={() => setShowAddModal(true)}
								disabled={loading}
								className="rounded-xl w-full md:w-auto">
								<Button.Icon icon={Plus} />
								<Button.Text>Tambah</Button.Text>
							</Button.Root>
						</div>
					</div>

					{/* Suppliers Table */}
					<div
						className="animate-fade-in-up"
						style={{ animationDelay: "150ms" }}>
						<DataTable
							data={filteredSuppliers}
							columns={columns}
							loading={loading}
							pageSize={10}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
