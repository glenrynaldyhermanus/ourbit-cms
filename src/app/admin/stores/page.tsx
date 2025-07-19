"use client";

import { useState } from "react";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	Store,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Users,
	DollarSign,
	Clock,
	CheckCircle,
	XCircle,
} from "lucide-react";

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
	total_staff: number;
	monthly_revenue: number;
	total_products: number;
	established_date: string;
	created_at: string;
	updated_at: string;
}

// Mock stores data - replace with Supabase data later
const mockStores: StoreData[] = [
	{
		id: "1",
		name: "OURBIT Central Store",
		address: "Jl. Sudirman No. 123, Jakarta Pusat",
		phone: "+62 21-1234-5678",
		email: "central@ourbit.com",
		manager_name: "Ahmad Rizky",
		status: "active",
		store_type: "main",
		opening_hours: "08:00 - 22:00",
		total_staff: 15,
		monthly_revenue: 150000000,
		total_products: 250,
		established_date: "2023-01-15",
		created_at: "2023-01-15",
		updated_at: "2024-07-15",
	},
	{
		id: "2",
		name: "OURBIT Mall Kelapa Gading",
		address: "Mall Kelapa Gading 3, Lt. 1 No. 15, Jakarta Utara",
		phone: "+62 21-2345-6789",
		email: "kelapagading@ourbit.com",
		manager_name: "Siti Nurhaliza",
		status: "active",
		store_type: "branch",
		opening_hours: "10:00 - 22:00",
		total_staff: 8,
		monthly_revenue: 85000000,
		total_products: 180,
		established_date: "2023-03-20",
		created_at: "2023-03-20",
		updated_at: "2024-07-14",
	},
	{
		id: "3",
		name: "OURBIT Bekasi Outlet",
		address: "Jl. Ahmad Yani No. 45, Bekasi",
		phone: "+62 21-3456-7890",
		manager_name: "Budi Santoso",
		status: "active",
		store_type: "outlet",
		opening_hours: "09:00 - 21:00",
		total_staff: 5,
		monthly_revenue: 45000000,
		total_products: 120,
		established_date: "2023-06-10",
		created_at: "2023-06-10",
		updated_at: "2024-07-13",
	},
	{
		id: "4",
		name: "OURBIT Warehouse",
		address: "Kawasan Industri Cibitung, Bekasi",
		phone: "+62 21-4567-8901",
		email: "warehouse@ourbit.com",
		manager_name: "Maya Dewi",
		status: "active",
		store_type: "warehouse",
		opening_hours: "24/7",
		total_staff: 12,
		monthly_revenue: 0,
		total_products: 1500,
		established_date: "2023-02-01",
		created_at: "2023-02-01",
		updated_at: "2024-07-15",
	},
	{
		id: "5",
		name: "OURBIT Bandung Branch",
		address: "Jl. Braga No. 67, Bandung",
		phone: "+62 22-1234-5678",
		email: "bandung@ourbit.com",
		manager_name: "Eko Prasetyo",
		status: "maintenance",
		store_type: "branch",
		opening_hours: "10:00 - 21:00",
		total_staff: 6,
		monthly_revenue: 52000000,
		total_products: 160,
		established_date: "2023-08-15",
		created_at: "2023-08-15",
		updated_at: "2024-07-10",
	},
];

export default function StoresPage() {
	const [stores, setStores] = useState<StoreData[]>(mockStores);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingStore, setEditingStore] = useState<StoreData | null>(null);
	const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);

	const filteredStores = stores.filter((store) => {
		const matchesSearch =
			store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
			store.manager_name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || store.status === statusFilter;
		const matchesType = typeFilter === "all" || store.store_type === typeFilter;
		return matchesSearch && matchesStatus && matchesType;
	});

	const totalStores = stores.length;
	const activeStores = stores.filter((s) => s.status === "active").length;
	const totalRevenue = stores.reduce(
		(sum, store) => sum + store.monthly_revenue,
		0
	);
	const totalStaff = stores.reduce((sum, store) => sum + store.total_staff, 0);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusInfo = (status: string) => {
		switch (status) {
			case "active":
				return {
					label: "Aktif",
					color: "bg-green-100 text-green-800",
					icon: CheckCircle,
				};
			case "inactive":
				return {
					label: "Tidak Aktif",
					color: "bg-red-100 text-red-800",
					icon: XCircle,
				};
			case "maintenance":
				return {
					label: "Maintenance",
					color: "bg-yellow-100 text-yellow-800",
					icon: Clock,
				};
			default:
				return {
					label: "Unknown",
					color: "bg-gray-100 text-gray-800",
					icon: XCircle,
				};
		}
	};

	const getTypeInfo = (type: string) => {
		switch (type) {
			case "main":
				return { label: "Toko Utama", color: "bg-blue-100 text-blue-800" };
			case "branch":
				return { label: "Cabang", color: "bg-purple-100 text-purple-800" };
			case "outlet":
				return { label: "Outlet", color: "bg-green-100 text-green-800" };
			case "warehouse":
				return { label: "Gudang", color: "bg-orange-100 text-orange-800" };
			default:
				return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
		}
	};

	const handleDeleteStore = (storeId: string) => {
		const store = stores.find((s) => s.id === storeId);
		if (store?.store_type === "main") {
			alert("Tidak dapat menghapus toko utama!");
			return;
		}
		if (confirm("Apakah Anda yakin ingin menghapus toko ini?")) {
			setStores(stores.filter((s) => s.id !== storeId));
		}
	};

	const toggleStoreStatus = (storeId: string) => {
		setStores(
			stores.map((s) => {
				if (s.id === storeId) {
					const newStatus = s.status === "active" ? "inactive" : "active";
					return { ...s, status: newStatus };
				}
				return s;
			})
		);
	};

	const StoreForm = ({
		store,
		onClose,
		onSave,
	}: {
		store?: StoreData | null;
		onClose: () => void;
		onSave: (store: Partial<StoreData>) => void;
	}) => {
		const [formData, setFormData] = useState({
			name: store?.name || "",
			address: store?.address || "",
			phone: store?.phone || "",
			email: store?.email || "",
			manager_name: store?.manager_name || "",
			store_type: store?.store_type || "branch",
			opening_hours: store?.opening_hours || "09:00 - 21:00",
			established_date:
				store?.established_date || new Date().toISOString().split("T")[0],
		});

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			onSave(formData);
			onClose();
		};

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
					<h3 className="text-lg font-semibold mb-4">
						{store ? "Edit Toko" : "Tambah Toko Baru"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Nama Toko *
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Nama toko"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Tipe Toko *
								</label>
								<select
									value={formData.store_type}
									onChange={(e) =>
										setFormData({
											...formData,
											store_type: e.target.value as
												| "main"
												| "branch"
												| "outlet"
												| "warehouse",
										})
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required>
									<option value="main">Toko Utama</option>
									<option value="branch">Cabang</option>
									<option value="outlet">Outlet</option>
									<option value="warehouse">Gudang</option>
								</select>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Alamat *
							</label>
							<textarea
								value={formData.address}
								onChange={(e) =>
									setFormData({ ...formData, address: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Alamat lengkap toko"
								rows={3}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Nomor Telepon *
								</label>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="+62 21-1234-5678"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="store@ourbit.com"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Nama Manager *
								</label>
								<input
									type="text"
									value={formData.manager_name}
									onChange={(e) =>
										setFormData({ ...formData, manager_name: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Nama manager toko"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Jam Operasional
								</label>
								<input
									type="text"
									value={formData.opening_hours}
									onChange={(e) =>
										setFormData({ ...formData, opening_hours: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="09:00 - 21:00"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Tanggal Berdiri
							</label>
							<input
								type="date"
								value={formData.established_date}
								onChange={(e) =>
									setFormData({ ...formData, established_date: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="flex space-x-2 pt-4">
							<button
								type="submit"
								className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
								{store ? "Update" : "Tambah"}
							</button>
							<button
								type="button"
								onClick={onClose}
								className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors">
								Batal
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	const StoreDetailModal = ({
		store,
		onClose,
	}: {
		store: StoreData;
		onClose: () => void;
	}) => {
		const statusInfo = getStatusInfo(store.status);
		const typeInfo = getTypeInfo(store.store_type);

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-xl font-semibold">Detail Toko</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600">
							✕
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Store Info */}
						<div className="space-y-4">
							<h4 className="font-semibold text-gray-900">Informasi Toko</h4>
							<div className="space-y-3">
								<div className="flex items-center">
									<Store className="w-4 h-4 text-gray-400 mr-2" />
									<div>
										<p className="font-medium">{store.name}</p>
										<div className="flex items-center space-x-2 mt-1">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
												{typeInfo.label}
											</span>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
												{statusInfo.label}
											</span>
										</div>
									</div>
								</div>
								<div className="flex items-start">
									<MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
									<span className="text-sm">{store.address}</span>
								</div>
								<div className="flex items-center">
									<Phone className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">{store.phone}</span>
								</div>
								{store.email && (
									<div className="flex items-center">
										<Mail className="w-4 h-4 text-gray-400 mr-2" />
										<span className="text-sm">{store.email}</span>
									</div>
								)}
								<div className="flex items-center">
									<Users className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">Manager: {store.manager_name}</span>
								</div>
								<div className="flex items-center">
									<Clock className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">
										Jam Operasional: {store.opening_hours}
									</span>
								</div>
								<div className="flex items-center">
									<Calendar className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">
										Berdiri: {formatDate(store.established_date)}
									</span>
								</div>
							</div>
						</div>

						{/* Store Stats */}
						<div className="space-y-4">
							<h4 className="font-semibold text-gray-900">
								Statistik & Performance
							</h4>
							<div className="space-y-3">
								<div className="bg-blue-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-blue-600">Total Staff</span>
										<span className="font-semibold text-blue-900">
											{store.total_staff} orang
										</span>
									</div>
								</div>
								<div className="bg-green-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-green-600">
											Revenue Bulanan
										</span>
										<span className="font-semibold text-green-900">
											{formatCurrency(store.monthly_revenue)}
										</span>
									</div>
								</div>
								<div className="bg-purple-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-purple-600">
											Total Produk
										</span>
										<span className="font-semibold text-purple-900">
											{store.total_products}
										</span>
									</div>
								</div>
								{store.total_staff > 0 && store.monthly_revenue > 0 && (
									<div className="bg-orange-50 p-3 rounded-lg">
										<div className="flex items-center justify-between">
											<span className="text-sm text-orange-600">
												Revenue per Staff
											</span>
											<span className="font-semibold text-orange-900">
												{formatCurrency(
													store.monthly_revenue / store.total_staff
												)}
											</span>
										</div>
									</div>
								)}
								<div className="bg-gray-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Last Updated</span>
										<span className="font-semibold text-gray-900">
											{formatDate(store.updated_at)}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Manajemen Toko</h1>
					<p className="text-gray-600">
						Kelola semua cabang dan outlet toko Anda
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
					<Plus className="w-4 h-4" />
					<span>Tambah Toko</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Toko</p>
							<p className="text-2xl font-bold text-gray-900">{totalStores}</p>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<Store className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Toko Aktif</p>
							<p className="text-2xl font-bold text-gray-900">{activeStores}</p>
						</div>
						<div className="p-3 bg-green-50 rounded-full">
							<CheckCircle className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Revenue</p>
							<p className="text-2xl font-bold text-gray-900">
								{formatCurrency(totalRevenue)}
							</p>
						</div>
						<div className="p-3 bg-purple-50 rounded-full">
							<DollarSign className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Staff</p>
							<p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
						</div>
						<div className="p-3 bg-yellow-50 rounded-full">
							<Users className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<input
							type="text"
							placeholder="Cari toko, alamat, atau manager..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div className="flex space-x-2">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
							<option value="all">Semua Status</option>
							<option value="active">Aktif</option>
							<option value="inactive">Tidak Aktif</option>
							<option value="maintenance">Maintenance</option>
						</select>
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
							<option value="all">Semua Tipe</option>
							<option value="main">Toko Utama</option>
							<option value="branch">Cabang</option>
							<option value="outlet">Outlet</option>
							<option value="warehouse">Gudang</option>
						</select>
					</div>
				</div>
			</div>

			{/* Stores Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredStores.map((store) => {
					const statusInfo = getStatusInfo(store.status);
					const typeInfo = getTypeInfo(store.store_type);

					return (
						<div
							key={store.id}
							className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center">
										<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
											<Store className="w-6 h-6 text-blue-600" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900">
												{store.name}
											</h3>
											<p className="text-sm text-gray-600">
												{store.manager_name}
											</p>
										</div>
									</div>
									<div className="flex flex-col space-y-1">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
											{typeInfo.label}
										</span>
										<button
											onClick={() => toggleStoreStatus(store.id)}
											className={`px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 ${statusInfo.color}`}>
											{statusInfo.label}
										</button>
									</div>
								</div>

								<div className="space-y-2 mb-4">
									<div className="flex items-center text-sm text-gray-600">
										<MapPin className="w-4 h-4 mr-2" />
										<span className="truncate">{store.address}</span>
									</div>
									<div className="flex items-center text-sm text-gray-600">
										<Phone className="w-4 h-4 mr-2" />
										<span>{store.phone}</span>
									</div>
									<div className="flex items-center text-sm text-gray-600">
										<Clock className="w-4 h-4 mr-2" />
										<span>{store.opening_hours}</span>
									</div>
								</div>

								<div className="grid grid-cols-3 gap-2 mb-4">
									<div className="text-center">
										<p className="text-xs text-gray-500">Staff</p>
										<p className="font-semibold text-blue-600">
											{store.total_staff}
										</p>
									</div>
									<div className="text-center">
										<p className="text-xs text-gray-500">Produk</p>
										<p className="font-semibold text-green-600">
											{store.total_products}
										</p>
									</div>
									<div className="text-center">
										<p className="text-xs text-gray-500">Revenue</p>
										<p className="font-semibold text-purple-600 text-xs">
											{store.monthly_revenue > 0
												? formatCurrency(store.monthly_revenue)
												: "-"}
										</p>
									</div>
								</div>

								<div className="flex justify-between items-center pt-4 border-t border-gray-200">
									<span className="text-xs text-gray-500">
										Berdiri: {formatDate(store.established_date)}
									</span>
									<div className="flex space-x-2">
										<button
											onClick={() => setSelectedStore(store)}
											className="text-blue-600 hover:text-blue-900"
											title="Lihat Detail">
											<Store className="w-4 h-4" />
										</button>
										<button
											onClick={() => setEditingStore(store)}
											className="text-green-600 hover:text-green-900"
											title="Edit">
											<Edit2 className="w-4 h-4" />
										</button>
										<button
											onClick={() => handleDeleteStore(store.id)}
											className="text-red-600 hover:text-red-900"
											title="Hapus"
											disabled={store.store_type === "main"}>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Empty State */}
			{filteredStores.length === 0 && (
				<div className="bg-white rounded-lg shadow p-12 text-center">
					<Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Tidak ada toko ditemukan
					</h3>
					<p className="text-gray-600 mb-6">
						Coba ubah filter pencarian atau tambah toko baru.
					</p>
					{searchTerm === "" &&
						statusFilter === "all" &&
						typeFilter === "all" && (
							<button
								onClick={() => setShowAddModal(true)}
								className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
								Tambah Toko Pertama
							</button>
						)}
				</div>
			)}

			{/* Modals */}
			{(showAddModal || editingStore) && (
				<StoreForm
					store={editingStore}
					onClose={() => {
						setShowAddModal(false);
						setEditingStore(null);
					}}
					onSave={(storeData) => {
						if (editingStore) {
							// Update existing store
							setStores(
								stores.map((s) =>
									s.id === editingStore.id
										? {
												...s,
												...storeData,
												updated_at: new Date().toISOString(),
										  }
										: s
								)
							);
						} else {
							// Add new store
							const newStore: StoreData = {
								id: Date.now().toString(),
								...storeData,
								status: "active",
								total_staff: 0,
								monthly_revenue: 0,
								total_products: 0,
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							} as StoreData;
							setStores([...stores, newStore]);
						}
					}}
				/>
			)}

			{selectedStore && (
				<StoreDetailModal
					store={selectedStore}
					onClose={() => setSelectedStore(null)}
				/>
			)}
		</div>
	);
}
