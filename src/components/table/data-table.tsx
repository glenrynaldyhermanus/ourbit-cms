"use client";

import React, { useState, useMemo } from "react";
import {
	ChevronUp,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

export interface Column<T> {
	key: string;
	header: string;
	render: (item: T) => React.ReactNode;
	sortable?: boolean;
	sortKey?: keyof T;
}

export interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	loading?: boolean;
	searchKey?: keyof T;
	searchPlaceholder?: string;
	pageSize?: number;
	className?: string;
}

export function DataTable<T>({
	data,
	columns,
	loading = false,
	searchKey,
	searchPlaceholder = "Cari...",
	pageSize = 10,
	className = "",
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

	const getSortIcon = (column: Column<T>) => {
		if (!column.sortable || !column.sortKey) return null;

		const isActive = sortConfig.key === column.sortKey;
		const isAsc = sortConfig.direction === "asc";

		return (
			<div className="flex flex-col -space-y-1">
				<ChevronUp
					className={`h-3 w-3 ${
						isActive && isAsc ? "text-orange-500" : "text-gray-400"
					}`}
				/>
				<ChevronDown
					className={`h-3 w-3 ${
						isActive && !isAsc ? "text-orange-500" : "text-gray-400"
					}`}
				/>
			</div>
		);
	};

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow">
				<div className="px-6 py-4">
					<div className="animate-pulse">
						<div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
						<div className="space-y-3">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="h-4 bg-gray-200 rounded"></div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-white rounded-lg shadow-sm border border-[#D1D5DB] ${className}`}>
			{/* Search Bar */}
			{searchKey && (
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="relative">
						<input
							type="text"
							placeholder={searchPlaceholder}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						/>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="overflow-x-auto rounded-lg">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{columns.map((column, index) => (
								<th
									key={index}
									className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
										column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
									}`}
									onClick={() =>
										column.sortable &&
										column.sortKey &&
										handleSort(column.sortKey)
									}>
									<div className="flex items-center space-x-1">
										<span>{column.header}</span>
										{column.sortable && getSortIcon(column)}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{paginatedData.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-4 text-center text-gray-500">
									Tidak ada data
								</td>
							</tr>
						) : (
							paginatedData.map((item, index) => (
								<tr key={index} className="hover:bg-gray-50">
									{columns.map((column, colIndex) => (
										<td key={colIndex} className="px-6 py-4">
											{column.render(item)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="px-6 py-4 border-t border-gray-200 rounded-b-lg">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<span className="text-sm text-gray-700">
								Menampilkan {startIndex + 1}-
								{Math.min(endIndex, sortedData.length)} dari {sortedData.length}{" "}
								data
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
								<ChevronLeft className="h-4 w-4" />
							</button>
							<span className="text-sm text-gray-700">
								Halaman {currentPage} dari {totalPages}
							</span>
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
