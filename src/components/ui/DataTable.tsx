"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, LucideIcon } from "lucide-react";
import { Table, Input } from "@/components/ui";

export interface Column<T> {
	key: string;
	header: string;
	render: (item: T) => React.ReactNode;
	sortable?: boolean;
	sortKey?: keyof T;
	align?: "left" | "center" | "right";
	width?: string;
}

export interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	loading?: boolean;
	searchKey?: keyof T;
	searchPlaceholder?: string;
	pageSize?: number;
	className?: string;
	emptyMessage?: string;
	emptyIcon?: LucideIcon;
}

export function DataTable<T>({
	data,
	columns,
	loading = false,
	searchKey,
	searchPlaceholder = "Cari...",
	pageSize = 10,
	className = "",
	emptyMessage = "Tidak ada data",
	emptyIcon,
}: DataTableProps<T>) {
	const [searchTerm, setSearchTerm] = useState("");
	const [sortConfig, setSortConfig] = useState<{
		key: keyof T | null;
		direction: "asc" | "desc";
	}>({ key: null, direction: "asc" });
	const [currentPage, setCurrentPage] = useState(1);

	// Filter data berdasarkan search term
	const filteredData = useMemo(() => {
		if (!searchTerm || !searchKey) return data;

		return data.filter((item) => {
			const value = item[searchKey];
			if (value === null || value === undefined) return false;

			const stringValue = String(value).toLowerCase();
			return stringValue.includes(searchTerm.toLowerCase());
		});
	}, [data, searchTerm, searchKey]);

	// Sort data
	const sortedData = useMemo(() => {
		if (!sortConfig.key) return filteredData;

		return [...filteredData].sort((a, b) => {
			const aValue = a[sortConfig.key!];
			const bValue = b[sortConfig.key!];

			// Handle null values
			if (aValue === null && bValue === null) return 0;
			if (aValue === null) return 1;
			if (bValue === null) return -1;

			let comparison = 0;
			if (typeof aValue === "string" && typeof bValue === "string") {
				comparison = aValue.localeCompare(bValue);
			} else if (typeof aValue === "number" && typeof bValue === "number") {
				comparison = aValue - bValue;
			} else {
				comparison = String(aValue).localeCompare(String(bValue));
			}

			return sortConfig.direction === "asc" ? comparison : -comparison;
		});
	}, [filteredData, sortConfig]);

	// Pagination
	const totalPages = Math.ceil(sortedData.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedData = sortedData.slice(startIndex, endIndex);

	const handleSort = (key: keyof T) => {
		setSortConfig((prev) => ({
			key,
			direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const getSortDirection = (column: Column<T>) => {
		if (!column.sortable || !column.sortKey) return null;
		if (sortConfig.key !== column.sortKey) return null;
		return sortConfig.direction;
	};

	if (loading) {
		return (
			<div className="bg-[var(--background)] rounded-lg shadow-sm border border-[var(--border)]">
				<div className="px-6 py-4">
					<div className="animate-pulse">
						<div className="h-4 bg-[var(--muted)] rounded w-1/4 mb-4"></div>
						<div className="space-y-3">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="h-4 bg-[var(--muted)] rounded"></div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-[var(--background)] rounded-lg shadow-sm border border-[var(--border)] ${className}`}>
			{/* Search Bar */}
			{searchKey && (
				<div className="px-6 py-4 border-b border-[var(--border)]">
					<Input.Root>
						<Input.Icon icon={Search} position="leading" />
						<Input.Field
							type="text"
							value={searchTerm}
							onChange={setSearchTerm}
							placeholder={searchPlaceholder}
							className="pl-10"
						/>
					</Input.Root>
				</div>
			)}

			{/* Table */}
			<Table.Root className="overflow-x-auto">
				<Table.Header>
					<Table.Row>
						{columns.map((column, index) => (
							<Table.HeaderCell
								key={index}
								align={column.align || "left"}
								width={column.width}
								sortable={column.sortable}
								onSort={() =>
									column.sortable &&
									column.sortKey &&
									handleSort(column.sortKey)
								}
								sortDirection={getSortDirection(column)}>
								{column.header}
							</Table.HeaderCell>
						))}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{paginatedData.length === 0 ? (
						<Table.Empty icon={emptyIcon}>{emptyMessage}</Table.Empty>
					) : (
						paginatedData.map((item, index) => (
							<Table.Row
								key={index}
								className={index % 2 === 1 ? "bg-[var(--muted)]/30" : ""}>
								{columns.map((column, colIndex) => (
									<Table.Cell key={colIndex} align={column.align || "left"}>
										{column.render(item)}
									</Table.Cell>
								))}
							</Table.Row>
						))
					)}
				</Table.Body>
			</Table.Root>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="px-6 py-4 border-t border-[var(--border)] rounded-b-lg">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<span className="text-sm text-[var(--muted-foreground)]">
								Menampilkan {startIndex + 1}-
								{Math.min(endIndex, sortedData.length)} dari {sortedData.length}{" "}
								data
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed">
								<ChevronLeft className="h-4 w-4" />
							</button>
							<span className="text-sm text-[var(--muted-foreground)]">
								Halaman {currentPage} dari {totalPages}
							</span>
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed">
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
