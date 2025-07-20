"use client";

import { useState, useEffect } from "react";
import {
	Plus,
	Edit2,
	Trash2,
	Store,
	Mail,
	Phone,
	MapPin,
	Users,
	DollarSign,
	Clock,
	CheckCircle,
	XCircle,
	Bell,
	Building,
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

interface StoreData {
	id: string;
	name: string;
	address: string;
	phone: string;
	email?: string;
	manager_name: string;
	status: "active" | "inactive" | "maintenance";
	store_type: "main" | "branch" | "outlet" | "warehouse";
	opening_hours: string;
	employee_count: number;
	monthly_revenue: number;
	created_at: string;
	updated_at: string;
}

// Mock stores data - in production this would come from Supabase
const mockStores: StoreData[] = [
	{
		id: "1",
		name: "OURBIT Central Store",
		address: "Jl. Sudirman No. 123, Jakarta Pusat",
		phone: "+62 21-5555-1111",
		email: "central@ourbit.com",
		manager_name: "Ahmad Rizky",
		status: "active",
		store_type: "main",
		opening_hours: "08:00 - 22:00",
		employee_count: 15,
		monthly_revenue: 250000000,
		created_at: "2023-01-15T10:30:00Z",
		updated_at: "2024-01-15T10:30:00Z",
	},
	{
		id: "2",
		name: "OURBIT Mall Kelapa Gading",
		address: "Mall Kelapa Gading Lt. 1, Jakarta Utara",
		phone: "+62 21-5555-2222",
		email: "kelapa.gading@ourbit.com",
		manager_name: "Siti Nurhaliza",
		status: "active",
		store_type: "branch",
		opening_hours: "10:00 - 22:00",
		employee_count: 12,
		monthly_revenue: 180000000,
		created_at: "2023-02-20T15:20:00Z",
		updated_at: "2024-01-14T15:20:00Z",
	},
	{
		id: "3",
		name: "OURBIT Bekasi Outlet",
		address: "Jl. Ahmad Yani No. 567, Bekasi",
		phone: "+62 21-5555-3333",
		email: "bekasi@ourbit.com",
		manager_name: "Budi Santoso",
		status: "maintenance",
		store_type: "outlet",
		opening_hours: "09:00 - 21:00",
		employee_count: 8,
		monthly_revenue: 120000000,
		created_at: "2023-03-10T09:15:00Z",
		updated_at: "2024-01-10T09:15:00Z",
	},
	{
		id: "4",
		name: "OURBIT Warehouse",
		address: "Jl. Industri No. 789, Tangerang",
		phone: "+62 21-5555-4444",
		manager_name: "Maya Dewi",
		status: "active",
		store_type: "warehouse",
		opening_hours: "06:00 - 18:00",
		employee_count: 25,
		monthly_revenue: 0, // Warehouse doesn't generate direct revenue
		created_at: "2023-04-05T14:45:00Z",
		updated_at: "2024-01-12T14:45:00Z",
	},
];

export default function StoresPage() {
	const [stores, setStores] = useState<StoreData[]>(mockStores);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");
	const loading = false;
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

	const filteredStores = stores.filter((store) => {
		const matchesSearch =
			store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
			store.manager_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			store.email?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || store.status === statusFilter;
		const matchesType = typeFilter === "all" || store.store_type === typeFilter;
		return matchesSearch && matchesStatus && matchesType;
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "inactive":
				return "bg-red-100 text-red-800";
			case "maintenance":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return CheckCircle;
			case "inactive":
				return XCircle;
			case "maintenance":
				return Clock;
			default:
				return Store;
		}
	};

	const getStoreTypeLabel = (type: string) => {
		switch (type) {
			case "main":
				return "Pusat";
			case "branch":
				return "Cabang";
			case "outlet":
				return "Outlet";
			case "warehouse":
				return "Gudang";
			default:
				return type;
		}
	};

	const getStoreTypeColor = (type: string) => {
		switch (type) {
			case "main":
				return "bg-blue-100 text-blue-800";
			case "branch":
				return "bg-green-100 text-green-800";
			case "outlet":
				return "bg-purple-100 text-purple-800";
			case "warehouse":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const handleDeleteStore = (storeId: string) => {
		setStores((prev) => prev.filter((store) => store.id !== storeId));
	};

	const handleEditStore = (store: StoreData) => {
		// TODO: Implement edit modal for store: ${store.name}
		console.log("Edit store:", store);
	};

	// Calculate stats
	const totalStores = stores.length;
	const activeStores = stores.filter((s) => s.status === "active").length;
	const totalRevenue = stores.reduce(
		(sum, store) => sum + store.monthly_revenue,
		0
	);
	const totalEmployees = stores.reduce(
		(sum, store) => sum + store.employee_count,
		0
	);

	// Define columns for DataTable
	const columns: Column<StoreData>[] = [
		{
			key: "store",
			header: "Toko",
			sortable: true,
			sortKey: "name",
			render: (store) => (
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
						<Store className="w-5 h-5 text-blue-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{store.name}
						</p>
						<p className="text-sm text-gray-500 truncate">
							Manager: {store.manager_name}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "contact",
			header: "Kontak",
			sortable: false,
			render: (store) => (
				<div className="space-y-1">
					<div className="flex items-center text-sm text-gray-900">
						<Phone className="w-3 h-3 mr-1 text-gray-400" />
						{store.phone}
					</div>
					{store.email && (
						<div className="flex items-center text-sm text-gray-600">
							<Mail className="w-3 h-3 mr-1 text-gray-400" />
							{store.email}
						</div>
					)}
				</div>
			),
		},
		{
			key: "address",
			header: "Alamat",
			sortable: false,
			render: (store) => (
				<div className="flex items-start text-sm text-gray-900">
					<MapPin className="w-3 h-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
					<span className="truncate">{store.address}</span>
				</div>
			),
		},
		{
			key: "type",
			header: "Tipe",
			sortable: true,
			sortKey: "store_type",
			render: (store) => (
				<span
					className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStoreTypeColor(
						store.store_type
					)}`}>
					{getStoreTypeLabel(store.store_type)}
				</span>
			),
		},
		{
			key: "employees",
			header: "Karyawan",
			sortable: true,
			sortKey: "employee_count",
			render: (store) => (
				<div className="text-sm text-gray-900">
					<div className="font-medium">{store.employee_count} orang</div>
				</div>
			),
		},
		{
			key: "revenue",
			header: "Pendapatan/Bulan",
			sortable: true,
			sortKey: "monthly_revenue",
			render: (store) => (
				<div className="text-sm font-medium text-gray-900">
					{store.monthly_revenue > 0
						? formatCurrency(store.monthly_revenue)
						: "-"}
				</div>
			),
		},
		{
			key: "hours",
			header: "Jam Operasional",
			sortable: false,
			render: (store) => (
				<div className="text-sm text-gray-900">{store.opening_hours}</div>
			),
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			sortKey: "status",
			render: (store) => {
				const StatusIcon = getStatusIcon(store.status);
				return (
					<div className="flex items-center space-x-2">
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
								store.status
							)}`}>
							<StatusIcon className="w-3 h-3 mr-1" />
							{store.status === "active"
								? "Aktif"
								: store.status === "inactive"
								? "Nonaktif"
								: "Maintenance"}
						</span>
					</div>
				);
			},
		},
		{
			key: "actions",
			header: "",
			sortable: false,
			render: (store) => (
				<div className="flex items-center space-x-2">
					<button
						onClick={() => {
							// TODO: Implement store detail modal
							console.log("View store details:", store);
						}}
						className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
						title="Lihat Detail">
						<Building className="w-4 h-4" />
					</button>
					<button
						onClick={() => handleEditStore(store)}
						className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
						title="Edit">
						<Edit2 className="w-4 h-4" />
					</button>
					<button
						onClick={() => handleDeleteStore(store.id)}
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
						title="Manajemen Toko"
						subtitle="Kelola semua toko dan outlet OURBIT"
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
					<Stats.Card
						title="Total Toko"
						value={loading ? 0 : totalStores}
						icon={Store}
						iconColor="bg-blue-500/10 text-blue-600"
					/>
					<Stats.Card
						title="Toko Aktif"
						value={loading ? 0 : activeStores}
						icon={CheckCircle}
						iconColor="bg-green-500/10 text-green-600"
					/>
					<Stats.Card
						title="Total Karyawan"
						value={loading ? 0 : totalEmployees}
						icon={Users}
						iconColor="bg-purple-500/10 text-purple-600"
					/>
					<Stats.Card
						title="Pendapatan/Bulan"
						value={loading ? "Rp 0" : formatCurrency(totalRevenue)}
						icon={DollarSign}
						iconColor="bg-orange-500/10 text-orange-600"
					/>
				</Stats.Grid>

				<div className="space-y-8">
					<Divider />

					{/* Search and Filter */}
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									type="text"
									value={searchTerm}
									onChange={setSearchTerm}
									placeholder="Cari toko berdasarkan nama, alamat, manager, atau email..."
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
									<Select.Item
										value="maintenance"
										onClick={() => setStatusFilter("maintenance")}
										selected={statusFilter === "maintenance"}>
										Maintenance
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div className="md:w-48">
							<Select.Root>
								<Select.Trigger
									value={typeFilter}
									placeholder="Semua Tipe"
									onClick={() => {
										// Handle select click
									}}
									open={false}
								/>
								<Select.Content open={false}>
									<Select.Item
										value="all"
										onClick={() => setTypeFilter("all")}
										selected={typeFilter === "all"}>
										Semua Tipe
									</Select.Item>
									<Select.Item
										value="main"
										onClick={() => setTypeFilter("main")}
										selected={typeFilter === "main"}>
										Pusat
									</Select.Item>
									<Select.Item
										value="branch"
										onClick={() => setTypeFilter("branch")}
										selected={typeFilter === "branch"}>
										Cabang
									</Select.Item>
									<Select.Item
										value="outlet"
										onClick={() => setTypeFilter("outlet")}
										selected={typeFilter === "outlet"}>
										Outlet
									</Select.Item>
									<Select.Item
										value="warehouse"
										onClick={() => setTypeFilter("warehouse")}
										selected={typeFilter === "warehouse"}>
										Gudang
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div className="md:w-auto">
							<Button.Root
								variant="default"
								onClick={() => {
									// TODO: Implement add store modal
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
						<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-12 text-center">
							<div className="w-8 h-8 border-2 border-[#FF5701] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-[#4A4A4A] font-['Inter']">Memuat toko...</p>
						</div>
					)}

					{/* Stores Table */}
					{!loading && (
						<DataTable
							data={filteredStores}
							columns={columns}
							loading={false}
							pageSize={10}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
