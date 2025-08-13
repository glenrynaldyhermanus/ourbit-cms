"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import { useToast } from "@/components/providers/ToastProvider";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/providers/AuthProvider";

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
	default_online_store_id?: string | null;
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

export default function OnlineStorePage() {
	const { user } = useAuthContext();
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [businessId, setBusinessId] = useState<string | null>(null);

	// Online settings
	const [onlineSettings, setOnlineSettings] =
		useState<BusinessOnlineSettings | null>(null);
	const [isOnlineActive, setIsOnlineActive] = useState(false);
	const [subdomain, setSubdomain] = useState("");
	const [contactEmail, setContactEmail] = useState("");
	const [description, setDescription] = useState("");
	const [facebookUrl, setFacebookUrl] = useState("");
	const [instagramUrl, setInstagramUrl] = useState("");
	const [twitterUrl, setTwitterUrl] = useState("");
	const [stockTracking, setStockTracking] = useState(1);
	const [defaultStoreId, setDefaultStoreId] = useState<string>("");

	// Delivery locations
	const [stores, setStores] = useState<Store[]>([]);
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

	// Loading states for toggles
	const [togglingStores, setTogglingStores] = useState<Set<string>>(new Set());
	const [togglingWarehouses, setTogglingWarehouses] = useState<Set<string>>(
		new Set()
	);

	const loadBusinessData = useCallback(async () => {
		try {
			setLoading(true);

			// Get user's business
			const { data: roleAssignment, error: roleError } = await supabase
				.from("role_assignments")
				.select("business_id")
				.eq("user_id", user?.id)
				.single();

			if (roleError) throw roleError;

			const businessId = roleAssignment.business_id;
			setBusinessId(businessId);

			// Load online settings
			const { data: settings } = await supabase
				.from("business_online_settings")
				.select("*")
				.eq("business_id", businessId)
				.single();

			if (settings) {
				setOnlineSettings(settings);
				setIsOnlineActive(true);
				setSubdomain(settings.subdomain);
				setContactEmail(settings.contact_email);
				setDescription(settings.description || "");
				setFacebookUrl(settings.facebook_url || "");
				setInstagramUrl(settings.instagram_url || "");
				setTwitterUrl(settings.twitter_url || "");
				setStockTracking(settings.stock_tracking);
				setDefaultStoreId(settings.default_online_store_id || "");
			}

			// Load stores
			const { data: storesData, error: storesError } = await supabase
				.from("stores")
				.select("id, name, is_online_delivery_active")
				.eq("business_id", businessId);

			if (storesError) throw storesError;
			setStores(storesData || []);

			// Load warehouses
			const { data: warehousesData, error: warehousesError } = await supabase
				.from("warehouses")
				.select("id, name, is_online_delivery_active")
				.eq("business_id", businessId);

			if (warehousesError) throw warehousesError;
			setWarehouses(warehousesData || []);
		} catch (error) {
			console.error("Error loading business data:", error);
			showToast({ type: "error", title: "Error loading data" });
		} finally {
			setLoading(false);
		}
	}, [user, showToast]);

	useEffect(() => {
		if (user) {
			loadBusinessData();
		}
	}, [user, loadBusinessData]);

	const saveOnlineSettings = async () => {
		if (!businessId) return;

		try {
			setSaving(true);

			if (isOnlineActive) {
				// Create or update online settings
				const settingsData: any = {
					business_id: businessId,
					subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ""),
					contact_email: contactEmail,
					description,
					facebook_url: facebookUrl,
					instagram_url: instagramUrl,
					twitter_url: twitterUrl,
					stock_tracking: stockTracking,
				};

				if (defaultStoreId) {
					settingsData.default_online_store_id = defaultStoreId;
				} else {
					settingsData.default_online_store_id = null;
				}

				if (onlineSettings) {
					// Update existing
					const { error } = await supabase
						.from("business_online_settings")
						.update(settingsData)
						.eq("id", onlineSettings.id);

					if (error) throw error;
				} else {
					// Create new
					const { error } = await supabase
						.from("business_online_settings")
						.insert(settingsData);

					if (error) throw error;
				}
			} else {
				// Delete online settings if deactivated
				if (onlineSettings) {
					const { error } = await supabase
						.from("business_online_settings")
						.delete()
						.eq("id", onlineSettings.id);

					if (error) throw error;
				}
			}

			showToast({
				type: "success",
				title: "Online store settings saved successfully",
			});
			await loadBusinessData(); // Reload data
		} catch (error) {
			console.error("Error saving online settings:", error);
			showToast({ type: "error", title: "Error saving settings" });
		} finally {
			setSaving(false);
		}
	};

	const toggleStoreDelivery = async (storeId: string, isActive: boolean) => {
		// Prevent multiple clicks
		if (togglingStores.has(storeId)) return;

		try {
			setTogglingStores((prev) => new Set(prev).add(storeId));

			const { error } = await supabase
				.from("stores")
				.update({ is_online_delivery_active: isActive })
				.eq("id", storeId);

			if (error) throw error;

			setStores((prev) =>
				prev.map((store) =>
					store.id === storeId
						? { ...store, is_online_delivery_active: isActive }
						: store
				)
			);

			showToast({
				type: "success",
				title: `Store delivery ${isActive ? "activated" : "deactivated"}`,
			});
		} catch (error) {
			console.error("Error toggling store delivery:", error);
			showToast({ type: "error", title: "Error updating store delivery" });
		} finally {
			setTogglingStores((prev) => {
				const newSet = new Set(prev);
				newSet.delete(storeId);
				return newSet;
			});
		}
	};

	const toggleWarehouseDelivery = async (
		warehouseId: string,
		isActive: boolean
	) => {
		// Prevent multiple clicks
		if (togglingWarehouses.has(warehouseId)) return;

		try {
			setTogglingWarehouses((prev) => new Set(prev).add(warehouseId));

			const { error } = await supabase
				.from("warehouses")
				.update({ is_online_delivery_active: isActive })
				.eq("id", warehouseId);

			if (error) throw error;

			setWarehouses((prev) =>
				prev.map((warehouse) =>
					warehouse.id === warehouseId
						? { ...warehouse, is_online_delivery_active: isActive }
						: warehouse
				)
			);

			showToast({
				type: "success",
				title: `Warehouse delivery ${isActive ? "activated" : "deactivated"}`,
			});
		} catch (error) {
			console.error("Error toggling warehouse delivery:", error);
			showToast({ type: "error", title: "Error updating warehouse delivery" });
		} finally {
			setTogglingWarehouses((prev) => {
				const newSet = new Set(prev);
				newSet.delete(warehouseId);
				return newSet;
			});
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="animate-pulse">
					<div className="h-8 bg-[var(--muted)] rounded w-1/4 mb-6"></div>
					<div className="space-y-4">
						<div className="h-64 bg-[var(--muted)] rounded"></div>
						<div className="h-64 bg-[var(--muted)] rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Toko Online</h1>
				<p className="text-gray-600">Kelola pengaturan toko online Anda</p>
			</div>

			<div className="grid gap-6">
				{/* Online Store Settings */}
				<Card>
					<CardHeader>
						<CardTitle>Pengaturan Toko Online</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-medium">Aktifkan Toko Online</h3>
								<p className="text-sm text-gray-600">
									Aktifkan untuk membuat katalog online di ourbit.web.app/@
									{subdomain}
								</p>
							</div>
							<Switch checked={isOnlineActive} onChange={setIsOnlineActive} />
						</div>

						{isOnlineActive && (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-2">
										Subdomain
									</label>
									<div className="flex items-center">
										<span className="text-gray-500 mr-2">ourbit.web.app/@</span>
										<Input.Root className="flex-1">
											<Input.Field
												value={subdomain}
												onChange={(value: string) => setSubdomain(value)}
												placeholder="namabisnis"
											/>
										</Input.Root>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Email Kontak
									</label>
									<Input.Root>
										<Input.Field
											type="email"
											value={contactEmail}
											onChange={(value: string) => setContactEmail(value)}
											placeholder="contact@example.com"
										/>
									</Input.Root>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Deskripsi Toko
									</label>
									<textarea
										value={description}
										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
											setDescription(e.target.value)
										}
										placeholder="Deskripsi toko Anda..."
										className="w-full p-3 border border-gray-300 rounded-md"
										rows={3}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium mb-2">
											Facebook URL
										</label>
										<Input.Root>
											<Input.Field
												value={facebookUrl}
												onChange={(value: string) => setFacebookUrl(value)}
												placeholder="https://facebook.com/..."
											/>
										</Input.Root>
									</div>
									<div>
										<label className="block text-sm font-medium mb-2">
											Instagram URL
										</label>
										<Input.Root>
											<Input.Field
												value={instagramUrl}
												onChange={(value: string) => setInstagramUrl(value)}
												placeholder="https://instagram.com/..."
											/>
										</Input.Root>
									</div>
									<div>
										<label className="block text-sm font-medium mb-2">
											Twitter URL
										</label>
										<Input.Root>
											<Input.Field
												value={twitterUrl}
												onChange={(value: string) => setTwitterUrl(value)}
												placeholder="https://twitter.com/..."
											/>
										</Input.Root>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Tracking Stok
									</label>
									<select
										value={stockTracking}
										onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
											setStockTracking(Number(e.target.value))
										}
										className="w-full p-3 border border-gray-300 rounded-md">
										<option value={1}>Real-time</option>
										<option value={2}>Manual</option>
										<option value={3}>Tidak ada</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Default store untuk online
									</label>
									<select
										value={defaultStoreId}
										onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
											setDefaultStoreId(e.target.value)
										}
										className="w-full p-3 border border-gray-300 rounded-md">
										<option value="">Pilih store (opsional)</option>
										{stores.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</select>
									<p className="text-xs text-gray-600 mt-1">
										Jika kosong, sistem gunakan store pertama bisnis sebagai
										fallback.
									</p>
								</div>

								<PrimaryButton
									onClick={saveOnlineSettings}
									disabled={saving}
									className="w-full">
									{saving ? "Menyimpan..." : "Simpan Pengaturan"}
								</PrimaryButton>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Delivery Locations */}
				<Card>
					<CardHeader>
						<CardTitle>Lokasi Pengiriman</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Stores */}
						<div>
							<h3 className="font-medium mb-4">Toko</h3>
							<div className="space-y-3">
								{stores.map((store) => (
									<div
										key={store.id}
										className={`flex items-center justify-between p-3 border rounded-lg ${
											togglingStores.has(store.id) ? "opacity-50" : ""
										}`}>
										<div>
											<h4 className="font-medium">{store.name}</h4>
											<p className="text-sm text-gray-600">
												{store.is_online_delivery_active
													? "Aktif untuk pengiriman online"
													: "Tidak aktif"}
											</p>
										</div>
										<div className="flex items-center space-x-2">
											{togglingStores.has(store.id) && (
												<div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
											)}
											<Switch
												checked={store.is_online_delivery_active}
												onChange={(checked: boolean) =>
													toggleStoreDelivery(store.id, checked)
												}
												disabled={togglingStores.has(store.id)}
											/>
										</div>
									</div>
								))}
								{stores.length === 0 && (
									<p className="text-gray-500 text-center py-4">
										Belum ada toko
									</p>
								)}
							</div>
						</div>

						{/* Warehouses */}
						<div>
							<h3 className="font-medium mb-4">Gudang</h3>
							<div className="space-y-3">
								{warehouses.map((warehouse) => (
									<div
										key={warehouse.id}
										className={`flex items-center justify-between p-3 border rounded-lg ${
											togglingWarehouses.has(warehouse.id) ? "opacity-50" : ""
										}`}>
										<div>
											<h4 className="font-medium">{warehouse.name}</h4>
											<p className="text-sm text-gray-600">
												{warehouse.is_online_delivery_active
													? "Aktif untuk pengiriman online"
													: "Tidak aktif"}
											</p>
										</div>
										<div className="flex items-center space-x-2">
											{togglingWarehouses.has(warehouse.id) && (
												<div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
											)}
											<Switch
												checked={warehouse.is_online_delivery_active}
												onChange={(checked: boolean) =>
													toggleWarehouseDelivery(warehouse.id, checked)
												}
												disabled={togglingWarehouses.has(warehouse.id)}
											/>
										</div>
									</div>
								))}
								{warehouses.length === 0 && (
									<p className="text-gray-500 text-center py-4">
										Belum ada gudang
									</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
