"use client";

import { useState } from "react";
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
} from "lucide-react";

interface Supplier {
	id: string;
	name: string;
	company: string;
	email?: string;
	phone?: string;
	address?: string;
	contact_person?: string;
	total_orders: number;
	total_value: number;
	last_order_date?: string;
	rating: number;
	status: "active" | "inactive";
	payment_terms: string;
	created_at: string;
	updated_at: string;
}

// Mock suppliers data - replace with Supabase data later
const mockSuppliers: Supplier[] = [
	{
		id: "1",
		name: "PT Kopi Nusantara",
		company: "Kopi Nusantara Indonesia",
		email: "order@kopinusantara.com",
		phone: "+62 21-5555-1111",
		address: "Jl. Raya Bogor No. 15, Jakarta Timur",
		contact_person: "Budi Hartono",
		total_orders: 45,
		total_value: 125000000,
		last_order_date: "2024-07-14",
		rating: 4.8,
		status: "active",
		payment_terms: "NET 30",
		created_at: "2024-01-15",
		updated_at: "2024-07-14",
	},
	{
		id: "2",
		name: "CV Roti Berkah",
		company: "Roti Berkah Sentosa",
		email: "sales@rotiberkah.co.id",
		phone: "+62 21-6666-2222",
		address: "Jl. Industri No. 89, Bekasi",
		contact_person: "Siti Rahmawati",
		total_orders: 32,
		total_value: 67500000,
		last_order_date: "2024-07-12",
		rating: 4.5,
		status: "active",
		payment_terms: "NET 15",
		created_at: "2024-02-20",
		updated_at: "2024-07-12",
	},
	{
		id: "3",
		name: "UD Sayur Fresh",
		company: "Sayuran Fresh Indonesia",
		email: "info@sayurfresh.com",
		phone: "+62 21-7777-3333",
		address: "Pasar Induk Kramat Jati, Jakarta Timur",
		contact_person: "Ahmad Fauzi",
		total_orders: 89,
		total_value: 45000000,
		last_order_date: "2024-07-15",
		rating: 4.2,
		status: "active",
		payment_terms: "COD",
		created_at: "2024-01-05",
		updated_at: "2024-07-15",
	},
	{
		id: "4",
		name: "PT Kemasan Sejahtera",
		company: "Kemasan Sejahtera Mandiri",
		email: "order@kemasan.id",
		phone: "+62 21-8888-4444",
		address: "Jl. Industri Kemasan No. 45, Tangerang",
		contact_person: "Maya Indira",
		total_orders: 18,
		total_value: 25000000,
		last_order_date: "2024-06-28",
		rating: 4.0,
		status: "inactive",
		payment_terms: "NET 45",
		created_at: "2024-03-10",
		updated_at: "2024-06-28",
	},
	{
		id: "5",
		name: "CV Bumbu Nusantara",
		company: "Bumbu Tradisional Nusantara",
		email: "sales@bumbunusantara.com",
		phone: "+62 21-9999-5555",
		address: "Jl. Rempah No. 123, Jakarta Barat",
		contact_person: "Rizki Pratama",
		total_orders: 67,
		total_value: 89000000,
		last_order_date: "2024-07-13",
		rating: 4.6,
		status: "active",
		payment_terms: "NET 30",
		created_at: "2024-01-25",
		updated_at: "2024-07-13",
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

	const filteredSuppliers = suppliers.filter((supplier) => {
		const matchesSearch =
			supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || supplier.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const totalSuppliers = suppliers.length;
	const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
	const totalValue = suppliers.reduce(
		(sum, supplier) => sum + supplier.total_value,
		0
	);
	const avgRating =
		suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) /
		suppliers.length;

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

	const getRatingStars = (rating: number) => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<Star
					key={i}
					className={`w-4 h-4 ${
						i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
					}`}
				/>
			);
		}
		return stars;
	};

	const handleDeleteSupplier = (supplierId: string) => {
		if (confirm("Apakah Anda yakin ingin menghapus data supplier ini?")) {
			setSuppliers(suppliers.filter((s) => s.id !== supplierId));
		}
	};

	const toggleSupplierStatus = (supplierId: string) => {
		setSuppliers(
			suppliers.map((s) =>
				s.id === supplierId
					? { ...s, status: s.status === "active" ? "inactive" : "active" }
					: s
			)
		);
	};

	const SupplierForm = ({
		supplier,
		onClose,
		onSave,
	}: {
		supplier?: Supplier | null;
		onClose: () => void;
		onSave: (supplier: Partial<Supplier>) => void;
	}) => {
		const [formData, setFormData] = useState({
			name: supplier?.name || "",
			company: supplier?.company || "",
			email: supplier?.email || "",
			phone: supplier?.phone || "",
			address: supplier?.address || "",
			contact_person: supplier?.contact_person || "",
			payment_terms: supplier?.payment_terms || "NET 30",
			rating: supplier?.rating || 5,
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
						{supplier ? "Edit Supplier" : "Tambah Supplier Baru"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Nama Supplier *
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Nama supplier"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Nama Perusahaan *
								</label>
								<input
									type="text"
									value={formData.company}
									onChange={(e) =>
										setFormData({ ...formData, company: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Nama perusahaan"
									required
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
									placeholder="email@supplier.com"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Nomor Telepon
								</label>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="+62 21-1234-5678"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Alamat
							</label>
							<textarea
								value={formData.address}
								onChange={(e) =>
									setFormData({ ...formData, address: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Alamat lengkap supplier"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Contact Person
								</label>
								<input
									type="text"
									value={formData.contact_person}
									onChange={(e) =>
										setFormData({ ...formData, contact_person: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Nama kontak person"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Payment Terms
								</label>
								<select
									value={formData.payment_terms}
									onChange={(e) =>
										setFormData({ ...formData, payment_terms: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
									<option value="COD">Cash on Delivery (COD)</option>
									<option value="NET 15">NET 15 Days</option>
									<option value="NET 30">NET 30 Days</option>
									<option value="NET 45">NET 45 Days</option>
									<option value="NET 60">NET 60 Days</option>
								</select>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Rating (1-5)
							</label>
							<select
								value={formData.rating}
								onChange={(e) =>
									setFormData({ ...formData, rating: Number(e.target.value) })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option value={5}>5 - Sangat Baik</option>
								<option value={4}>4 - Baik</option>
								<option value={3}>3 - Cukup</option>
								<option value={2}>2 - Kurang</option>
								<option value={1}>1 - Sangat Kurang</option>
							</select>
						</div>

						<div className="flex space-x-2 pt-4">
							<button
								type="submit"
								className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
								{supplier ? "Update" : "Tambah"}
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

	const SupplierDetailModal = ({
		supplier,
		onClose,
	}: {
		supplier: Supplier;
		onClose: () => void;
	}) => {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-xl font-semibold">Detail Supplier</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600">
							✕
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Supplier Info */}
						<div className="space-y-4">
							<h4 className="font-semibold text-gray-900">
								Informasi Supplier
							</h4>
							<div className="space-y-3">
								<div className="flex items-center">
									<Building2 className="w-4 h-4 text-gray-400 mr-2" />
									<div>
										<p className="font-medium">{supplier.name}</p>
										<p className="text-sm text-gray-600">{supplier.company}</p>
									</div>
								</div>
								{supplier.email && (
									<div className="flex items-center">
										<Mail className="w-4 h-4 text-gray-400 mr-2" />
										<span className="text-sm">{supplier.email}</span>
									</div>
								)}
								{supplier.phone && (
									<div className="flex items-center">
										<Phone className="w-4 h-4 text-gray-400 mr-2" />
										<span className="text-sm">{supplier.phone}</span>
									</div>
								)}
								{supplier.address && (
									<div className="flex items-start">
										<MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
										<span className="text-sm">{supplier.address}</span>
									</div>
								)}
								{supplier.contact_person && (
									<div className="flex items-center">
										<span className="text-sm text-gray-600">
											Contact Person: {supplier.contact_person}
										</span>
									</div>
								)}
								<div className="flex items-center">
									<Calendar className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">
										Bergabung: {formatDate(supplier.created_at)}
									</span>
								</div>
							</div>
						</div>

						{/* Supplier Stats */}
						<div className="space-y-4">
							<h4 className="font-semibold text-gray-900">
								Statistik & Performance
							</h4>
							<div className="space-y-3">
								<div className="bg-blue-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-blue-600">Total Pesanan</span>
										<span className="font-semibold text-blue-900">
											{supplier.total_orders}
										</span>
									</div>
								</div>
								<div className="bg-green-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-green-600">
											Total Nilai Transaksi
										</span>
										<span className="font-semibold text-green-900">
											{formatCurrency(supplier.total_value)}
										</span>
									</div>
								</div>
								<div className="bg-purple-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-purple-600">
											Rata-rata per Pesanan
										</span>
										<span className="font-semibold text-purple-900">
											{formatCurrency(
												supplier.total_value / supplier.total_orders
											)}
										</span>
									</div>
								</div>
								<div className="bg-yellow-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-yellow-600">Rating</span>
										<div className="flex items-center">
											{getRatingStars(supplier.rating)}
											<span className="ml-2 font-semibold text-yellow-900">
												{supplier.rating}
											</span>
										</div>
									</div>
								</div>
								{supplier.last_order_date && (
									<div className="bg-orange-50 p-3 rounded-lg">
										<div className="flex items-center justify-between">
											<span className="text-sm text-orange-600">
												Pesanan Terakhir
											</span>
											<span className="font-semibold text-orange-900">
												{formatDate(supplier.last_order_date)}
											</span>
										</div>
									</div>
								)}
								<div className="bg-gray-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Payment Terms</span>
										<span className="font-semibold text-gray-900">
											{supplier.payment_terms}
										</span>
									</div>
								</div>
								<div className="flex items-center justify-center pt-2">
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											supplier.status === "active"
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}>
										{supplier.status === "active" ? "Aktif" : "Tidak Aktif"}
									</span>
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
					<h1 className="text-3xl font-bold text-gray-900">
						Manajemen Supplier
					</h1>
					<p className="text-gray-600">
						Kelola data supplier dan rekanan bisnis
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
					<Plus className="w-4 h-4" />
					<span>Tambah Supplier</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Total Supplier
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{totalSuppliers}
							</p>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<Building2 className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Supplier Aktif
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{activeSuppliers}
							</p>
						</div>
						<div className="p-3 bg-green-50 rounded-full">
							<TrendingUp className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Total Nilai Transaksi
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{formatCurrency(totalValue)}
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
							<p className="text-sm font-medium text-gray-600">
								Rating Rata-rata
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{avgRating.toFixed(1)}
							</p>
						</div>
						<div className="p-3 bg-yellow-50 rounded-full">
							<Star className="w-6 h-6 text-yellow-600" />
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
							placeholder="Cari supplier, perusahaan, atau contact person..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value="all">Semua Status</option>
						<option value="active">Aktif</option>
						<option value="inactive">Tidak Aktif</option>
					</select>
				</div>
			</div>

			{/* Suppliers Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Supplier
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Kontak
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Pesanan
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Total Nilai
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Rating
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredSuppliers.map((supplier) => (
								<tr key={supplier.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
												<Building2 className="w-5 h-5 text-blue-600" />
											</div>
											<div>
												<div className="text-sm font-medium text-gray-900">
													{supplier.name}
												</div>
												<div className="text-sm text-gray-500">
													{supplier.company}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{supplier.email && (
												<div className="flex items-center mb-1">
													<Mail className="w-3 h-3 text-gray-400 mr-1" />
													{supplier.email}
												</div>
											)}
											{supplier.phone && (
												<div className="flex items-center">
													<Phone className="w-3 h-3 text-gray-400 mr-1" />
													{supplier.phone}
												</div>
											)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{supplier.total_orders} pesanan
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{formatCurrency(supplier.total_value)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											{getRatingStars(supplier.rating)}
											<span className="ml-2 text-sm text-gray-600">
												{supplier.rating}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<button
											onClick={() => toggleSupplierStatus(supplier.id)}
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												supplier.status === "active"
													? "bg-green-100 text-green-800 hover:bg-green-200"
													: "bg-red-100 text-red-800 hover:bg-red-200"
											}`}>
											{supplier.status === "active" ? "Aktif" : "Tidak Aktif"}
										</button>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex space-x-2">
											<button
												onClick={() => setSelectedSupplier(supplier)}
												className="text-blue-600 hover:text-blue-900"
												title="Lihat Detail">
												<Building2 className="w-4 h-4" />
											</button>
											<button
												onClick={() => setEditingSupplier(supplier)}
												className="text-green-600 hover:text-green-900"
												title="Edit">
												<Edit2 className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleDeleteSupplier(supplier.id)}
												className="text-red-600 hover:text-red-900"
												title="Hapus">
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{filteredSuppliers.length === 0 && (
					<div className="text-center py-12">
						<Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Tidak ada supplier ditemukan
						</h3>
						<p className="text-gray-600">
							Coba ubah kata kunci pencarian atau tambah supplier baru.
						</p>
					</div>
				)}
			</div>

			{/* Modals */}
			{(showAddModal || editingSupplier) && (
				<SupplierForm
					supplier={editingSupplier}
					onClose={() => {
						setShowAddModal(false);
						setEditingSupplier(null);
					}}
					onSave={(supplierData) => {
						if (editingSupplier) {
							// Update existing supplier
							setSuppliers(
								suppliers.map((s) =>
									s.id === editingSupplier.id
										? {
												...s,
												...supplierData,
												updated_at: new Date().toISOString(),
										  }
										: s
								)
							);
						} else {
							// Add new supplier
							const newSupplier: Supplier = {
								id: Date.now().toString(),
								...supplierData,
								total_orders: 0,
								total_value: 0,
								status: "active",
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							} as Supplier;
							setSuppliers([...suppliers, newSupplier]);
						}
					}}
				/>
			)}

			{selectedSupplier && (
				<SupplierDetailModal
					supplier={selectedSupplier}
					onClose={() => setSelectedSupplier(null)}
				/>
			)}
		</div>
	);
}
