"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlignTableRootProps {
	children: React.ReactNode;
	className?: string;
}

interface AlignTableHeaderProps {
	children: React.ReactNode;
	className?: string;
}

interface AlignTableBodyProps {
	children: React.ReactNode;
	className?: string;
}

interface AlignTableRowProps {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	selected?: boolean;
	hover?: boolean;
}

interface AlignTableCellProps {
	children: React.ReactNode;
	className?: string;
	align?: "left" | "center" | "right";
	width?: string;
}

interface AlignTableHeaderCellProps {
	children: React.ReactNode;
	className?: string;
	align?: "left" | "center" | "right";
	width?: string;
	sortable?: boolean;
	onSort?: () => void;
	sortDirection?: "asc" | "desc" | null;
}

interface AlignTableIconProps {
	icon: LucideIcon;
	className?: string;
}

interface AlignTableEmptyProps {
	children: React.ReactNode;
	className?: string;
	icon?: LucideIcon;
}

// Root Component
function AlignTableRoot({ children, className = "" }: AlignTableRootProps) {
	return (
		<div className={cn("w-full overflow-auto", className)}>
			<table className="w-full caption-bottom text-sm">{children}</table>
		</div>
	);
}

// Header Component
function AlignTableHeader({ children, className = "" }: AlignTableHeaderProps) {
	return (
		<thead className={cn("[&_tr]:border-b [&_tr]:border-gray-200", className)}>
			{children}
		</thead>
	);
}

// Body Component
function AlignTableBody({ children, className = "" }: AlignTableBodyProps) {
	return (
		<tbody className={cn("[&_tr:last-child]:border-0", className)}>
			{children}
		</tbody>
	);
}

// Row Component
function AlignTableRow({
	children,
	className = "",
	onClick,
	selected = false,
	hover = true,
}: AlignTableRowProps) {
	return (
		<tr
			className={cn(
				"border-b border-gray-100 transition-colors",
				hover && "hover:bg-gray-100/70",
				selected && "bg-muted",
				onClick && "cursor-pointer",
				className
			)}
			onClick={onClick}>
			{children}
		</tr>
	);
}

// Cell Component
function AlignTableCell({
	children,
	className = "",
	align = "left",
	width,
}: AlignTableCellProps) {
	const alignClasses = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	};

	return (
		<td
			className={cn("p-4 align-middle", alignClasses[align], className)}
			style={width ? { width } : undefined}>
			{children}
		</td>
	);
}

// Header Cell Component
function AlignTableHeaderCell({
	children,
	className = "",
	align = "left",
	width,
	sortable = false,
	onSort,
	sortDirection,
}: AlignTableHeaderCellProps) {
	const alignClasses = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	};

	return (
		<th
			className={cn(
				"h-12 px-4 text-left align-middle font-medium text-muted-foreground",
				alignClasses[align],
				sortable && "cursor-pointer select-none",
				className
			)}
			style={width ? { width } : undefined}
			onClick={sortable ? onSort : undefined}>
			<div
				className={cn(
					"flex items-center gap-2",
					sortable && "hover:text-foreground"
				)}>
				{children}
				{sortable && sortDirection && (
					<span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
				)}
			</div>
		</th>
	);
}

// Icon Component
function AlignTableIcon({ icon: Icon, className = "" }: AlignTableIconProps) {
	return <Icon className={cn("h-4 w-4", className)} />;
}

// Empty Component
function AlignTableEmpty({
	children,
	className = "",
	icon: Icon,
}: AlignTableEmptyProps) {
	return (
		<tr>
			<td
				colSpan={100}
				className={cn(
					"h-24 text-center align-middle text-muted-foreground",
					className
				)}>
				<div className="flex flex-col items-center justify-center space-y-2">
					{Icon && <Icon className="h-8 w-8 opacity-50" />}
					{children}
				</div>
			</td>
		</tr>
	);
}

// Compound Component
const AlignTable = Object.assign(AlignTableRoot, {
	Header: AlignTableHeader,
	Body: AlignTableBody,
	Row: AlignTableRow,
	Cell: AlignTableCell,
	HeaderCell: AlignTableHeaderCell,
	Icon: AlignTableIcon,
	Empty: AlignTableEmpty,
	Root: AlignTableRoot,
});

export default AlignTable;
