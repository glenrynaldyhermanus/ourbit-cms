"use client";

import React, { useState, useEffect } from "react";
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

interface Supplier {
	id: string;
	name: string;
	company: string;
	email?: string;
	phone?: string;
	address?: string;
	contact_person?: string;
	total_orders: number;
	total_amount: number;
	last_order_date?: string;
	rating: number;
	status: "active" | "inactive";
	created_at: string;
	updated_at: string;
}

// Mock data - replace with Supabase data later
const mockSuppliers: Supplier[] = [
	{
		id: "1",
		name: "CV Kopi Nusantara",
		company: "CV Kopi Nusantara",
		email: "info@kopinusantara.com",
		phone: "+62 21-5555-1234",
		address: "Jl. Gatot Subroto No. 45, Jakarta Selatan",
		contact_person: "Budi Santoso",
		total_orders: 25,
		total_amount: 125000000,
		last_order_date: "2024-01-15T10:30:00Z",
		rating: 4.8,
		status: "active",
		created_at: "2023-01-15T10:30:00Z",
		updated_at: "2024-01-15T10:30:00Z",
	},
	{
		id: "2",
		name: "PT Bakery Supplies",
		company: "PT Bakery Supplies Indonesia",
		email: "sales@bakerysupplies.co.id",
		phone: "+62 21-5555-5678",
		address: "Jl. Sudirman No. 123, Jakarta Pusat",
		contact_person: "Siti Rahayu",
		total_orders: 18,
		total_amount: 89000000,
		last_order_date: "2024-01-14T15:20:00Z",
		rating: 4.5,
		status: "active",
		created_at: "2023-02-20T15:20:00Z",
		updated_at: "2024-01-14T15:20:00Z",
	},
	{
		id: "3",
		name: "PT Gula Manis",
		company: "PT Gula Manis Sejahtera",
		email: "order@gulamanis.com",
		phone: "+62 21-5555-9012",
		address: "Jl. Thamrin No. 567, Jakarta Pusat",
		contact_person: "Ahmad Rahman",
		total_orders: 12,
		total_amount: 45000000,
		last_order_date: "2024-01-10T09:15:00Z",
		rating: 4.2,
		status: "active",
		created_at: "2023-03-10T09:15:00Z",
		updated_at: "2024-01-10T09:15:00Z",
	},
	{
		id: "4",
		name: "CV Kemasan Kreatif",
		company: "CV Kemasan Kreatif",
		email: "info@kemasankreatif.com",
		phone: "+62 21-5555-3456",
		address: "Jl. Ahmad Yani No. 789, Bekasi",
		contact_person: "Maya Dewi",
		total_orders: 8,
		total_amount: 32000000,
		last_order_date: "2024-01-05T14:45:00Z",
		rating: 4.0,
		status: "inactive",
		created_at: "2023-04-05T14:45:00Z",
		updated_at: "2024-01-05T14:45:00Z",
	},
];

export default function SuppliersPage() {
	const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
	const [searchTerm, setSearchTerm] = useState("");
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

	const filteredSuppliers = suppliers.filter((supplier) => {
		const matchesSearch =
			supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.contact_person
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || supplier.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

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

	// Calculate stats
	const totalSuppliers = suppliers.length;
	const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
	const totalSpent = suppliers.reduce(
		(sum, supplier) => sum + supplier.total_amount,
		0
	);
	const averageRating =
		suppliers.length > 0
			? suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) /
			  suppliers.length
			: 0;

	// Define columns for DataTable
	const columns: Column<Supplier>[] = [
		{
			key: "supplier",
			header: "Supplier",
			sortable: true,
			sortKey: "name",
			render: (supplier) => (
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
			key: "address",
			header: "Alamat",
			sortable: false,
			render: (supplier) => (
				<div className="flex items-start text-sm text-gray-900">
					<MapPin className="w-3 h-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
					<span className="truncate">
						{supplier.address || "Alamat tidak tersedia"}
					</span>
				</div>
			),
		},
		{
			key: "orders",
			header: "Total Order",
			sortable: true,
			sortKey: "total_orders",
			render: (supplier) => (
				<div className="text-sm text-gray-900">
					<div className="font-medium">{supplier.total_orders} order</div>
					<div className="text-xs text-gray-500">
						{formatCurrency(supplier.total_amount)}
					</div>
				</div>
			),
		},
		{
			key: "rating",
			header: "Rating",
			sortable: true,
			sortKey: "rating",
			render: (supplier) => (
				<div className="flex items-center space-x-1">
					{getRatingStars(supplier.rating)}
					<span className="text-sm text-gray-600 ml-1">
						{supplier.rating.toFixed(1)}
					</span>
				</div>
			),
		},
		{
			key: "last_order",
			header: "Order Terakhir",
			sortable: true,
			sortKey: "last_order_date",
			render: (supplier) => (
				<div className="text-sm text-gray-900">
					{formatDate(supplier.last_order_date)}
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			sortKey: "status",
			render: (supplier) => (
				<div className="flex items-center space-x-2">
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
							supplier.status
						)}`}>
						{supplier.status === "active" ? "Aktif" : "Nonaktif"}
					</span>
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
						onClick={() => setSelectedSupplier(supplier)}
						className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
						title="Lihat Detail">
						<User className="w-4 h-4" />
					</button>
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
	];

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Supplier"
						subtitle="Kelola data supplier dan vendor toko"
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
				<Stats.Grid>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "0ms" }}>
						<Stats.Card
							title="Total Supplier"
							value={loading ? 0 : totalSuppliers}
							icon={Building2}
							iconColor="bg-blue-500/10 text-blue-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "30ms" }}>
						<Stats.Card
							title="Supplier Aktif"
							value={loading ? 0 : activeSuppliers}
							icon={Package}
							iconColor="bg-green-500/10 text-green-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "60ms" }}>
						<Stats.Card
							title="Total Pembelian"
							value={loading ? "Rp 0" : formatCurrency(totalSpent)}
							icon={DollarSign}
							iconColor="bg-orange-500/10 text-orange-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "90ms" }}>
						<Stats.Card
							title="Rating Rata-rata"
							value={loading ? "0.0" : averageRating.toFixed(1)}
							icon={Star}
							iconColor="bg-yellow-500/10 text-yellow-600"
						/>
					</div>
				</Stats.Grid>

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
									placeholder="Cari supplier berdasarkan nama, perusahaan, kontak, atau email..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-48">
							<Select.Root>
								<Select.Trigger
									value={statusFilter}
									placeholder="Semua Status"
									onClick={() => {
										// Handle select click
									}}
									open={false}
								/>
								<Select.Content open={false}>
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

					{/* Loading State */}
					{loading && (
						<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-12 text-center animate-fade-in">
							<div className="w-8 h-8 border-2 border-[#FF5701] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-[#4A4A4A] font-['Inter']">
								Memuat supplier...
							</p>
						</div>
					)}

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
			</div>
		</div>
	);
}
