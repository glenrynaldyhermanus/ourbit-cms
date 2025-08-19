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
	PrimaryButton,
	Skeleton,
	Button,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getStoreId } from "@/lib/store";

interface StockOpnameSession {
	id: string;
	store_id: string;
	status: string;
	started_at: string;
	finished_at?: string;
	items_counted: number;
	total_items: number;
	created_at: string;
}

interface OpnameItemJoinedRow {
	product_id: string;
	expected_qty: number | null;
	actual_qty: number | null;
	note: string | null;
	products?: { name?: string | null; code?: string | null } | null;
}

export default function StockOpnamePage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [stockOpnameSessions, setStockOpnameSessions] = useState<
		StockOpnameSession[]
	>([]);
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [isStartingSession, setIsStartingSession] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean;
		sessionId: string | null;
	}>({ isOpen: false, sessionId: null });

	useEffect(() => {
		initializeData();
	}, []);

	const handleViewSession = (sessionId: string) => {
		router.push(`/admin/inventories/opname/input?session_id=${sessionId}`);
	};

	const handleDownloadSession = async (sessionId: string) => {
		try {
			const { data, error } = await supabase
				.from("stock_opname_items")
				.select(
					`product_id, expected_qty, actual_qty, note, products ( name, code )`
				)
				.eq("session_id", sessionId)
				.returns<OpnameItemJoinedRow[]>();

			if (error) {
				console.error("Error exporting session items:", error);
				return;
			}

			const rows = (data || []).map((row) => ({
				product_name: row.products?.name ?? "",
				sku: row.products?.code ?? "",
				expected_qty: row.expected_qty ?? 0,
				actual_qty: row.actual_qty ?? 0,
				variance: (row.actual_qty ?? 0) - (row.expected_qty ?? 0),
				note: row.note ?? "",
			}));

			const header = [
				"Product Name",
				"SKU",
				"Expected Qty",
				"Actual Qty",
				"Variance",
				"Note",
			];
			const csv = [
				header.join(","),
				...rows.map((r) =>
					[
						r.product_name,
						r.sku,
						r.expected_qty,
						r.actual_qty,
						r.variance,
						`"${String(r.note).replaceAll('"', '""')}"`,
					].join(",")
				),
			].join("\n");

			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `stock-opname-${sessionId}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Error generating CSV:", err);
		}
	};

	const openCancelDialog = (sessionId: string) => {
		setDeleteConfirm({ isOpen: true, sessionId });
	};

	const confirmCancel = async () => {
		if (!deleteConfirm.sessionId) return;
		try {
			const { error } = await supabase
				.from("stock_opname_sessions")
				.update({ status: "3", finished_at: new Date().toISOString() })
				.eq("id", deleteConfirm.sessionId);
			if (error) {
				console.error("Error cancelling session:", error);
				return;
			}
			setDeleteConfirm({ isOpen: false, sessionId: null });
			await initializeData();
		} catch (err) {
			console.error("Error cancelling session:", err);
		}
	};

	const cancelDialog = () => {
		setDeleteConfirm({ isOpen: false, sessionId: null });
	};

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

			// Get store_id from localStorage
			const storeId = getStoreId();

			if (!storeId) {
				throw new Error("No store ID available");
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

			// Get store_id from localStorage
			const storeId = getStoreId();

			if (!storeId) {
				console.error("No store ID available");
				return;
			}

			console.log("Using store ID for stock opname:", storeId);

			// Fetch stock opname sessions filtered by store_id
			const { data: sessions, error } = await supabase
				.from("stock_opname_sessions")
				.select("*")
				.eq("store_id", storeId)
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
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
			case "2":
				return "bg-green-500/10 text-green-600 dark:text-green-400";
			case "3":
				return "bg-red-500/10 text-red-600 dark:text-red-400";
			default:
				return "bg-[var(--muted)] text-[var(--muted-foreground)]";
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

	const columns: Column<StockOpnameSession>[] = [
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
						<p className="text-sm font-medium text-[var(--foreground)] truncate">
							Stock Opname #{item.id.slice(0, 8)}
						</p>
						<p className="text-sm text-[var(--muted-foreground)] truncate">
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
				<div className="text-sm text-[var(--foreground)]">
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
				<div className="text-sm text-[var(--foreground)]">
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
				<div className="text-sm text-[var(--foreground)]">
					{item.finished_at ? formatDate(item.finished_at) : "-"}
				</div>
			),
		},
		{
			key: "progress",
			header: "Progress",
			sortable: false,
			render: (item) => (
				<div className="text-sm text-[var(--foreground)]">
					<div className="font-medium">
						{item.items_counted || 0} / {item.total_items || 0} item
					</div>
					<div className="text-xs text-[var(--muted-foreground)]">
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
					<button
						onClick={() => handleViewSession(item.id)}
						className="p-1 text-[var(--muted-foreground)] hover:text-blue-600 transition-colors">
						<Eye className="w-4 h-4" />
					</button>
					<button
						onClick={() => handleDownloadSession(item.id)}
						className="p-1 text-[var(--muted-foreground)] hover:text-green-600 transition-colors">
						<Download className="w-4 h-4" />
					</button>
					<button
						onClick={() => openCancelDialog(item.id)}
						className="p-1 text-[var(--muted-foreground)] hover:text-red-600 transition-colors">
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div>
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
				<div className="rounded-xl">
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
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Aktif"
								value={
									loading
										? 0
										: stockOpnameSessions.filter(
												(s: StockOpnameSession) => s.status === "1"
										  ).length
								}
								icon={Bell}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Selesai"
								value={
									loading
										? 0
										: stockOpnameSessions.filter(
												(s: StockOpnameSession) => s.status === "2"
										  ).length
								}
								icon={CheckCircle}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-[var(--border)]"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Dibatalkan"
								value={
									loading
										? 0
										: stockOpnameSessions.filter(
												(s: StockOpnameSession) => s.status === "3"
										  ).length
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
					{loading && <Skeleton.Table rows={5} />}

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
				{/* Cancel Confirmation Dialog */}
				{deleteConfirm.isOpen && (
					<div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
						<div className="bg-[var(--card)] rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-[var(--border)]">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
									<XCircle className="w-5 h-5 text-red-600" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-[var(--foreground)]">
										Batalkan Sesi
									</h3>
									<p className="text-sm text-[var(--muted-foreground)]">
										Tindakan ini akan menandai sesi sebagai dibatalkan.
									</p>
								</div>
							</div>
							<div className="mb-6 text-sm text-[var(--muted-foreground)]">
								Data yang sudah tersimpan tetap ada untuk keperluan audit.
							</div>
							<div className="flex space-x-3">
								<Button.Root
									variant="outline"
									onClick={cancelDialog}
									className="flex-1">
									<Button.Text>Batal</Button.Text>
								</Button.Root>
								<Button.Root
									variant="destructive"
									onClick={confirmCancel}
									className="flex-1">
									<Button.Text>Batalkan Sesi</Button.Text>
								</Button.Root>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
