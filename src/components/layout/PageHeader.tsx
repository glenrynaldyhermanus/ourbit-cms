"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LucideIcon, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { AuthUtil } from "@/lib/auth";
import { Button } from "@/components/ui";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getStoreId } from "@/lib/store";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	backButton?: {
		onClick: () => void;
		disabled?: boolean;
	};
	notificationButton?: {
		icon: LucideIcon;
		onClick: () => void;
		count?: number;
		disabled?: boolean;
	};
	showThemeToggle?: boolean;
	profileButton?: {
		avatar?: string;
		name?: string;
		email?: string;
		onClick: () => void;
	};
}

export default function PageHeader({
	title,
	subtitle,
	backButton,
	notificationButton,
	showThemeToggle,
	profileButton,
}: PageHeaderProps) {
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
	const [tokenValidated, setTokenValidated] = useState(false);
	const { user, refreshUser } = useAuthContext();

	// Real notification count fetched from DB
	const [notificationCount, setNotificationCount] = useState<number | null>(
		null
	);

	// Dropdown state for notifications
	const [isNotifOpen, setIsNotifOpen] = useState(false);
	const [recentNotifs, setRecentNotifs] = useState<
		{
			id: string;
			created_at: string;
			template: string;
			channel: "email" | "whatsapp" | string;
			recipient: string | null;
			status: "pending" | "sent" | "failed" | string;
			error: string | null;
		}[]
	>([]);
	const [loadingNotifs, setLoadingNotifs] = useState(false);

	// Load real notification count for current store
	useEffect(() => {
		const loadNotificationCount = async () => {
			try {
				if (!tokenValidated || !user) return;
				const storeId = getStoreId();
				if (!storeId) return;

				const { count, error } = await supabase
					.from("notifications")
					.select("id", { count: "exact", head: true })
					.eq("store_id", storeId)
					.eq("status", "pending");

				if (error) {
					console.error(
						"PageHeader: Error loading notifications count:",
						error
					);
					return;
				}

				setNotificationCount(typeof count === "number" ? count : 0);
			} catch (err) {
				console.error(
					"PageHeader: Exception loading notifications count:",
					err
				);
			}
		};

		loadNotificationCount();
	}, [tokenValidated, user]);

	// Load recent notifications when dropdown opens
	useEffect(() => {
		const loadRecent = async () => {
			try {
				if (!isNotifOpen) return;
				const storeId = getStoreId();
				if (!storeId) return;
				setLoadingNotifs(true);
				const { data, error } = await supabase
					.from("notifications")
					.select("id, created_at, template, channel, recipient, status, error")
					.eq("store_id", storeId)
					.order("created_at", { ascending: false })
					.limit(8);
				if (error) throw error;
				setRecentNotifs((data as unknown as typeof recentNotifs) || []);
			} catch (err) {
				console.error("PageHeader: Error loading recent notifications:", err);
			} finally {
				setLoadingNotifs(false);
			}
		};

		void loadRecent();
	}, [isNotifOpen]);

	// Validate token when component mounts
	useEffect(() => {
		const validateToken = async () => {
			try {
				console.log("PageHeader: Validating token...");

				// Add small delay to allow auth to settle after hard refresh
				await new Promise((resolve) => setTimeout(resolve, 100));

				const isValid = await AuthUtil.isAuthenticated();

				if (!isValid) {
					console.log("PageHeader: Token invalid, redirecting to sign-in");
					// Add another small delay before redirect
					setTimeout(() => {
						window.location.href = "/sign-in";
					}, 500);
					return;
				}

				console.log("PageHeader: Token valid");
				setTokenValidated(true);

				// If we have a user but missing detailed info, refresh user data
				if (user && (!user.fullName || !user.phone)) {
					console.log("PageHeader: Refreshing user details...");
					await refreshUser();
				}
			} catch (error) {
				console.error("PageHeader: Token validation error:", error);
				// Add delay before redirect on error
				setTimeout(() => {
					window.location.href = "/sign-in";
				}, 1000);
			}
		};

		// Add initial delay before running validation
		const timer = setTimeout(validateToken, 200);
		return () => clearTimeout(timer);
	}, [user, refreshUser]);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		window.location.href = "/sign-in";
	};

	// Render loading skeleton for user profile only
	const renderUserProfile = () => {
		if (!tokenValidated) {
			return (
				<div className="flex items-center space-x-2">
					<div className="w-8 h-8 bg-[var(--muted)] animate-pulse rounded-full"></div>
					<div className="hidden md:block">
						<div className="h-4 w-20 bg-[var(--muted)] animate-pulse rounded mb-1"></div>
						<div className="h-3 w-24 bg-[var(--muted)] animate-pulse rounded"></div>
					</div>
				</div>
			);
		}

		if (!profileButton) return null;

		return (
			<div className="relative">
				<button
					onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
					className="flex items-center space-x-2 py-2 rounded-lg hover:bg-[var(--muted)]">
					{profileButton.avatar ? (
						<Image
							src={profileButton.avatar}
							alt="Profile"
							width={32}
							height={32}
							className="w-8 h-8 rounded-full object-cover"
						/>
					) : (
						<div className="w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
							<span className="text-sm font-medium text-[var(--muted-foreground)]">
								{profileButton.name?.[0]?.toUpperCase() || "U"}
							</span>
						</div>
					)}
					<div className="hidden md:block text-left">
						<p className="text-sm font-medium text-[var(--foreground)]">
							{profileButton.name || "User"}
						</p>
						<p className="text-xs text-[var(--muted-foreground)]">
							{profileButton.email || "user@example.com"}
						</p>
					</div>
					<ChevronDown
						className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 ${
							isProfileDropdownOpen ? "rotate-180" : ""
						}`}
					/>
				</button>

				{/* Profile Dropdown dengan animasi */}
				<div
					className={`absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg py-2 z-50 transition-all duration-200 ease-out origin-top ${
						isProfileDropdownOpen
							? "opacity-100 scale-100 translate-y-0"
							: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
					}`}>
					<button
						onClick={profileButton.onClick}
						className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
						Profile Settings
					</button>
					<hr className="my-1 border-[var(--border)]" />
					<button
						onClick={handleLogout}
						className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2">
						<LogOut className="w-4 h-4" />
						<span>Logout</span>
					</button>
				</div>
			</div>
		);
	};
	return (
		<div className="flex justify-between items-start">
			<div className="flex-1 flex items-start space-x-4">
				{backButton && (
					<div
						className="flex-shrink-0 pt-1 animate-fade-in"
						style={{ animationDelay: "0ms" }}>
						<Button.Root
							variant="outline"
							size="sm"
							onClick={backButton.onClick}
							disabled={backButton.disabled}
							className="h-8">
							<Button.Text>Back</Button.Text>
						</Button.Root>
					</div>
				)}
				<div className="flex-1">
					<h1
						className="text-xl font-semibold text-[var(--foreground)] mb-0.5 font-['Inter'] animate-fade-in"
						style={{ animationDelay: "100ms" }}>
						{title}
					</h1>
					{subtitle && (
						<p
							className="text-[var(--muted-foreground)] font-['Inter'] text-xs animate-fade-in"
							style={{ animationDelay: "200ms" }}>
							{subtitle}
						</p>
					)}
				</div>
			</div>

			<div className="flex items-center space-x-4">
				{notificationButton && (
					<button
						onClick={() => {
							try {
								notificationButton.onClick();
							} catch {}
							setIsNotifOpen((v) => !v);
						}}
						disabled={notificationButton.disabled}
						className="relative p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
						style={{ animationDelay: "300ms" }}>
						<notificationButton.icon className="w-5 h-5" />
						{(() => {
							const displayCount =
								notificationCount ?? notificationButton.count ?? 0;
							return displayCount > 0 ? (
								<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
									{displayCount > 9 ? "9+" : displayCount}
								</span>
							) : null;
						})()}
					</button>
				)}

				{/* Notifications Dropdown */}
				<div
					className={`absolute right-16 top-10 w-80 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 transition-all duration-200 ease-out origin-top ${
						isNotifOpen
							? "opacity-100 scale-100 translate-y-0"
							: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
					}`}>
					<div className="p-3 border-b border-[var(--border)]">
						<p className="text-sm font-medium text-[var(--foreground)]">
							Notifikasi Terbaru
						</p>
					</div>
					<div className="max-h-96 overflow-auto">
						{loadingNotifs ? (
							<div className="p-4 text-sm text-[var(--muted-foreground)]">
								Memuat...
							</div>
						) : recentNotifs.length === 0 ? (
							<div className="p-6 text-center">
								<div className="w-10 h-10 rounded-full bg-[var(--muted)] mx-auto mb-2" />
								<p className="text-sm text-[var(--muted-foreground)]">
									Belum ada notifikasi
								</p>
							</div>
						) : (
							<ul className="divide-y divide-[var(--border)]">
								{recentNotifs.map((n) => (
									<li key={n.id} className="p-3">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="text-sm font-medium text-[var(--foreground)] truncate">
													{n.template} • {n.channel}
												</p>
												<p className="text-xs text-[var(--muted-foreground)] truncate">
													{n.recipient || "-"} •{" "}
													{new Date(n.created_at).toLocaleString("id-ID")}
												</p>
												{n.error && (
													<p className="text-xs text-[var(--destructive)] truncate">
														{n.error}
													</p>
												)}
											</div>
											<span
												className={`text-xs px-2 py-0.5 rounded border ${
													n.status === "pending"
														? "border-yellow-400 text-yellow-600"
														: n.status === "sent"
														? "border-green-400 text-green-600"
														: "border-red-400 text-red-600"
												}`}>
												{n.status}
											</span>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
					<div className="p-3 border-t border-[var(--border)]">
						<Link
							href="/admin/notifications"
							className="block w-full text-center text-sm font-medium text-[var(--foreground)] hover:underline">
							View All
						</Link>
					</div>
				</div>

				{showThemeToggle && (
					<div className="animate-fade-in" style={{ animationDelay: "350ms" }}>
						<ThemeToggle />
					</div>
				)}

				<div style={{ animationDelay: "400ms" }}>{renderUserProfile()}</div>
			</div>
		</div>
	);
}
