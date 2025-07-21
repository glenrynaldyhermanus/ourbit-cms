"use client";

import { useState, useEffect, useMemo } from "react";
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
	Check,
	AlertCircle,
	Clipboard,
	ClipboardCheck,
	Eye,
	Edit,
	Trash2,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import {
	DataTable,
	Column,
	Divider,
	Input,
	Select,
	PrimaryButton,
	OutlineButton,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import {
	InventoryItem,
	OptionItem,
	fetchInventoryItems,
	performStockAdjustment,
	fetchOptions,
	getCurrentUserStoreId,
} from "@/lib/inventory";
import InventoryAdjustmentForm from "@/components/forms/InventoryAdjustmentForm";

export default function InventoriesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("");
	const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
	const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
	const [loading, setLoading] = useState(false);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);

	useEffect(() => {
		initializeData();
	}, []);

	const initializeData = async () => {
		setLoading(true);
		try {
			// Fetch user profile and store ID
			await fetchUserProfile();

			// Get current user's store ID
			const storeId = await getCurrentUserStoreId();
			setCurrentStoreId(storeId);

			if (storeId) {
				// Fetch inventory items for current store
				const items = await fetchInventoryItems(storeId);
				setInventoryItems(items);

				// Extract unique categories
				const uniqueCategories = [
					...new Set(items.map((item) => item.category_name)),
				];
				setCategories(uniqueCategories);
			}
		} catch (error) {
			console.error("Error initializing data:", error);
		} finally {
			setLoading(false);
		}
	};

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300);

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

	const handleStockAdjustmentSuccess = async () => {
		console.log("handleStockAdjustmentSuccess called");
		if (!currentStoreId) {
			console.error("No current store ID available");
			return;
		}

		try {
			console.log("Refreshing inventory items for store:", currentStoreId);
			// Refresh inventory items to reflect stock changes
			const updatedItems = await fetchInventoryItems(currentStoreId);
			console.log("Updated inventory items:", updatedItems.length);
			setInventoryItems(updatedItems);
			console.log("Inventory items updated successfully");
		} catch (error) {
			console.error("Error refreshing inventory:", error);
		}
	};

	const handleStockAdjustmentError = (message: string) => {
		console.error("Stock adjustment error:", message);
		// You can add toast notification here if needed
	};

	const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
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

	// Filter inventory items
	const filteredInventoryItems = useMemo(() => {
		return inventoryItems.filter((item) => {
			const matchesSearch =
				item.product_name
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				item.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
				(item.supplier_name || "")
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase());
			const matchesCategory =
				!selectedCategory || item.category_name === selectedCategory;
			const matchesStatus = !selectedStatus || item.status === selectedStatus;
			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [inventoryItems, debouncedSearchTerm, selectedCategory, selectedStatus]);

	// Calculate stats
	const stats = useMemo(() => {
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

		return {
			totalItems,
			lowStockItems,
			outOfStockItems,
			totalValue,
		};
	}, [inventoryItems]);

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

	// Define columns for inventory table
	const inventoryColumns: Column<InventoryItem>[] = useMemo(
		() => [
			{
				key: "product",
				header: "Produk",
				sortable: true,
				sortKey: "product_name",
				render: (item) => (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
							<Package className="w-5 h-5 text-orange-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{item.product_name}
							</p>
							<p className="text-sm text-gray-500 truncate">
								{item.sku} • {item.category_name}
							</p>
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
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
								item.status
							)}`}>
							<StatusIcon className="w-3 h-3 mr-1" />
							{statuses.find((s) => s.value === item.status)?.label}
						</span>
					);
				},
			},
			{
				key: "actions",
				header: "Aksi",
				sortable: false,
				render: (item) => (
					<div className="flex items-center space-x-2">
						<button
							onClick={() => {
								setSelectedItem(item);
								setShowAdjustmentModal(true);
							}}
							className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
							<Edit className="w-4 h-4" />
						</button>
						<button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
							<Eye className="w-4 h-4" />
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
						title="Manajemen Inventori"
						subtitle="Kelola stok dan lakukan stock opname toko Anda"
						notificationButton={{
							icon: Bell,
							onClick: () => {
								console.log("Notification clicked");
							},
							count: 3,
						}}
						profileButton={{
							avatar: userProfile?.avatar,
							name: userProfile?.name,
							email: userProfile?.email,
							onClick: () => {
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
								title="Total Item"
								value={loading ? 0 : stats.totalItems}
								icon={Package}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Stok Rendah"
								value={loading ? 0 : stats.lowStockItems}
								icon={AlertTriangle}
								iconColor="bg-yellow-500/10 text-yellow-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Stok Habis"
								value={loading ? 0 : stats.outOfStockItems}
								icon={XCircle}
								iconColor="bg-red-500/10 text-red-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Total Nilai"
								value={loading ? "Rp 0" : formatCurrency(stats.totalValue)}
								icon={TrendingUp}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<Divider />

					{/* Search and Filter */}
					<div
						className="flex flex-col md:flex-row gap-4 animate-fade-in-up relative z-20"
						style={{ animationDelay: "120ms" }}>
						<div className="flex-1">
							<Input.Root>
								<Input.Field
									type="text"
									value={searchTerm}
									onChange={setSearchTerm}
									placeholder="Cari produk berdasarkan nama, SKU, atau supplier..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-48">
							<Select.Root>
								<Select.Trigger
									value={
										selectedCategory === ""
											? "Semua Kategori"
											: selectedCategory
									}
									placeholder="Filter Kategori"
								/>
								<Select.Content>
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
									value={
										selectedStatus === ""
											? "Semua Status"
											: statuses.find((s) => s.value === selectedStatus)
													?.label || ""
									}
									placeholder="Filter Status"
								/>
								<Select.Content>
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
						<div className="md:w-auto">
							<PrimaryButton
								onClick={() => {
									window.location.href = "/admin/inventories/opname";
								}}
								className="whitespace-nowrap">
								<Clipboard className="w-4 h-4 mr-2" />
								Stock Opname
							</PrimaryButton>
						</div>
					</div>

					{/* Loading State */}
					{loading && (
						<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-6 animate-fade-in">
							<div className="space-y-4">
								{/* Skeleton rows */}
								{Array.from({ length: 5 }).map((_, index) => (
									<div
										key={index}
										className="flex items-center space-x-4 animate-pulse">
										<div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
										<div className="flex-1 space-y-2">
											<div className="h-4 bg-gray-200 rounded w-3/4"></div>
											<div className="h-3 bg-gray-200 rounded w-1/2"></div>
										</div>
										<div className="h-4 bg-gray-200 rounded w-20"></div>
										<div className="h-4 bg-gray-200 rounded w-24"></div>
										<div className="h-4 bg-gray-200 rounded w-20"></div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Inventory Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredInventoryItems}
								columns={inventoryColumns}
								loading={false}
								pageSize={10}
							/>
						</div>
					)}
				</div>

				{/* Stock Adjustment Form */}
				{showAdjustmentModal && selectedItem && (
					<InventoryAdjustmentForm
						item={selectedItem}
						isOpen={showAdjustmentModal}
						storeId={currentStoreId || ""}
						onClose={() => {
							setShowAdjustmentModal(false);
							setSelectedItem(null);
						}}
						onSaveSuccess={handleStockAdjustmentSuccess}
						onError={handleStockAdjustmentError}
					/>
				)}
			</div>
		</div>
	);
}
