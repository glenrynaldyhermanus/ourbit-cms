"use client";

import { useState, useEffect } from "react";
import {
	Package,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Plus,
	Search,
	Filter,
	Bell,
	Box,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Minus,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable, Column, Divider, Input, Select } from "@/components/ui";
import { supabase } from "@/lib/supabase";

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
	const [loading, setLoading] = useState(false);
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

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "in_stock":
				return CheckCircle;
			case "low_stock":
				return AlertTriangle;
			case "out_of_stock":
				return XCircle;
			case "overstock":
				return TrendingUp;
			default:
				return Package;
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

	const getMovementTypeIcon = (type: string) => {
		switch (type) {
			case "in":
				return ArrowUp;
			case "out":
				return ArrowDown;
			case "adjustment":
				return Minus;
			case "transfer":
				return ArrowUpDown;
			default:
				return Package;
		}
	};

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

	// Filter inventory items
	const filteredInventoryItems = inventoryItems.filter((item) => {
		const matchesSearch =
			item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			!selectedCategory || item.category === selectedCategory;
		const matchesStatus = !selectedStatus || item.status === selectedStatus;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	// Filter stock movements
	const filteredStockMovements = stockMovements.filter((movement) => {
		const matchesSearch =
			movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			movement.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
			movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesSearch;
	});

	// Calculate stats
	const totalItems = inventoryItems.length;
	const totalValue = inventoryItems.reduce(
		(sum, item) => sum + item.current_stock * item.cost_price,
		0
	);
	const lowStockItems = inventoryItems.filter(
		(item) => item.status === "low_stock" || item.status === "out_of_stock"
	).length;
	const overstockItems = inventoryItems.filter(
		(item) => item.status === "overstock"
	).length;

	// Define columns for Inventory Items DataTable
	const inventoryColumns: Column<InventoryItem>[] = [
		{
			key: "product",
			header: "Produk",
			sortable: true,
			sortKey: "product_name",
			render: (item) => (
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
						<Package className="w-5 h-5 text-blue-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{item.product_name}
						</p>
						<p className="text-sm text-gray-500 truncate">SKU: {item.sku}</p>
					</div>
				</div>
			),
		},
		{
			key: "stock",
			header: "Stok",
			sortable: true,
			sortKey: "current_stock",
			render: (item) => (
				<div className="text-sm text-gray-900">
					<div className="font-medium">
						{item.current_stock} {item.unit}
					</div>
					<div className="text-xs text-gray-500">
						Min: {item.min_stock} | Max: {item.max_stock}
					</div>
				</div>
			),
		},
		{
			key: "category",
			header: "Kategori",
			sortable: true,
			sortKey: "category",
			render: (item) => (
				<div className="text-sm text-gray-900">{item.category}</div>
			),
		},
		{
			key: "location",
			header: "Lokasi",
			sortable: true,
			sortKey: "location",
			render: (item) => (
				<div className="text-sm text-gray-900">{item.location}</div>
			),
		},
		{
			key: "cost",
			header: "Harga Beli",
			sortable: true,
			sortKey: "cost_price",
			render: (item) => (
				<div className="text-sm font-medium text-gray-900">
					{formatCurrency(item.cost_price)}
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			sortKey: "status",
			render: (item) => {
				const StatusIcon = getStatusIcon(item.status);
				return (
					<div className="flex items-center space-x-2">
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
								item.status
							)}`}>
							<StatusIcon className="w-3 h-3 mr-1" />
							{statuses.find((s) => s.value === item.status)?.label ||
								item.status}
						</span>
					</div>
				);
			},
		},
		{
			key: "last_updated",
			header: "Terakhir Diperbarui",
			sortable: true,
			sortKey: "last_updated",
			render: (item) => (
				<div className="text-sm text-gray-900">
					{formatDate(item.last_updated)}
				</div>
			),
		},
	];

	// Define columns for Stock Movements DataTable
	const movementColumns: Column<StockMovement>[] = [
		{
			key: "product",
			header: "Produk",
			sortable: true,
			sortKey: "product_name",
			render: (movement) => (
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
						<Box className="w-5 h-5 text-green-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{movement.product_name}
						</p>
						<p className="text-sm text-gray-500 truncate">
							SKU: {movement.sku}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "movement",
			header: "Pergerakan",
			sortable: true,
			sortKey: "movement_type",
			render: (movement) => {
				const MovementIcon = getMovementTypeIcon(movement.movement_type);
				return (
					<div className="flex items-center space-x-2">
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(
								movement.movement_type
							)}`}>
							<MovementIcon className="w-3 h-3 mr-1" />
							{getMovementTypeLabel(movement.movement_type)}
						</span>
						<span className="text-sm font-medium text-gray-900">
							{movement.quantity > 0 ? "+" : ""}
							{movement.quantity}
						</span>
					</div>
				);
			},
		},
		{
			key: "reason",
			header: "Alasan",
			sortable: true,
			sortKey: "reason",
			render: (movement) => (
				<div className="text-sm text-gray-900">{movement.reason}</div>
			),
		},
		{
			key: "location",
			header: "Lokasi",
			sortable: false,
			render: (movement) => (
				<div className="text-sm text-gray-900">
					{movement.location_from && movement.location_to ? (
						<div>
							<div className="text-xs text-gray-500">
								Dari: {movement.location_from}
							</div>
							<div className="text-xs text-gray-500">
								Ke: {movement.location_to}
							</div>
						</div>
					) : (
						"-"
					)}
				</div>
			),
		},
		{
			key: "created_by",
			header: "Oleh",
			sortable: true,
			sortKey: "created_by",
			render: (movement) => (
				<div className="text-sm text-gray-900">{movement.created_by}</div>
			),
		},
		{
			key: "created_at",
			header: "Tanggal",
			sortable: true,
			sortKey: "created_at",
			render: (movement) => (
				<div className="text-sm text-gray-900">
					{formatDate(movement.created_at)}
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<PageHeader
					title="Manajemen Inventory"
					subtitle="Kelola stok dan pergerakan inventory toko"
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

				{/* Divider */}
				<Divider />

				{/* Stats Cards */}
				<Stats.Grid>
					<Stats.Card
						title="Total Item"
						value={loading ? 0 : totalItems}
						icon={Package}
						iconColor="bg-blue-500/10 text-blue-600"
					/>
					<Stats.Card
						title="Nilai Total Stok"
						value={loading ? "Rp 0" : formatCurrency(totalValue)}
						icon={TrendingUp}
						iconColor="bg-green-500/10 text-green-600"
					/>
					<Stats.Card
						title="Stok Menipis"
						value={loading ? 0 : lowStockItems}
						icon={AlertTriangle}
						iconColor="bg-yellow-500/10 text-yellow-600"
					/>
					<Stats.Card
						title="Stok Berlebih"
						value={loading ? 0 : overstockItems}
						icon={TrendingDown}
						iconColor="bg-red-500/10 text-red-600"
					/>
				</Stats.Grid>

				<div className="space-y-8">
					<Divider />

					{/* Tabs */}
					<div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
						<button
							onClick={() => setActiveTab("stock")}
							className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
								activeTab === "stock"
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}>
							Stok Inventory
						</button>
						<button
							onClick={() => setActiveTab("movements")}
							className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
								activeTab === "movements"
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}>
							Pergerakan Stok
						</button>
					</div>

					{/* Search and Filter */}
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									type="text"
									value={searchTerm}
									onChange={setSearchTerm}
									placeholder={
										activeTab === "stock"
											? "Cari item berdasarkan nama, SKU, atau supplier..."
											: "Cari pergerakan berdasarkan produk, SKU, atau alasan..."
									}
								/>
							</Input.Root>
						</div>
						{activeTab === "stock" && (
							<>
								<div className="md:w-48">
									<Select.Root>
										<Select.Trigger
											value={selectedCategory}
											placeholder="Semua Kategori"
											onClick={() => {
												// Handle select click
											}}
											open={false}
										/>
										<Select.Content open={false}>
											<Select.Item
												value=""
												onClick={() => setSelectedCategory("")}
												selected={selectedCategory === ""}>
												Semua Kategori
											</Select.Item>
											{categories.map((category) => (
												<Select.Item
													key={category}
													value={category}
													onClick={() => setSelectedCategory(category)}
													selected={selectedCategory === category}>
													{category}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>
								</div>
								<div className="md:w-48">
									<Select.Root>
										<Select.Trigger
											value={selectedStatus}
											placeholder="Semua Status"
											onClick={() => {
												// Handle select click
											}}
											open={false}
										/>
										<Select.Content open={false}>
											<Select.Item
												value=""
												onClick={() => setSelectedStatus("")}
												selected={selectedStatus === ""}>
												Semua Status
											</Select.Item>
											{statuses.map((status) => (
												<Select.Item
													key={status.value}
													value={status.value}
													onClick={() => setSelectedStatus(status.value)}
													selected={selectedStatus === status.value}>
													{status.label}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>
								</div>
							</>
						)}
					</div>

					{/* Loading State */}
					{loading && (
						<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-12 text-center">
							<div className="w-8 h-8 border-2 border-[#FF5701] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-[#4A4A4A] font-['Inter']">
								Memuat inventory...
							</p>
						</div>
					)}

					{/* Data Tables */}
					{!loading && (
						<>
							{activeTab === "stock" && (
								<DataTable
									data={filteredInventoryItems}
									columns={inventoryColumns}
									loading={false}
									pageSize={10}
								/>
							)}
							{activeTab === "movements" && (
								<DataTable
									data={filteredStockMovements}
									columns={movementColumns}
									loading={false}
									pageSize={10}
								/>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
