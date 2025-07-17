"use client";

import { useState } from "react";

interface InventoryItem {
	id: string;
	product_name: string;
	sku: string;
	category: string;
	current_stock: number;
	min_stock: number;
	max_stock: number;
	unit: string;
	location: string;
	last_updated: string;
	supplier: string;
	cost_price: number;
	status: "in_stock" | "low_stock" | "out_of_stock" | "overstock";
}

interface StockMovement {
	id: string;
	product_name: string;
	sku: string;
	movement_type: "in" | "out" | "adjustment" | "transfer";
	quantity: number;
	reason: string;
	location_from?: string;
	location_to?: string;
	created_by: string;
	created_at: string;
	notes?: string;
}

export default function InventoriesPage() {
	const [activeTab, setActiveTab] = useState<"stock" | "movements">("stock");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
	const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

	// Mock data untuk inventory items
	const [inventoryItems] = useState<InventoryItem[]>([
		{
			id: "1",
			product_name: "Kopi Arabica Premium",
			sku: "KAP-001",
			category: "Beverages",
			current_stock: 150,
			min_stock: 50,
			max_stock: 500,
			unit: "kg",
			location: "Gudang Utama",
			last_updated: "2024-01-15T10:30:00Z",
			supplier: "CV Kopi Nusantara",
			cost_price: 85000,
			status: "in_stock",
		},
		{
			id: "2",
			product_name: "Croissant Mix",
			sku: "CRM-002",
			category: "Bakery",
			current_stock: 25,
			min_stock: 30,
			max_stock: 200,
			unit: "kg",
			location: "Gudang Utama",
			last_updated: "2024-01-14T15:20:00Z",
			supplier: "PT Bakery Supplies",
			cost_price: 45000,
			status: "low_stock",
		},
		{
			id: "3",
			product_name: "Gula Pasir",
			sku: "GLP-003",
			category: "Food",
			current_stock: 0,
			min_stock: 100,
			max_stock: 1000,
			unit: "kg",
			location: "Gudang Utama",
			last_updated: "2024-01-13T09:15:00Z",
			supplier: "PT Gula Manis",
			cost_price: 15000,
			status: "out_of_stock",
		},
		{
			id: "4",
			product_name: "Kemasan Paper Cup",
			sku: "KPC-004",
			category: "Packaging",
			current_stock: 5500,
			min_stock: 1000,
			max_stock: 5000,
			unit: "pcs",
			location: "Gudang Cabang Mall",
			last_updated: "2024-01-15T14:45:00Z",
			supplier: "CV Kemasan Kreatif",
			cost_price: 500,
			status: "overstock",
		},
		{
			id: "5",
			product_name: "Susu UHT Full Cream",
			sku: "SUF-005",
			category: "Beverages",
			current_stock: 200,
			min_stock: 100,
			max_stock: 800,
			unit: "liter",
			location: "Gudang Utama",
			last_updated: "2024-01-15T11:00:00Z",
			supplier: "PT Dairy Fresh",
			cost_price: 12000,
			status: "in_stock",
		},
	]);

	// Mock data untuk stock movements
	const [stockMovements] = useState<StockMovement[]>([
		{
			id: "1",
			product_name: "Kopi Arabica Premium",
			sku: "KAP-001",
			movement_type: "in",
			quantity: 100,
			reason: "Pembelian",
			created_by: "Admin",
			created_at: "2024-01-15T10:30:00Z",
			notes: "Pembelian rutin bulanan",
		},
		{
			id: "2",
			product_name: "Croissant Mix",
			sku: "CRM-002",
			movement_type: "out",
			quantity: 15,
			reason: "Penjualan",
			created_by: "Kasir 1",
			created_at: "2024-01-14T15:20:00Z",
		},
		{
			id: "3",
			product_name: "Gula Pasir",
			sku: "GLP-003",
			movement_type: "out",
			quantity: 50,
			reason: "Produksi",
			created_by: "Chef",
			created_at: "2024-01-13T09:15:00Z",
			notes: "Untuk produksi kue",
		},
		{
			id: "4",
			product_name: "Kemasan Paper Cup",
			sku: "KPC-004",
			movement_type: "transfer",
			quantity: 500,
			reason: "Transfer Antar Lokasi",
			location_from: "Gudang Utama",
			location_to: "Gudang Cabang Mall",
			created_by: "Manager Gudang",
			created_at: "2024-01-15T14:45:00Z",
		},
		{
			id: "5",
			product_name: "Susu UHT Full Cream",
			sku: "SUF-005",
			movement_type: "adjustment",
			quantity: -5,
			reason: "Penyesuaian Stock",
			created_by: "Admin",
			created_at: "2024-01-15T11:00:00Z",
			notes: "Koreksi perhitungan",
		},
	]);

	const categories = ["Beverages", "Bakery", "Food", "Packaging", "Snacks"];
	const statuses = [
		{ value: "in_stock", label: "Stok Normal" },
		{ value: "low_stock", label: "Stok Rendah" },
		{ value: "out_of_stock", label: "Habis" },
		{ value: "overstock", label: "Kelebihan Stok" },
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "in_stock":
				return "bg-green-100 text-green-800";
			case "low_stock":
				return "bg-yellow-100 text-yellow-800";
			case "out_of_stock":
				return "bg-red-100 text-red-800";
			case "overstock":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getMovementTypeColor = (type: string) => {
		switch (type) {
			case "in":
				return "bg-green-100 text-green-800";
			case "out":
				return "bg-red-100 text-red-800";
			case "adjustment":
				return "bg-yellow-100 text-yellow-800";
			case "transfer":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getMovementTypeLabel = (type: string) => {
		switch (type) {
			case "in":
				return "Masuk";
			case "out":
				return "Keluar";
			case "adjustment":
				return "Penyesuaian";
			case "transfer":
				return "Transfer";
			default:
				return type;
		}
	};

	const filteredItems = inventoryItems.filter((item) => {
		const matchesSearch =
			item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.sku.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			!selectedCategory || item.category === selectedCategory;
		const matchesStatus = !selectedStatus || item.status === selectedStatus;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	const filteredMovements = stockMovements.filter((movement) => {
		return (
			movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			movement.sku.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	// Statistics
	const totalItems = inventoryItems.length;
	const lowStockItems = inventoryItems.filter(
		(item) => item.status === "low_stock"
	).length;
	const outOfStockItems = inventoryItems.filter(
		(item) => item.status === "out_of_stock"
	).length;
	const totalValue = inventoryItems.reduce(
		(sum, item) => sum + item.current_stock * item.cost_price,
		0
	);

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
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Manajemen Inventori
					</h1>
					<p className="text-gray-600">
						Kelola stok produk dan tracking pergerakan inventori
					</p>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center">
							<div className="p-2 bg-blue-100 rounded-lg">
								<svg
									className="w-6 h-6 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
									/>
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Total Item</p>
								<p className="text-2xl font-bold text-gray-900">{totalItems}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center">
							<div className="p-2 bg-yellow-100 rounded-lg">
								<svg
									className="w-6 h-6 text-yellow-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Stok Rendah</p>
								<p className="text-2xl font-bold text-yellow-600">
									{lowStockItems}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center">
							<div className="p-2 bg-red-100 rounded-lg">
								<svg
									className="w-6 h-6 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Stok Habis</p>
								<p className="text-2xl font-bold text-red-600">
									{outOfStockItems}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center">
							<div className="p-2 bg-green-100 rounded-lg">
								<svg
									className="w-6 h-6 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
									/>
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Total Nilai</p>
								<p className="text-2xl font-bold text-green-600">
									{formatCurrency(totalValue)}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="mb-6">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex space-x-8">
							<button
								onClick={() => setActiveTab("stock")}
								className={`py-2 px-1 border-b-2 font-medium text-sm ${
									activeTab === "stock"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}>
								Stok Produk
							</button>
							<button
								onClick={() => setActiveTab("movements")}
								className={`py-2 px-1 border-b-2 font-medium text-sm ${
									activeTab === "movements"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}>
								Pergerakan Stok
							</button>
						</nav>
					</div>
				</div>

				{/* Filters and Actions */}
				<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex flex-col sm:flex-row gap-4 flex-1">
							<div className="relative flex-1">
								<input
									type="text"
									placeholder={`Cari ${
										activeTab === "stock" ? "produk" : "pergerakan"
									}...`}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<svg
									className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>

							{activeTab === "stock" && (
								<>
									<select
										value={selectedCategory}
										onChange={(e) => setSelectedCategory(e.target.value)}
										className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
										<option value="">Semua Kategori</option>
										{categories.map((category) => (
											<option key={category} value={category}>
												{category}
											</option>
										))}
									</select>

									<select
										value={selectedStatus}
										onChange={(e) => setSelectedStatus(e.target.value)}
										className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
										<option value="">Semua Status</option>
										{statuses.map((status) => (
											<option key={status.value} value={status.value}>
												{status.label}
											</option>
										))}
									</select>
								</>
							)}
						</div>

						<div className="flex gap-3">
							{activeTab === "stock" && (
								<>
									<button
										onClick={() => setShowAdjustmentModal(true)}
										className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
										Penyesuaian Stok
									</button>
									<button
										onClick={() => setShowAddModal(true)}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
										Tambah Item
									</button>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Content */}
				{activeTab === "stock" ? (
					<div className="bg-white rounded-xl shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Produk
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Kategori
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Stok
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Lokasi
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Nilai
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Terakhir Update
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredItems.map((item) => (
										<tr key={item.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">
														{item.product_name}
													</div>
													<div className="text-sm text-gray-500">
														SKU: {item.sku}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm text-gray-900">
													{item.category}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">
													{item.current_stock} {item.unit}
												</div>
												<div className="text-xs text-gray-500">
													Min: {item.min_stock} | Max: {item.max_stock}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
														item.status
													)}`}>
													{statuses.find((s) => s.value === item.status)?.label}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{item.location}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatCurrency(item.current_stock * item.cost_price)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatDate(item.last_updated)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												<button
													onClick={() => setSelectedItem(item)}
													className="text-blue-600 hover:text-blue-900 mr-3">
													Detail
												</button>
												<button className="text-green-600 hover:text-green-900">
													Edit
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-xl shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Produk
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Tipe
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Jumlah
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Alasan
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Lokasi
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Dibuat Oleh
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Tanggal
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredMovements.map((movement) => (
										<tr key={movement.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">
														{movement.product_name}
													</div>
													<div className="text-sm text-gray-500">
														SKU: {movement.sku}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(
														movement.movement_type
													)}`}>
													{getMovementTypeLabel(movement.movement_type)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`text-sm font-medium ${
														movement.quantity > 0
															? "text-green-600"
															: "text-red-600"
													}`}>
													{movement.quantity > 0 ? "+" : ""}
													{movement.quantity}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{movement.reason}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{movement.movement_type === "transfer" ? (
													<div>
														<div>Dari: {movement.location_from}</div>
														<div>Ke: {movement.location_to}</div>
													</div>
												) : (
													"-"
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{movement.created_by}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatDate(movement.created_at)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Detail Modal */}
				{selectedItem && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex justify-between items-center mb-6">
									<h3 className="text-xl font-bold text-gray-900">
										Detail Inventori
									</h3>
									<button
										onClick={() => setSelectedItem(null)}
										className="text-gray-400 hover:text-gray-600">
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-gray-500">
												Nama Produk
											</label>
											<p className="text-gray-900">
												{selectedItem.product_name}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												SKU
											</label>
											<p className="text-gray-900">{selectedItem.sku}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Kategori
											</label>
											<p className="text-gray-900">{selectedItem.category}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Unit
											</label>
											<p className="text-gray-900">{selectedItem.unit}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Stok Saat Ini
											</label>
											<p className="text-gray-900 text-lg font-semibold">
												{selectedItem.current_stock} {selectedItem.unit}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Status
											</label>
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
													selectedItem.status
												)}`}>
												{
													statuses.find((s) => s.value === selectedItem.status)
														?.label
												}
											</span>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Stok Minimum
											</label>
											<p className="text-gray-900">
												{selectedItem.min_stock} {selectedItem.unit}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Stok Maksimum
											</label>
											<p className="text-gray-900">
												{selectedItem.max_stock} {selectedItem.unit}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Lokasi
											</label>
											<p className="text-gray-900">{selectedItem.location}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Supplier
											</label>
											<p className="text-gray-900">{selectedItem.supplier}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Harga Beli
											</label>
											<p className="text-gray-900">
												{formatCurrency(selectedItem.cost_price)}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">
												Total Nilai
											</label>
											<p className="text-gray-900 text-lg font-semibold">
												{formatCurrency(
													selectedItem.current_stock * selectedItem.cost_price
												)}
											</p>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-gray-500">
											Terakhir Diupdate
										</label>
										<p className="text-gray-900">
											{formatDate(selectedItem.last_updated)}
										</p>
									</div>
								</div>

								<div className="flex justify-end mt-6 space-x-3">
									<button
										onClick={() => setSelectedItem(null)}
										className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
										Tutup
									</button>
									<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
										Edit Item
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Add Item Modal */}
				{showAddModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex justify-between items-center mb-6">
									<h3 className="text-xl font-bold text-gray-900">
										Tambah Item Inventori
									</h3>
									<button
										onClick={() => setShowAddModal(false)}
										className="text-gray-400 hover:text-gray-600">
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<form className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Nama Produk
											</label>
											<input
												type="text"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Masukkan nama produk"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												SKU
											</label>
											<input
												type="text"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Masukkan SKU"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Kategori
											</label>
											<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
												<option>Pilih kategori</option>
												{categories.map((category) => (
													<option key={category} value={category}>
														{category}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Unit
											</label>
											<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
												<option>Pilih unit</option>
												<option value="kg">Kilogram (kg)</option>
												<option value="gram">Gram (g)</option>
												<option value="liter">Liter (L)</option>
												<option value="ml">Mililiter (ml)</option>
												<option value="pcs">Pieces (pcs)</option>
												<option value="box">Box</option>
												<option value="pack">Pack</option>
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Stok Awal
											</label>
											<input
												type="number"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="0"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Harga Beli
											</label>
											<input
												type="number"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="0"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Stok Minimum
											</label>
											<input
												type="number"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="0"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Stok Maksimum
											</label>
											<input
												type="number"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="0"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Lokasi
										</label>
										<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
											<option>Pilih lokasi</option>
											<option value="Gudang Utama">Gudang Utama</option>
											<option value="Gudang Cabang Mall">
												Gudang Cabang Mall
											</option>
											<option value="Gudang Cabang Plaza">
												Gudang Cabang Plaza
											</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Supplier
										</label>
										<input
											type="text"
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Nama supplier"
										/>
									</div>
								</form>

								<div className="flex justify-end mt-6 space-x-3">
									<button
										onClick={() => setShowAddModal(false)}
										className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
										Batal
									</button>
									<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
										Tambah Item
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Stock Adjustment Modal */}
				{showAdjustmentModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl max-w-lg w-full">
							<div className="p-6">
								<div className="flex justify-between items-center mb-6">
									<h3 className="text-xl font-bold text-gray-900">
										Penyesuaian Stok
									</h3>
									<button
										onClick={() => setShowAdjustmentModal(false)}
										className="text-gray-400 hover:text-gray-600">
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<form className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Pilih Produk
										</label>
										<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
											<option>Pilih produk</option>
											{inventoryItems.map((item) => (
												<option key={item.id} value={item.id}>
													{item.product_name} (Stok: {item.current_stock}{" "}
													{item.unit})
												</option>
											))}
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Tipe Penyesuaian
										</label>
										<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
											<option value="in">Tambah Stok</option>
											<option value="out">Kurangi Stok</option>
											<option value="adjustment">Set Stok Baru</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Jumlah
										</label>
										<input
											type="number"
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Masukkan jumlah"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Alasan
										</label>
										<select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
											<option>Pilih alasan</option>
											<option value="Pembelian">Pembelian</option>
											<option value="Retur">Retur</option>
											<option value="Kerusakan">Kerusakan</option>
											<option value="Kehilangan">Kehilangan</option>
											<option value="Koreksi">Koreksi Perhitungan</option>
											<option value="Expired">Expired</option>
											<option value="Lainnya">Lainnya</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Catatan (Opsional)
										</label>
										<textarea
											rows={3}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Tambahkan catatan jika diperlukan"></textarea>
									</div>
								</form>

								<div className="flex justify-end mt-6 space-x-3">
									<button
										onClick={() => setShowAdjustmentModal(false)}
										className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
										Batal
									</button>
									<button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
										Sesuaikan Stok
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
