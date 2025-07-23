"use client";

import { useState, useEffect } from "react";
import {
	Settings,
	User,
	Store,
	Bell,
	Shield,
	Palette,
	Database,
	Save,
	Eye,
	EyeOff,
	Camera,
	Edit2,
	Check,
	X,
	AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import {
	Divider,
	Input,
	Select,
	Button,
	Switch,
	ThemeToggle,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getBusinessId, getStoreId } from "@/lib/store";

interface UserProfile {
	name: string;
	email: string;
	phone: string;
	role: string;
	avatar?: string;
}

interface StoreSettings {
	storeName: string;
	address: string;
	phone: string;
	currency: string;
	taxRate: number;
	timezone: string;
}

interface NotificationSettings {
	emailNotifications: boolean;
	lowStockAlerts: boolean;
	orderNotifications: boolean;
	dailyReports: boolean;
	weeklyReports: boolean;
}

interface SystemSettings {
	theme: string;
	language: string;
	dateFormat: string;
	backupFrequency: string;
	autoLogout: number;
}

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("profile");
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		email?: string;
		avatar?: string;
	} | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Real data from Supabase
	const [profile, setProfile] = useState<UserProfile>({
		name: "",
		email: "",
		phone: "",
		role: "User",
		avatar: undefined,
	});

	const [storeSettings, setStoreSettings] = useState<StoreSettings>({
		storeName: "",
		address: "",
		phone: "",
		currency: "IDR",
		taxRate: 0,
		timezone: "Asia/Jakarta",
	});
	const [storeId, setStoreId] = useState<string | null>(null);

	const [notificationSettings, setNotificationSettings] =
		useState<NotificationSettings>({
			emailNotifications: true,
			lowStockAlerts: true,
			orderNotifications: true,
			dailyReports: false,
			weeklyReports: true,
		});

	const [systemSettings, setSystemSettings] = useState<SystemSettings>({
		theme: "light",
		language: "id",
		dateFormat: "DD/MM/YYYY",
		backupFrequency: "daily",
		autoLogout: 30,
	});

	useEffect(() => {
		fetchUserProfile();
		fetchStoreData();
	}, []);

	const fetchStoreData = async () => {
		try {
			const currentStoreId = getStoreId();
			if (!currentStoreId) {
				console.error("Store ID not found in localStorage");
				return;
			}

			setStoreId(currentStoreId);

			const { data: store, error } = await supabase
				.from("stores")
				.select(
					"name, address, phone_country_code, phone_number, business_field, currency, default_tax_rate"
				)
				.eq("id", currentStoreId)
				.single();

			if (error) {
				console.error("Error fetching store data:", error);
				return;
			}

			if (store) {
				setStoreSettings({
					storeName: store.name || "",
					address: store.address || "",
					phone: `${store.phone_country_code || "+62"} ${
						store.phone_number || ""
					}`,
					currency: store.currency || "IDR",
					taxRate: store.default_tax_rate || 0,
					timezone: "Asia/Jakarta", // Default timezone
				});
			}
		} catch (error) {
			console.error("Error fetching store data:", error);
		}
	};

	const showToast = (type: "success" | "error", message: string) => {
		setToast({ type, message });
		setTimeout(() => setToast(null), 3000);
	};

	const fetchUserProfile = async () => {
		try {
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user) {
				console.error("Error fetching auth user:", authError);
				return;
			}

			// Ambil data user dari tabel users
			const { data: userData, error: userError } = await supabase
				.from("users")
				.select("name, email, phone")
				.eq("id", user.id)
				.single();

			if (userError) {
				console.error("Error fetching user data:", userError);
				// Fallback to auth data
				const fallbackName =
					user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
				const fallbackEmail = user.email || "user@example.com";

				setUserProfile({
					name: fallbackName,
					email: fallbackEmail,
					avatar: user.user_metadata?.avatar_url,
				});

				setProfile({
					name: fallbackName,
					email: fallbackEmail,
					phone: user.user_metadata?.phone || "",
					role: user.user_metadata?.role || "User",
					avatar: user.user_metadata?.avatar_url,
				});
				return;
			}

			// Set data from users table
			setUserProfile({
				name: userData.name || user.email?.split("@")[0] || "User",
				email: userData.email || user.email || "user@example.com",
				avatar: user.user_metadata?.avatar_url,
			});

			setProfile({
				name: userData.name || "",
				email: userData.email || user.email || "",
				phone: userData.phone || "",
				role: user.user_metadata?.role || "User",
				avatar: user.user_metadata?.avatar_url,
			});
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	const handleSaveProfile = async () => {
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				showToast("error", "Gagal mendapatkan data user!");
				return;
			}

			// Update Supabase Auth
			const { error: updateAuthError } = await supabase.auth.updateUser({
				data: {
					full_name: profile.name,
					phone: profile.phone,
					role: profile.role,
					avatar_url: profile.avatar,
				},
			});

			if (updateAuthError) {
				console.error("Error updating auth user profile:", updateAuthError);
				showToast("error", "Gagal memperbarui profil Auth!");
				return;
			}

			// Update tabel users
			const { error: updateUsersError } = await supabase
				.from("users")
				.update({
					name: profile.name,
					phone: profile.phone,
				})
				.eq("id", user.id);

			if (updateUsersError) {
				console.error("Error updating users table:", updateUsersError);
				showToast("error", "Gagal memperbarui profil di database!");
				return;
			}

			setIsEditing(false);
			showToast("success", "Profil berhasil diperbarui!");

			// Refresh data
			fetchUserProfile();
		} catch (error) {
			console.error("Error saving profile:", error);
			showToast("error", "Gagal memperbarui profil!");
		}
	};

	const handleSaveStore = async () => {
		if (!storeId) {
			showToast("error", "Store ID tidak ditemukan!");
			return;
		}

		try {
			// Parse phone number
			const phoneParts = storeSettings.phone.split(" ");
			const phoneCountryCode = phoneParts[0] || "+62";
			const phoneNumber = phoneParts.slice(1).join(" ") || "";

			const { error } = await supabase
				.from("stores")
				.update({
					name: storeSettings.storeName,
					address: storeSettings.address,
					phone_country_code: phoneCountryCode,
					phone_number: phoneNumber,
					currency: storeSettings.currency,
					default_tax_rate: storeSettings.taxRate,
				})
				.eq("id", storeId);

			if (error) {
				console.error("Error updating store:", error);
				showToast("error", "Gagal memperbarui pengaturan toko!");
				return;
			}

			showToast("success", "Pengaturan toko berhasil diperbarui!");
		} catch (error) {
			console.error("Error saving store settings:", error);
			showToast("error", "Gagal memperbarui pengaturan toko!");
		}
	};

	const handleSaveNotifications = () => {
		// In production, save to Supabase
		showToast("success", "Pengaturan notifikasi berhasil diperbarui!");
	};

	const handleSaveSystem = () => {
		// In production, save to Supabase
		showToast("success", "Pengaturan sistem berhasil diperbarui!");
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setIsUploading(true);
			// In production, upload to Supabase Storage
			setTimeout(() => {
				const reader = new FileReader();
				reader.onload = (e) => {
					setProfile((prev) => ({
						...prev,
						avatar: e.target?.result as string,
					}));
					setIsUploading(false);
				};
				reader.readAsDataURL(file);
			}, 1000);
		}
	};

	const tabs = [
		{
			id: "profile",
			label: "Profil Pengguna",
			icon: User,
			description: "Kelola informasi profil Anda",
		},
		{
			id: "store",
			label: "Pengaturan Toko",
			icon: Store,
			description: "Konfigurasi informasi toko",
		},
		{
			id: "notifications",
			label: "Notifikasi",
			icon: Bell,
			description: "Atur preferensi notifikasi",
		},
		{
			id: "system",
			label: "Sistem",
			icon: Settings,
			description: "Pengaturan umum sistem",
		},
	];

	// Removed stats calculation as requested

	const renderProfileTab = () => (
		<div className="space-y-6">
			{/* Profile Picture Section */}
			<div
				className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 animate-fade-in-up"
				style={{ animationDelay: "0ms" }}>
				<h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
					Foto Profil
				</h3>
				<div className="flex items-center space-x-6">
					<div className="relative">
						<div className="w-24 h-24 bg-[var(--muted)] rounded-full flex items-center justify-center overflow-hidden">
							{profile.avatar ? (
								<img
									src={profile.avatar}
									alt="Profile"
									className="w-full h-full object-cover"
								/>
							) : (
								<User className="w-10 h-10 text-[var(--muted-foreground)]" />
							)}
						</div>
						{isUploading && (
							<div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
								<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							</div>
						)}
					</div>
					<div className="flex-1">
						<label className="block">
							<input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								className="hidden"
								disabled={isUploading}
							/>
							<div className="cursor-pointer inline-flex items-center px-4 py-2 bg-[var(--muted)] hover:bg-[var(--muted)]/80 rounded-xl text-sm font-medium text-[var(--foreground)] transition-colors">
								<Camera className="w-4 h-4 mr-2" />
								Ubah Foto
							</div>
						</label>
						<p className="text-xs text-[var(--muted-foreground)] mt-2">
							Format: JPG, PNG. Maksimal 2MB.
						</p>
					</div>
				</div>
			</div>

			{/* Profile Information */}
			<div
				className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 animate-fade-in-up"
				style={{ animationDelay: "30ms" }}>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-[var(--foreground)]">
						Informasi Profil
					</h3>
					<button
						onClick={() => setIsEditing(!isEditing)}
						className="inline-flex items-center px-3 py-1 bg-[var(--muted)] hover:bg-[var(--muted)]/80 rounded-xl text-sm font-medium text-[var(--foreground)] transition-colors">
						{isEditing ? (
							<>
								<X className="w-4 h-4 mr-1" />
								Batal
							</>
						) : (
							<>
								<Edit2 className="w-4 h-4 mr-1" />
								Edit
							</>
						)}
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Nama Lengkap
						</label>
						{isEditing ? (
							<Input.Root>
								<Input.Field
									type="text"
									value={profile.name}
									onChange={(value) =>
										setProfile((prev) => ({ ...prev, name: value }))
									}
									placeholder="Masukkan nama lengkap"
								/>
							</Input.Root>
						) : (
							<p className="text-[var(--foreground)] py-2">{profile.name}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Email
						</label>
						{isEditing ? (
							<Input.Root>
								<Input.Field
									type="email"
									value={profile.email}
									onChange={(value) =>
										setProfile((prev) => ({ ...prev, email: value }))
									}
									placeholder="Masukkan email"
								/>
							</Input.Root>
						) : (
							<p className="text-[var(--foreground)] py-2">{profile.email}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Nomor Telepon
						</label>
						{isEditing ? (
							<Input.Root>
								<Input.Field
									type="tel"
									value={profile.phone}
									onChange={(value) =>
										setProfile((prev) => ({ ...prev, phone: value }))
									}
									placeholder="Masukkan nomor telepon"
								/>
							</Input.Root>
						) : (
							<p className="text-[var(--foreground)] py-2">{profile.phone}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Role
						</label>
						<p className="text-[var(--muted-foreground)] py-2">
							{profile.role}
						</p>
					</div>
				</div>

				{isEditing && (
					<div className="mt-6 flex space-x-3">
						<Button.Root
							variant="default"
							onClick={handleSaveProfile}
							className="rounded-xl">
							<Button.Icon icon={Save} />
							<Button.Text>Simpan Perubahan</Button.Text>
						</Button.Root>
					</div>
				)}
			</div>

			{/* Change Password */}
			<div
				className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 animate-fade-in-up"
				style={{ animationDelay: "60ms" }}>
				<h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
					Ubah Password
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Password Lama
						</label>
						<Input.Root>
							<div className="relative">
								<Input.Field
									type={showPassword ? "text" : "password"}
									placeholder="Masukkan password lama"
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</Input.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Password Baru
						</label>
						<Input.Root>
							<Input.Field
								type="password"
								placeholder="Masukkan password baru"
							/>
						</Input.Root>
					</div>
				</div>

				<div className="mt-4">
					<Button.Root
						variant="default"
						onClick={() => showToast("success", "Password berhasil diubah!")}
						className="rounded-xl">
						<Button.Icon icon={Shield} />
						<Button.Text>Ubah Password</Button.Text>
					</Button.Root>
				</div>
			</div>
		</div>
	);

	const renderStoreTab = () => (
		<div className="space-y-6">
			<div
				className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 animate-fade-in-up"
				style={{ animationDelay: "0ms" }}>
				<h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
					Informasi Toko
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Nama Toko
						</label>
						<Input.Root>
							<Input.Field
								type="text"
								value={storeSettings.storeName}
								onChange={(value) =>
									setStoreSettings((prev) => ({ ...prev, storeName: value }))
								}
								placeholder="Masukkan nama toko"
							/>
						</Input.Root>
					</div>

					{/* Email field removed as it's not in database schema */}

					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Alamat
						</label>
						<Input.Root>
							<Input.Field
								type="text"
								value={storeSettings.address}
								onChange={(value) =>
									setStoreSettings((prev) => ({ ...prev, address: value }))
								}
								placeholder="Masukkan alamat lengkap"
							/>
						</Input.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Nomor Telepon
						</label>
						<Input.Root>
							<Input.Field
								type="tel"
								value={storeSettings.phone}
								onChange={(value) =>
									setStoreSettings((prev) => ({ ...prev, phone: value }))
								}
								placeholder="Masukkan nomor telepon"
							/>
						</Input.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Mata Uang
						</label>
						<Select.Root>
							<Select.Trigger
								value={storeSettings.currency}
								placeholder="Pilih mata uang"
							/>
							<Select.Content>
								<Select.Item
									value="IDR"
									onClick={() =>
										setStoreSettings((prev) => ({ ...prev, currency: "IDR" }))
									}
									selected={storeSettings.currency === "IDR"}>
									IDR - Indonesian Rupiah
								</Select.Item>
								<Select.Item
									value="USD"
									onClick={() =>
										setStoreSettings((prev) => ({ ...prev, currency: "USD" }))
									}
									selected={storeSettings.currency === "USD"}>
									USD - US Dollar
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Pajak (%)
						</label>
						<Input.Root>
							<Input.Field
								type="number"
								value={storeSettings.taxRate.toString()}
								onChange={(value) =>
									setStoreSettings((prev) => ({
										...prev,
										taxRate: parseFloat(value) || 0,
									}))
								}
								placeholder="0"
							/>
						</Input.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Zona Waktu
						</label>
						<Select.Root>
							<Select.Trigger
								value={storeSettings.timezone}
								placeholder="Pilih zona waktu"
							/>
							<Select.Content>
								<Select.Item
									value="Asia/Jakarta"
									onClick={() =>
										setStoreSettings((prev) => ({
											...prev,
											timezone: "Asia/Jakarta",
										}))
									}
									selected={storeSettings.timezone === "Asia/Jakarta"}>
									Asia/Jakarta (WIB)
								</Select.Item>
								<Select.Item
									value="Asia/Makassar"
									onClick={() =>
										setStoreSettings((prev) => ({
											...prev,
											timezone: "Asia/Makassar",
										}))
									}
									selected={storeSettings.timezone === "Asia/Makassar"}>
									Asia/Makassar (WITA)
								</Select.Item>
								<Select.Item
									value="Asia/Jayapura"
									onClick={() =>
										setStoreSettings((prev) => ({
											...prev,
											timezone: "Asia/Jayapura",
										}))
									}
									selected={storeSettings.timezone === "Asia/Jayapura"}>
									Asia/Jayapura (WIT)
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<div className="mt-6">
					<Button.Root
						variant="default"
						onClick={handleSaveStore}
						className="rounded-xl">
						<Button.Icon icon={Save} />
						<Button.Text>Simpan Pengaturan</Button.Text>
					</Button.Root>
				</div>
			</div>
		</div>
	);

	const renderNotificationsTab = () => (
		<div className="space-y-6">
			<div
				className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 animate-fade-in-up"
				style={{ animationDelay: "0ms" }}>
				<h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
					Pengaturan Notifikasi
				</h3>

				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-medium text-[var(--foreground)]">
								Email Notifikasi
							</h4>
							<p className="text-sm text-[var(--muted-foreground)]">
								Terima notifikasi via email untuk aktivitas penting
							</p>
						</div>
						<Switch
							checked={notificationSettings.emailNotifications}
							onChange={(checked) =>
								setNotificationSettings((prev) => ({
									...prev,
									emailNotifications: checked,
								}))
							}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-medium text-[var(--foreground)]">
								Peringatan Stok Rendah
							</h4>
							<p className="text-sm text-[var(--muted-foreground)]">
								Dapatkan notifikasi saat stok produk hampir habis
							</p>
						</div>
						<Switch
							checked={notificationSettings.lowStockAlerts}
							onChange={(checked) =>
								setNotificationSettings((prev) => ({
									...prev,
									lowStockAlerts: checked,
								}))
							}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-medium text-[var(--foreground)]">
								Notifikasi Pesanan
							</h4>
							<p className="text-sm text-[var(--muted-foreground)]">
								Terima notifikasi untuk pesanan baru dan perubahan status
							</p>
						</div>
						<Switch
							checked={notificationSettings.orderNotifications}
							onChange={(checked) =>
								setNotificationSettings((prev) => ({
									...prev,
									orderNotifications: checked,
								}))
							}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-medium text-[var(--foreground)]">
								Laporan Harian
							</h4>
							<p className="text-sm text-[var(--muted-foreground)]">
								Terima ringkasan penjualan harian via email
							</p>
						</div>
						<Switch
							checked={notificationSettings.dailyReports}
							onChange={(checked) =>
								setNotificationSettings((prev) => ({
									...prev,
									dailyReports: checked,
								}))
							}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-medium text-[var(--foreground)]">
								Laporan Mingguan
							</h4>
							<p className="text-sm text-[var(--muted-foreground)]">
								Terima ringkasan penjualan mingguan via email
							</p>
						</div>
						<Switch
							checked={notificationSettings.weeklyReports}
							onChange={(checked) =>
								setNotificationSettings((prev) => ({
									...prev,
									weeklyReports: checked,
								}))
							}
						/>
					</div>
				</div>

				<div className="mt-6">
					<Button.Root
						variant="default"
						onClick={handleSaveNotifications}
						className="rounded-xl">
						<Button.Icon icon={Save} />
						<Button.Text>Simpan Pengaturan</Button.Text>
					</Button.Root>
				</div>
			</div>
		</div>
	);

	const renderSystemTab = () => (
		<div className="space-y-6">
			<div
				className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 animate-fade-in-up"
				style={{ animationDelay: "0ms" }}>
				<h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
					Pengaturan Sistem
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<ThemeToggle showLabel />
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Bahasa
						</label>
						<Select.Root>
							<Select.Trigger
								value={systemSettings.language}
								placeholder="Pilih bahasa"
							/>
							<Select.Content>
								<Select.Item
									value="id"
									onClick={() =>
										setSystemSettings((prev) => ({ ...prev, language: "id" }))
									}
									selected={systemSettings.language === "id"}>
									Bahasa Indonesia
								</Select.Item>
								<Select.Item
									value="en"
									onClick={() =>
										setSystemSettings((prev) => ({ ...prev, language: "en" }))
									}
									selected={systemSettings.language === "en"}>
									English
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Format Tanggal
						</label>
						<Select.Root>
							<Select.Trigger
								value={systemSettings.dateFormat}
								placeholder="Pilih format tanggal"
							/>
							<Select.Content>
								<Select.Item
									value="DD/MM/YYYY"
									onClick={() =>
										setSystemSettings((prev) => ({
											...prev,
											dateFormat: "DD/MM/YYYY",
										}))
									}
									selected={systemSettings.dateFormat === "DD/MM/YYYY"}>
									DD/MM/YYYY
								</Select.Item>
								<Select.Item
									value="MM/DD/YYYY"
									onClick={() =>
										setSystemSettings((prev) => ({
											...prev,
											dateFormat: "MM/DD/YYYY",
										}))
									}
									selected={systemSettings.dateFormat === "MM/DD/YYYY"}>
									MM/DD/YYYY
								</Select.Item>
								<Select.Item
									value="YYYY-MM-DD"
									onClick={() =>
										setSystemSettings((prev) => ({
											...prev,
											dateFormat: "YYYY-MM-DD",
										}))
									}
									selected={systemSettings.dateFormat === "YYYY-MM-DD"}>
									YYYY-MM-DD
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Frekuensi Backup
						</label>
						<Select.Root>
							<Select.Trigger
								value={systemSettings.backupFrequency}
								placeholder="Pilih frekuensi backup"
							/>
							<Select.Content>
								<Select.Item
									value="daily"
									onClick={() =>
										setSystemSettings((prev) => ({
											...prev,
											backupFrequency: "daily",
										}))
									}
									selected={systemSettings.backupFrequency === "daily"}>
									Harian
								</Select.Item>
								<Select.Item
									value="weekly"
									onClick={() =>
										setSystemSettings((prev) => ({
											...prev,
											backupFrequency: "weekly",
										}))
									}
									selected={systemSettings.backupFrequency === "weekly"}>
									Mingguan
								</Select.Item>
								<Select.Item
									value="monthly"
									onClick={() =>
										setSystemSettings((prev) => ({
											...prev,
											backupFrequency: "monthly",
										}))
									}
									selected={systemSettings.backupFrequency === "monthly"}>
									Bulanan
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
							Auto Logout (menit)
						</label>
						<Input.Root>
							<Input.Field
								type="number"
								value={systemSettings.autoLogout.toString()}
								onChange={(value) =>
									setSystemSettings((prev) => ({
										...prev,
										autoLogout: parseInt(value) || 30,
									}))
								}
								placeholder="30"
							/>
						</Input.Root>
					</div>
				</div>

				<div className="mt-6">
					<Button.Root
						variant="default"
						onClick={handleSaveSystem}
						className="rounded-xl">
						<Button.Icon icon={Save} />
						<Button.Text>Simpan Pengaturan</Button.Text>
					</Button.Root>
				</div>
			</div>

			{/* Database Management */}
			<div
				className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 animate-fade-in-up"
				style={{ animationDelay: "30ms" }}>
				<h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
					Manajemen Database
				</h3>
				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-xl">
						<div>
							<h4 className="font-medium text-[var(--foreground)]">
								Backup Database
							</h4>
							<p className="text-sm text-[var(--muted-foreground)]">
								Buat cadangan database secara manual
							</p>
						</div>
						<Button.Root
							variant="default"
							onClick={() => showToast("success", "Backup database dimulai!")}
							className="rounded-xl">
							<Button.Icon icon={Database} />
							<Button.Text>Backup</Button.Text>
						</Button.Root>
					</div>

					<div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-xl">
						<div>
							<h4 className="font-medium text-[var(--foreground)]">
								Restore Database
							</h4>
							<p className="text-sm text-[var(--muted-foreground)]">
								Pulihkan database dari file backup
							</p>
						</div>
						<Button.Root
							variant="outline"
							onClick={() =>
								showToast("error", "Fitur restore akan segera tersedia!")
							}
							className="rounded-xl">
							<Button.Text>Restore</Button.Text>
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-[var(--background)]">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
				<div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
					<PageHeader
						title="Pengaturan"
						subtitle="Kelola pengaturan akun, toko, dan sistem"
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
								// Handle profile click - switch to profile tab
								setActiveTab("profile");
							},
						}}
					/>
				</div>

				{/* Stats Cards removed as requested */}

				<div className="space-y-8">
					<Divider />

					{/* Settings Navigation */}
					<div
						className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in-up"
						style={{ animationDelay: "120ms" }}>
						{/* Sidebar */}
						<div className="lg:col-span-1">
							<div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
								<nav className="space-y-2">
									{tabs.map((tab, index) => {
										const IconComponent = tab.icon;
										return (
											<button
												key={tab.id}
												onClick={() => setActiveTab(tab.id)}
												className={`w-full text-left px-4 py-3 rounded-xl transition-colors animate-fade-in-left ${
													activeTab === tab.id
														? "bg-[#FF5701] text-white"
														: "text-[var(--foreground)] hover:bg-[var(--muted)]/50"
												}`}
												style={{ animationDelay: `${140 + index * 30}ms` }}>
												<div className="flex items-center space-x-3">
													<IconComponent className="w-5 h-5" />
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium truncate">
															{tab.label}
														</p>
														<p className="text-xs opacity-75 truncate">
															{tab.description}
														</p>
													</div>
												</div>
											</button>
										);
									})}
								</nav>
							</div>
						</div>

						{/* Content */}
						<div className="lg:col-span-3">
							{activeTab === "profile" && renderProfileTab()}
							{activeTab === "store" && renderStoreTab()}
							{activeTab === "notifications" && renderNotificationsTab()}
							{activeTab === "system" && renderSystemTab()}
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
