"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import { getStoreId } from "@/lib/store";
import { CartItem } from "@/types";
import { Package, CreditCard, ArrowLeft, Check } from "lucide-react";

interface PaymentType {
	id: string;
	code: string;
	name: string;
}

interface PaymentMethod {
	id: string;
	payment_type_id: string;
	code: string;
	name: string;
}

interface StorePaymentMethod {
	id: string;
	payment_method_id: string;
	is_active: boolean;
}

export default function PaymentPage() {
	const router = useRouter();
	const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [storePaymentMethods, setStorePaymentMethods] = useState<
		StorePaymentMethod[]
	>([]);
	const [selectedPaymentMethod, setSelectedPaymentMethod] =
		useState<string>("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
	const storeId = getStoreId();

	// Get cart from store_carts table
	const [cart, setCart] = useState<CartItem[]>([]);

	useEffect(() => {
		// Get cart data from store_carts table
		if (!storeId) {
			router.push("/cashier");
			return;
		}

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
				router.push("/cashier");
				return;
			}

			if (!data || data.length === 0) {
				// If no cart, redirect back to cashier
				router.push("/cashier");
				return;
			}

			// Transform data to match CartItem interface
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const cartItems: CartItem[] = data.map((item: any) => ({
				product: item.products,
				quantity: item.quantity,
			}));

			setCart(cartItems);
		};

		fetchCart();
	}, [router, storeId]);

	useEffect(() => {
		const fetchTypes = async () => {
			const { data, error } = await supabase
				.from("payment_types")
				.select("id, code, name")
				.order("name");
			if (!error && data) {
				setPaymentTypes(data);
			}
		};
		fetchTypes();
	}, []);

	useEffect(() => {
		const fetchMethods = async () => {
			const { data, error } = await supabase
				.from("payment_methods")
				.select("id, payment_type_id, code, name")
				.order("name");
			if (!error && data) setPaymentMethods(data);
		};
		fetchMethods();
	}, []);

	useEffect(() => {
		if (storeId) {
			const fetchStoreMethods = async () => {
				const { data, error } = await supabase
					.from("store_payment_methods")
					.select("id, payment_method_id, is_active")
					.eq("store_id", storeId)
					.eq("is_active", true);
				if (!error && data) setStorePaymentMethods(data);
			};
			fetchStoreMethods();
		}
	}, [storeId]);

	const getActiveMethodsByType = (typeId: string) => {
		const activeMethodIds = new Set(
			storePaymentMethods.map((spm) => spm.payment_method_id)
		);
		return paymentMethods.filter(
			(pm) => pm.payment_type_id === typeId && activeMethodIds.has(pm.id)
		);
	};

	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const calculateTotal = () => {
		return cart.reduce(
			(total, item) => total + item.product.selling_price * item.quantity,
			0
		);
	};

	const calculateTax = (subtotal: number) => {
		return subtotal * 0.11; // PPN 11%
	};

	const subtotal = calculateTotal();
	const tax = calculateTax(subtotal);
	const total = subtotal + tax;

	const handlePaymentMethodSelect = (methodId: string) => {
		setSelectedPaymentMethod(methodId);
	};

	const handleProcessPayment = async () => {
		if (!selectedPaymentMethod || !storeId) return;

		setIsProcessing(true);

		try {
			// Ambil user info (kasir)
			const { data: userData } = await supabase.auth.getUser();
			const cashierId = userData?.user?.id || null;

			// Generate sale_number (misal: POS-YYYYMMDD-HHmmss)
			const now = new Date();
			const saleNumber = `POS-${now.getFullYear()}${(now.getMonth() + 1)
				.toString()
				.padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
				.getHours()
				.toString()
				.padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
				.getSeconds()
				.toString()
				.padStart(2, "0")}`;

			// 1. Insert ke tabel sales
			const { data: salesInsert, error: salesError } = await supabase
				.from("sales")
				.insert([
					{
						store_id: storeId,
						sale_number: saleNumber,
						sale_date: now.toISOString(),
						subtotal,
						discount_amount: 0,
						tax_amount: tax,
						total_amount: total,
						payment_method_id: selectedPaymentMethod,
						status: "completed",
						notes: null,
						cashier_id: cashierId,
						customer_id: null,
					},
				])
				.select()
				.single();

			if (salesError || !salesInsert)
				throw salesError || new Error("Gagal insert sales");

			const saleId = salesInsert.id;

			// 2. Insert ke tabel sales_items
			const salesItemsPayload = cart.map((item) => ({
				sale_id: saleId,
				product_id: item.product.id,
				quantity: item.quantity,
				unit_price: item.product.selling_price,
				discount_amount: 0,
				tax_amount: 0,
				total_amount: item.product.selling_price * item.quantity,
			}));
			const { error: salesItemsError } = await supabase
				.from("sales_items")
				.insert(salesItemsPayload);
			if (salesItemsError) throw salesItemsError;

			// 3. Insert ke tabel financial_transactions
			const { error: finError } = await supabase
				.from("financial_transactions")
				.insert([
					{
						store_id: storeId,
						transaction_date: now.toISOString(),
						transaction_type: "income",
						category: "sales",
						description: `POS Sale #${saleNumber}`,
						amount: total,
						payment_method_id: selectedPaymentMethod,
						status: "completed",
						notes: null,
					},
				]);
			if (finError) throw finError;

			// Process each cart item - reduce stock and log inventory transaction
			for (const item of cart) {
				// Update product stock
				const { data: product, error: fetchError } = await supabase
					.from("products")
					.select("stock")
					.eq("id", item.product.id)
					.single();

				if (fetchError) {
					console.error("Error fetching product:", fetchError);
					continue;
				}

				const newStock = product.stock - item.quantity;

				// Update stock
				const { error: updateError } = await supabase
					.from("products")
					.update({ stock: newStock })
					.eq("id", item.product.id);

				if (updateError) {
					console.error("Error updating stock:", updateError);
					continue;
				}

				// Log inventory transaction
				const { error: logError } = await supabase
					.from("inventory_transactions")
					.insert({
						product_id: item.product.id,
						store_id: storeId,
						type: 2, // Sale/outbound
						quantity: -item.quantity,
						reference: `POS-${Date.now()}`,
						note: "POS Sale",
						previous_qty: product.stock,
						new_qty: newStock,
						unit_cost: item.product.purchase_price,
						total_cost: item.product.purchase_price * item.quantity,
					});

				if (logError) {
					console.error("Error logging transaction:", logError);
				}
			}

			// Clear cart from store_carts table
			const { error: clearCartError } = await supabase
				.from("store_carts")
				.delete()
				.eq("store_id", storeId);

			if (clearCartError) {
				console.error("Error clearing cart:", clearCartError);
			}

			// Show success animation
			setIsPaymentSuccess(true);
		} catch (error) {
			console.error("Payment processing error:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleBackToCashier = () => {
		router.push("/cashier");
	};

	return (
		<div className="min-h-screen bg-[var(--background)] p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<Button.Root
						variant="outline"
						onClick={() => router.push("/cashier")}
						className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<Button.Text>Kembali</Button.Text>
					</Button.Root>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Pembayaran
					</h1>
					<div />
				</div>

				{/* Main Layout - 2 Panels Horizontal */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Panel - Order Summary */}
					<div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
						<div className="flex items-center mb-4">
							<Package className="w-5 h-5 mr-2 text-orange-600" />
							<h2 className="text-lg font-semibold text-[var(--foreground)]">
								Ringkasan Pesanan
							</h2>
						</div>

						{/* Order Items */}
						<div className="space-y-3 mb-6">
							{cart.map((item, index) => (
								<div
									key={index}
									className="flex items-center justify-between py-3 border-b border-[var(--border)]">
									<div className="flex items-center">
										{item.product.image_url ? (
											<img
												src={item.product.image_url}
												alt={item.product.name}
												className="w-12 h-12 bg-[var(--muted)] rounded-lg mr-4 object-cover flex-shrink-0"
											/>
										) : (
											<div className="w-12 h-12 bg-[var(--muted)] rounded-lg mr-4 flex items-center justify-center flex-shrink-0">
												<Package className="w-6 h-6 text-[var(--muted-foreground)]" />
											</div>
										)}
										<div>
											<h4 className="font-medium text-[var(--foreground)]">
												{item.product.name}
											</h4>
											<p className="text-sm text-[var(--muted-foreground)]">
												{item.quantity}x{" "}
												{formatCurrency(item.product.selling_price)}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-[var(--foreground)]">
											{formatCurrency(
												item.quantity * item.product.selling_price
											)}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Order Summary */}
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-[var(--muted-foreground)]">Subtotal</span>
								<span className="font-medium text-[var(--foreground)]">
									{formatCurrency(subtotal)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--muted-foreground)]">
									PPN (11%)
								</span>
								<span className="font-medium text-[var(--foreground)]">
									{formatCurrency(tax)}
								</span>
							</div>
							<Divider />
							<div className="flex justify-between text-lg font-bold">
								<span>Total</span>
								<span className="text-orange-600">{formatCurrency(total)}</span>
							</div>
						</div>
					</div>

					{/* Right Panel - Payment Selection or Success */}
					<div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
						{!isPaymentSuccess ? (
							<>
								<h2 className="text-xl font-semibold mb-4 flex items-center">
									<CreditCard className="w-5 h-5 mr-2 text-orange-600" />
									Pilih Metode Pembayaran
								</h2>
								<Divider />

								{paymentTypes.length > 0 ? (
									<Tabs
										defaultValue={paymentTypes[0]?.id || ""}
										className="mt-4">
										<TabsList className="grid w-full grid-cols-2">
											{paymentTypes.map((type) => (
												<TabsTrigger
													key={type.id}
													value={type.id}
													className="text-xs">
													{type.name}
												</TabsTrigger>
											))}
										</TabsList>

										{paymentTypes.map((type) => (
											<TabsContent key={type.id} value={type.id}>
												<div className="mt-6">
													{getActiveMethodsByType(type.id).length === 0 ? (
														<div className="text-center text-[var(--muted-foreground)] py-8">
															Tidak ada metode pembayaran tersedia
														</div>
													) : (
														<div className="grid grid-cols-1 gap-3">
															{getActiveMethodsByType(type.id).map((method) => (
																<Button.Root
																	key={method.id}
																	variant={
																		selectedPaymentMethod === method.id
																			? "default"
																			: "outline"
																	}
																	className="w-full justify-start"
																	onClick={() =>
																		handlePaymentMethodSelect(method.id)
																	}>
																	<Button.Text>{method.name}</Button.Text>
																</Button.Root>
															))}
														</div>
													)}
												</div>
											</TabsContent>
										))}
									</Tabs>
								) : (
									<div className="text-center text-[var(--muted-foreground)] py-8">
										Memuat metode pembayaran...
									</div>
								)}

								{/* Process Payment Button */}
								<div className="mt-8">
									<Button.Root
										variant="default"
										className="w-full"
										onClick={handleProcessPayment}
										disabled={!selectedPaymentMethod || isProcessing}>
										<Button.Text>
											{isProcessing
												? "Memproses..."
												: `Bayar ${formatCurrency(total)}`}
										</Button.Text>
									</Button.Root>
								</div>
							</>
						) : (
							/* Success Animation */
							<div className="flex flex-col items-center justify-center py-12 animate-fade-in">
								<div className="bg-green-500/10 rounded-full p-6 mb-6 animate-bounce">
									<Check className="w-12 h-12 text-green-600 dark:text-green-400" />
								</div>
								<h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
									Pembayaran Berhasil!
								</h2>
								<p className="text-[var(--muted-foreground)] text-center mb-2">
									Transaksi telah berhasil diproses
								</p>
								<p className="text-sm text-[var(--muted-foreground)] text-center mb-8">
									Stock telah diperbarui dan transaksi telah dicatat
								</p>
								<div className="text-center mb-6">
									<p className="text-lg font-semibold text-orange-600">
										Total: {formatCurrency(total)}
									</p>
								</div>
								<Button.Root
									variant="default"
									onClick={handleBackToCashier}
									className="w-full">
									<Button.Text>Kembali ke Kasir</Button.Text>
								</Button.Root>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
