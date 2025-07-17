"use client";

import React, { useState, useEffect } from "react";
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
	X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Customer {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	address?: string;
	created_at: string;
}

export default function CustomersPage() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddSlider, setShowAddSlider] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Fetch customers from Supabase
	useEffect(() => {
		fetchCustomers();
	}, []);

	const fetchCustomers = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("customers")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching customers:", error);
				return;
			}

			setCustomers(data || []);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleDeleteCustomer = async (customerId: string) => {
		if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
			try {
				const { error } = await supabase
					.from("customers")
					.delete()
					.eq("id", customerId);

				if (error) {
					console.error("Error deleting customer:", error);
					alert("Gagal menghapus pelanggan!");
					return;
				}

				// Update local state
				setCustomers(customers.filter((c) => c.id !== customerId));
			} catch (error) {
				console.error("Error:", error);
				alert("Gagal menghapus pelanggan!");
			}
		}
	};

	const CustomerSlider = ({
		customer,
		isOpen,
		onClose,
	}: {
		customer?: Customer | null;
		isOpen: boolean;
		onClose: () => void;
	}) => {
		const [formData, setFormData] = useState({
			name: customer?.name || "",
			email: customer?.email || "",
			phone: customer?.phone || "",
			address: customer?.address || "",
		});
		const [isAnimating, setIsAnimating] = useState(false);

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			if (formData.name.trim()) {
				setSaving(true);
				try {
					const customerData = {
						name: formData.name.trim(),
						email: formData.email.trim() || null,
						phone: formData.phone.trim() || null,
						address: formData.address.trim() || null,
					};

					if (customer) {
						// Update existing customer
						const { error } = await supabase
							.from("customers")
							.update(customerData)
							.eq("id", customer.id);

						if (error) {
							console.error("Error updating customer:", error);
							alert("Gagal memperbarui pelanggan!");
							return;
						}
					} else {
						// Add new customer
						const { error } = await supabase
							.from("customers")
							.insert([customerData]);

						if (error) {
							console.error("Error adding customer:", error);
							alert("Gagal menambah pelanggan!");
							return;
						}
					}

					// Refresh customers list
					await fetchCustomers();
					onClose();
					resetForm();
				} catch (error) {
					console.error("Error:", error);
					alert("Gagal menyimpan pelanggan!");
				} finally {
					setSaving(false);
				}
			}
		};

		const resetForm = () => {
			setFormData({
				name: "",
				email: "",
				phone: "",
				address: "",
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

		// Update form data when customer changes
		React.useEffect(() => {
			if (customer) {
				setFormData({
					name: customer.name,
					email: customer.email || "",
					phone: customer.phone || "",
					address: customer.address || "",
				});
			} else {
				resetForm();
			}
		}, [customer]);

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
								{customer ? "Edit Pelanggan" : "Tambah Pelanggan"}
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
								{/* Customer Name */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Nama Pelanggan <span className="text-[#EF476F]">*</span>
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
										placeholder="Masukkan nama pelanggan"
										required
										disabled={saving}
									/>
								</div>

								{/* Email */}
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
										placeholder="pelanggan@email.com"
										disabled={saving}
									/>
								</div>

								{/* Phone */}
								<div>
									<label className="block text-sm font-medium text-[#191919] mb-2 font-['Inter']">
										Nomor Telepon
									</label>
									<input
										type="tel"
										value={formData.phone}
										onChange={(e) =>
											setFormData({ ...formData, phone: e.target.value })
										}
										className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter']"
										placeholder="+62 812-3456-7890"
										disabled={saving}
									/>
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
										placeholder="Alamat lengkap pelanggan"
										disabled={saving}
									/>
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
									disabled={!formData.name.trim() || saving}
									className="flex-1 px-4 py-2 bg-[#FF5701] text-white rounded-lg hover:bg-[#E04E00] disabled:bg-[#D1D5DB] disabled:cursor-not-allowed transition-colors font-medium font-['Inter'] flex items-center justify-center">
									{saving ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
											{customer ? "Memperbarui..." : "Menyimpan..."}
										</>
									) : customer ? (
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
							Manajemen Pelanggan
						</h1>
						<p className="text-[#4A4A4A] font-['Inter']">
							Kelola data pelanggan dan kontak mereka
						</p>
					</div>
					<button
						onClick={() => setShowAddSlider(true)}
						disabled={loading}
						className="bg-[#FF5701] text-white px-6 py-3 rounded-lg hover:bg-[#E04E00] transition-colors flex items-center space-x-2 font-medium font-['Inter'] disabled:opacity-50">
						<Plus className="w-5 h-5" />
						<span>Tambah Pelanggan</span>
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Total Pelanggan
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
									{loading ? "..." : customers.length}
								</p>
							</div>
							<div className="p-3 bg-[#FF5701]/10 rounded-full">
								<Users className="w-6 h-6 text-[#FF5701]" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Dengan Email
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
									{loading ? "..." : customers.filter((c) => c.email).length}
								</p>
							</div>
							<div className="p-3 bg-[#249689]/10 rounded-full">
								<Mail className="w-6 h-6 text-[#249689]" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-[#4A4A4A] font-['Inter']">
									Dengan Telepon
								</p>
								<p className="text-2xl font-semibold text-[#191919] font-['Inter_Tight']">
									{loading ? "..." : customers.filter((c) => c.phone).length}
								</p>
							</div>
							<div className="p-3 bg-[#FFD166]/10 rounded-full">
								<Phone className="w-6 h-6 text-[#FFD166]" />
							</div>
						</div>
					</div>
				</div>

				{/* Search */}
				<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A4A4A] w-4 h-4" />
						<input
							type="text"
							placeholder="Cari pelanggan berdasarkan nama, email, atau telepon..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							disabled={loading}
							className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#FF5701] focus:border-transparent text-[#191919] font-['Inter'] disabled:opacity-50"
						/>
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-12 text-center">
						<div className="w-8 h-8 border-2 border-[#FF5701] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<p className="text-[#4A4A4A] font-['Inter']">Memuat pelanggan...</p>
					</div>
				)}

				{/* Customers Grid */}
				{!loading && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredCustomers.map((customer) => (
							<div
								key={customer.id}
								className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6 hover:shadow-md transition-shadow">
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<h3 className="text-lg font-medium text-[#191919] font-['Inter_Tight'] mb-2">
											{customer.name}
										</h3>
										{customer.email && (
											<div className="flex items-center text-[#4A4A4A] text-sm mb-1 font-['Inter']">
												<Mail className="w-4 h-4 mr-2" />
												<span className="truncate">{customer.email}</span>
											</div>
										)}
										{customer.phone && (
											<div className="flex items-center text-[#4A4A4A] text-sm mb-1 font-['Inter']">
												<Phone className="w-4 h-4 mr-2" />
												<span>{customer.phone}</span>
											</div>
										)}
										{customer.address && (
											<div className="flex items-center text-[#4A4A4A] text-sm mb-1 font-['Inter']">
												<MapPin className="w-4 h-4 mr-2" />
												<span className="truncate">{customer.address}</span>
											</div>
										)}
									</div>
									<div className="flex space-x-2">
										<button
											onClick={() => setEditingCustomer(customer)}
											className="p-1.5 text-[#4A4A4A] hover:text-[#FF5701] hover:bg-[#FF5701]/10 rounded transition-colors">
											<Edit2 className="w-4 h-4" />
										</button>
										<button
											onClick={() => handleDeleteCustomer(customer.id)}
											className="p-1.5 text-[#4A4A4A] hover:text-[#EF476F] hover:bg-[#EF476F]/10 rounded transition-colors">
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
								<div className="flex items-center justify-between text-xs text-[#4A4A4A] font-['Inter']">
									<div className="flex items-center">
										<Calendar className="w-4 h-4 mr-1" />
										<span>
											Bergabung:{" "}
											{new Date(customer.created_at).toLocaleDateString(
												"id-ID"
											)}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Empty State */}
				{!loading && filteredCustomers.length === 0 && (
					<div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-12 text-center">
						<Users className="w-12 h-12 text-[#4A4A4A]/50 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-[#191919] mb-2 font-['Inter_Tight']">
							{searchTerm
								? "Tidak ada pelanggan ditemukan"
								: "Belum ada pelanggan"}
						</h3>
						<p className="text-[#4A4A4A] mb-6 font-['Inter']">
							{searchTerm
								? "Coba ubah kata kunci pencarian Anda."
								: "Mulai dengan menambahkan pelanggan pertama."}
						</p>
						{!searchTerm && (
							<button
								onClick={() => setShowAddSlider(true)}
								className="bg-[#FF5701] text-white px-6 py-2 rounded-lg hover:bg-[#E04E00] transition-colors font-medium font-['Inter']">
								Tambah Pelanggan Pertama
							</button>
						)}
					</div>
				)}

				{/* Add/Edit Customer Slider */}
				<CustomerSlider
					customer={editingCustomer}
					isOpen={showAddSlider || !!editingCustomer}
					onClose={() => {
						setShowAddSlider(false);
						setEditingCustomer(null);
					}}
				/>
			</div>
		</div>
	);
}
