"use client";

import { useState } from "react";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	Users,
	Mail,
	Phone,
	MapPin,
	Calendar,
	ShoppingBag,
	DollarSign,
} from "lucide-react";

interface Customer {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	address?: string;
	total_orders: number;
	total_spent: number;
	last_order_date?: string;
	created_at: string;
	updated_at: string;
}

// Mock customers data - replace with Supabase data later
const mockCustomers: Customer[] = [
	{
		id: "1",
		name: "Ahmad Rizky",
		email: "ahmad.rizky@email.com",
		phone: "+62 812-3456-7890",
		address: "Jl. Sudirman No. 123, Jakarta",
		total_orders: 15,
		total_spent: 750000,
		last_order_date: "2024-07-15",
		created_at: "2024-01-15",
		updated_at: "2024-07-15",
	},
	{
		id: "2",
		name: "Siti Nurhaliza",
		email: "siti.nur@email.com",
		phone: "+62 813-9876-5432",
		address: "Jl. Gatot Subroto No. 45, Bandung",
		total_orders: 8,
		total_spent: 320000,
		last_order_date: "2024-07-10",
		created_at: "2024-02-20",
		updated_at: "2024-07-10",
	},
	{
		id: "3",
		name: "Budi Santoso",
		email: "budi.santoso@email.com",
		phone: "+62 814-5555-1234",
		address: "Jl. Diponegoro No. 67, Surabaya",
		total_orders: 22,
		total_spent: 1250000,
		last_order_date: "2024-07-14",
		created_at: "2024-01-05",
		updated_at: "2024-07-14",
	},
	{
		id: "4",
		name: "Maya Dewi",
		phone: "+62 815-7777-8888",
		total_orders: 3,
		total_spent: 150000,
		last_order_date: "2024-07-08",
		created_at: "2024-06-10",
		updated_at: "2024-07-08",
	},
	{
		id: "5",
		name: "Eko Prasetyo",
		email: "eko.p@email.com",
		phone: "+62 816-1111-2222",
		address: "Jl. Ahmad Yani No. 89, Yogyakarta",
		total_orders: 12,
		total_spent: 480000,
		last_order_date: "2024-07-12",
		created_at: "2024-03-15",
		updated_at: "2024-07-12",
	},
];

export default function CustomersPage() {
	const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
		null
	);

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.phone?.includes(searchTerm)
	);

	const totalCustomers = customers.length;
	const totalRevenue = customers.reduce(
		(sum, customer) => sum + customer.total_spent,
		0
	);
	const averageOrderValue =
		totalRevenue /
			customers.reduce((sum, customer) => sum + customer.total_orders, 0) || 0;

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

	const getCustomerTier = (totalSpent: number) => {
		if (totalSpent >= 1000000)
			return { label: "VIP", color: "bg-purple-100 text-purple-800" };
		if (totalSpent >= 500000)
			return { label: "Gold", color: "bg-yellow-100 text-yellow-800" };
		if (totalSpent >= 200000)
			return { label: "Silver", color: "bg-gray-100 text-gray-800" };
		return { label: "Bronze", color: "bg-orange-100 text-orange-800" };
	};

	const handleDeleteCustomer = (customerId: string) => {
		if (confirm("Apakah Anda yakin ingin menghapus data pelanggan ini?")) {
			setCustomers(customers.filter((c) => c.id !== customerId));
		}
	};

	const CustomerForm = ({
		customer,
		onClose,
		onSave,
	}: {
		customer?: Customer | null;
		onClose: () => void;
		onSave: (customer: Partial<Customer>) => void;
	}) => {
		const [formData, setFormData] = useState({
			name: customer?.name || "",
			email: customer?.email || "",
			phone: customer?.phone || "",
			address: customer?.address || "",
		});

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			onSave(formData);
			onClose();
		};

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-md w-full p-6">
					<h3 className="text-lg font-semibold mb-4">
						{customer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Nama Lengkap *
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Masukkan nama lengkap"
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
								placeholder="email@contoh.com"
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
								placeholder="+62 812-3456-7890"
							/>
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
								placeholder="Alamat lengkap (opsional)"
								rows={3}
							/>
						</div>
						<div className="flex space-x-2 pt-4">
							<button
								type="submit"
								className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
								{customer ? "Update" : "Tambah"}
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

	const CustomerDetailModal = ({
		customer,
		onClose,
	}: {
		customer: Customer;
		onClose: () => void;
	}) => {
		const tier = getCustomerTier(customer.total_spent);

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-2xl w-full p-6">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-xl font-semibold">Detail Pelanggan</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600">
							×
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Customer Info */}
						<div className="space-y-4">
							<h4 className="font-semibold text-gray-900">Informasi Pribadi</h4>
							<div className="space-y-3">
								<div className="flex items-center">
									<Users className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">{customer.name}</span>
								</div>
								{customer.email && (
									<div className="flex items-center">
										<Mail className="w-4 h-4 text-gray-400 mr-2" />
										<span className="text-sm">{customer.email}</span>
									</div>
								)}
								{customer.phone && (
									<div className="flex items-center">
										<Phone className="w-4 h-4 text-gray-400 mr-2" />
										<span className="text-sm">{customer.phone}</span>
									</div>
								)}
								{customer.address && (
									<div className="flex items-start">
										<MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
										<span className="text-sm">{customer.address}</span>
									</div>
								)}
								<div className="flex items-center">
									<Calendar className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">
										Bergabung: {formatDate(customer.created_at)}
									</span>
								</div>
							</div>
						</div>

						{/* Customer Stats */}
						<div className="space-y-4">
							<h4 className="font-semibold text-gray-900">
								Statistik Pembelian
							</h4>
							<div className="space-y-3">
								<div className="bg-blue-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-blue-600">Total Pesanan</span>
										<span className="font-semibold text-blue-900">
											{customer.total_orders}
										</span>
									</div>
								</div>
								<div className="bg-green-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-green-600">
											Total Pembelian
										</span>
										<span className="font-semibold text-green-900">
											{formatCurrency(customer.total_spent)}
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
												customer.total_spent / customer.total_orders
											)}
										</span>
									</div>
								</div>
								{customer.last_order_date && (
									<div className="bg-orange-50 p-3 rounded-lg">
										<div className="flex items-center justify-between">
											<span className="text-sm text-orange-600">
												Pesanan Terakhir
											</span>
											<span className="font-semibold text-orange-900">
												{formatDate(customer.last_order_date)}
											</span>
										</div>
									</div>
								)}
								<div className="flex items-center justify-center pt-2">
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${tier.color}`}>
										{tier.label} Customer
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
						Manajemen Pelanggan
					</h1>
					<p className="text-gray-600">
						Kelola data dan riwayat pembelian pelanggan
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
					<Plus className="w-4 h-4" />
					<span>Tambah Pelanggan</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Total Pelanggan
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{totalCustomers}
							</p>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<Users className="w-6 h-6 text-blue-600" />
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
						<div className="p-3 bg-green-50 rounded-full">
							<DollarSign className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Rata-rata Pembelian
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{formatCurrency(averageOrderValue)}
							</p>
						</div>
						<div className="p-3 bg-purple-50 rounded-full">
							<ShoppingBag className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">VIP Customers</p>
							<p className="text-2xl font-bold text-gray-900">
								{customers.filter((c) => c.total_spent >= 1000000).length}
							</p>
						</div>
						<div className="p-3 bg-yellow-50 rounded-full">
							<Users className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="bg-white rounded-lg shadow p-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Cari pelanggan berdasarkan nama, email, atau telepon..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* Customers Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Pelanggan
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Kontak
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Total Pesanan
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Total Pembelian
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Tier
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Terakhir Belanja
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredCustomers.map((customer) => {
								const tier = getCustomerTier(customer.total_spent);
								return (
									<tr key={customer.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
													<Users className="w-5 h-5 text-blue-600" />
												</div>
												<div>
													<div className="text-sm font-medium text-gray-900">
														{customer.name}
													</div>
													<div className="text-sm text-gray-500">
														Bergabung {formatDate(customer.created_at)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{customer.email && (
													<div className="flex items-center mb-1">
														<Mail className="w-3 h-3 text-gray-400 mr-1" />
														{customer.email}
													</div>
												)}
												{customer.phone && (
													<div className="flex items-center">
														<Phone className="w-3 h-3 text-gray-400 mr-1" />
														{customer.phone}
													</div>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{customer.total_orders} pesanan
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatCurrency(customer.total_spent)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${tier.color}`}>
												{tier.label}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{customer.last_order_date
												? formatDate(customer.last_order_date)
												: "-"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() => setSelectedCustomer(customer)}
													className="text-blue-600 hover:text-blue-900"
													title="Lihat Detail">
													<Users className="w-4 h-4" />
												</button>
												<button
													onClick={() => setEditingCustomer(customer)}
													className="text-green-600 hover:text-green-900"
													title="Edit">
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDeleteCustomer(customer.id)}
													className="text-red-600 hover:text-red-900"
													title="Hapus">
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{filteredCustomers.length === 0 && (
					<div className="text-center py-12">
						<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Tidak ada pelanggan ditemukan
						</h3>
						<p className="text-gray-600">
							Coba ubah kata kunci pencarian atau tambah pelanggan baru.
						</p>
					</div>
				)}
			</div>

			{/* Modals */}
			{(showAddModal || editingCustomer) && (
				<CustomerForm
					customer={editingCustomer}
					onClose={() => {
						setShowAddModal(false);
						setEditingCustomer(null);
					}}
					onSave={(customerData) => {
						if (editingCustomer) {
							// Update existing customer
							setCustomers(
								customers.map((c) =>
									c.id === editingCustomer.id
										? {
												...c,
												...customerData,
												updated_at: new Date().toISOString(),
										  }
										: c
								)
							);
						} else {
							// Add new customer
							const newCustomer: Customer = {
								id: Date.now().toString(),
								...customerData,
								total_orders: 0,
								total_spent: 0,
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							} as Customer;
							setCustomers([...customers, newCustomer]);
						}
					}}
				/>
			)}

			{selectedCustomer && (
				<CustomerDetailModal
					customer={selectedCustomer}
					onClose={() => setSelectedCustomer(null)}
				/>
			)}
		</div>
	);
}
