"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlignStatsRootProps {
	children: React.ReactNode;
	className?: string;
}

interface AlignStatsCardProps {
	title: string;
	value: string | number;
	change?: {
		value: string | number;
		type: "positive" | "negative" | "neutral";
		period?: string;
	};
	icon: LucideIcon;
	iconColor?: string;
	className?: string;
}

interface AlignStatsGridProps {
	children: React.ReactNode;
	className?: string;
	columns?: 1 | 2 | 3 | 4;
}

// Root Component
function AlignStatsRoot({ children, className = "" }: AlignStatsRootProps) {
	return <div className={cn("space-y-6", className)}>{children}</div>;
}

// Grid Component
function AlignStatsGrid({
	children,
	className = "",
	columns = 4,
}: AlignStatsGridProps) {
	const gridClasses = {
		1: "grid-cols-1",
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div
			className={cn(
				"bg-[var(--card)] dark:bg-[var(--background)] rounded-xl",
				className
			)}>
			<div className={cn("grid", gridClasses[columns])}>{children}</div>
		</div>
	);
}

// Card Component
function AlignStatsCard({
	title,
	value,
	change,
	icon: Icon,
	iconColor = "bg-blue-500/10 text-blue-600",
	className = "",
}: AlignStatsCardProps) {
	const changeClasses = {
		positive: "text-green-600",
		negative: "text-red-600",
		neutral: "text-[var(--muted-foreground)]",
	};

	const changeIcon = {
		positive: "↗",
		negative: "↘",
		neutral: "→",
	};

	return (
		<div
			className={cn(
				"py-3 px-4",
				"hover:bg-[var(--muted)]/50 transition-colors duration-200",
				className
			)}>
			<div className="flex items-center space-x-3">
				<div className={cn("p-2 rounded-xl", iconColor)}>
					<Icon className="h-5 w-5" />
				</div>
				<div className="space-y-1">
					<p className="text-sm font-medium text-[var(--muted-foreground)]">
						{title}
					</p>
					<div className="flex items-baseline gap-2">
						<p className="text-2xl font-bold text-[var(--foreground)]">
							{typeof value === "number"
								? new Intl.NumberFormat("id-ID").format(value)
								: value}
						</p>
						{change && (
							<div className="flex items-center gap-1">
								<span
									className={cn(
										"text-sm font-medium",
										changeClasses[change.type]
									)}>
									{changeIcon[change.type]} {change.value}
								</span>
								{change.period && (
									<span className="text-xs text-[var(--muted-foreground)]">
										{change.period}
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// Compound Component
const AlignStats = Object.assign(AlignStatsRoot, {
	Grid: AlignStatsGrid,
	Card: AlignStatsCard,
	Root: AlignStatsRoot,
});

export default AlignStats;
