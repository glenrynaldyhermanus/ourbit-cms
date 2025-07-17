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

// Mock suppliers data - in production this would come from Supabase
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
		last_order_date: "2024-07-08",
		rating: 4.0,
		status: "active",
		payment_terms: "NET 7",
		created_at: "2024-03-10",
		updated_at: "2024-07-08",
	},
	{
		id: "5",
		name: "Toko Bahan Kue Makmur",
		company: "UD Makmur Jaya",
		phone: "+62 21-9999-5555",
		address: "Pasar Besar, Jakarta Pusat",
		contact_person: "Pak Slamet",
		total_orders: 65,
		total_value: 38500000,
		last_order_date: "2024-07-13",
		rating: 3.8,
		status: "inactive",
		payment_terms: "COD",
		created_at: "2024-01-20",
		updated_at: "2024-07-13",
	},
];

export default function SuppliersPage() {
	const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [showAddSlider, setShowAddSlider] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const filteredSuppliers = suppliers.filter((supplier) => {
		const matchesSearch =
			supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus = !statusFilter || supplier.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const totalValue = suppliers.reduce(
		(sum, supplier) => sum + supplier.total_value,
		0
	);
	const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
	const averageRating =
		suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) /
		suppliers.length;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const handleDeleteSupplier = (supplierId: string) => {
		if (confirm("Apakah Anda yakin ingin menghapus supplier ini?")) {
			setSuppliers(suppliers.filter((s) => s.id !== supplierId));
		}
	};

	const SupplierSlider = ({
		supplier,
		isOpen,
		onClose,
	}: {
		supplier?: Supplier | null;
		isOpen: boolean;
		onClose: () => void;
	}) => {
		const [formData, setFormData] = useState({
			name: supplier?.name || "",
			company: supplier?.company || "",
			email: supplier?.email || "",
			phone: supplier?.phone || "",
			address: supplier?.address || "",
			contact_person: supplier?.contact_person || "",
			payment_terms: supplier?.payment_terms || "NET 30",
			status: supplier?.status || "active",
		});
		const [isAnimating, setIsAnimating] = useState(false);

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			if (formData.name.trim() && formData.company.trim()) {
				setSaving(true);
				try {
					// In production, this would save to Supabase
					const supplierData = {
						...formData,
						rating: supplier?.rating || 0,
						total_orders: supplier?.total_orders || 0,
						total_value: supplier?.total_value || 0,
						updated_at: new Date().toISOString(),
					};

					if (supplier) {
						// Update existing supplier
						setSuppliers(
							suppliers.map((s) =>
								s.id === supplier.id ? { ...s, ...supplierData } : s
							)
						);
					} else {
						// Add new supplier
						const newSupplier: Supplier = {
							id: Date.now().toString(),
							...supplierData,
							total_orders: 0,
							total_value: 0,
							rating: 0,
							created_at: new Date().toISOString(),
						} as Supplier;
						setSuppliers([...suppliers, newSupplier]);
					}

					onClose();
					resetForm();
				} catch (error) {
					console.error("Error:", error);
					alert("Gagal menyimpan supplier!");
				} finally {
					setSaving(false);
				}
			}
		};

		const resetForm = () => {
			setFormData({
				name: "",
				company: "",
				email: "",
				phone: "",
				address: "",
				contact_person: "",
				payment_terms: "NET 30",
				status: "active",
			});
		};

		const handleClose = () => {
			setIsAnimating(false);
			setTimeout(() => {
				onClose();
				resetForm();
			}, 300);
		};

		// Trigger animation when opening
		React.useEffect(() => {
			if (isOpen) {
				setTimeout(() => setIsAnimating(true), 10);
			} else {
				setIsAnimating(false);
			}
		}, [isOpen]);

		// Update form data when supplier changes
		React.useEffect(() => {
			if (supplier) {
				setFormData({
					name: supplier.name,
					company: supplier.company,
					email: supplier.email || "",
					phone: supplier.phone || "",
					address: supplier.address || "",
					contact_person: supplier.contact_person || "",
					payment_terms: supplier.payment_terms,
					status: supplier.status,
				});
			} else {
				resetForm();
			}
		}, [supplier]);

		if (!isOpen) return null;

		return (
			<div className="fixed inset-0 z-40">
				{/* Backdrop */}
				<div
					className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
						isAnimating ? "opacity-50" : "opacity-0"
					}`}
					onClick={handleClose}
				/>

				{/* Slider Panel */}
				<div
					className={`absolute top-0 right-0 h-full w-96 bg-white shadow-xl z-10 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
						isAnimating ? "translate-x-0" : "translate-x-full"
					}`}>
					<div className="flex flex-col h-full">
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
							<h2 className="text-xl font-medium text-[#191919] font-['Inter_Tight']">
								{supplier ? "Edit Supplier" : "Tambah Supplier"}
							</h2>
							<button
								onClick={handleClose}
								disabled={saving}
								className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
								<X className="w-5 h-5 text-[#4A4A4A]" />
							</button>
						</div>

						{/* Form Content */}
						<div className="flex-1 p-6">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Supplier Name */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Nama Supplier <span className="text-[#EF476F]">*</span>
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
										placeholder="Masukkan nama supplier"
										required
										disabled={saving}
									/>
								</div>

								{/* Company Name */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Nama Perusahaan <span className="text-[#EF476F]">*</span>
									</label>
									<input
										type="text"
										value={formData.company}
										onChange={(e) =>
											setFormData({ ...formData, company: e.target.value })
										}
										className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
										placeholder="Masukkan nama perusahaan"
										required
										disabled={saving}
									/>
								</div>

								{/* Contact Person */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Kontak Person
									</label>
									<input
										type="text"
										value={formData.contact_person}
										onChange={(e) =>
											setFormData({
												...formData,
												contact_person: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
										placeholder="Nama kontak person"
										disabled={saving}
									/>
								</div>

								{/* Email and Phone Row */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
											Email
										</label>
										<input
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
											className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
											placeholder="supplier@email.com"
											disabled={saving}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
											Telepon
										</label>
										<input
											type="tel"
											value={formData.phone}
											onChange={(e) =>
												setFormData({ ...formData, phone: e.target.value })
											}
											className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
											placeholder="+62 21-1234-5678"
											disabled={saving}
										/>
									</div>
								</div>

								{/* Address */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Alamat
									</label>
									<textarea
										value={formData.address}
										onChange={(e) =>
											setFormData({ ...formData, address: e.target.value })
										}
										rows={3}
										className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
										placeholder="Alamat lengkap supplier"
										disabled={saving}
									/>
								</div>

								{/* Payment Terms and Status Row */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
											Term Pembayaran
										</label>
										<select
											value={formData.payment_terms}
											onChange={(e) =>
												setFormData({
													...formData,
													payment_terms: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
											disabled={saving}>
											<option value="COD">COD (Cash on Delivery)</option>
											<option value="NET 7">NET 7 (7 Hari)</option>
											<option value="NET 15">NET 15 (15 Hari)</option>
											<option value="NET 30">NET 30 (30 Hari)</option>
											<option value="NET 45">NET 45 (45 Hari)</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
											Status
										</label>
										<select
											value={formData.status}
											onChange={(e) =>
												setFormData({
													...formData,
													status: e.target.value as "active" | "inactive",
												})
											}
											className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
											disabled={saving}>
											<option value="active">Aktif</option>
											<option value="inactive">Tidak Aktif</option>
										</select>
									</div>
								</div>
							</form>
						</div>

						{/* Footer */}
						<div className="p-6 border-t border-gray-200 bg-white">
							<div className="flex space-x-3">
								<button
									onClick={handleClose}
									disabled={saving}
									className="flex-1 px-4 py-2 text-[#4A4A4A] bg-[#F3F4F6] border border-[#D1D5DB] rounded-lg hover:bg-[#E5E7EB] transition-colors font-medium font-['Inter'] disabled:opacity-50">
									Batal
								</button>
								<button
									onClick={handleSubmit}
									disabled={
										!formData.name.trim() || !formData.company.trim() || saving
									}
									className="flex-1 px-4 py-2 bg-[#FF5701] text-white rounded-lg hover:bg-[#E04E00] disabled:bg-[#D1D5DB] disabled:cursor-not-allowed transition-colors font-medium font-['Inter'] flex items-center justify-center">
									{saving ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
											{supplier ? "Memperbarui..." : "Menyimpan..."}
										</>
									) : supplier ? (
										"Perbarui"
									) : (
										"Simpan"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-[#EFEDED] p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-semibold text-[#191919] mb-2 font-['Inter_Tight']">
							Manajemen Supplier
						</h1>
						<p className="text-[#4A4A4A] font-['Inter']">
							Kelola data supplier dan partner bisnis Anda
						</p>
					</div>
					<button
						onClick={() => setShowAddSlider(true)}
						disabled={loading}
						className="bg-[#FF5701] text-white px-6 py-3 rounded-lg hover:bg-[#E04E00] transition-colors flex items-center space-x-2 font-medium font-['Inter'] disabled:opacity-50">
						<Plus className="w-5 h-5" />
						<span>Tambah Supplier</span>
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Total Supplier
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
									{suppliers.length}
								</p>
							</div>
							<div className="p-3 bg-[#FF5701]/10 rounded-full">
								<Building2 className="w-6 h-6 text-[#FF5701]" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Supplier Aktif
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
									{activeSuppliers}
								</p>
							</div>
							<div className="p-3 bg-[#249689]/10 rounded-full">
								<TrendingUp className="w-6 h-6 text-[#249689]" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Total Nilai Order
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
									{formatCurrency(totalValue)}
								</p>
							</div>
							<div className="p-3 bg-[#FFD166]/10 rounded-full">
								<DollarSign className="w-6 h-6 text-[#FFD166]" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Rata-rata Rating
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
									{averageRating.toFixed(1)}
								</p>
							</div>
							<div className="p-3 bg-[#EF476F]/10 rounded-full">
								<Star className="w-6 h-6 text-[#EF476F]" />
							</div>
						</div>
					</div>
				</div>

				{/* Search and Filter */}
				<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A4A4A] w-4 h-4" />
							<input
								type="text"
								placeholder="Cari supplier berdasarkan nama, perusahaan, atau kontak..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								disabled={loading}
								className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter'] disabled:opacity-50"
							/>
						</div>
						<div className="md:w-48">
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								disabled={loading}
								className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter'] disabled:opacity-50">
								<option value="">Semua Status</option>
								<option value="active">Aktif</option>
								<option value="inactive">Tidak Aktif</option>
							</select>
						</div>
					</div>
				</div>

				{/* Suppliers Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredSuppliers.map((supplier) => (
						<div
							key={supplier.id}
							className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6 hover:shadow-md transition-shadow">
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-lg font-medium text-[#191919] font-['Inter_Tight']">
											{supplier.name}
										</h3>
										<div
											className={`px-2 py-1 text-xs font-medium rounded-full font-['Inter'] ${
												supplier.status === "active"
													? "bg-[#249689]/10 text-[#249689]"
													: "bg-[#EF476F]/10 text-[#EF476F]"
											}`}>
											{supplier.status === "active" ? "Aktif" : "Tidak Aktif"}
										</div>
									</div>
									<p className="text-[#4A4A4A] text-sm mb-3 font-['Inter']">
										{supplier.company}
									</p>

									{supplier.contact_person && (
										<div className="flex items-center text-[#4A4A4A] text-sm mb-1 font-['Inter']">
											<User className="w-4 h-4 mr-2" />
											<span>{supplier.contact_person}</span>
										</div>
									)}
									{supplier.email && (
										<div className="flex items-center text-[#4A4A4A] text-sm mb-1 font-['Inter']">
											<Mail className="w-4 h-4 mr-2" />
											<span className="truncate">{supplier.email}</span>
										</div>
									)}
									{supplier.phone && (
										<div className="flex items-center text-[#4A4A4A] text-sm mb-1 font-['Inter']">
											<Phone className="w-4 h-4 mr-2" />
											<span>{supplier.phone}</span>
										</div>
									)}
									{supplier.address && (
										<div className="flex items-center text-[#4A4A4A] text-sm mb-3 font-['Inter']">
											<MapPin className="w-4 h-4 mr-2" />
											<span className="truncate">{supplier.address}</span>
										</div>
									)}
								</div>
								<div className="flex space-x-2 ml-4">
									<button
										onClick={() => setEditingSupplier(supplier)}
										className="p-1.5 text-[#4A4A4A] hover:text-[#FF5701] hover:bg-[#FF5701]/10 rounded transition-colors">
										<Edit2 className="w-4 h-4" />
									</button>
									<button
										onClick={() => handleDeleteSupplier(supplier.id)}
										className="p-1.5 text-[#4A4A4A] hover:text-[#EF476F] hover:bg-[#EF476F]/10 rounded transition-colors">
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>

							{/* Stats */}
							<div className="border-t border-gray-100 pt-4 space-y-2">
								<div className="flex justify-between text-xs text-[#4A4A4A] font-['Inter']">
									<span>Total Order:</span>
									<span className="font-medium">{supplier.total_orders}</span>
								</div>
								<div className="flex justify-between text-xs text-[#4A4A4A] font-['Inter']">
									<span>Total Nilai:</span>
									<span className="font-medium">
										{formatCurrency(supplier.total_value)}
									</span>
								</div>
								<div className="flex justify-between text-xs text-[#4A4A4A] font-['Inter']">
									<span>Rating:</span>
									<div className="flex items-center">
										<Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
										<span className="font-medium">
											{supplier.rating.toFixed(1)}
										</span>
									</div>
								</div>
								<div className="flex justify-between text-xs text-[#4A4A4A] font-['Inter']">
									<span>Payment:</span>
									<span className="font-medium">{supplier.payment_terms}</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Empty State */}
				{filteredSuppliers.length === 0 && (
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-12 text-center">
						<Building2 className="w-12 h-12 text-[#4A4A4A]/50 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-[#191919] mb-2 font-['Inter_Tight']">
							{searchTerm || statusFilter
								? "Tidak ada supplier ditemukan"
								: "Belum ada supplier"}
						</h3>
						<p className="text-[#4A4A4A] mb-6 font-['Inter']">
							{searchTerm || statusFilter
								? "Coba ubah kata kunci pencarian atau filter Anda."
								: "Mulai dengan menambahkan supplier pertama."}
						</p>
						{!searchTerm && !statusFilter && (
							<button
								onClick={() => setShowAddSlider(true)}
								className="bg-[#FF5701] text-white px-6 py-2 rounded-lg hover:bg-[#E04E00] transition-colors font-medium font-['Inter']">
								Tambah Supplier Pertama
							</button>
						)}
					</div>
				)}

				{/* Add/Edit Supplier Slider */}
				<SupplierSlider
					supplier={editingSupplier}
					isOpen={showAddSlider || !!editingSupplier}
					onClose={() => {
						setShowAddSlider(false);
						setEditingSupplier(null);
					}}
				/>
			</div>
		</div>
	);
}
