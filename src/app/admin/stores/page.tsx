"use client";

import { useState, useEffect, useMemo } from "react";
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
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
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

	// Filter stores by search and filters - optimized with useMemo
	const filteredStores = useMemo(() => {
		return stores.filter((store) => {
			const matchesSearch =
				store.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
				store.address
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				store.manager_name
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				store.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === "all" || store.status === statusFilter;
			const matchesType =
				typeFilter === "all" || store.store_type === typeFilter;
			return matchesSearch && matchesStatus && matchesType;
		});
	}, [stores, debouncedSearchTerm, statusFilter, typeFilter]);

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

	// Calculate stats - optimized with useMemo
	const stats = useMemo(() => {
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

		return {
			totalStores,
			activeStores,
			totalRevenue,
			totalEmployees,
		};
	}, [stores]);

	// Define columns for DataTable - memoized to prevent re-renders
	const columns: Column<StoreData>[] = useMemo(
		() => [
			{
				key: "store",
				header: "Toko",
				sortable: true,
				sortKey: "name",
				render: (store) => (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<Store className="w-5 h-5 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{store.name}
							</p>
							<p className="text-sm text-gray-500 truncate">
								{store.manager_name} • {store.opening_hours}
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
					<div className="flex items-center space-x-2">
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStoreTypeColor(
								store.store_type
							)}`}>
							{getStoreTypeLabel(store.store_type)}
						</span>
					</div>
				),
			},
			{
				key: "employees",
				header: "Karyawan",
				sortable: true,
				sortKey: "employee_count",
				render: (store) => (
					<div className="text-sm font-medium text-gray-900">
						{store.employee_count} karyawan
					</div>
				),
			},
			{
				key: "revenue",
				header: "Pendapatan Bulanan",
				sortable: true,
				sortKey: "monthly_revenue",
				render: (store) => (
					<div className="text-sm font-medium text-gray-900">
						{formatCurrency(store.monthly_revenue)}
					</div>
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
		],
		[]
	);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Toko"
						subtitle="Kelola data toko dan cabang Anda"
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
								title="Total Toko"
								value={stats.totalStores}
								icon={Store}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Toko Aktif"
								value={stats.activeStores}
								icon={CheckCircle}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Total Pendapatan"
								value={formatCurrency(stats.totalRevenue)}
								icon={DollarSign}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Total Karyawan"
								value={stats.totalEmployees}
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
									placeholder="Cari toko berdasarkan nama, alamat, atau manager..."
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
											: statusFilter === "inactive"
											? "Nonaktif"
											: "Maintenance"
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
									value={
										typeFilter === "all"
											? "Semua Tipe"
											: getStoreTypeLabel(typeFilter)
									}
									placeholder="Filter Tipe"
								/>
								<Select.Content>
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
									// Handle add store
									console.log("Add store clicked");
								}}
								disabled={loading}
								className="rounded-xl w-full md:w-auto">
								<Button.Icon icon={Plus} />
								<Button.Text>Tambah</Button.Text>
							</Button.Root>
						</div>
					</div>

					{/* Stores Table */}
					<div
						className="animate-fade-in-up"
						style={{ animationDelay: "150ms" }}>
						<DataTable
							data={filteredStores}
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
