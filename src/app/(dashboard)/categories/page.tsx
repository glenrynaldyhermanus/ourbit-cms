"use client";

import { useState } from "react";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	Grid3X3,
	Package,
	Eye,
} from "lucide-react";

interface Category {
	id: string;
	name: string;
	description?: string;
	product_count: number;
	created_at: string;
	updated_at: string;
}

// Mock categories data - replace with Supabase data later
const mockCategories: Category[] = [
	{
		id: "1",
		name: "Beverages",
		description: "Minuman panas dan dingin",
		product_count: 15,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
	{
		id: "2",
		name: "Bakery",
		description: "Roti dan kue-kue",
		product_count: 8,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
	{
		id: "3",
		name: "Food",
		description: "Makanan siap saji",
		product_count: 12,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
	{
		id: "4",
		name: "Snacks",
		description: "Cemilan dan makanan ringan",
		product_count: 20,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
	{
		id: "5",
		name: "Desserts",
		description: "Makanan penutup dan es krim",
		product_count: 6,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
	},
];

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>(mockCategories);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);

	const filteredCategories = categories.filter(
		(category) =>
			category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false)
	);

	const totalProducts = categories.reduce(
		(sum, cat) => sum + cat.product_count,
		0
	);

	const handleDeleteCategory = (categoryId: string) => {
		const category = categories.find((c) => c.id === categoryId);
		if (category && category.product_count > 0) {
			alert("Tidak dapat menghapus kategori yang masih memiliki produk!");
			return;
		}

		if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
			setCategories(categories.filter((c) => c.id !== categoryId));
		}
	};

	const CategoryForm = ({
		category,
		onClose,
		onSave,
	}: {
		category?: Category | null;
		onClose: () => void;
		onSave: (category: Partial<Category>) => void;
	}) => {
		const [formData, setFormData] = useState({
			name: category?.name || "",
			description: category?.description || "",
		});

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			onSave(formData);
			onClose();
		};

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg max-w-md w-full p-6">
					<h3 className="text-lg font-semibold mb-4">
						{category ? "Edit Kategori" : "Tambah Kategori Baru"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Nama Kategori
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Masukkan nama kategori"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Deskripsi
							</label>
							<textarea
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Deskripsi kategori (opsional)"
								rows={3}
							/>
						</div>
						<div className="flex space-x-2 pt-4">
							<button
								type="submit"
								className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
								{category ? "Update" : "Tambah"}
							</button>
							<button
								type="button"
								onClick={onClose}
								className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors">
								Batal
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Manajemen Kategori
					</h1>
					<p className="text-gray-600">
						Kelola kategori produk untuk mengorganisir inventory
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
					<Plus className="w-4 h-4" />
					<span>Tambah Kategori</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Total Kategori
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{categories.length}
							</p>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<Grid3X3 className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Produk</p>
							<p className="text-2xl font-bold text-gray-900">
								{totalProducts}
							</p>
						</div>
						<div className="p-3 bg-green-50 rounded-full">
							<Package className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Rata-rata Produk
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{categories.length > 0
									? Math.round(totalProducts / categories.length)
									: 0}
							</p>
						</div>
						<div className="p-3 bg-purple-50 rounded-full">
							<Eye className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="bg-white rounded-lg shadow p-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Cari kategori..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* Categories Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredCategories.map((category) => (
					<div
						key={category.id}
						className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-start justify-between mb-4">
							<div className="flex items-center">
								<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
									<Grid3X3 className="w-6 h-6 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										{category.name}
									</h3>
									<p className="text-sm text-gray-600">
										{category.product_count} produk
									</p>
								</div>
							</div>
							<div className="flex space-x-2">
								<button
									onClick={() => setEditingCategory(category)}
									className="text-gray-400 hover:text-blue-600 transition-colors">
									<Edit2 className="w-4 h-4" />
								</button>
								<button
									onClick={() => handleDeleteCategory(category.id)}
									className="text-gray-400 hover:text-red-600 transition-colors">
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
						</div>
						{category.description && (
							<p className="text-gray-600 text-sm mb-4">
								{category.description}
							</p>
						)}
						<div className="flex items-center justify-between pt-4 border-t border-gray-200">
							<span className="text-xs text-gray-500">
								Dibuat:{" "}
								{new Date(category.created_at).toLocaleDateString("id-ID")}
							</span>
							<div className="flex items-center text-xs text-gray-500">
								<Package className="w-3 h-3 mr-1" />
								{category.product_count}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Empty State */}
			{filteredCategories.length === 0 && (
				<div className="bg-white rounded-lg shadow p-12 text-center">
					<Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{searchTerm ? "Tidak ada kategori ditemukan" : "Belum ada kategori"}
					</h3>
					<p className="text-gray-600 mb-6">
						{searchTerm
							? "Coba ubah kata kunci pencarian Anda."
							: "Mulai dengan menambahkan kategori pertama untuk mengorganisir produk Anda."}
					</p>
					{!searchTerm && (
						<button
							onClick={() => setShowAddModal(true)}
							className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
							Tambah Kategori Pertama
						</button>
					)}
				</div>
			)}

			{/* Add/Edit Category Modal */}
			{(showAddModal || editingCategory) && (
				<CategoryForm
					category={editingCategory}
					onClose={() => {
						setShowAddModal(false);
						setEditingCategory(null);
					}}
					onSave={(categoryData) => {
						if (editingCategory) {
							// Update existing category
							setCategories(
								categories.map((c) =>
									c.id === editingCategory.id
										? {
												...c,
												...categoryData,
												updated_at: new Date().toISOString(),
										  }
										: c
								)
							);
						} else {
							// Add new category
							const newCategory: Category = {
								id: Date.now().toString(),
								...categoryData,
								product_count: 0,
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							} as Category;
							setCategories([...categories, newCategory]);
						}
					}}
				/>
			)}
		</div>
	);
}
