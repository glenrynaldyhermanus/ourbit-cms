"use client";

import React, { useState, useEffect } from "react";
import { LucideIcon, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { AuthUtil } from "@/lib/auth";
import { Button } from "@/components/ui";
import ThemeToggle from "@/components/ui/ThemeToggle";

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
					className="flex items-center space-x-2 p-1 rounded-lg hover:bg-[var(--muted)]">
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
						onClick={notificationButton.onClick}
						disabled={notificationButton.disabled}
						className="relative p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
						style={{ animationDelay: "300ms" }}>
						<notificationButton.icon className="w-5 h-5" />
						{notificationButton.count && notificationButton.count > 0 && (
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
								{notificationButton.count > 9 ? "9+" : notificationButton.count}
							</span>
						)}
					</button>
				)}

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
