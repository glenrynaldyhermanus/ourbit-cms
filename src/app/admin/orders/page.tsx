"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types";
import {
	Search,
	Filter,
	Eye,
	Receipt,
	CheckCircle,
	XCircle,
	Clock,
	Bell,
	Package,
	DollarSign,
	TrendingUp,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { DataTable, Column, Divider, Input, Select } from "@/components/ui";
import { supabase } from "@/lib/supabase";

// Mock orders data - in real app this would come from Supabase
const mockOrders: Order[] = [
	{
		id: "1",
		customer_id: "1",
		total_amount: 15.48,
		tax_amount: 1.48,
		discount_amount: 0,
		status: "completed",
		payment_method: "card",
		created_at: "2024-01-15T10:30:00Z",
		customer: {
			id: "1",
			name: "John Doe",
			email: "john@example.com",
			created_at: "2024-01-01",
		},
		order_items: [
			{
				id: "1",
				order_id: "1",
				product_id: "1",
				quantity: 2,
				price: 4.5,
			},
			{
				id: "2",
				order_id: "1",
				product_id: "4",
				quantity: 1,
				price: 5.99,
			},
		],
	},
	{
		id: "2",
		customer_id: "2",
		total_amount: 12.49,
		tax_amount: 1.19,
		discount_amount: 0,
		status: "pending",
		payment_method: "cash",
		created_at: "2024-01-15T11:45:00Z",
		customer: {
			id: "2",
			name: "Jane Smith",
			email: "jane@example.com",
			created_at: "2024-01-01",
		},
		order_items: [
			{
				id: "3",
				order_id: "2",
				product_id: "2",
				quantity: 1,
				price: 8.99,
			},
			{
				id: "4",
				order_id: "2",
				product_id: "3",
				quantity: 1,
				price: 3.5,
			},
		],
	},
	{
		id: "3",
		total_amount: 8.99,
		tax_amount: 0.89,
		discount_amount: 0,
		status: "completed",
		payment_method: "card",
		created_at: "2024-01-15T09:15:00Z",
		order_items: [
			{
				id: "5",
				order_id: "3",
				product_id: "2",
				quantity: 1,
				price: 8.99,
			},
		],
	},
];

const statusIcons = {
	pending: Clock,
	completed: CheckCircle,
	cancelled: XCircle,
};

const statusColors = {
	pending: "bg-yellow-100 text-yellow-800",
	completed: "bg-green-100 text-green-800",
	cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>(mockOrders);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "pending" | "completed" | "cancelled"
	>("all");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || order.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
		setOrders((prev) =>
			prev.map((order) =>
				order.id === orderId ? { ...order, status: newStatus } : order
			)
		);
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

	// Calculate stats
	const totalOrders = orders.length;
	const pendingOrders = orders.filter((o) => o.status === "pending").length;
	const completedOrders = orders.filter((o) => o.status === "completed").length;
	const totalRevenue = orders
		.filter((o) => o.status === "completed")
		.reduce((sum, o) => sum + o.total_amount, 0);

	// Define columns for DataTable
	const columns: Column<Order>[] = [
		{
			key: "order",
			header: "Order",
			sortable: true,
			sortKey: "id",
			render: (order) => (
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
						<Receipt className="w-5 h-5 text-blue-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							Order #{order.id}
						</p>
						<p className="text-sm text-gray-500 truncate">
							{order.customer?.name || "Customer tidak tersedia"}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "amount",
			header: "Total",
			sortable: true,
			sortKey: "total_amount",
			render: (order) => (
				<div className="text-sm font-medium text-gray-900">
					{new Intl.NumberFormat("id-ID", {
						style: "currency",
						currency: "IDR",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}).format(order.total_amount * 15000)}{" "}
					{/* Convert to IDR */}
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			sortKey: "status",
			render: (order) => {
				const StatusIcon = statusIcons[order.status];
				return (
					<div className="flex items-center space-x-2">
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
								statusColors[order.status]
							}`}>
							<StatusIcon className="w-3 h-3 mr-1" />
							{order.status === "completed"
								? "Selesai"
								: order.status === "pending"
								? "Menunggu"
								: "Dibatalkan"}
						</span>
					</div>
				);
			},
		},
		{
			key: "payment",
			header: "Pembayaran",
			sortable: true,
			sortKey: "payment_method",
			render: (order) => (
				<div className="text-sm text-gray-900">
					{order.payment_method === "card"
						? "Kartu"
						: order.payment_method === "cash"
						? "Tunai"
						: order.payment_method}
				</div>
			),
		},
		{
			key: "created_at",
			header: "Tanggal",
			sortable: true,
			sortKey: "created_at",
			render: (order) => (
				<div className="text-sm text-gray-900">
					{formatDate(order.created_at)}
				</div>
			),
		},
		{
			key: "actions",
			header: "",
			sortable: false,
			render: (order) => (
				<div className="flex items-center space-x-2">
					<button
						onClick={() => setSelectedOrder(order)}
						className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
						title="Lihat Detail">
						<Eye className="w-4 h-4" />
					</button>
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Manajemen Pesanan"
						subtitle="Kelola pesanan dan transaksi pelanggan"
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
				<Stats.Grid>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "0ms" }}>
						<Stats.Card
							title="Total Pesanan"
							value={loading ? 0 : totalOrders}
							icon={Package}
							iconColor="bg-blue-500/10 text-blue-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "30ms" }}>
						<Stats.Card
							title="Menunggu"
							value={loading ? 0 : pendingOrders}
							icon={Clock}
							iconColor="bg-yellow-500/10 text-yellow-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "60ms" }}>
						<Stats.Card
							title="Selesai"
							value={loading ? 0 : completedOrders}
							icon={CheckCircle}
							iconColor="bg-green-500/10 text-green-600"
						/>
					</div>
					<div
						className="animate-fade-in-left"
						style={{ animationDelay: "90ms" }}>
						<Stats.Card
							title="Total Pendapatan"
							value={
								loading
									? "Rp 0"
									: new Intl.NumberFormat("id-ID", {
											style: "currency",
											currency: "IDR",
											minimumFractionDigits: 0,
											maximumFractionDigits: 0,
									  }).format(totalRevenue * 15000)
							}
							icon={DollarSign}
							iconColor="bg-green-500/10 text-green-600"
						/>
					</div>
				</Stats.Grid>

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
									placeholder="Cari pesanan berdasarkan ID, nama pelanggan, atau email..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-64">
							<Select.Root>
								<Select.Trigger
									value={statusFilter}
									placeholder="Semua Status"
									onClick={() => {
										// Handle select click
									}}
									open={false}
								/>
								<Select.Content open={false}>
									<Select.Item
										value="all"
										onClick={() => setStatusFilter("all")}
										selected={statusFilter === "all"}>
										Semua Status
									</Select.Item>
									<Select.Item
										value="pending"
										onClick={() => setStatusFilter("pending")}
										selected={statusFilter === "pending"}>
										Menunggu
									</Select.Item>
									<Select.Item
										value="completed"
										onClick={() => setStatusFilter("completed")}
										selected={statusFilter === "completed"}>
										Selesai
									</Select.Item>
									<Select.Item
										value="cancelled"
										onClick={() => setStatusFilter("cancelled")}
										selected={statusFilter === "cancelled"}>
										Dibatalkan
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					{/* Loading State */}
					{loading && (
						<div className="bg-white rounded-xl shadow-sm border border-[#D1D5DB] p-12 text-center animate-fade-in">
							<div className="w-8 h-8 border-2 border-[#FF5701] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-[#4A4A4A] font-['Inter']">Memuat pesanan...</p>
						</div>
					)}

					{/* Orders Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredOrders}
								columns={columns}
								loading={false}
								pageSize={10}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
