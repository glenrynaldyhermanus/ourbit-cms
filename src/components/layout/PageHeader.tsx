"use client";

import React, { useState } from "react";
import { LucideIcon, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	notificationButton?: {
		icon: LucideIcon;
		onClick: () => void;
		count?: number;
		disabled?: boolean;
	};
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
	notificationButton,
	profileButton,
}: PageHeaderProps) {
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		window.location.href = "/sign-in";
	};
	return (
		<div className="flex justify-between items-start">
			<div className="flex-1">
				<h1 className="text-xl font-semibold text-[var(--foreground)] mb-0.5 font-['Inter']">
					{title}
				</h1>
				{subtitle && (
					<p className="text-[var(--muted-foreground)] font-['Inter'] text-xs">
						{subtitle}
					</p>
				)}
			</div>

			<div className="flex items-center space-x-4">
				{notificationButton && (
					<button
						onClick={notificationButton.onClick}
						disabled={notificationButton.disabled}
						className="relative p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
						<notificationButton.icon className="w-5 h-5" />
					</button>
				)}

				{profileButton && (
					<div className="relative">
						<button
							onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
							className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
							<div className="flex-shrink-0">
								{profileButton.avatar ? (
									<Image
										src={profileButton.avatar}
										alt={profileButton.name || "Profile"}
										width={32}
										height={32}
										className="w-8 h-8 rounded-full object-cover"
									/>
								) : (
									<div className="w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
										<span className="text-sm font-medium text-[var(--muted-foreground)]">
											{profileButton.name?.charAt(0) || "U"}
										</span>
									</div>
								)}
							</div>
							<div className="hidden md:block text-left">
								<div className="text-sm font-medium text-[var(--foreground)]">
									{profileButton.name || "User"}
								</div>
								<div className="text-xs text-[var(--muted-foreground)]">
									{profileButton.email || "user@example.com"}
								</div>
							</div>
							<div className="text-[var(--muted-foreground)]">
								{isProfileDropdownOpen ? (
									<ChevronUp className="w-4 h-4" />
								) : (
									<ChevronDown className="w-4 h-4" />
								)}
							</div>
						</button>

						{/* Profile Dropdown Menu */}
						{isProfileDropdownOpen && (
							<div className="absolute right-0 top-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 min-w-48">
								<div className="py-1">
									<button
										onClick={profileButton.onClick}
										className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-colors duration-200">
										<span>Profile</span>
									</button>
									<button
										onClick={handleLogout}
										className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200">
										<LogOut className="w-4 h-4" />
										<span>Logout</span>
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
