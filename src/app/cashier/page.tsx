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
	ArrowLeft,
	X,
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { Divider, Input, Button, ThemeToggle } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getStoreId } from "@/lib/store";

export default function POSPage() {
	const router = useRouter();
	const storeId = getStoreId();

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

	// Load products from Supabase
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

	// Load cart from store_carts table
	useEffect(() => {
		if (!storeId) return;

		const fetchCart = async () => {
			const { data, error } = await supabase
				.from("store_carts")
				.select(
					`
					id,
					quantity,
					products (*)
				`
				)
				.eq("store_id", storeId);

			if (error) {
				console.error("Gagal ambil cart:", error);
				return;
			}

			// Transform data to match CartItem interface
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const cartItems: CartItem[] = (data || []).map((item: any) => ({
				product: item.products,
				quantity: item.quantity,
			}));

			setCart(cartItems);
		};

		fetchCart();
	}, [storeId]);

	useEffect(() => {
		fetchUserProfile();
	}, []);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300);

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

	const addToCart = async (product: Product) => {
		if (!storeId) {
			showToast("error", "Store ID tidak ditemukan!");
			return;
		}

		// Check if product already in cart
		const existingCartItem = cart.find(
			(item) => item.product.id === product.id
		);

		if (existingCartItem) {
			// Update quantity in database
			const { error } = await supabase
				.from("store_carts")
				.update({ quantity: existingCartItem.quantity + 1 })
				.eq("store_id", storeId)
				.eq("product_id", product.id);

			if (error) {
				console.error("Gagal update cart:", error);
				showToast("error", "Gagal menambah ke keranjang!");
				return;
			}

			// Update local state
			setCart((prevCart) =>
				prevCart.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				)
			);
		} else {
			// Insert new cart item
			const { error } = await supabase.from("store_carts").insert({
				store_id: storeId,
				product_id: product.id,
				quantity: 1,
			});

			if (error) {
				console.error("Gagal tambah ke cart:", error);
				showToast("error", "Gagal menambah ke keranjang!");
				return;
			}

			// Update local state
			setCart((prevCart) => [
				...prevCart,
				{
					product: product,
					quantity: 1,
				},
			]);
		}

		showToast("success", `${product.name} ditambahkan ke keranjang!`);
	};

	const updateQuantity = async (productId: string, newQuantity: number) => {
		if (!storeId) return;

		if (newQuantity <= 0) {
			removeFromCart(productId);
		} else {
			// Update quantity in database
			const { error } = await supabase
				.from("store_carts")
				.update({ quantity: newQuantity })
				.eq("store_id", storeId)
				.eq("product_id", productId);

			if (error) {
				console.error("Gagal update quantity:", error);
				showToast("error", "Gagal update quantity!");
				return;
			}

			// Update local state
			setCart((prevCart) =>
				prevCart.map((item) =>
					item.product.id === productId
						? { ...item, quantity: newQuantity }
						: item
				)
			);
		}
	};

	const removeFromCart = async (productId: string) => {
		if (!storeId) return;

		// Remove from database
		const { error } = await supabase
			.from("store_carts")
			.delete()
			.eq("store_id", storeId)
			.eq("product_id", productId);

		if (error) {
			console.error("Gagal hapus dari cart:", error);
			showToast("error", "Gagal hapus dari keranjang!");
			return;
		}

		// Update local state
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

		// Redirect ke halaman payment
		router.push("/cashier/payment");
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className="min-h-screen bg-[var(--background)]">
			{/* Header with Theme Toggle */}
			<div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
				<div>
					<h1 className="text-3xl font-bold text-[var(--foreground)]">
						POS Kasir
					</h1>
					<p className="text-[var(--muted-foreground)] mt-1">
						Kelola penjualan dengan mudah
					</p>
				</div>
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-2">
						<span className="text-sm text-[var(--muted-foreground)]">
							Tema:
						</span>
						<ThemeToggle />
					</div>
					<PageHeader
						title=""
						subtitle=""
						notificationButton={{
							icon: Bell,
							onClick: () => {
								console.log("Notification clicked");
							},
							count: 3,
						}}
						profileButton={{
							avatar: userProfile?.avatar,
							name: userProfile?.name,
							email: userProfile?.email,
							onClick: () => {
								window.location.href = "/admin/settings/profile";
							},
						}}
					/>
				</div>
			</div>

			{/* Main POS Interface */}
			<div className="p-6">
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
								<Button.Root
									variant={selectedCategory === "all" ? "default" : "outline"}
									onClick={() => setSelectedCategory("all")}
									className="px-4 py-2 rounded-xl text-sm">
									<Button.Text>Semua</Button.Text>
								</Button.Root>
								{categories.map((category) => (
									<Button.Root
										key={category}
										variant={
											selectedCategory === category ? "default" : "outline"
										}
										onClick={() => setSelectedCategory(category || "")}
										className="px-4 py-2 rounded-xl text-sm">
										<Button.Text>{category}</Button.Text>
									</Button.Root>
								))}
							</div>
						</div>

						{/* Products Grid */}
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto">
							{filteredProducts.map((product, index) => (
								<div
									key={product.id}
									className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
									onClick={() => addToCart(product)}>
									<div className="text-center">
										{product.image_url ? (
											<img
												src={product.image_url}
												alt={product.name}
												className="w-16 h-16 bg-[var(--muted)] rounded-xl mx-auto mb-3 object-cover"
											/>
										) : (
											<div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
												<Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
											</div>
										)}
										<h3 className="font-medium text-[var(--foreground)] text-sm mb-1 truncate">
											{product.name}
										</h3>
										<p className="text-xs text-[var(--muted-foreground)] mb-2">
											{product.category_name}
										</p>
										<p className="font-semibold text-[#FF5701] text-sm">
											{formatCurrency(product.selling_price)}
										</p>
										<p className="text-xs text-[var(--muted-foreground)] mt-1">
											Stok: {product.stock}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Empty State */}
						{filteredProducts.length === 0 && (
							<div className="text-center py-12">
								<Package className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
								<h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
									Produk tidak ditemukan
								</h3>
								<p className="text-[var(--muted-foreground)]">
									Coba ubah kata kunci pencarian atau filter kategori.
								</p>
							</div>
						)}
					</div>

					{/* Shopping Cart */}
					<div className="lg:col-span-1">
						<div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 sticky top-6 h-[calc(100vh-120px)] flex flex-col">
							{/* Cart Header */}
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold text-[var(--foreground)]">
									Keranjang Belanja
								</h2>
								<div className="flex items-center text-sm text-[var(--muted-foreground)]">
									<ShoppingCart className="w-4 h-4 mr-1" />
									{cart.length} item
								</div>
							</div>

							{/* Cart Items */}
							<div className="flex-1 overflow-y-auto mb-4">
								{cart.length === 0 ? (
									<div className="text-center py-8">
										<ShoppingCart className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
										<p className="text-[var(--muted-foreground)] text-sm">
											Keranjang kosong
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{cart.map((item) => (
											<div
												key={item.product.id}
												className="flex items-center justify-between border-b border-[var(--border)] pb-3">
												<div className="flex items-center flex-1">
													{item.product.image_url ? (
														<img
															src={item.product.image_url}
															alt={item.product.name}
															className="w-10 h-10 bg-[var(--muted)] rounded-lg mr-3 object-cover flex-shrink-0"
														/>
													) : (
														<div className="w-10 h-10 bg-[var(--muted)] rounded-lg mr-3 flex items-center justify-center flex-shrink-0">
															<Package className="w-5 h-5 text-[var(--muted-foreground)]" />
														</div>
													)}
													<div className="flex-1 min-w-0">
														<h4 className="text-sm font-medium text-[var(--foreground)] truncate">
															{item.product.name}
														</h4>
														<p className="text-xs text-[var(--muted-foreground)]">
															{formatCurrency(item.product.selling_price)}
														</p>
													</div>
												</div>
												<div className="flex items-center space-x-2">
													<button
														onClick={() =>
															updateQuantity(item.product.id, item.quantity - 1)
														}
														className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center hover:bg-[var(--muted)]/80 transition-colors">
														<Minus className="w-3 h-3 text-[var(--foreground)]" />
													</button>
													<span className="text-sm font-medium w-8 text-center text-[var(--foreground)]">
														{item.quantity}
													</span>
													<button
														onClick={() =>
															updateQuantity(item.product.id, item.quantity + 1)
														}
														className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center hover:bg-[var(--muted)]/80 transition-colors">
														<Plus className="w-3 h-3 text-[var(--foreground)]" />
													</button>
													<button
														onClick={() => removeFromCart(item.product.id)}
														className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 text-red-600 dark:text-red-400 ml-2 transition-colors">
														<X className="w-3 h-3" />
													</button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Cart Footer */}
							{cart.length > 0 && (
								<div className="border-t border-[var(--border)] pt-4 mt-auto">
									<div className="flex justify-between items-center mb-2">
										<span className="text-sm text-[var(--muted-foreground)]">
											Subtotal
										</span>
										<span className="font-medium text-[var(--foreground)]">
											{formatCurrency(cartStats.totalAmount)}
										</span>
									</div>
									<div className="flex justify-between items-center mb-4">
										<span className="text-base font-semibold text-[var(--foreground)]">
											Total
										</span>
										<span className="text-lg font-bold text-orange-600">
											{formatCurrency(cartStats.totalAmount)}
										</span>
									</div>
									<Button.Root
										variant="default"
										onClick={handleCheckout}
										className="w-full rounded-xl mb-2">
										<Button.Text>Checkout</Button.Text>
									</Button.Root>
									<Button.Root
										variant="outline"
										onClick={() => setCart([])}
										className="w-full rounded-xl">
										<Button.Text>Clear Cart</Button.Text>
									</Button.Root>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Toast */}
			{toast && (
				<div className="fixed bottom-4 left-4 z-[9999] pointer-events-none transform transition-all duration-300 ease-out">
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
	);
}
