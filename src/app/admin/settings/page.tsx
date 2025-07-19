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
} from "lucide-react";
import { Stats } from "@/components/ui";
import PageHeader from "@/components/layout/PageHeader";
import { Divider, Input, Select, Button, Switch } from "@/components/ui";
import { supabase } from "@/lib/supabase";

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
	email: string;
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

	// Mock data - in production this would come from Supabase
	const [profile, setProfile] = useState<UserProfile>({
		name: "Administrator",
		email: "admin@ourbit.com",
		phone: "+62 21-5555-0001",
		role: "Super Admin",
		avatar: undefined,
	});

	const [storeSettings, setStoreSettings] = useState<StoreSettings>({
		storeName: "OURBIT Central Store",
		address: "Jl. Sudirman No. 123, Jakarta Pusat",
		phone: "+62 21-5555-1111",
		email: "central@ourbit.com",
		currency: "IDR",
		taxRate: 10,
		timezone: "Asia/Jakarta",
	});

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

	const handleSaveProfile = () => {
		// In production, save to Supabase
		setIsEditing(false);
		alert("Profil berhasil diperbarui!");
	};

	const handleSaveStore = () => {
		// In production, save to Supabase
		alert("Pengaturan toko berhasil diperbarui!");
	};

	const handleSaveNotifications = () => {
		// In production, save to Supabase
		alert("Pengaturan notifikasi berhasil diperbarui!");
	};

	const handleSaveSystem = () => {
		// In production, save to Supabase
		alert("Pengaturan sistem berhasil diperbarui!");
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

	const renderProfileTab = () => (
		<div className="space-y-6">
			{/* Profile Picture Section */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Foto Profil
				</h3>
				<div className="flex items-center space-x-6">
					<div className="relative">
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
							{profile.avatar ? (
								<img
									src={profile.avatar}
									alt="Profile"
									className="w-full h-full object-cover"
								/>
							) : (
								<User className="w-10 h-10 text-gray-400" />
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
							<div className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
								<Camera className="w-4 h-4 mr-2" />
								Ubah Foto
							</div>
						</label>
						<p className="text-xs text-gray-500 mt-2">
							Format: JPG, PNG. Maksimal 2MB.
						</p>
					</div>
				</div>
			</div>

			{/* Profile Information */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900">
						Informasi Profil
					</h3>
					<button
						onClick={() => setIsEditing(!isEditing)}
						className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
							<p className="text-gray-900 py-2">{profile.name}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
							<p className="text-gray-900 py-2">{profile.email}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
							<p className="text-gray-900 py-2">{profile.phone}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Role
						</label>
						<p className="text-gray-600 py-2">{profile.role}</p>
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
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Ubah Password
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Password Lama
						</label>
						<div className="relative">
							<Input.Root>
								<Input.Field
									type={showPassword ? "text" : "password"}
									placeholder="Masukkan password lama"
								/>
							</Input.Root>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
								{showPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
						onClick={() => alert("Password berhasil diubah!")}
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
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">
					Informasi Toko
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
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

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Email Toko
						</label>
						<Input.Root>
							<Input.Field
								type="email"
								value={storeSettings.email}
								onChange={(value) =>
									setStoreSettings((prev) => ({ ...prev, email: value }))
								}
								placeholder="Masukkan email toko"
							/>
						</Input.Root>
					</div>

					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Mata Uang
						</label>
						<Select.Root>
							<Select.Trigger
								value={storeSettings.currency}
								placeholder="Pilih mata uang"
								onClick={() => {}}
								open={false}
							/>
							<Select.Content open={false}>
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Zona Waktu
						</label>
						<Select.Root>
							<Select.Trigger
								value={storeSettings.timezone}
								placeholder="Pilih zona waktu"
								onClick={() => {}}
								open={false}
							/>
							<Select.Content open={false}>
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
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">
					Pengaturan Notifikasi
				</h3>

				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-medium text-gray-900">
								Email Notifikasi
							</h4>
							<p className="text-sm text-gray-500">
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
							<h4 className="text-sm font-medium text-gray-900">
								Peringatan Stok Rendah
							</h4>
							<p className="text-sm text-gray-500">
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
							<h4 className="text-sm font-medium text-gray-900">
								Notifikasi Pesanan
							</h4>
							<p className="text-sm text-gray-500">
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
							<h4 className="text-sm font-medium text-gray-900">
								Laporan Harian
							</h4>
							<p className="text-sm text-gray-500">
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
							<h4 className="text-sm font-medium text-gray-900">
								Laporan Mingguan
							</h4>
							<p className="text-sm text-gray-500">
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
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">
					Pengaturan Sistem
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tema
						</label>
						<Select.Root>
							<Select.Trigger
								value={systemSettings.theme}
								placeholder="Pilih tema"
								onClick={() => {}}
								open={false}
							/>
							<Select.Content open={false}>
								<Select.Item
									value="light"
									onClick={() =>
										setSystemSettings((prev) => ({ ...prev, theme: "light" }))
									}
									selected={systemSettings.theme === "light"}>
									Terang
								</Select.Item>
								<Select.Item
									value="dark"
									onClick={() =>
										setSystemSettings((prev) => ({ ...prev, theme: "dark" }))
									}
									selected={systemSettings.theme === "dark"}>
									Gelap
								</Select.Item>
								<Select.Item
									value="auto"
									onClick={() =>
										setSystemSettings((prev) => ({ ...prev, theme: "auto" }))
									}
									selected={systemSettings.theme === "auto"}>
									Otomatis
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Bahasa
						</label>
						<Select.Root>
							<Select.Trigger
								value={systemSettings.language}
								placeholder="Pilih bahasa"
								onClick={() => {}}
								open={false}
							/>
							<Select.Content open={false}>
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Format Tanggal
						</label>
						<Select.Root>
							<Select.Trigger
								value={systemSettings.dateFormat}
								placeholder="Pilih format tanggal"
								onClick={() => {}}
								open={false}
							/>
							<Select.Content open={false}>
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Frekuensi Backup
						</label>
						<Select.Root>
							<Select.Trigger
								value={systemSettings.backupFrequency}
								placeholder="Pilih frekuensi backup"
								onClick={() => {}}
								open={false}
							/>
							<Select.Content open={false}>
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">
					Manajemen Database
				</h3>
				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div>
							<h4 className="font-medium text-gray-900">Backup Database</h4>
							<p className="text-sm text-gray-500">
								Buat cadangan database secara manual
							</p>
						</div>
						<Button.Root
							variant="default"
							onClick={() => alert("Backup database dimulai!")}
							className="rounded-xl">
							<Button.Icon icon={Database} />
							<Button.Text>Backup</Button.Text>
						</Button.Root>
					</div>

					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div>
							<h4 className="font-medium text-gray-900">Restore Database</h4>
							<p className="text-sm text-gray-500">
								Pulihkan database dari file backup
							</p>
						</div>
						<Button.Root
							variant="outline"
							onClick={() => alert("Fitur restore akan segera tersedia!")}
							className="rounded-xl">
							<Button.Text>Restore</Button.Text>
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w mx-auto space-y-4">
				{/* Header */}
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
						title="Pengaturan Aktif"
						value={4}
						icon={Settings}
						iconColor="bg-blue-500/10 text-blue-600"
					/>
					<Stats.Card
						title="Notifikasi"
						value={Object.values(notificationSettings).filter(Boolean).length}
						icon={Bell}
						iconColor="bg-green-500/10 text-green-600"
					/>
					<Stats.Card
						title="Tema"
						value={systemSettings.theme === "light" ? "Terang" : "Gelap"}
						icon={Palette}
						iconColor="bg-purple-500/10 text-purple-600"
					/>
					<Stats.Card
						title="Bahasa"
						value={systemSettings.language === "id" ? "ID" : "EN"}
						icon={Database}
						iconColor="bg-orange-500/10 text-orange-600"
					/>
				</Stats.Grid>

				<div className="space-y-8">
					<Divider />

					{/* Settings Navigation */}
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						{/* Sidebar */}
						<div className="lg:col-span-1">
							<div className="bg-white rounded-xl border border-gray-200 p-4">
								<nav className="space-y-2">
									{tabs.map((tab) => {
										const IconComponent = tab.icon;
										return (
											<button
												key={tab.id}
												onClick={() => setActiveTab(tab.id)}
												className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
													activeTab === tab.id
														? "bg-[#FF5701] text-white"
														: "text-gray-700 hover:bg-gray-100"
												}`}>
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
			</div>
		</div>
	);
}
