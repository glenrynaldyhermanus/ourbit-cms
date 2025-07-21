"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Package,
	CheckCircle,
	XCircle,
	Bell,
	Clipboard,
	ClipboardCheck,
	Eye,
	Download,
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
} from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function StockOpnamePage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [stockOpnameSessions, setStockOpnameSessions] = useState([]);
	const [userProfile, setUserProfile] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [isStartingSession, setIsStartingSession] = useState(false);

	useEffect(() => {
		initializeData();
	}, []);

	const handleStartStockOpname = async () => {
		setIsStartingSession(true);
		try {
			// Get current user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			// Get store_id from user metadata or get first available store
			let storeId = user.user_metadata?.store_id;

			if (!storeId) {
				// Get first available store
				const { data: stores, error: storeError } = await supabase
					.from("stores")
					.select("id")
					.limit(1);

				if (storeError || !stores || stores.length === 0) {
					throw new Error("No store available");
				}

				storeId = stores[0].id;
			}

			// Create new stock opname session
			const { data: newSession, error } = await supabase
				.from("stock_opname_sessions")
				.insert({
					store_id: storeId,
					status: "1", // Active
					started_at: new Date().toISOString(),
					items_counted: 0,
					total_items: 0,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating session:", error);
				throw error;
			}

			// Redirect to input page
			router.push(
				`/admin/inventories/opname/input?session_id=${newSession.id}`
			);
		} catch (error) {
			console.error("Failed to start stock opname:", error);
			// You can add error toast here
		} finally {
			setIsStartingSession(false);
		}
	};

	const initializeData = async () => {
		setLoading(true);
		try {
			// Fetch user profile
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setUserProfile({
					name: user.user_metadata?.full_name || user.email,
					email: user.email,
				});
			}

			// Fetch stock opname sessions
			const { data: sessions, error } = await supabase
				.from("stock_opname_sessions")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching sessions:", error);
			} else {
				setStockOpnameSessions(sessions || []);
			}
		} catch (error) {
			console.error("Error initializing data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "1":
				return "bg-blue-100 text-blue-800";
			case "2":
				return "bg-green-100 text-green-800";
			case "3":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "1":
				return "Aktif";
			case "2":
				return "Selesai";
			case "3":
				return "Dibatalkan";
			default:
				return "Tidak Diketahui";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "1":
				return <Bell className="w-4 h-4" />;
			case "2":
				return <CheckCircle className="w-4 h-4" />;
			case "3":
				return <XCircle className="w-4 h-4" />;
			default:
				return <Package className="w-4 h-4" />;
		}
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

	// Filter sessions by search term
	const filteredSessions = stockOpnameSessions.filter((session) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return session.id.toLowerCase().includes(searchLower);
	});

	const columns: Column<any>[] = [
		{
			key: "session",
			header: "Sesi Stock Opname",
			sortable: true,
			sortKey: "id",
			render: (item) => (
				<div className="flex items-center space-x-3">
					<div className="flex-shrink-0">
						<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
							<Clipboard className="w-6 h-6 text-orange-600" />
						</div>
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							Stock Opname #{item.id.slice(0, 8)}
						</p>
						<p className="text-sm text-gray-500 truncate">
							{formatDate(item.started_at)}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			sortKey: "status",
			render: (item) => (
				<div className="text-sm text-gray-900">
					<div
						className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
							item.status
						)}`}>
						{getStatusIcon(item.status)}
						<span>{getStatusLabel(item.status)}</span>
					</div>
				</div>
			),
		},
		{
			key: "started_at",
			header: "Dimulai",
			sortable: true,
			sortKey: "started_at",
			render: (item) => (
				<div className="text-sm text-gray-900">
					{formatDate(item.started_at)}
				</div>
			),
		},
		{
			key: "finished_at",
			header: "Selesai",
			sortable: true,
			sortKey: "finished_at",
			render: (item) => (
				<div className="text-sm text-gray-900">
					{item.finished_at ? formatDate(item.finished_at) : "-"}
				</div>
			),
		},
		{
			key: "progress",
			header: "Progress",
			sortable: false,
			render: (item) => (
				<div className="text-sm text-gray-900">
					<div className="font-medium">
						{item.items_counted || 0} / {item.total_items || 0} item
					</div>
					<div className="text-xs text-gray-500">
						{Math.round(
							((item.items_counted || 0) / (item.total_items || 1)) * 100
						)}
						% selesai
					</div>
				</div>
			),
		},
		{
			key: "actions",
			header: "Aksi",
			sortable: false,
			render: (item) => (
				<div className="flex items-center space-x-2">
					<button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
						<Eye className="w-4 h-4" />
					</button>
					<button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
						<Download className="w-4 h-4" />
					</button>
					<button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
						<Trash2 className="w-4 h-4" />
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
						title="Stock Opname"
						subtitle="Kelola dan lakukan stock opname untuk toko Anda"
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
								title="Total Sesi"
								value={loading ? 0 : stockOpnameSessions.length}
								icon={Clipboard}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Aktif"
								value={
									loading
										? 0
										: stockOpnameSessions.filter((s: any) => s.status === "1")
												.length
								}
								icon={Bell}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Selesai"
								value={
									loading
										? 0
										: stockOpnameSessions.filter((s: any) => s.status === "2")
												.length
								}
								icon={CheckCircle}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Dibatalkan"
								value={
									loading
										? 0
										: stockOpnameSessions.filter((s: any) => s.status === "3")
												.length
								}
								icon={XCircle}
								iconColor="bg-red-500/10 text-red-600"
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
									placeholder="Cari sesi stock opname berdasarkan ID..."
								/>
							</Input.Root>
						</div>
						<div className="md:w-auto">
							<PrimaryButton
								onClick={handleStartStockOpname}
								disabled={loading || isStartingSession}
								className="rounded-xl w-full md:w-auto">
								{isStartingSession ? (
									<>
										<div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										Memulai...
									</>
								) : (
									<>
										<ClipboardCheck className="w-4 h-4 mr-2" />
										Mulai Stock Opname
									</>
								)}
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

					{/* Stock Opname Sessions Table */}
					{!loading && (
						<div
							className="animate-fade-in-up"
							style={{ animationDelay: "150ms" }}>
							<DataTable
								data={filteredSessions}
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
