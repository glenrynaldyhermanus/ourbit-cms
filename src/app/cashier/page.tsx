"use client";

import { useState, useEffect, useMemo } from "react";
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
	Check,
	AlertCircle,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { Divider, Input, Button } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function POSPage() {
	// Fullscreen logic
	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			document.documentElement.requestFullscreen
		) {
			document.documentElement.requestFullscreen().catch(() => {
				/* fallback */
			});
			return () => {
				if (document.exitFullscreen) {
					document.exitFullscreen().catch(() => {
						/* fallback */
					});
				}
			};
		}
	}, []);

	const [products, setProducts] = useState<Product[]>([]);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Ambil produk dari Supabase
	useEffect(() => {
		const fetchProducts = async () => {
			const { data, error } = await supabase
				.from("products")
				.select("*")
				.order("created_at", { ascending: false });
			if (error) {
				console.error("Gagal ambil produk:", error);
				return;
			}
			setProducts(data || []);
		};
		fetchProducts();
	}, []);

	useEffect(() => {
		fetchUserProfile();
	}, []);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300); // 300ms delay

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const showToast = (type: "success" | "error", message: string) => {
		setToast({ type, message });
		setTimeout(() => setToast(null), 3000);
	};

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

	// Filter products - optimized with useMemo
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesSearch = product.name
				.toLowerCase()
				.includes(debouncedSearchTerm.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" ||
				product.category_name === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [products, debouncedSearchTerm, selectedCategory]);

	// Get unique categories - optimized with useMemo
	const categories = useMemo(() => {
		return Array.from(
			new Set(products.map((product) => product.category_name).filter(Boolean))
		);
	}, [products]);

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

	// Calculate totals - optimized with useMemo
	const cartStats = useMemo(() => {
		const totalAmount = cart.reduce(
			(total, item) => total + item.product.selling_price * item.quantity,
			0
		);
		const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

		return {
			totalAmount,
			totalItems,
		};
	}, [cart]);

	const handleCheckout = () => {
		if (cart.length === 0) {
			showToast("error", "Keranjang masih kosong!");
			return;
		}

		// In real app, this would process payment and save transaction
		showToast(
			"success",
			`Pembayaran berhasil! Total: ${formatCurrency(cartStats.totalAmount)}`
		);
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
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
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
				</div>

				{/* Divider */}
				<div className="animate-fade-in" style={{ animationDelay: "30ms" }}>
					<Divider />
				</div>

				{/* Stats Cards */}
				<div className="bg-white rounded-xl">
					<div className="flex items-center">
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "0ms" }}>
							<Stats.Card
								title="Total Produk"
								value={products.length}
								icon={Package}
								iconColor="bg-blue-500/10 text-blue-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "30ms" }}>
							<Stats.Card
								title="Item di Keranjang"
								value={cartStats.totalItems}
								icon={ShoppingCart}
								iconColor="bg-green-500/10 text-green-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "60ms" }}>
							<Stats.Card
								title="Total Transaksi"
								value={formatCurrency(cartStats.totalAmount)}
								icon={DollarSign}
								iconColor="bg-orange-500/10 text-orange-600"
							/>
						</div>
						<div className="w-px h-16 bg-gray-200"></div>
						<div
							className="flex-1 animate-fade-in-left"
							style={{ animationDelay: "90ms" }}>
							<Stats.Card
								title="Kategori"
								value={categories.length}
								icon={Package}
								iconColor="bg-purple-500/10 text-purple-600"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<Divider />

					{/* POS Interface */}
					<div
						className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up"
						style={{ animationDelay: "120ms" }}>
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
										className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
											className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
								{filteredProducts.map((product, index) => (
									<div
										key={product.id}
										className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in-up"
										style={{ animationDelay: `${150 + index * 30}ms` }}
										onClick={() => addToCart(product)}>
										<div className="text-center">
											<div className="w-16 h-16 bg-orange-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
												<Package className="w-8 h-8 text-orange-600" />
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
								<div className="text-center py-12 animate-fade-in">
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
						<div
							className="bg-white border border-gray-200 rounded-xl p-6 animate-fade-in-right"
							style={{ animationDelay: "120ms" }}>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-lg font-semibold text-gray-900">
									Keranjang
								</h2>
								<div className="flex items-center text-sm text-gray-500">
									<ShoppingCart className="w-4 h-4 mr-1" />
									{cartStats.totalItems} item
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
													className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
													<Minus className="w-3 h-3" />
												</button>
												<span className="text-sm font-medium w-8 text-center">
													{item.quantity}
												</span>
												<button
													onClick={() =>
														updateQuantity(item.product.id, item.quantity + 1)
													}
													className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
													<Plus className="w-3 h-3" />
												</button>
												<button
													onClick={() => removeFromCart(item.product.id)}
													className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600 ml-2 transition-colors">
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
											{formatCurrency(cartStats.totalAmount)}
										</span>
									</div>
									<div className="flex justify-between items-center mb-4">
										<span className="text-base font-semibold text-gray-900">
											Total
										</span>
										<span className="text-lg font-bold text-[#FF5701]">
											{formatCurrency(cartStats.totalAmount)}
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

				{/* Toast */}
				{toast && (
					<div className="fixed bottom-4 left-4 z-[9999] pointer-events-none transform transition-all duration-300 ease-out animate-slide-in-right">
						<div
							className={`px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 ease-out ${
								toast.type === "success"
									? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white"
									: "bg-gradient-to-r from-[#EF476F] to-[#DC2626] text-white"
							}`}>
							<div className="flex items-center space-x-3">
								<div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
									{toast.type === "success" ? (
										<Check className="w-3 h-3" />
									) : (
										<AlertCircle className="w-3 h-3" />
									)}
								</div>
								<span className="font-semibold font-['Inter']">
									{toast.message}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
