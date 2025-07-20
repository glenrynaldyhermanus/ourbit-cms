"use client";

import { useState, useEffect, useMemo } from "react";
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
	Bell,
	Check,
	AlertCircle,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable, Column, Divider, Input, Select } from "@/components/ui";
import { supabase } from "@/lib/supabase";

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
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [departmentFilter, setDepartmentFilter] = useState("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
	const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
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

	// Filter staff by search and filters - optimized with useMemo
	const filteredStaff = useMemo(() => {
		return staff.filter((member) => {
			const matchesSearch =
				member.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
				member.email
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				member.position
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				member.store_name
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === "all" || member.status === statusFilter;
			const matchesDepartment =
				departmentFilter === "all" || member.department === departmentFilter;
			return matchesSearch && matchesStatus && matchesDepartment;
		});
	}, [staff, debouncedSearchTerm, statusFilter, departmentFilter]);

	// Calculate stats - optimized with useMemo
	const stats = useMemo(() => {
		const totalStaff = staff.length;
		const activeStaff = staff.filter((s) => s.status === "active").length;
		const totalSalary = staff
			.filter((s) => s.status === "active")
			.reduce((sum, member) => sum + member.salary, 0);
		const averageSalary = activeStaff > 0 ? totalSalary / activeStaff : 0;

		return {
			totalStaff,
			activeStaff,
			totalSalary,
			averageSalary: Math.round(averageSalary),
		};
	}, [staff]);

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
					icon: CheckCircle,
					color: "bg-green-100 text-green-800",
					text: "Aktif",
				};
			case "inactive":
				return {
					icon: XCircle,
					color: "bg-red-100 text-red-800",
					text: "Nonaktif",
				};
			case "on_leave":
				return {
					icon: Clock,
					color: "bg-yellow-100 text-yellow-800",
					text: "Cuti",
				};
			default:
				return {
					icon: UserX,
					color: "bg-gray-100 text-gray-800",
					text: "Tidak Diketahui",
				};
		}
	};

	const getEmploymentTypeInfo = (type: string) => {
		switch (type) {
			case "full_time":
				return "Full Time";
			case "part_time":
				return "Part Time";
			case "contract":
				return "Kontrak";
			case "intern":
				return "Magang";
			default:
				return type;
		}
	};

	const handleDeleteStaff = (staffId: string) => {
		// Handle delete staff
		console.log("Delete staff:", staffId);
	};

	const toggleStaffStatus = (staffId: string) => {
		// Handle toggle staff status
		console.log("Toggle staff status:", staffId);
	};

	// Define columns for DataTable - memoized to prevent re-renders
	const columns: Column<Staff>[] = useMemo(
		() => [
			{
				key: "staff",
				header: "Staff",
				sortable: true,
				sortKey: "name",
				render: (member) => (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<Users className="w-5 h-5 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{member.name}
							</p>
							<p className="text-sm text-gray-500 truncate">
								{member.position} • {member.store_name}
							</p>
						</div>
					</div>
				),
			},
			{
				key: "contact",
				header: "Kontak",
				sortable: false,
				render: (member) => (
					<div className="space-y-1">
						<div className="flex items-center text-sm text-gray-900">
							<Mail className="w-3 h-3 mr-1 text-gray-400" />
							{member.email}
						</div>
						<div className="flex items-center text-sm text-gray-600">
							<Phone className="w-3 h-3 mr-1 text-gray-400" />
							{member.phone}
						</div>
					</div>
				),
			},
			{
				key: "department",
				header: "Departemen",
				sortable: true,
				sortKey: "department",
				render: (member) => (
					<div className="text-sm font-medium text-gray-900">
						{member.department}
					</div>
				),
			},
			{
				key: "salary",
				header: "Gaji",
				sortable: true,
				sortKey: "salary",
				render: (member) => (
					<div className="text-sm font-medium text-gray-900">
						{formatCurrency(member.salary)}
					</div>
				),
			},
			{
				key: "status",
				header: "Status",
				sortable: true,
				sortKey: "status",
				render: (member) => {
					const statusInfo = getStatusInfo(member.status);
					const StatusIcon = statusInfo.icon;
					return (
						<div className="flex items-center space-x-2">
							<span
								className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
								<StatusIcon className="w-3 h-3 mr-1" />
								{statusInfo.text}
							</span>
						</div>
					);
				},
			},
			{
				key: "hire_date",
				header: "Tanggal Bergabung",
				sortable: true,
				sortKey: "hire_date",
				render: (member) => (
					<div className="text-sm text-gray-900">
						{formatDate(member.hire_date)}
					</div>
				),
			},
			{
				key: "actions",
				header: "",
				sortable: false,
				render: (member) => (
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setSelectedStaff(member)}
							className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
							title="Lihat Detail">
							<Edit2 className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleDeleteStaff(member.id)}
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
						title="Manajemen Staff"
						subtitle="Kelola data karyawan toko Anda"
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
								title="Total Staff"
								value={stats.totalStaff}
								icon={Users}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Staff Aktif"
								value={stats.activeStaff}
								icon={UserCheck}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Total Gaji"
								value={formatCurrency(stats.totalSalary)}
								icon={DollarSign}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Rata-rata Gaji"
								value={formatCurrency(stats.averageSalary)}
								icon={DollarSign}
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
									placeholder="Cari staff berdasarkan nama, email, posisi, atau toko..."
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
											: "Cuti"
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
										value="on_leave"
										onClick={() => setStatusFilter("on_leave")}
										selected={statusFilter === "on_leave"}>
										Cuti
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div className="md:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										departmentFilter === "all"
											? "Semua Departemen"
											: departmentFilter
									}
									placeholder="Filter Departemen"
								/>
								<Select.Content>
									{departments.map((dept) => (
										<Select.Item
											key={dept}
											value={dept}
											onClick={() => setDepartmentFilter(dept)}
											selected={departmentFilter === dept}>
											{dept === "all" ? "Semua Departemen" : dept}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</div>
						<div className="md:w-auto">
							<button
								onClick={() => setShowAddModal(true)}
								className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
								<Plus className="w-4 h-4" />
								<span>Tambah</span>
							</button>
						</div>
					</div>

					{/* Staff Table */}
					<div
						className="animate-fade-in-up"
						style={{ animationDelay: "150ms" }}>
						<DataTable
							data={filteredStaff}
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
