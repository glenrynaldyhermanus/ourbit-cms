"use client";

import { useState } from "react";
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
	numberFormat: string;
	enableBackup: boolean;
	backupFrequency: string;
}

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("profile");
	const [isEditing, setIsEditing] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	// Mock data - replace with real data from Supabase
	const [userProfile, setUserProfile] = useState<UserProfile>({
		name: "Ahmad Rizky",
		email: "ahmad.rizky@email.com",
		phone: "+62 812-3456-7890",
		role: "Owner",
	});

	const [storeSettings, setStoreSettings] = useState<StoreSettings>({
		storeName: "Warung OURBIT",
		address: "Jl. Sudirman No. 123, Jakarta Pusat",
		phone: "+62 21-1234-5678",
		email: "info@warungourbit.com",
		currency: "IDR",
		taxRate: 11,
		timezone: "Asia/Jakarta",
	});

	const [notifications, setNotifications] = useState<NotificationSettings>({
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
		numberFormat: "id-ID",
		enableBackup: true,
		backupFrequency: "daily",
	});

	const handleSave = (section: string) => {
		// Simulate saving to database
		console.log(`Saving ${section} settings...`);
		setIsEditing(null);
		// Show success message
	};

	const tabs = [
		{ id: "profile", label: "Profil", icon: User },
		{ id: "store", label: "Toko", icon: Store },
		{ id: "notifications", label: "Notifikasi", icon: Bell },
		{ id: "system", label: "Sistem", icon: Settings },
		{ id: "security", label: "Keamanan", icon: Shield },
	];

	const ProfileSection = () => (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-lg font-semibold">Informasi Profil</h3>
				<button
					onClick={() =>
						setIsEditing(isEditing === "profile" ? null : "profile")
					}
					className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
					{isEditing === "profile" ? (
						<X className="w-4 h-4" />
					) : (
						<Edit2 className="w-4 h-4" />
					)}
					<span>{isEditing === "profile" ? "Batal" : "Edit"}</span>
				</button>
			</div>

			<div className="space-y-6">
				{/* Avatar */}
				<div className="flex items-center space-x-4">
					<div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
						{userProfile.avatar ? (
							<img
								src={userProfile.avatar}
								alt="Profile"
								className="w-20 h-20 rounded-full object-cover"
							/>
						) : (
							<User className="w-8 h-8 text-blue-600" />
						)}
					</div>
					{isEditing === "profile" && (
						<button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
							<Camera className="w-4 h-4" />
							<span>Ubah Foto</span>
						</button>
					)}
				</div>

				{/* Form Fields */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nama Lengkap
						</label>
						{isEditing === "profile" ? (
							<input
								type="text"
								value={userProfile.name}
								onChange={(e) =>
									setUserProfile({ ...userProfile, name: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						) : (
							<p className="text-gray-900 py-2">{userProfile.name}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						{isEditing === "profile" ? (
							<input
								type="email"
								value={userProfile.email}
								onChange={(e) =>
									setUserProfile({ ...userProfile, email: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						) : (
							<p className="text-gray-900 py-2">{userProfile.email}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nomor Telepon
						</label>
						{isEditing === "profile" ? (
							<input
								type="tel"
								value={userProfile.phone}
								onChange={(e) =>
									setUserProfile({ ...userProfile, phone: e.target.value })
								}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						) : (
							<p className="text-gray-900 py-2">{userProfile.phone}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Role
						</label>
						<p className="text-gray-900 py-2">
							<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
								{userProfile.role}
							</span>
						</p>
					</div>
				</div>

				{isEditing === "profile" && (
					<div className="flex justify-end space-x-3">
						<button
							onClick={() => setIsEditing(null)}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
							Batal
						</button>
						<button
							onClick={() => handleSave("profile")}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
							<Save className="w-4 h-4" />
							<span>Simpan</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);

	const StoreSection = () => (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-lg font-semibold">Pengaturan Toko</h3>
				<button
					onClick={() => setIsEditing(isEditing === "store" ? null : "store")}
					className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
					{isEditing === "store" ? (
						<X className="w-4 h-4" />
					) : (
						<Edit2 className="w-4 h-4" />
					)}
					<span>{isEditing === "store" ? "Batal" : "Edit"}</span>
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Nama Toko
					</label>
					{isEditing === "store" ? (
						<input
							type="text"
							value={storeSettings.storeName}
							onChange={(e) =>
								setStoreSettings({
									...storeSettings,
									storeName: e.target.value,
								})
							}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					) : (
						<p className="text-gray-900 py-2">{storeSettings.storeName}</p>
					)}
				</div>

				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Alamat
					</label>
					{isEditing === "store" ? (
						<textarea
							value={storeSettings.address}
							onChange={(e) =>
								setStoreSettings({ ...storeSettings, address: e.target.value })
							}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							rows={3}
						/>
					) : (
						<p className="text-gray-900 py-2">{storeSettings.address}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Telepon Toko
					</label>
					{isEditing === "store" ? (
						<input
							type="tel"
							value={storeSettings.phone}
							onChange={(e) =>
								setStoreSettings({ ...storeSettings, phone: e.target.value })
							}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					) : (
						<p className="text-gray-900 py-2">{storeSettings.phone}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Email Toko
					</label>
					{isEditing === "store" ? (
						<input
							type="email"
							value={storeSettings.email}
							onChange={(e) =>
								setStoreSettings({ ...storeSettings, email: e.target.value })
							}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					) : (
						<p className="text-gray-900 py-2">{storeSettings.email}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Mata Uang
					</label>
					{isEditing === "store" ? (
						<select
							value={storeSettings.currency}
							onChange={(e) =>
								setStoreSettings({ ...storeSettings, currency: e.target.value })
							}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
							<option value="IDR">IDR - Rupiah Indonesia</option>
							<option value="USD">USD - US Dollar</option>
							<option value="EUR">EUR - Euro</option>
						</select>
					) : (
						<p className="text-gray-900 py-2">{storeSettings.currency}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Tarif Pajak (%)
					</label>
					{isEditing === "store" ? (
						<input
							type="number"
							value={storeSettings.taxRate}
							onChange={(e) =>
								setStoreSettings({
									...storeSettings,
									taxRate: Number(e.target.value),
								})
							}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							min="0"
							max="100"
							step="0.1"
						/>
					) : (
						<p className="text-gray-900 py-2">{storeSettings.taxRate}%</p>
					)}
				</div>
			</div>

			{isEditing === "store" && (
				<div className="flex justify-end space-x-3 mt-6">
					<button
						onClick={() => setIsEditing(null)}
						className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
						Batal
					</button>
					<button
						onClick={() => handleSave("store")}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
						<Save className="w-4 h-4" />
						<span>Simpan</span>
					</button>
				</div>
			)}
		</div>
	);

	const NotificationSection = () => (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold mb-6">Pengaturan Notifikasi</h3>

			<div className="space-y-4">
				{Object.entries(notifications).map(([key, value]) => {
					const labels: Record<string, string> = {
						emailNotifications: "Notifikasi Email",
						lowStockAlerts: "Peringatan Stok Habis",
						orderNotifications: "Notifikasi Pesanan Baru",
						dailyReports: "Laporan Harian",
						weeklyReports: "Laporan Mingguan",
					};

					return (
						<div
							key={key}
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
							<span className="text-gray-900">{labels[key]}</span>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={value}
									onChange={(e) =>
										setNotifications({
											...notifications,
											[key]: e.target.checked,
										})
									}
									className="sr-only peer"
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
							</label>
						</div>
					);
				})}
			</div>

			<div className="flex justify-end mt-6">
				<button
					onClick={() => handleSave("notifications")}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
					<Save className="w-4 h-4" />
					<span>Simpan</span>
				</button>
			</div>
		</div>
	);

	const SystemSection = () => (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold mb-6">Pengaturan Sistem</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Tema
					</label>
					<select
						value={systemSettings.theme}
						onChange={(e) =>
							setSystemSettings({ ...systemSettings, theme: e.target.value })
						}
						className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value="light">Terang</option>
						<option value="dark">Gelap</option>
						<option value="auto">Otomatis</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Bahasa
					</label>
					<select
						value={systemSettings.language}
						onChange={(e) =>
							setSystemSettings({ ...systemSettings, language: e.target.value })
						}
						className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value="id">Bahasa Indonesia</option>
						<option value="en">English</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Format Tanggal
					</label>
					<select
						value={systemSettings.dateFormat}
						onChange={(e) =>
							setSystemSettings({
								...systemSettings,
								dateFormat: e.target.value,
							})
						}
						className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value="DD/MM/YYYY">DD/MM/YYYY</option>
						<option value="MM/DD/YYYY">MM/DD/YYYY</option>
						<option value="YYYY-MM-DD">YYYY-MM-DD</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Frekuensi Backup
					</label>
					<select
						value={systemSettings.backupFrequency}
						onChange={(e) =>
							setSystemSettings({
								...systemSettings,
								backupFrequency: e.target.value,
							})
						}
						className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value="daily">Harian</option>
						<option value="weekly">Mingguan</option>
						<option value="monthly">Bulanan</option>
					</select>
				</div>
			</div>

			<div className="mt-6">
				<div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
					<span className="text-gray-900">Aktifkan Backup Otomatis</span>
					<label className="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							checked={systemSettings.enableBackup}
							onChange={(e) =>
								setSystemSettings({
									...systemSettings,
									enableBackup: e.target.checked,
								})
							}
							className="sr-only peer"
						/>
						<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
					</label>
				</div>
			</div>

			<div className="flex justify-end mt-6">
				<button
					onClick={() => handleSave("system")}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
					<Save className="w-4 h-4" />
					<span>Simpan</span>
				</button>
			</div>
		</div>
	);

	const SecuritySection = () => (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold mb-6">Keamanan</h3>

			<div className="space-y-6">
				<div>
					<h4 className="text-md font-medium text-gray-900 mb-3">
						Ubah Password
					</h4>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Password Lama
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Masukkan password lama"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center">
									{showPassword ? (
										<EyeOff className="w-4 h-4 text-gray-400" />
									) : (
										<Eye className="w-4 h-4 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Password Baru
								</label>
								<input
									type="password"
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Password baru"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Konfirmasi Password
								</label>
								<input
									type="password"
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Konfirmasi password baru"
								/>
							</div>
						</div>

						<button className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
							Ubah Password
						</button>
					</div>
				</div>

				<div className="border-t pt-6">
					<h4 className="text-md font-medium text-gray-900 mb-3">
						Riwayat Login
					</h4>
					<div className="space-y-3">
						<div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
							<div>
								<p className="text-sm font-medium">Login berhasil</p>
								<p className="text-xs text-gray-600">
									IP: 192.168.1.100 • Chrome di MacOS
								</p>
							</div>
							<span className="text-xs text-gray-500">2 jam lalu</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
							<div>
								<p className="text-sm font-medium">Login berhasil</p>
								<p className="text-xs text-gray-600">
									IP: 192.168.1.100 • Chrome di MacOS
								</p>
							</div>
							<span className="text-xs text-gray-500">1 hari lalu</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	const renderSection = () => {
		switch (activeTab) {
			case "profile":
				return <ProfileSection />;
			case "store":
				return <StoreSection />;
			case "notifications":
				return <NotificationSection />;
			case "system":
				return <SystemSection />;
			case "security":
				return <SecuritySection />;
			default:
				return <ProfileSection />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
				<p className="text-gray-600">
					Kelola pengaturan akun, toko, dan sistem
				</p>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow">
				<div className="border-b border-gray-200">
					<nav className="flex space-x-8 px-6" aria-label="Tabs">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
										activeTab === tab.id
											? "border-blue-500 text-blue-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}>
									<Icon className="w-4 h-4" />
									<span>{tab.label}</span>
								</button>
							);
						})}
					</nav>
				</div>
			</div>

			{/* Content */}
			{renderSection()}
		</div>
	);
}
