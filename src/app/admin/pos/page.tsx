"use client";

import { useState, useEffect } from "react";
import { CartItem, Product } from "@/types";
import {
	Plus,
	Minus,
	Trash2,
	CreditCard,
	DollarSign,
	Bell,
	ShoppingCart,
	Package,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { Divider, Input, Button } from "@/components/ui";
import { supabase } from "@/lib/supabase";

// Mock products data - in real app this would come from Supabase
const mockProducts: Product[] = [
	{
		id: "1",
		name: "Kopi Arabica",
		selling_price: 25000,
		purchase_price: 20000,
		category_name: "Minuman",
		stock: 50,
		code: "BEV001",
		type: "beverage",
		weight_grams: 250,
		min_stock: 10,
		is_active: true,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
		store_id: "1",
	},
	{
		id: "2",
		name: "Sandwich Club",
		selling_price: 35000,
		purchase_price: 28000,
		category_name: "Makanan",
		stock: 25,
		code: "FOOD001",
		type: "food",
		weight_grams: 300,
		min_stock: 5,
		is_active: true,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
		store_id: "1",
	},
	{
		id: "3",
		name: "Croissant",
		selling_price: 18000,
		purchase_price: 14000,
		category_name: "Makanan",
		stock: 30,
		code: "FOOD002",
		type: "food",
		weight_grams: 150,
		min_stock: 10,
		is_active: true,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
		store_id: "1",
	},
	{
		id: "4",
		name: "Teh Hijau",
		selling_price: 20000,
		purchase_price: 15000,
		category_name: "Minuman",
		stock: 40,
		code: "BEV002",
		type: "beverage",
		weight_grams: 200,
		min_stock: 15,
		is_active: true,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
		store_id: "1",
	},
	{
		id: "5",
		name: "Muffin Blueberry",
		selling_price: 22000,
		purchase_price: 17000,
		category_name: "Makanan",
		stock: 20,
		code: "FOOD003",
		type: "food",
		weight_grams: 180,
		min_stock: 8,
		is_active: true,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
		store_id: "1",
	},
];

export default function POSPage() {
	const [products] = useState<Product[]>(mockProducts);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);

	useEffect(() => {
		fetchUserProfile();
	}, []);

	const fetchUserProfile = async () => {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				console.error("Error fetching user:", error);
				return;
			}

			setUserProfile({
				name:
					user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
				email: user.email || "user@example.com",
				avatar: user.user_metadata?.avatar_url,
			});
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	const filteredProducts = products.filter((product) => {
		const matchesSearch = product.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || product.category_name === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const categories = Array.from(
		new Set(products.map((product) => product.category_name).filter(Boolean))
	);

	const addToCart = (product: Product) => {
		setCart((prevCart) => {
			const existingItem = prevCart.find(
				(item) => item.product.id === product.id
			);
			if (existingItem) {
				return prevCart.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			} else {
				return [
					...prevCart,
					{
						product: product,
						quantity: 1,
					},
				];
			}
		});
	};

	const updateQuantity = (productId: string, newQuantity: number) => {
		if (newQuantity <= 0) {
			removeFromCart(productId);
		} else {
			setCart((prevCart) =>
				prevCart.map((item) =>
					item.product.id === productId
						? { ...item, quantity: newQuantity }
						: item
				)
			);
		}
	};

	const removeFromCart = (productId: string) => {
		setCart((prevCart) =>
			prevCart.filter((item) => item.product.id !== productId)
		);
	};

	const getTotalAmount = () => {
		return cart.reduce(
			(total, item) => total + item.product.selling_price * item.quantity,
			0
		);
	};

	const getTotalItems = () => {
		return cart.reduce((total, item) => total + item.quantity, 0);
	};

	const handleCheckout = () => {
		if (cart.length === 0) {
			alert("Keranjang masih kosong!");
			return;
		}

		// In real app, this would process payment and save transaction
		alert(`Pembayaran berhasil!\nTotal: ${formatCurrency(getTotalAmount())}`);
		setCart([]);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<PageHeader
					title="Point of Sale (POS)"
					subtitle="Sistem kasir untuk transaksi penjualan"
					notificationButton={{
						icon: Bell,
						onClick: () => {
							// Handle notification click
							console.log("Notification clicked");
						},
						count: 3, // Example notification count
					}}
					profileButton={{
						avatar: userProfile?.avatar,
						name: userProfile?.name,
						email: userProfile?.email,
						onClick: () => {
							// Handle profile click - redirect to profile page
							window.location.href = "/admin/settings/profile";
						},
					}}
				/>

				{/* Divider */}
				<Divider />

				{/* Stats Cards */}
				<Stats.Grid>
					<Stats.Card
						title="Total Produk"
						value={products.length}
						icon={Package}
						iconColor="bg-blue-500/10 text-blue-600"
					/>
					<Stats.Card
						title="Item di Keranjang"
						value={getTotalItems()}
						icon={ShoppingCart}
						iconColor="bg-green-500/10 text-green-600"
					/>
					<Stats.Card
						title="Total Transaksi"
						value={formatCurrency(getTotalAmount())}
						icon={DollarSign}
						iconColor="bg-orange-500/10 text-orange-600"
					/>
					<Stats.Card
						title="Kategori"
						value={categories.length}
						icon={Package}
						iconColor="bg-purple-500/10 text-purple-600"
					/>
				</Stats.Grid>

				<div className="space-y-8">
					<Divider />

					{/* POS Interface */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Products Section */}
						<div className="lg:col-span-2 space-y-4">
							{/* Search and Category Filter */}
							<div className="flex flex-col md:flex-row gap-4">
								<div className="flex-1">
									<Input.Root>
										<Input.Field
											type="text"
											value={searchTerm}
											onChange={setSearchTerm}
											placeholder="Cari produk..."
										/>
									</Input.Root>
								</div>
								<div className="flex gap-2 flex-wrap">
									<button
										onClick={() => setSelectedCategory("all")}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
											selectedCategory === "all"
												? "bg-[#FF5701] text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}>
										Semua
									</button>
									{categories.map((category) => (
										<button
											key={category}
											onClick={() => setSelectedCategory(category || "")}
											className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
												selectedCategory === category
													? "bg-[#FF5701] text-white"
													: "bg-gray-100 text-gray-700 hover:bg-gray-200"
											}`}>
											{category}
										</button>
									))}
								</div>
							</div>

							{/* Products Grid */}
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{filteredProducts.map((product) => (
									<div
										key={product.id}
										className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
										onClick={() => addToCart(product)}>
										<div className="text-center">
											<div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
												<Package className="w-8 h-8 text-gray-400" />
											</div>
											<h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
												{product.name}
											</h3>
											<p className="text-xs text-gray-500 mb-2">
												{product.category_name}
											</p>
											<p className="font-semibold text-[#FF5701] text-sm">
												{formatCurrency(product.selling_price)}
											</p>
											<p className="text-xs text-gray-400 mt-1">
												Stok: {product.stock}
											</p>
										</div>
									</div>
								))}
							</div>

							{/* Empty State */}
							{filteredProducts.length === 0 && (
								<div className="text-center py-12">
									<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Produk tidak ditemukan
									</h3>
									<p className="text-gray-600">
										Coba ubah kata kunci pencarian atau filter kategori.
									</p>
								</div>
							)}
						</div>

						{/* Cart Section */}
						<div className="bg-white border border-gray-200 rounded-xl p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-lg font-semibold text-gray-900">
									Keranjang
								</h2>
								<div className="flex items-center text-sm text-gray-500">
									<ShoppingCart className="w-4 h-4 mr-1" />
									{getTotalItems()} item
								</div>
							</div>

							{/* Cart Items */}
							<div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
								{cart.length === 0 ? (
									<div className="text-center py-8">
										<ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
										<p className="text-gray-500 text-sm">Keranjang kosong</p>
									</div>
								) : (
									cart.map((item) => (
										<div
											key={item.product.id}
											className="flex items-center justify-between border-b border-gray-100 pb-3">
											<div className="flex-1 min-w-0">
												<h4 className="text-sm font-medium text-gray-900 truncate">
													{item.product.name}
												</h4>
												<p className="text-xs text-gray-500">
													{formatCurrency(item.product.selling_price)}
												</p>
											</div>
											<div className="flex items-center space-x-2 ml-4">
												<button
													onClick={() =>
														updateQuantity(item.product.id, item.quantity - 1)
													}
													className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
													<Minus className="w-3 h-3" />
												</button>
												<span className="text-sm font-medium w-8 text-center">
													{item.quantity}
												</span>
												<button
													onClick={() =>
														updateQuantity(item.product.id, item.quantity + 1)
													}
													className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
													<Plus className="w-3 h-3" />
												</button>
												<button
													onClick={() => removeFromCart(item.product.id)}
													className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600 ml-2">
													<Trash2 className="w-3 h-3" />
												</button>
											</div>
										</div>
									))
								)}
							</div>

							{/* Cart Summary */}
							<div className="space-y-4">
								<div className="border-t border-gray-200 pt-4">
									<div className="flex justify-between items-center mb-2">
										<span className="text-sm text-gray-600">Subtotal</span>
										<span className="text-sm font-medium">
											{formatCurrency(getTotalAmount())}
										</span>
									</div>
									<div className="flex justify-between items-center mb-4">
										<span className="text-base font-semibold text-gray-900">
											Total
										</span>
										<span className="text-lg font-bold text-[#FF5701]">
											{formatCurrency(getTotalAmount())}
										</span>
									</div>
								</div>

								{/* Checkout Button */}
								<Button.Root
									variant="default"
									onClick={handleCheckout}
									disabled={cart.length === 0}
									className="w-full rounded-xl">
									<Button.Icon icon={CreditCard} />
									<Button.Text>Bayar Sekarang</Button.Text>
								</Button.Root>

								{/* Clear Cart Button */}
								{cart.length > 0 && (
									<button
										onClick={() => setCart([])}
										className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
										Kosongkan Keranjang
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
