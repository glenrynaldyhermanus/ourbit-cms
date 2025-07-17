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
	Badge,
	DollarSign,
	Clock,
	CheckCircle,
	XCircle,
	UserCheck,
	UserX,
} from "lucide-react";

interface Staff {
	id: string;
	name: string;
	email: string;
	phone: string;
	position: string;
	department: string;
	salary: number;
	status: "active" | "inactive" | "on_leave";
	employment_type: "full_time" | "part_time" | "contract" | "intern";
	hire_date: string;
	address?: string;
	store_id: string;
	store_name: string;
	emergency_contact?: string;
	emergency_phone?: string;
	created_at: string;
	updated_at: string;
}

// Mock staff data - replace with Supabase data later
const mockStaff: Staff[] = [
	{
		id: "1",
		name: "Ahmad Rizky",
		email: "ahmad.rizky@ourbit.com",
		phone: "+62 812-3456-7890",
		position: "Store Manager",
		department: "Operations",
		salary: 8000000,
		status: "active",
		employment_type: "full_time",
		hire_date: "2023-01-15",
		address: "Jl. Sudirman No. 123, Jakarta Pusat",
		store_id: "1",
		store_name: "OURBIT Central Store",
		emergency_contact: "Siti Rizky",
		emergency_phone: "+62 813-1111-2222",
		created_at: "2023-01-15",
		updated_at: "2024-07-15",
	},
	{
		id: "2",
		name: "Siti Nurhaliza",
		email: "siti.nur@ourbit.com",
		phone: "+62 813-9876-5432",
		position: "Cashier",
		department: "Sales",
		salary: 4500000,
		status: "active",
		employment_type: "full_time",
		hire_date: "2023-02-20",
		address: "Jl. Gatot Subroto No. 45, Bandung",
		store_id: "2",
		store_name: "OURBIT Mall Kelapa Gading",
		emergency_contact: "Budi Nurhaliza",
		emergency_phone: "+62 814-3333-4444",
		created_at: "2023-02-20",
		updated_at: "2024-07-14",
	},
	{
		id: "3",
		name: "Budi Santoso",
		email: "budi.santoso@ourbit.com",
		phone: "+62 814-5555-1234",
		position: "Sales Associate",
		department: "Sales",
		salary: 3800000,
		status: "active",
		employment_type: "part_time",
		hire_date: "2023-03-10",
		address: "Jl. Diponegoro No. 67, Surabaya",
		store_id: "1",
		store_name: "OURBIT Central Store",
		emergency_contact: "Maya Santoso",
		emergency_phone: "+62 815-5555-6666",
		created_at: "2023-03-10",
		updated_at: "2024-07-13",
	},
	{
		id: "4",
		name: "Maya Dewi",
		email: "maya.dewi@ourbit.com",
		phone: "+62 815-7777-8888",
		position: "Inventory Clerk",
		department: "Operations",
		salary: 4200000,
		status: "on_leave",
		employment_type: "full_time",
		hire_date: "2023-04-05",
		address: "Jl. Ahmad Yani No. 89, Yogyakarta",
		store_id: "4",
		store_name: "OURBIT Warehouse",
		emergency_contact: "Eko Dewi",
		emergency_phone: "+62 816-7777-8888",
		created_at: "2023-04-05",
		updated_at: "2024-07-12",
	},
	{
		id: "5",
		name: "Eko Prasetyo",
		email: "eko.p@ourbit.com",
		phone: "+62 816-1111-2222",
		position: "Assistant Manager",
		department: "Operations",
		salary: 6500000,
		status: "active",
		employment_type: "full_time",
		hire_date: "2023-05-20",
		address: "Jl. Braga No. 67, Bandung",
		store_id: "5",
		store_name: "OURBIT Bandung Branch",
		emergency_contact: "Rina Prasetyo",
		emergency_phone: "+62 817-9999-0000",
		created_at: "2023-05-20",
		updated_at: "2024-07-11",
	},
	{
		id: "6",
		name: "Rina Sari",
		email: "rina.sari@ourbit.com",
		phone: "+62 817-3333-4444",
		position: "Barista",
		department: "F&B",
		salary: 3500000,
		status: "inactive",
		employment_type: "contract",
		hire_date: "2023-06-15",
		store_id: "3",
		store_name: "OURBIT Bekasi Outlet",
		emergency_contact: "Anton Sari",
		emergency_phone: "+62 818-1111-2222",
		created_at: "2023-06-15",
		updated_at: "2024-07-01",
	},
];

export default function StaffPage() {
	const [staff, setStaff] = useState<Staff[]>(mockStaff);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [departmentFilter, setDepartmentFilter] = useState("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
	const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

	const filteredStaff = staff.filter((member) => {
		const matchesSearch =
			member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.store_name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || member.status === statusFilter;
		const matchesDepartment =
			departmentFilter === "all" || member.department === departmentFilter;
		return matchesSearch && matchesStatus && matchesDepartment;
	});

	const totalStaff = staff.length;
	const activeStaff = staff.filter((s) => s.status === "active").length;
	const totalSalary = staff
		.filter((s) => s.status === "active")
		.reduce((sum, member) => sum + member.salary, 0);
	const departments = [
		"all",
		...Array.from(new Set(staff.map((s) => s.department))),
	];

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
			case "on_leave":
				return {
					label: "Cuti",
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

	const getEmploymentTypeInfo = (type: string) => {
		switch (type) {
			case "full_time":
				return { label: "Full Time", color: "bg-blue-100 text-blue-800" };
			case "part_time":
				return { label: "Part Time", color: "bg-purple-100 text-purple-800" };
			case "contract":
				return { label: "Kontrak", color: "bg-orange-100 text-orange-800" };
			case "intern":
				return { label: "Magang", color: "bg-gray-100 text-gray-800" };
			default:
				return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
		}
	};

	const handleDeleteStaff = (staffId: string) => {
		if (confirm("Apakah Anda yakin ingin menghapus data karyawan ini?")) {
			setStaff(staff.filter((s) => s.id !== staffId));
		}
	};

	const toggleStaffStatus = (staffId: string) => {
		setStaff(
			staff.map((s) => {
				if (s.id === staffId) {
					const newStatus = s.status === "active" ? "inactive" : "active";
					return { ...s, status: newStatus };
				}
				return s;
			})
		);
	};

	const StaffForm = ({
		staffMember,
		onClose,
		onSave,
	}: {
		staffMember?: Staff | null;
		onClose: () => void;
		onSave: (staff: Partial<Staff>) => void;
	}) => {
		const [formData, setFormData] = useState({
			name: staffMember?.name || "",
			email: staffMember?.email || "",
			phone: staffMember?.phone || "",
			position: staffMember?.position || "",
			department: staffMember?.department || "Sales",
			salary: staffMember?.salary || 0,
			employment_type: staffMember?.employment_type || "full_time",
			hire_date:
				staffMember?.hire_date || new Date().toISOString().split("T")[0],
			address: staffMember?.address || "",
			store_id: staffMember?.store_id || "1",
			store_name: staffMember?.store_name || "OURBIT Central Store",
			emergency_contact: staffMember?.emergency_contact || "",
			emergency_phone: staffMember?.emergency_phone || "",
		});

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			onSave(formData);
			onClose();
		};

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
					<h3 className="text-lg font-semibold mb-4">
						{staffMember ? "Edit Karyawan" : "Tambah Karyawan Baru"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
									placeholder="Nama lengkap karyawan"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email *
								</label>
								<input
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="email@ourbit.com"
									required
								/>
							</div>
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
									placeholder="+62 812-3456-7890"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Posisi *
								</label>
								<input
									type="text"
									value={formData.position}
									onChange={(e) =>
										setFormData({ ...formData, position: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Cashier, Manager, dll"
									required
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Departemen *
								</label>
								<select
									value={formData.department}
									onChange={(e) =>
										setFormData({ ...formData, department: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required>
									<option value="Sales">Sales</option>
									<option value="Operations">Operations</option>
									<option value="F&B">F&B</option>
									<option value="IT">IT</option>
									<option value="HR">HR</option>
									<option value="Finance">Finance</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Tipe Karyawan *
								</label>
								<select
									value={formData.employment_type}
									onChange={(e) =>
										setFormData({
											...formData,
											employment_type: e.target.value as
												| "full_time"
												| "part_time"
												| "contract"
												| "intern",
										})
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required>
									<option value="full_time">Full Time</option>
									<option value="part_time">Part Time</option>
									<option value="contract">Kontrak</option>
									<option value="intern">Magang</option>
								</select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Gaji (IDR) *
								</label>
								<input
									type="number"
									value={formData.salary}
									onChange={(e) =>
										setFormData({ ...formData, salary: Number(e.target.value) })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="5000000"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Tanggal Bergabung *
								</label>
								<input
									type="date"
									value={formData.hire_date}
									onChange={(e) =>
										setFormData({ ...formData, hire_date: e.target.value })
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
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
								placeholder="Alamat lengkap karyawan"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Kontak Darurat
								</label>
								<input
									type="text"
									value={formData.emergency_contact}
									onChange={(e) =>
										setFormData({
											...formData,
											emergency_contact: e.target.value,
										})
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Nama kontak darurat"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Telepon Darurat
								</label>
								<input
									type="tel"
									value={formData.emergency_phone}
									onChange={(e) =>
										setFormData({
											...formData,
											emergency_phone: e.target.value,
										})
									}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="+62 812-3456-7890"
								/>
							</div>
						</div>

						<div className="flex space-x-2 pt-4">
							<button
								type="submit"
								className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
								{staffMember ? "Update" : "Tambah"}
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

	const StaffDetailModal = ({
		staffMember,
		onClose,
	}: {
		staffMember: Staff;
		onClose: () => void;
	}) => {
		const statusInfo = getStatusInfo(staffMember.status);
		const employmentInfo = getEmploymentTypeInfo(staffMember.employment_type);

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-xl font-semibold">Detail Karyawan</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600">
							✕
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Personal Info */}
						<div className="space-y-4">
							<h4 className="font-semibold text-gray-900">
								Informasi Personal
							</h4>
							<div className="space-y-3">
								<div className="flex items-center">
									<Users className="w-4 h-4 text-gray-400 mr-2" />
									<div>
										<p className="font-medium">{staffMember.name}</p>
										<p className="text-sm text-gray-600">
											{staffMember.position}
										</p>
									</div>
								</div>
								<div className="flex items-center">
									<Mail className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">{staffMember.email}</span>
								</div>
								<div className="flex items-center">
									<Phone className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">{staffMember.phone}</span>
								</div>
								{staffMember.address && (
									<div className="flex items-start">
										<MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
										<span className="text-sm">{staffMember.address}</span>
									</div>
								)}
								<div className="flex items-center">
									<Calendar className="w-4 h-4 text-gray-400 mr-2" />
									<span className="text-sm">
										Bergabung: {formatDate(staffMember.hire_date)}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${employmentInfo.color}`}>
										{employmentInfo.label}
									</span>
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
										{statusInfo.label}
									</span>
								</div>
							</div>
						</div>

						{/* Work Info */}
						<div className="space-y-4">
							<h4 className="font-semibold text-gray-900">
								Informasi Pekerjaan
							</h4>
							<div className="space-y-3">
								<div className="bg-blue-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-blue-600">Departemen</span>
										<span className="font-semibold text-blue-900">
											{staffMember.department}
										</span>
									</div>
								</div>
								<div className="bg-green-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-green-600">Gaji</span>
										<span className="font-semibold text-green-900">
											{formatCurrency(staffMember.salary)}
										</span>
									</div>
								</div>
								<div className="bg-purple-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-purple-600">Toko</span>
										<span className="font-semibold text-purple-900">
											{staffMember.store_name}
										</span>
									</div>
								</div>
								{staffMember.emergency_contact && (
									<div className="bg-orange-50 p-3 rounded-lg">
										<div className="text-sm text-orange-600 mb-1">
											Kontak Darurat
										</div>
										<div className="font-semibold text-orange-900">
											{staffMember.emergency_contact}
										</div>
										{staffMember.emergency_phone && (
											<div className="text-sm text-orange-700">
												{staffMember.emergency_phone}
											</div>
										)}
									</div>
								)}
								<div className="bg-gray-50 p-3 rounded-lg">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Last Updated</span>
										<span className="font-semibold text-gray-900">
											{formatDate(staffMember.updated_at)}
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
					<h1 className="text-3xl font-bold text-gray-900">
						Manajemen Karyawan
					</h1>
					<p className="text-gray-600">Kelola data karyawan dan staff toko</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
					<Plus className="w-4 h-4" />
					<span>Tambah Karyawan</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Total Karyawan
							</p>
							<p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<Users className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Karyawan Aktif
							</p>
							<p className="text-2xl font-bold text-gray-900">{activeStaff}</p>
						</div>
						<div className="p-3 bg-green-50 rounded-full">
							<UserCheck className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Total Gaji/Bulan
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{formatCurrency(totalSalary)}
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
							<p className="text-sm font-medium text-gray-600">Departemen</p>
							<p className="text-2xl font-bold text-gray-900">
								{departments.length - 1}
							</p>
						</div>
						<div className="p-3 bg-yellow-50 rounded-full">
							<Badge className="w-6 h-6 text-yellow-600" />
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
							placeholder="Cari nama, email, posisi, atau toko..."
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
							<option value="on_leave">Cuti</option>
						</select>
						<select
							value={departmentFilter}
							onChange={(e) => setDepartmentFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
							{departments.map((dept) => (
								<option key={dept} value={dept}>
									{dept === "all" ? "Semua Departemen" : dept}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Staff Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Karyawan
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Kontak
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Posisi & Departemen
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Toko
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Gaji
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
							{filteredStaff.map((member) => {
								const statusInfo = getStatusInfo(member.status);
								const employmentInfo = getEmploymentTypeInfo(
									member.employment_type
								);

								return (
									<tr key={member.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
													<Users className="w-5 h-5 text-blue-600" />
												</div>
												<div>
													<div className="text-sm font-medium text-gray-900">
														{member.name}
													</div>
													<div className="text-sm text-gray-500">
														{employmentInfo.label} • Bergabung{" "}
														{formatDate(member.hire_date)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												<div className="flex items-center mb-1">
													<Mail className="w-3 h-3 text-gray-400 mr-1" />
													{member.email}
												</div>
												<div className="flex items-center">
													<Phone className="w-3 h-3 text-gray-400 mr-1" />
													{member.phone}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												<div className="font-medium">{member.position}</div>
												<span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
													{member.department}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{member.store_name}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatCurrency(member.salary)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<button
												onClick={() => toggleStaffStatus(member.id)}
												className={`px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 ${statusInfo.color}`}>
												{statusInfo.label}
											</button>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() => setSelectedStaff(member)}
													className="text-blue-600 hover:text-blue-900"
													title="Lihat Detail">
													<Users className="w-4 h-4" />
												</button>
												<button
													onClick={() => setEditingStaff(member)}
													className="text-green-600 hover:text-green-900"
													title="Edit">
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDeleteStaff(member.id)}
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
				{filteredStaff.length === 0 && (
					<div className="text-center py-12">
						<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Tidak ada karyawan ditemukan
						</h3>
						<p className="text-gray-600">
							Coba ubah kata kunci pencarian atau tambah karyawan baru.
						</p>
					</div>
				)}
			</div>

			{/* Modals */}
			{(showAddModal || editingStaff) && (
				<StaffForm
					staffMember={editingStaff}
					onClose={() => {
						setShowAddModal(false);
						setEditingStaff(null);
					}}
					onSave={(staffData) => {
						if (editingStaff) {
							// Update existing staff
							setStaff(
								staff.map((s) =>
									s.id === editingStaff.id
										? {
												...s,
												...staffData,
												updated_at: new Date().toISOString(),
										  }
										: s
								)
							);
						} else {
							// Add new staff
							const newStaff: Staff = {
								id: Date.now().toString(),
								...staffData,
								status: "active",
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							} as Staff;
							setStaff([...staff, newStaff]);
						}
					}}
				/>
			)}

			{selectedStaff && (
				<StaffDetailModal
					staffMember={selectedStaff}
					onClose={() => setSelectedStaff(null)}
				/>
			)}
		</div>
	);
}
