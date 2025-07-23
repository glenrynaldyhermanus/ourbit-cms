import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
	children?: React.ReactNode;
}

interface SkeletonItemProps {
	className?: string;
	width?: string;
	height?: string;
}

interface SkeletonRowProps {
	children: React.ReactNode;
	className?: string;
}

interface SkeletonTableProps {
	rows?: number;
	className?: string;
}

// Root Skeleton Container
function SkeletonRoot({ children, className = "" }: SkeletonProps) {
	return (
		<div
			className={cn(
				"bg-[var(--background)] rounded-xl shadow-sm border border-[var(--border)] p-6 animate-fade-in",
				className
			)}>
			{children}
		</div>
	);
}

// Individual Skeleton Item
function SkeletonItem({ className = "", width, height }: SkeletonItemProps) {
	return (
		<div
			className={cn("bg-[var(--muted)] rounded animate-pulse", className)}
			style={{
				width: width || undefined,
				height: height || undefined,
			}}
		/>
	);
}

// Skeleton Row (for table-like structures)
function SkeletonRow({ children, className = "" }: SkeletonRowProps) {
	return (
		<div className={cn("flex items-center space-x-4 animate-pulse", className)}>
			{children}
		</div>
	);
}

// Skeleton Table (complete table skeleton)
function SkeletonTable({ rows = 5, className = "" }: SkeletonTableProps) {
	return (
		<SkeletonRoot className={className}>
			<div className="space-y-4">
				{Array.from({ length: rows }).map((_, index) => (
					<SkeletonRow key={index}>
						<SkeletonItem className="w-12 h-12 rounded-lg" />
						<div className="flex-1 space-y-2">
							<SkeletonItem className="h-4 w-3/4" />
							<SkeletonItem className="h-3 w-1/2" />
						</div>
						<SkeletonItem className="h-4 w-20" />
						<SkeletonItem className="h-4 w-24" />
						<SkeletonItem className="h-4 w-20" />
					</SkeletonRow>
				))}
			</div>
		</SkeletonRoot>
	);
}

// Compound Component
const Skeleton = Object.assign(SkeletonRoot, {
	Item: SkeletonItem,
	Row: SkeletonRow,
	Table: SkeletonTable,
	Root: SkeletonRoot,
});

export default Skeleton;
