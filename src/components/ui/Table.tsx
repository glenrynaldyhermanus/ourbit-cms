"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableRootProps {
	children: React.ReactNode;
	className?: string;
}

interface TableHeaderProps {
	children: React.ReactNode;
	className?: string;
}

interface TableBodyProps {
	children: React.ReactNode;
	className?: string;
}

interface TableRowProps {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	selected?: boolean;
	hover?: boolean;
}

interface TableCellProps {
	children: React.ReactNode;
	className?: string;
	align?: "left" | "center" | "right";
	width?: string;
}

interface TableHeaderCellProps {
	children: React.ReactNode;
	className?: string;
	align?: "left" | "center" | "right";
	width?: string;
	sortable?: boolean;
	onSort?: () => void;
	sortDirection?: "asc" | "desc" | null;
}

interface TableIconProps {
	icon: LucideIcon;
	className?: string;
}

interface TableEmptyProps {
	children: React.ReactNode;
	className?: string;
	icon?: LucideIcon;
}

// Root Component
function TableRoot({ children, className = "" }: TableRootProps) {
	return (
		<div className={cn("w-full overflow-auto", className)}>
			<table className="w-full caption-bottom text-sm text-[var(--foreground)]">
				{children}
			</table>
		</div>
	);
}

// Header Component
function TableHeader({ children, className = "" }: TableHeaderProps) {
	return (
		<thead
			className={cn(
				"[&_tr]:border-b [&_tr]:border-[var(--border)]",
				className
			)}>
			{children}
		</thead>
	);
}

// Body Component
function TableBody({ children, className = "" }: TableBodyProps) {
	return (
		<tbody className={cn("[&_tr:last-child]:border-0", className)}>
			{children}
		</tbody>
	);
}

// Row Component
function TableRow({
	children,
	className = "",
	onClick,
	selected = false,
	hover = true,
}: TableRowProps) {
	return (
		<tr
			className={cn(
				"border-b border-[var(--border)] transition-colors",
				hover && "hover:bg-[var(--muted)]/70",
				selected && "bg-[var(--muted)]",
				onClick && "cursor-pointer",
				className
			)}
			onClick={onClick}>
			{children}
		</tr>
	);
}

// Cell Component
function TableCell({
	children,
	className = "",
	align = "left",
	width,
}: TableCellProps) {
	const alignClasses = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	};

	return (
		<td
			className={cn(
				"p-4 align-middle text-[var(--foreground)]",
				alignClasses[align],
				className
			)}
			style={width ? { width } : undefined}>
			{children}
		</td>
	);
}

// Header Cell Component
function TableHeaderCell({
	children,
	className = "",
	align = "left",
	width,
	sortable = false,
	onSort,
	sortDirection,
}: TableHeaderCellProps) {
	const alignClasses = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	};

	return (
		<th
			className={cn(
				"h-12 px-4 text-left align-middle font-medium text-[var(--muted-foreground)]",
				alignClasses[align],
				sortable && "cursor-pointer select-none",
				className
			)}
			style={width ? { width } : undefined}
			onClick={sortable ? onSort : undefined}>
			<div
				className={cn(
					"flex items-center gap-2",
					sortable && "hover:text-[var(--foreground)]"
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
function TableIcon({ icon: Icon, className = "" }: TableIconProps) {
	return <Icon className={cn("h-4 w-4", className)} />;
}

// Empty Component
function TableEmpty({ children, className = "", icon: Icon }: TableEmptyProps) {
	return (
		<tr>
			<td
				colSpan={100}
				className={cn(
					"h-24 text-center align-middle text-[var(--muted-foreground)]",
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
const Table = Object.assign(TableRoot, {
	Header: TableHeader,
	Body: TableBody,
	Row: TableRow,
	Cell: TableCell,
	HeaderCell: TableHeaderCell,
	Icon: TableIcon,
	Empty: TableEmpty,
	Root: TableRoot,
});

export default Table;
