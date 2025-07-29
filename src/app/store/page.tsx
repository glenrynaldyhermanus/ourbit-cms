"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

interface BusinessOnlineSettings {
	id: string;
	business_id: string;
	subdomain: string;
	contact_email: string;
	description: string;
	facebook_url: string;
	instagram_url: string;
	twitter_url: string;
	stock_tracking: number;
	businesses?: {
		id: string;
		name: string;
	};
}

interface Product {
	id: string;
	name: string;
	description: string;
	selling_price: number;
	image_url: string;
	stock: number;
	is_active: boolean;
}

interface Store {
	id: string;
	name: string;
	is_online_delivery_active: boolean;
}

interface Warehouse {
	id: string;
	name: string;
	is_online_delivery_active: boolean;
}

function OnlineStoreContent() {
	const searchParams = useSearchParams();
	const [subdomain, setSubdomain] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [businessSettings, setBusinessSettings] =
		useState<BusinessOnlineSettings | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [stores, setStores] = useState<Store[]>([]);
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		// Get subdomain from URL query or path
		const subdomainFromParams = searchParams.get("subdomain");
		const pathSubdomain = window.location.pathname.split("/")[1];

		// Use subdomain from params first, then from path
		const detectedSubdomain = subdomainFromParams || pathSubdomain;

		if (detectedSubdomain && detectedSubdomain !== "store") {
			setSubdomain(detectedSubdomain);
		}
	}, [searchParams]);

	useEffect(() => {
		if (subdomain) {
			loadStoreData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subdomain]);

	const loadStoreData = async () => {
		if (!subdomain) return;

		try {
			setLoading(true);

			// Get business settings by subdomain
			const { data: settings, error: settingsError } = await supabase
				.from("business_online_settings")
				.select(
					`
          *,
          businesses (
            id,
            name
          )
        `
				)
				.eq("subdomain", subdomain)
				.single();

			if (settingsError || !settings) {
				throw new Error("Business not found");
			}

			setBusinessSettings(settings);

			// Get products from active stores/warehouses
			const { data: productsData, error: productsError } = await supabase
				.from("products")
				.select(
					`
          id,
          name,
          description,
          selling_price,
          image_url,
          stock,
          is_active,
          stores!inner (
            id,
            is_online_delivery_active
          )
        `
				)
				.eq("stores.is_online_delivery_active", true)
				.eq("is_active", true);

			if (productsError) throw productsError;
			setProducts(productsData || []);

			// Get active stores
			const { data: storesData, error: storesError } = await supabase
				.from("stores")
				.select("id, name, is_online_delivery_active")
				.eq("business_id", settings.business_id)
				.eq("is_online_delivery_active", true);

			if (storesError) throw storesError;
			setStores(storesData || []);

			// Get active warehouses
			const { data: warehousesData, error: warehousesError } = await supabase
				.from("warehouses")
				.select("id, name, is_online_delivery_active")
				.eq("business_id", settings.business_id)
				.eq("is_online_delivery_active", true);

			if (warehousesError) throw warehousesError;
			setWarehouses(warehousesData || []);
		} catch (error) {
			console.error("Error loading store data:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredProducts = products.filter(
		(product) =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.description?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
		}).format(price);
	};

	if (!subdomain) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Toko Tidak Ditemukan
					</h1>
					<p className="text-gray-600">Parameter subdomain tidak ditemukan.</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto p-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="h-64 bg-gray-200 rounded"></div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!businessSettings) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Toko Tidak Ditemukan
					</h1>
					<p className="text-gray-600">
						Toko online dengan subdomain &quot;{subdomain}&quot; tidak ditemukan
						atau belum aktif.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="container mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{businessSettings.businesses?.name || "Toko Online"}
							</h1>
							{businessSettings.description && (
								<p className="text-gray-600 mt-1">
									{businessSettings.description}
								</p>
							)}
						</div>
						<div className="flex items-center space-x-4">
							{businessSettings.facebook_url && (
								<a
									href={businessSettings.facebook_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:text-blue-800">
									Facebook
								</a>
							)}
							{businessSettings.instagram_url && (
								<a
									href={businessSettings.instagram_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-pink-600 hover:text-pink-800">
									Instagram
								</a>
							)}
							{businessSettings.twitter_url && (
								<a
									href={businessSettings.twitter_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-400 hover:text-blue-600">
									Twitter
								</a>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Search */}
			<div className="container mx-auto px-6 py-6">
				<div className="mb-6">
					<Input.Root className="max-w-md">
						<Input.Field
							type="text"
							placeholder="Cari produk..."
							value={searchTerm}
							onChange={(value: string) => setSearchTerm(value)}
						/>
					</Input.Root>
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredProducts.map((product) => (
						<Card key={product.id} className="overflow-hidden">
							{product.image_url && (
								<div className="aspect-square bg-gray-200">
									<Image
										src={product.image_url}
										alt={product.name}
										fill
										className="object-cover"
									/>
								</div>
							)}
							<CardContent className="p-4">
								<h3 className="font-semibold text-lg mb-2">{product.name}</h3>
								{product.description && (
									<p className="text-gray-600 text-sm mb-3 line-clamp-2">
										{product.description}
									</p>
								)}
								<div className="flex items-center justify-between">
									<span className="text-lg font-bold text-green-600">
										{formatPrice(product.selling_price)}
									</span>
									<span className="text-sm text-gray-500">
										Stok: {product.stock}
									</span>
								</div>
								<PrimaryButton
									className="w-full mt-3"
									disabled={product.stock <= 0}>
									{product.stock > 0 ? "Hubungi untuk Order" : "Stok Habis"}
								</PrimaryButton>
							</CardContent>
						</Card>
					))}
				</div>

				{filteredProducts.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500">Tidak ada produk yang ditemukan.</p>
					</div>
				)}

				{/* Contact Info */}
				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Informasi Kontak</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-medium mb-2">Email</h4>
								<p className="text-gray-600">
									{businessSettings.contact_email}
								</p>
							</div>
							<div>
								<h4 className="font-medium mb-2">Lokasi Pengiriman</h4>
								<div className="space-y-1">
									{stores.map((store) => (
										<p key={store.id} className="text-sm text-gray-600">
											• {store.name}
										</p>
									))}
									{warehouses.map((warehouse) => (
										<p key={warehouse.id} className="text-sm text-gray-600">
											• {warehouse.name}
										</p>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default function OnlineStorePage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Loading...
						</h1>
					</div>
				</div>
			}>
			<OnlineStoreContent />
		</Suspense>
	);
}
