"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button, Input, Select } from "@/components/ui";
import { useToast } from "@/components";

type NotificationRow = {
	id: string;
	created_at: string;
	store_id: string;
	sale_id: string | null;
	channel: "email" | "whatsapp";
	template: string;
	recipient: string;
	payload_json: Record<string, unknown> | null;
	status: "pending" | "sent" | "failed";
	error: string | null;
	sent_at: string | null;
};

export default function NotificationsPage() {
	const { showToast } = useToast();
	const [rows, setRows] = useState<NotificationRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [statusFilter, setStatusFilter] = useState<
		"all" | "pending" | "sent" | "failed"
	>("all");
	const [search, setSearch] = useState("");

	const load = useCallback(async () => {
		setLoading(true);
		try {
			let q = supabase
				.from("notifications")
				.select(
					"id, created_at, store_id, sale_id, channel, template, recipient, payload_json, status, error, sent_at"
				)
				.order("created_at", { ascending: false })
				.limit(200);
			if (statusFilter !== "all") {
				q = q.eq("status", statusFilter);
			}
			const { data, error } = await q;
			if (error) throw error;
			setRows((data ?? []) as unknown as NotificationRow[]);
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		} finally {
			setLoading(false);
		}
	}, [statusFilter, showToast]);

	useEffect(() => {
		void load();
	}, [load]);

	const filtered = useMemo(() => {
		const s = search.trim().toLowerCase();
		if (!s) return rows;
		return rows.filter((r) =>
			[r.recipient, r.template, r.status, r.channel, r.error ?? "", r.id]
				.join(" ")
				.toLowerCase()
				.includes(s)
		);
	}, [rows, search]);

	const markSent = async (id: string) => {
		try {
			const { error } = await supabase
				.from("notifications")
				.update({
					status: "sent",
					sent_at: new Date().toISOString(),
					error: null,
				})
				.eq("id", id);
			if (error) throw error;
			showToast({
				type: "success",
				title: "Berhasil",
				message: "Ditandai terkirim",
			});
			load();
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		}
	};

	const markFailed = async (id: string) => {
		try {
			const { error } = await supabase
				.from("notifications")
				.update({ status: "failed", error: "Marked as failed manually" })
				.eq("id", id);
			if (error) throw error;
			showToast({
				type: "success",
				title: "Berhasil",
				message: "Ditandai gagal",
			});
			load();
		} catch (e) {
			showToast({
				type: "error",
				title: "Gagal",
				message: (e as Error).message,
			});
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Notifications</h1>
				<p className="text-[var(--muted-foreground)] mt-2">
					Pantau antrean notifikasi (pending/sent/failed)
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filter</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-3">
						<Input.Root className="flex-1">
							<Input.Field
								value={search}
								onChange={setSearch}
								placeholder="Cari penerima/template/status..."
							/>
						</Input.Root>
						<Select.Root>
							<Select.Trigger
								value={
									statusFilter === "all"
										? "Semua"
										: statusFilter === "pending"
										? "Pending"
										: statusFilter === "sent"
										? "Sent"
										: "Failed"
								}
								onClick={() => {}}
							/>
							<Select.Content open>
								<Select.Item
									value="all"
									onClick={() => setStatusFilter("all")}
									selected={statusFilter === "all"}>
									Semua
								</Select.Item>
								<Select.Item
									value="pending"
									onClick={() => setStatusFilter("pending")}
									selected={statusFilter === "pending"}>
									Pending
								</Select.Item>
								<Select.Item
									value="sent"
									onClick={() => setStatusFilter("sent")}
									selected={statusFilter === "sent"}>
									Sent
								</Select.Item>
								<Select.Item
									value="failed"
									onClick={() => setStatusFilter("failed")}
									selected={statusFilter === "failed"}>
									Failed
								</Select.Item>
							</Select.Content>
						</Select.Root>
						<Button onClick={() => load()} loading={loading}>
							Refresh
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="mt-6">
				<Card>
					<CardHeader>
						<CardTitle>Daftar Notifikasi</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="text-center py-6">Loading...</div>
						) : filtered.length === 0 ? (
							<div className="text-center py-6 text-[var(--muted-foreground)]">
								Tidak ada data
							</div>
						) : (
							<div className="space-y-2">
								{filtered.map((n) => (
									<div
										key={n.id}
										className="p-3 border border-[var(--border)] rounded-lg flex items-center justify-between">
										<div className="min-w-0">
											<div className="text-sm font-medium truncate">
												{n.template} • {n.channel} • {n.status}
											</div>
											<div className="text-xs text-[var(--muted-foreground)] truncate">
												To: {n.recipient || "-"} • Sale: {n.sale_id ?? "-"} •{" "}
												{new Date(n.created_at).toLocaleString("id-ID")}
											</div>
											{n.error && (
												<div className="text-xs text-[var(--destructive)] mt-1 truncate">
													Error: {n.error}
												</div>
											)}
										</div>
										<div className="flex items-center gap-2 ml-3 flex-shrink-0">
											{n.status !== "sent" && (
												<Button size="sm" onClick={() => markSent(n.id)}>
													Mark Sent
												</Button>
											)}
											{n.status !== "failed" && (
												<Button
													size="sm"
													variant="outline"
													onClick={() => markFailed(n.id)}>
													Mark Failed
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
