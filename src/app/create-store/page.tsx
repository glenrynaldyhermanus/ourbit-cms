"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import Switch from "@/components/ui/Switch";

interface OptionItem {
	id: string; // stored value (key or value)
	name: string; // display label
}

interface Country {
	id: string;
	name: string;
	code: string;
}

interface Province {
	id: string;
	name: string;
	country_id: string;
}

interface City {
	id: string;
	name: string;
	province_id: string;
}

export default function CreateStorePage() {
	const router = useRouter();
	const { user } = useAuthContext();
	const { showToast } = useToast();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		businessName: "",
		businessField: "",
		otherBusinessField: "",
		storeName: "",
		country: "ID",
		province: "",
		city: "",
		address: "",
		zipCode: "",
		businessAge: "",
		ownerName: "",
		accountingMethod: "",
		currency: "",
		description: "",
	});

	// Online store settings
	const [enableOnlineStore, setEnableOnlineStore] = useState(false);
	const [onlineStoreSubdomain, setOnlineStoreSubdomain] = useState("");
	const [onlineStoreContactEmail, setOnlineStoreContactEmail] = useState("");
	const [subdomainError, setSubdomainError] = useState("");

	// Dropdown options
	const [businessFields, setBusinessFields] = useState<OptionItem[]>([]);
	const [countries, setCountries] = useState<Country[]>([]);
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [businessAges, setBusinessAges] = useState<OptionItem[]>([]);
	const [accountingMethods, setAccountingMethods] = useState<OptionItem[]>([]);
	const [currencies, setCurrencies] = useState<OptionItem[]>([]);

	// Local open state for custom selects
	const [openSelect, setOpenSelect] = useState<
		| null
		| "businessField"
		| "businessAge"
		| "accountingMethod"
		| "currency"
		| "country"
		| "province"
		| "city"
	>(null);

	useEffect(() => {
		loadDropdownData();

		// Set default contact email to user's email
		if (user?.email) {
			setOnlineStoreContactEmail(user.email);
		}
	}, [user]);

	useEffect(() => {
		if (formData.country) {
			loadProvinces(formData.country);
		}
	}, [formData.country]);

	useEffect(() => {
		if (formData.province) {
			loadCities(formData.province);
		}
	}, [formData.province]);

	// Auto-generate subdomain based on business name
	useEffect(() => {
		if (formData.businessName && !onlineStoreSubdomain) {
			// Generate subdomain from business name
			const generatedSubdomain = formData.businessName
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "") // Remove special chars
				.replace(/\s+/g, "-") // Replace spaces with hyphens
				.replace(/-+/g, "-") // Replace multiple hyphens with single
				.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

			setOnlineStoreSubdomain(generatedSubdomain);
		}
	}, [formData.businessName, onlineStoreSubdomain]);

	// Check subdomain availability
	const checkSubdomainAvailability = async (subdomain: string) => {
		if (!subdomain) return true;

		// Check length first
		if (subdomain.length < 3 || subdomain.length > 50) {
			return false;
		}

		// Check for valid characters
		const validSubdomainRegex = /^[a-z0-9-]+$/;
		if (!validSubdomainRegex.test(subdomain)) {
			return false;
		}

		// Check if subdomain starts or ends with hyphen
		if (subdomain.startsWith("-") || subdomain.endsWith("-")) {
			return false;
		}

		// Check if subdomain is only numbers
		const onlyNumbersRegex = /^\d+$/;
		if (onlyNumbersRegex.test(subdomain)) {
			return false;
		}

		// Check for reserved words
		const reservedWords = [
			"www",
			"admin",
			"api",
			"blog",
			"help",
			"support",
			"docs",
			"status",
			"shop",
			"store",
			"market",
			"ourbit",
			"app",
		];
		if (reservedWords.includes(subdomain.toLowerCase())) {
			return false;
		}

		// Check for inappropriate words (simplified check)
		const inappropriateWords = ["xxx", "sex", "porn", "adult"];
		const subdomainLower = subdomain.toLowerCase();
		for (const word of inappropriateWords) {
			if (subdomainLower.includes(word)) {
				return false;
			}
		}

		// Check for repeated characters (more than 3 in a row)
		const repeatedCharRegex = /(.)\1{2,}/;
		if (repeatedCharRegex.test(subdomain)) {
			return false;
		}

		try {
			const { data, error } = await supabase
				.from("business_online_settings")
				.select("id")
				.eq("subdomain", subdomain.toLowerCase())
				.maybeSingle();

			if (error) throw error;

			// If data exists, subdomain is taken
			return !data;
		} catch (error) {
			console.error("Error checking subdomain availability:", error);
			return false;
		}
	};

	// Check subdomain availability when it changes
	useEffect(() => {
		if (onlineStoreSubdomain && enableOnlineStore) {
			const timer = setTimeout(async () => {
				const isAvailable = await checkSubdomainAvailability(
					onlineStoreSubdomain
				);
				if (!isAvailable) {
					setSubdomainError(
						"Subdomain ini sudah digunakan. Silakan pilih yang lain."
					);
				} else {
					setSubdomainError("");
				}
			}, 500);

			return () => clearTimeout(timer);
		} else {
			setSubdomainError("");
		}
	}, [onlineStoreSubdomain, enableOnlineStore]);

	const loadDropdownData = async () => {
		try {
			// Load all dropdown options
			const [
				businessFieldsData,
				countriesData,
				businessAgesData,
				accountingMethodsData,
				currenciesData,
			] = await Promise.all([
				supabase
					.schema("common")
					.from("options")
					.select("id,key,value")
					.eq("type", "business_field"),
				supabase.schema("common").from("countries").select("*"),
				supabase
					.schema("common")
					.from("options")
					.select("id,key,value")
					.eq("type", "business_age"),
				supabase
					.schema("common")
					.from("options")
					.select("id,key,value")
					.eq("type", "inventory_valuation_method"),
				supabase
					.schema("common")
					.from("options")
					.select("id,key,value")
					.eq("type", "currency"),
			]);

			// Map options: use key as id, value as label for consistent storage/display
			type OptRow = { id: string; key: string; value: string };
			setBusinessFields(
				((businessFieldsData.data as OptRow[]) || []).map((o) => ({
					id: o.key,
					name: o.value,
				}))
			);
			setCountries(countriesData.data || []);
			setBusinessAges(
				((businessAgesData.data as OptRow[]) || []).map((o) => ({
					id: o.key,
					name: o.value,
				}))
			);
			setAccountingMethods(
				((accountingMethodsData.data as OptRow[]) || []).map((o) => ({
					id: o.key,
					name: o.value,
				}))
			);
			setCurrencies(
				((currenciesData.data as OptRow[]) || []).map((o) => ({
					id: o.value,
					name: o.value,
				}))
			);
		} catch (error) {
			console.error("Error loading dropdown data:", error);
		}
	};

	const loadProvinces = async (countryId: string) => {
		try {
			const { data } = await supabase
				.schema("common")
				.from("provinces")
				.select("*")
				.eq("country_id", countryId);
			setProvinces(data || []);
			setFormData((prev) => ({ ...prev, province: "", city: "" }));
		} catch (error) {
			console.error("Error loading provinces:", error);
		}
	};

	const loadCities = async (provinceId: string) => {
		try {
			const { data } = await supabase
				.schema("common")
				.from("cities")
				.select("*")
				.eq("province_id", provinceId);
			setCities(data || []);
			setFormData((prev) => ({ ...prev, city: "" }));
		} catch (error) {
			console.error("Error loading cities:", error);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const selectValue = (
		field:
			| "businessField"
			| "businessAge"
			| "accountingMethod"
			| "currency"
			| "country"
			| "province"
			| "city",
		value: string
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setOpenSelect(null);
	};

	const getLabel = (
		items: OptionItem[],
		value: string,
		placeholder: string
	) => {
		const item = items.find((i) => i.id === value);
		return item ? item.name : placeholder;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		// Basic validations
		if (!formData.businessAge) {
			showToast({
				type: "error",
				title: "Data belum lengkap",
				message: "Mohon pilih berapa lama usaha Anda berdiri",
			});
			setLoading(false);
			return;
		}

		if (!formData.zipCode || !formData.zipCode.trim()) {
			showToast({
				type: "error",
				title: "Data belum lengkap",
				message: "Mohon isi Kode POS toko",
			});
			setLoading(false);
			return;
		}

		// Online store validation
		if (enableOnlineStore) {
			if (!onlineStoreSubdomain || !onlineStoreSubdomain.trim()) {
				showToast({
					type: "error",
					title: "Data belum lengkap",
					message: "Mohon isi subdomain untuk toko online",
				});
				setLoading(false);
				return;
			}

			// Check subdomain length
			if (onlineStoreSubdomain.length < 3 || onlineStoreSubdomain.length > 50) {
				showToast({
					type: "error",
					title: "Subdomain tidak valid",
					message: "Subdomain harus terdiri dari 3-50 karakter",
				});
				setLoading(false);
				return;
			}

			// Check for invalid characters
			const validSubdomainRegex = /^[a-z0-9-]+$/;
			if (!validSubdomainRegex.test(onlineStoreSubdomain)) {
				showToast({
					type: "error",
					title: "Subdomain tidak valid",
					message:
						"Subdomain hanya boleh mengandung huruf kecil, angka, dan tanda hubung (-)",
				});
				setLoading(false);
				return;
			}

			// Check if subdomain starts or ends with hyphen
			if (
				onlineStoreSubdomain.startsWith("-") ||
				onlineStoreSubdomain.endsWith("-")
			) {
				showToast({
					type: "error",
					title: "Subdomain tidak valid",
					message:
						"Subdomain tidak boleh dimulai atau diakhiri dengan tanda hubung (-)",
				});
				setLoading(false);
				return;
			}

			// Check if subdomain is only numbers
			const onlyNumbersRegex = /^\d+$/;
			if (onlyNumbersRegex.test(onlineStoreSubdomain)) {
				showToast({
					type: "error",
					title: "Subdomain tidak valid",
					message: "Subdomain tidak boleh hanya terdiri dari angka",
				});
				setLoading(false);
				return;
			}

			// Check for reserved words
			const reservedWords = [
				"www",
				"admin",
				"api",
				"blog",
				"help",
				"support",
				"docs",
				"status",
				"shop",
				"store",
				"market",
				"ourbit",
				"app",
			];
			if (reservedWords.includes(onlineStoreSubdomain.toLowerCase())) {
				showToast({
					type: "error",
					title: "Subdomain tidak valid",
					message:
						"Subdomain tersebut merupakan kata yang dilindungi. Silakan pilih yang lain.",
				});
				setLoading(false);
				return;
			}

			// Check for inappropriate words
			const inappropriateWords = ["xxx", "sex", "porn", "adult"];
			const subdomainLower = onlineStoreSubdomain.toLowerCase();
			for (const word of inappropriateWords) {
				if (subdomainLower.includes(word)) {
					showToast({
						type: "error",
						title: "Subdomain tidak valid",
						message:
							"Subdomain mengandung kata yang tidak pantas. Silakan pilih yang lain.",
					});
					setLoading(false);
					return;
				}
			}

			// Check if there's a subdomain error
			if (subdomainError) {
				showToast({
					type: "error",
					title: "Subdomain tidak tersedia",
					message:
						"Subdomain tersebut sudah digunakan. Silakan pilih yang lain.",
				});
				setLoading(false);
				return;
			}

			if (!onlineStoreContactEmail || !onlineStoreContactEmail.trim()) {
				showToast({
					type: "error",
					title: "Data belum lengkap",
					message: "Mohon isi email kontak untuk toko online",
				});
				setLoading(false);
				return;
			}

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(onlineStoreContactEmail)) {
				showToast({
					type: "error",
					title: "Email tidak valid",
					message: "Mohon masukkan email yang valid",
				});
				setLoading(false);
				return;
			}
		}

		try {
			if (!user) {
				throw new Error("User not authenticated");
			}

			// Ensure corresponding record exists in public.users for FK on role_assignments
			const { error: userUpsertError } = await supabase
				.schema("common")
				.from("users")
				.upsert(
					{
						id: user.id,
						email: user.email || "",
						name: user.fullName || null,
						phone: user.phone || null,
					},
					{ onConflict: "id" }
				);
			if (userUpsertError) throw userUpsertError;

			// Create business
			const { data: businessData, error: businessError } = await supabase
				.schema("common")
				.from("businesses")
				.insert({
					created_by: user.id,
					name: formData.businessName,
					business_age: formData.businessAge || null,
				})
				.select()
				.single();

			if (businessError) throw businessError;

			// Create store
			const { data: storeData, error: storeError } = await supabase
				.schema("common")
				.from("stores")
				.insert({
					business_id: businessData.id,
					country_id: formData.country,
					province_id: formData.province,
					city_id: formData.city,
					name: formData.storeName,
					address: formData.address,
					zip_code: formData.zipCode || null,
					business_field:
						formData.businessField === "9999"
							? formData.otherBusinessField
							: formData.businessField,
					business_description: formData.description,
					stock_setting: formData.accountingMethod,
					currency: formData.currency,
					default_tax_rate: 0.0,
					is_branch: false,
					phone_number: user.phone || "081314169140",
				})
				.select()
				.single();

			if (storeError) throw storeError;

			// Ensure we have an Owner role and assign it
			let ownerRoleId: string | null = null;
			const { data: ownerRole, error: ownerRoleError } = await supabase
				.schema("common")
				.from("roles")
				.select("id")
				.eq("name", "Owner")
				.maybeSingle();

			if (ownerRoleError) throw ownerRoleError;
			if (ownerRole?.id) {
				ownerRoleId = ownerRole.id;
			} else {
				const { data: createdRole, error: createRoleError } = await supabase
					.schema("common")
					.from("roles")
					.insert({ name: "Owner" })
					.select("id")
					.single();
				if (createRoleError) throw createRoleError;
				ownerRoleId = createdRole.id;
			}

			const { error: roleError } = await supabase
				.schema("common")
				.from("role_assignments")
				.insert({
					user_id: user.id,
					business_id: businessData.id,
					store_id: storeData.id,
					role_id: ownerRoleId,
				});

			if (roleError) throw roleError;

			// Seed default store payment methods: activate all methods under cash, qris, and edc
			try {
				// 1) Load target payment types (parent categories)
				const { data: typeRows, error: typeErr } = await supabase
					.from("payment_types")
					.select("id, code")
					.in("code", ["cash", "qris", "edc"]);
				if (typeErr) throw typeErr;

				const typeIdByCode = new Map(
					(typeRows || []).map((t: { id: string; code: string }) => [
						t.code,
						t.id,
					])
				);
				const targetTypeIds = ["cash", "qris", "edc"]
					.map((c) => typeIdByCode.get(c))
					.filter(Boolean) as string[];

				if (targetTypeIds.length > 0) {
					// 2) Load all methods under those types
					const { data: methodRows, error: methodErr } = await supabase
						.from("payment_methods")
						.select("id, payment_type_id, code")
						.in("payment_type_id", targetTypeIds);
					if (methodErr) throw methodErr;

					const methodIds = (methodRows || []).map((m: { id: string }) => m.id);

					if (methodIds.length > 0) {
						// 3) Determine which methods are not yet enabled for this store
						const { data: existingRows, error: existingErr } = await supabase
							.from("store_payment_methods")
							.select("payment_method_id")
							.eq("store_id", storeData.id);
						if (existingErr) throw existingErr;

						const existingIds = new Set(
							(existingRows || []).map(
								(r: { payment_method_id: string }) => r.payment_method_id
							)
						);
						const toInsert = methodIds
							.filter((id) => !existingIds.has(id))
							.map((id) => ({
								store_id: storeData.id,
								payment_method_id: id,
								is_active: true,
							}));

						if (toInsert.length > 0) {
							const { error: insertErr } = await supabase
								.from("store_payment_methods")
								.insert(toInsert);
							if (insertErr) throw insertErr;
						}
					}
				}
			} catch (seedErr) {
				console.error(
					"Gagal mengaktifkan metode pembayaran default untuk toko baru:",
					seedErr
				);
			}

			// Create online store settings if enabled
			if (enableOnlineStore) {
				// Format subdomain before saving
				const formattedSubdomain = onlineStoreSubdomain
					.toLowerCase()
					.replace(/\s+/g, "") // Remove all whitespace
					.replace(/[^a-z0-9-]/g, "")
					.replace(/-+/g, "-")
					.replace(/^-|-$/g, "");

				// Additional validation before saving
				if (formattedSubdomain.length < 3 || formattedSubdomain.length > 50) {
					throw new Error("Subdomain harus terdiri dari 3-50 karakter");
				}

				if (
					formattedSubdomain.startsWith("-") ||
					formattedSubdomain.endsWith("-")
				) {
					throw new Error(
						"Subdomain tidak boleh dimulai atau diakhiri dengan tanda hubung (-)"
					);
				}

				// Check if subdomain is only numbers
				const onlyNumbersRegex = /^\d+$/;
				if (onlyNumbersRegex.test(formattedSubdomain)) {
					throw new Error("Subdomain tidak boleh hanya terdiri dari angka");
				}

				// Check for reserved words
				const reservedWords = [
					"www",
					"admin",
					"api",
					"blog",
					"help",
					"support",
					"docs",
					"status",
					"shop",
					"store",
					"market",
					"ourbit",
					"app",
				];
				if (reservedWords.includes(formattedSubdomain.toLowerCase())) {
					throw new Error(
						"Subdomain tersebut merupakan kata yang dilindungi. Silakan pilih yang lain."
					);
				}

				// Check for inappropriate words
				const inappropriateWords = ["xxx", "sex", "porn", "adult"];
				const subdomainLower = formattedSubdomain.toLowerCase();
				for (const word of inappropriateWords) {
					if (subdomainLower.includes(word)) {
						throw new Error(
							"Subdomain mengandung kata yang tidak pantas. Silakan pilih yang lain."
						);
					}
				}

				const { error: onlineSettingsError } = await supabase
					.from("business_online_settings")
					.insert({
						business_id: businessData.id,
						subdomain: formattedSubdomain,
						contact_email: onlineStoreContactEmail,
						description: formData.description || "",
						stock_tracking: 1, // Default to real-time tracking
						default_online_store_id: storeData.id,
					});

				if (onlineSettingsError) throw onlineSettingsError;

				// Also enable online delivery for the store
				const { error: storeUpdateError } = await supabase
					.schema("common")
					.from("stores")
					.update({ is_online_delivery_active: true })
					.eq("id", storeData.id);

				if (storeUpdateError) throw storeUpdateError;
			}

			showToast({
				type: "success",
				title: "Toko berhasil dibuat!",
				message: "Data toko Anda telah tersimpan",
			});

			router.push("/admin/dashboard");
		} catch (error: unknown) {
			let errorMessage = "Terjadi kesalahan saat membuat toko";
			if (error && typeof error === "object" && "message" in error) {
				const errObj = error as { message?: unknown };
				errorMessage = String(errObj.message || errorMessage);
			}
			console.error("Error creating store:", error ?? "");
			showToast({
				type: "error",
				title: "Gagal membuat toko",
				message: errorMessage,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut();
			router.push("/sign-in");
		} catch (error) {
			console.error("Error logging out:", error);
			showToast({
				type: "error",
				title: "Gagal keluar",
				message: "Terjadi kesalahan saat keluar, coba lagi.",
			});
		}
	};

	// Derived validations for online store subdomain (for JSX rendering)
	const subdomainLower = onlineStoreSubdomain.toLowerCase();
	const hasSubdomain = onlineStoreSubdomain.length > 0;
	const isSubLenInvalid =
		hasSubdomain &&
		(onlineStoreSubdomain.length < 3 || onlineStoreSubdomain.length > 50);
	const isSubInvalidChars =
		hasSubdomain && !/^[a-z0-9-]+$/.test(onlineStoreSubdomain);
	const isSubHyphenInvalid =
		hasSubdomain &&
		(onlineStoreSubdomain.startsWith("-") ||
			onlineStoreSubdomain.endsWith("-"));
	const isSubNumericOnly = hasSubdomain && /^\d+$/.test(onlineStoreSubdomain);
	const reservedWordsForUI = [
		"www",
		"admin",
		"api",
		"blog",
		"help",
		"support",
		"docs",
		"status",
		"shop",
		"store",
		"market",
		"ourbit",
		"app",
	];
	const hasReservedWord =
		hasSubdomain && reservedWordsForUI.includes(subdomainLower);
	const inappropriateWordsForUI = ["xxx", "sex", "porn", "adult"];
	const hasInappropriateWord =
		hasSubdomain &&
		inappropriateWordsForUI.some((w) => subdomainLower.includes(w));

	// URL preview for mobile frame
	const previewUrl = `https://ourbit.web.app/@${
		onlineStoreSubdomain || "namatoko"
	}`;

	return (
		<div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
			<div
				className={`${
					enableOnlineStore ? "max-w-6xl" : "max-w-2xl"
				} mx-auto transition-all duration-300`}>
				<div
					className={`${
						enableOnlineStore ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""
					}`}>
					<div className={`transition-transform duration-300`}>
						<div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm">
							<div className="px-6 py-8">
								<div className="mb-8">
									<h1 className="text-3xl font-bold text-[var(--foreground)]">
										Isi Data Toko
									</h1>
									<p className="text-[var(--muted-foreground)] mt-2">
										Isi data toko kamu di Ourbit
									</p>
									<p className="text-sm text-[var(--muted-foreground)] mt-4">
										Setelah membuat toko, Anda dapat menjual produk secara
										online melalui toko digital kami.
									</p>
								</div>

								<form onSubmit={handleSubmit} className="space-y-6">
									{/* Nama Usaha */}
									<Input.Root>
										<Input.Label required>Nama Usaha</Input.Label>
										<Input.Field
											name="businessName"
											required
											value={formData.businessName}
											onChange={(v) =>
												setFormData((p) => ({ ...p, businessName: v }))
											}
											placeholder="Ourbit"
										/>
									</Input.Root>

									{/* Nama Toko */}
									<Input.Root>
										<Input.Label required>Nama Toko</Input.Label>
										<Input.Field
											name="storeName"
											required
											value={formData.storeName}
											onChange={(v) =>
												setFormData((p) => ({ ...p, storeName: v }))
											}
											placeholder="Ourbit Store"
										/>
									</Input.Root>

									{/* Deskripsi Toko (dipindahkan ke bawah Nama Toko) */}
									<div>
										<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
											Deskripsi Toko
										</label>
										<textarea
											name="description"
											rows={3}
											value={formData.description}
											onChange={handleInputChange}
											placeholder="Toko serba ada terdebes!"
											className="w-full px-3 py-3 border border-[var(--border-input)] bg-[var(--background)] text-[var(--foreground)] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
										/>
									</div>

									{/* Online Store (under Nama Toko) */}
									<div className="border border-[var(--border)] rounded-lg p-4">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-medium text-[var(--foreground)]">
													Aktifkan Toko Online
												</h4>
												<p className="text-sm text-[var(--muted-foreground)]">
													Buat toko online untuk menjual produk secara digital
												</p>
											</div>
											<Switch
												checked={enableOnlineStore}
												onChange={setEnableOnlineStore}
											/>
										</div>

										{enableOnlineStore && (
											<div className="space-y-4 mt-4">
												<div>
													<label className="block text-sm font-medium text-[var(--foreground)] mb-2">
														Subdomain
													</label>
													<div className="flex items-center">
														<span className="text-[var(--muted-foreground)] mr-2">
															ourbit.web.app/@
														</span>
														<Input.Root className="flex-1">
															<Input.Field
																value={onlineStoreSubdomain}
																onChange={(value: string) => {
																	const formattedValue = value
																		.toLowerCase()
																		.replace(/\s+/g, "")
																		.replace(/[^a-z0-9-]/g, "")
																		.replace(/-+/g, "-")
																		.replace(/^-|-$/g, "");
																	setOnlineStoreSubdomain(formattedValue);
																}}
																placeholder="namatoko"
															/>
														</Input.Root>
													</div>
													{hasSubdomain && (
														<>
															<p className="text-xs text-[var(--muted-foreground)] mt-1">
																Toko online Anda akan tersedia di:
																ourbit.web.app/@{onlineStoreSubdomain}
															</p>
															{subdomainError && (
																<p className="text-xs text-red-500 mt-1">
																	{subdomainError}
																</p>
															)}
															{isSubLenInvalid && (
																<p className="text-xs text-red-500 mt-1">
																	Subdomain harus terdiri dari 3-50 karakter
																</p>
															)}
															{isSubInvalidChars && (
																<p className="text-xs text-red-500 mt-1">
																	Subdomain hanya boleh mengandung huruf kecil,
																	angka, dan tanda hubung (-)
																</p>
															)}
															{isSubHyphenInvalid && (
																<p className="text-xs text-red-500 mt-1">
																	Subdomain tidak boleh dimulai atau diakhiri
																	dengan tanda hubung (-)
																</p>
															)}
															{hasReservedWord && (
																<p className="text-xs text-red-500 mt-1">
																	Subdomain tersebut merupakan kata yang
																	dilindungi. Silakan pilih yang lain.
																</p>
															)}
															{isSubNumericOnly && (
																<p className="text-xs text-red-500 mt-1">
																	Subdomain tidak boleh hanya terdiri dari angka
																</p>
															)}
															{hasInappropriateWord && (
																<p className="text-xs text-red-500 mt-1">
																	Subdomain mengandung kata yang tidak pantas.
																	Silakan pilih yang lain.
																</p>
															)}
														</>
													)}
												</div>

												{/* Email Kontak dihilangkan: gunakan email login otomatis */}
											</div>
										)}
									</div>

									{/* Bidang Usaha */}
									<Select.Root
										className={
											openSelect === "businessField" ? "z-[10002]" : ""
										}>
										<Select.Label required>Bidang Usaha</Select.Label>
										<Select.Trigger
											value={getLabel(
												businessFields,
												formData.businessField,
												"Pilih Bidang Usaha"
											)}
											placeholder="Pilih Bidang Usaha"
											open={openSelect === "businessField"}
											onClick={() =>
												setOpenSelect(
													openSelect === "businessField"
														? null
														: "businessField"
												)
											}
										/>
										<Select.Content
											open={openSelect === "businessField"}
											onClose={() => setOpenSelect(null)}>
											{businessFields.map((item) => (
												<Select.Item
													value={item.id}
													key={item.id}
													onClick={() => selectValue("businessField", item.id)}
													selected={formData.businessField === item.id}>
													{item.name}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>

									{/* Bidang Usaha Lainnya */}
									{formData.businessField === "9999" && (
										<Input.Root>
											<Input.Field
												name="otherBusinessField"
												required
												value={formData.otherBusinessField}
												onChange={(v) =>
													setFormData((p) => ({ ...p, otherBusinessField: v }))
												}
												placeholder="Bidang Usaha Lainnya"
											/>
										</Input.Root>
									)}

									{/* Negara */}
									<Select.Root
										className={openSelect === "country" ? "z-[10002]" : ""}>
										<Select.Label required>Negara</Select.Label>
										<Select.Trigger
											value={
												countries.find((c) => c.id === formData.country)
													?.name || "Pilih Negara"
											}
											placeholder="Pilih Negara"
											open={openSelect === "country"}
											onClick={() =>
												setOpenSelect(
													openSelect === "country" ? null : "country"
												)
											}
										/>
										<Select.Content
											open={openSelect === "country"}
											onClose={() => setOpenSelect(null)}>
											{countries.map((c) => (
												<Select.Item
													value={c.id}
													key={c.id}
													onClick={() => selectValue("country", c.id)}
													selected={formData.country === c.id}>
													{c.name}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>

									{/* Provinsi */}
									<Select.Root
										className={`${!formData.country ? "opacity-50" : ""} ${
											openSelect === "province" ? "z-[10002]" : ""
										}`}>
										<Select.Label required>Provinsi</Select.Label>
										<Select.Trigger
											value={
												provinces.find((p) => p.id === formData.province)
													?.name || "Pilih Provinsi"
											}
											placeholder="Pilih Provinsi"
											disabled={!formData.country}
											open={openSelect === "province"}
											onClick={() =>
												!formData.country
													? undefined
													: setOpenSelect(
															openSelect === "province" ? null : "province"
													  )
											}
										/>
										<Select.Content
											open={openSelect === "province"}
											onClose={() => setOpenSelect(null)}>
											{provinces.map((p) => (
												<Select.Item
													value={p.id}
													key={p.id}
													onClick={() => selectValue("province", p.id)}
													selected={formData.province === p.id}>
													{p.name}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>

									{/* Kota */}
									<Select.Root
										className={`${!formData.province ? "opacity-50" : ""} ${
											openSelect === "city" ? "z-[10002]" : ""
										}`}>
										<Select.Label required>Kota / Kabupaten</Select.Label>
										<Select.Trigger
											value={
												cities.find((c) => c.id === formData.city)?.name ||
												"Pilih Kota / Kabupaten"
											}
											placeholder="Pilih Kota / Kabupaten"
											disabled={!formData.province}
											open={openSelect === "city"}
											onClick={() =>
												!formData.province
													? undefined
													: setOpenSelect(openSelect === "city" ? null : "city")
											}
										/>
										<Select.Content
											open={openSelect === "city"}
											onClose={() => setOpenSelect(null)}>
											{cities.map((c) => (
												<Select.Item
													value={c.id}
													key={c.id}
													onClick={() => selectValue("city", c.id)}
													selected={formData.city === c.id}>
													{c.name}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>

									{/* Alamat Toko */}
									<Input.Root>
										<Input.Label required>Alamat Toko</Input.Label>
										<Input.Field
											name="address"
											required
											value={formData.address}
											onChange={(v) =>
												setFormData((p) => ({ ...p, address: v }))
											}
											placeholder="Jalan Raya Lenteng Agung No 60"
										/>
									</Input.Root>

									{/* Kode POS */}
									<Input.Root>
										<Input.Label required>Kode POS</Input.Label>
										<Input.Field
											name="zipCode"
											required
											value={formData.zipCode}
											onChange={(v) =>
												setFormData((p) => ({ ...p, zipCode: v }))
											}
											placeholder="12630"
										/>
									</Input.Root>

									{/* Berapa lama usaha berdiri */}
									<Select.Root
										className={openSelect === "businessAge" ? "z-[10002]" : ""}>
										<Select.Label required>
											Berapa lama usaha anda berdiri?
										</Select.Label>
										<Select.Trigger
											value={getLabel(
												businessAges,
												formData.businessAge,
												"Pilih Jawaban"
											)}
											placeholder="Pilih Jawaban"
											open={openSelect === "businessAge"}
											onClick={() =>
												setOpenSelect(
													openSelect === "businessAge" ? null : "businessAge"
												)
											}
										/>
										<Select.Content
											open={openSelect === "businessAge"}
											onClose={() => setOpenSelect(null)}>
											{businessAges.map((item) => (
												<Select.Item
													value={item.id}
													key={item.id}
													onClick={() => selectValue("businessAge", item.id)}
													selected={formData.businessAge === item.id}>
													{item.name}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>

									{/* Nama Pemilik Toko dihapus: sudah dikumpulkan pada @sign-up */}

									{/* Metode Akuntansi */}
									<Select.Root
										className={
											openSelect === "accountingMethod" ? "z-[10002]" : ""
										}>
										<Select.Label required>Metode Akuntansi</Select.Label>
										<Select.Trigger
											value={getLabel(
												accountingMethods,
												formData.accountingMethod,
												"Pilih Metode Akuntansi"
											)}
											placeholder="Pilih Metode Akuntansi"
											open={openSelect === "accountingMethod"}
											onClick={() =>
												setOpenSelect(
													openSelect === "accountingMethod"
														? null
														: "accountingMethod"
												)
											}
										/>
										<Select.Content
											open={openSelect === "accountingMethod"}
											onClose={() => setOpenSelect(null)}>
											{accountingMethods.map((item) => (
												<Select.Item
													value={item.id}
													key={item.id}
													onClick={() =>
														selectValue("accountingMethod", item.id)
													}
													selected={formData.accountingMethod === item.id}>
													{item.name}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>

									{/* Kurs Mata Uang */}
									<Select.Root
										className={openSelect === "currency" ? "z-[10002]" : ""}>
										<Select.Label required>Kurs Mata Uang</Select.Label>
										<Select.Trigger
											value={getLabel(
												currencies,
												formData.currency,
												"Pilih Kurs Mata Uang"
											)}
											placeholder="Pilih Kurs Mata Uang"
											open={openSelect === "currency"}
											onClick={() =>
												setOpenSelect(
													openSelect === "currency" ? null : "currency"
												)
											}
										/>
										<Select.Content
											open={openSelect === "currency"}
											onClose={() => setOpenSelect(null)}>
											{currencies.map((item) => (
												<Select.Item
													value={item.id}
													key={item.id}
													onClick={() => selectValue("currency", item.id)}
													selected={formData.currency === item.id}>
													{item.name}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>

									{/* Submit Button */}
									<div className="pt-6 flex items-center gap-3">
										<Button
											variant="outline"
											type="button"
											onClick={handleLogout}
											className="h-11">
											<Button.Text>Keluar</Button.Text>
										</Button>
										<Button
											type="submit"
											loading={loading}
											className="h-11 flex-1">
											<Button.Text>Simpan Data Toko</Button.Text>
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>

					{/* Online Store Preview Panel */}
					<div
						className={`${
							enableOnlineStore
								? "opacity-100 translate-y-0"
								: "opacity-0 pointer-events-none -translate-y-2"
						} hidden lg:block transition-all duration-300`}>
						<div className="bg-[var(--card)] rounded-lg animate-fade-in">
							<div className="flex justify-center">
								<div className="w-full max-w-[420px]">
									<div className="relative w-full aspect-[9/16] rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
										{/* Mobile URL bar */}
										<div className="absolute top-0 left-0 right-0 h-10 bg-[var(--card)]/80 backdrop-blur border-b border-[var(--border)] flex items-center px-3">
											<div className="mx-auto w-full rounded-full text-[var(--muted-foreground)] text-xs px-1 py-1.5 truncate">
												{previewUrl}
											</div>
										</div>
										<div className="absolute inset-0 overflow-y-auto">
											<div className="pt-12 p-4">
												<div className="mb-4">
													<h2 className="text-xl font-bold text-[var(--foreground)]">
														{formData.businessName || "Nama Usaha"}
													</h2>
													<p className="text-[var(--muted-foreground)] mt-1">
														{formData.storeName || "Nama Toko"}
													</p>
													{formData.description ? (
														<p className="text-[var(--muted-foreground)] mt-2">
															{formData.description}
														</p>
													) : (
														<p className="text-[var(--muted-foreground)] mt-2">
															Tambahkan deskripsi toko untuk ditampilkan di
															halaman toko online Anda.
														</p>
													)}
												</div>
												<div className="grid grid-cols-1 gap-4">
													{Array.from({ length: 4 }).map((_, i) => (
														<Card key={i}>
															<CardHeader>
																<CardTitle>
																	<Skeleton.Item className="h-5 w-1/2" />
																</CardTitle>
															</CardHeader>
															<CardContent>
																<div className="w-full h-40 bg-[var(--muted)] rounded-md mb-3" />
																<Skeleton.Item className="h-4 w-3/4 mb-2" />
																<Skeleton.Item className="h-4 w-1/3" />
															</CardContent>
														</Card>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
