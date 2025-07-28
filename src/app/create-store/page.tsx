"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

interface OptionItem {
	id: string;
	name: string;
	description?: string;
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
		currency: "IDR",
		description: "",
	});

	// Dropdown options
	const [businessFields, setBusinessFields] = useState<OptionItem[]>([]);
	const [countries, setCountries] = useState<Country[]>([]);
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [businessAges, setBusinessAges] = useState<OptionItem[]>([]);
	const [accountingMethods, setAccountingMethods] = useState<OptionItem[]>([]);
	const [currencies, setCurrencies] = useState<OptionItem[]>([]);

	useEffect(() => {
		loadDropdownData();
	}, []);

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
				supabase.from("options").select("*").eq("type", "business_field"),
				supabase.from("countries").select("*"),
				supabase.from("options").select("*").eq("type", "business_age"),
				supabase
					.from("options")
					.select("*")
					.eq("type", "inventory_valuation_method"),
				supabase.from("options").select("*").eq("type", "currency"),
			]);

			setBusinessFields(businessFieldsData.data || []);
			setCountries(countriesData.data || []);
			setBusinessAges(businessAgesData.data || []);
			setAccountingMethods(accountingMethodsData.data || []);
			setCurrencies(currenciesData.data || []);
		} catch (error) {
			console.error("Error loading dropdown data:", error);
		}
	};

	const loadProvinces = async (countryId: string) => {
		try {
			const { data } = await supabase
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!user) {
				throw new Error("User not authenticated");
			}

			// Create business
			const { data: businessData, error: businessError } = await supabase
				.from("businesses")
				.insert({
					created_by: user.id,
					name: formData.businessName,
				})
				.select()
				.single();

			if (businessError) throw businessError;

			// Create store
			const { data: storeData, error: storeError } = await supabase
				.from("stores")
				.insert({
					business_id: businessData.id,
					country_id: formData.country,
					province_id: formData.province,
					city_id: formData.city,
					name: formData.storeName,
					address: formData.address,
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

			// Create role assignment
			const { error: roleError } = await supabase
				.from("role_assignments")
				.insert({
					user_id: user.id,
					business_id: businessData.id,
					store_id: storeData.id,
					role_id: "677b303f-d2c9-478c-ab5b-456db1078b1e", // Owner role ID
				});

			if (roleError) throw roleError;

			showToast({
				type: "success",
				title: "Toko berhasil dibuat!",
				message: "Data toko Anda telah tersimpan",
			});

			router.push("/admin/dashboard");
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat membuat toko";
			console.error("Error creating store:", error);
			showToast({
				type: "error",
				title: "Gagal membuat toko",
				message: errorMessage,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white shadow rounded-lg">
					<div className="px-6 py-8">
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900">
								Isi Data Toko
							</h1>
							<p className="text-gray-600 mt-2">Isi data toko kamu di Ourbit</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Nama Usaha */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nama Usaha
								</label>
								<input
									type="text"
									name="businessName"
									required
									value={formData.businessName}
									onChange={handleInputChange}
									placeholder="Ourbit"
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
								/>
							</div>

							{/* Bidang Usaha */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Bidang Usaha
								</label>
								<select
									name="businessField"
									required
									value={formData.businessField}
									onChange={handleInputChange}
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500">
									<option value="">Pilih Bidang Usaha</option>
									{businessFields.map((field: OptionItem) => (
										<option key={field.id} value={field.id}>
											{field.name}
										</option>
									))}
								</select>
							</div>

							{/* Bidang Usaha Lainnya */}
							{formData.businessField === "9999" && (
								<div>
									<input
										type="text"
										name="otherBusinessField"
										required
										value={formData.otherBusinessField}
										onChange={handleInputChange}
										placeholder="Bidang Usaha Lainnya"
										className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
									/>
								</div>
							)}

							{/* Nama Toko */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nama Toko
								</label>
								<input
									type="text"
									name="storeName"
									required
									value={formData.storeName}
									onChange={handleInputChange}
									placeholder="Ourbit Store"
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
								/>
							</div>

							{/* Negara */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Negara
								</label>
								<select
									name="country"
									required
									value={formData.country}
									onChange={handleInputChange}
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500">
									<option value="">Pilih Negara</option>
									{countries.map((country: Country) => (
										<option key={country.id} value={country.id}>
											{country.name}
										</option>
									))}
								</select>
							</div>

							{/* Provinsi */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Provinsi
								</label>
								<select
									name="province"
									required
									value={formData.province}
									onChange={handleInputChange}
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
									disabled={!formData.country}>
									<option value="">Pilih Provinsi</option>
									{provinces.map((province: Province) => (
										<option key={province.id} value={province.id}>
											{province.name}
										</option>
									))}
								</select>
							</div>

							{/* Kota */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Kota / Kabupaten
								</label>
								<select
									name="city"
									required
									value={formData.city}
									onChange={handleInputChange}
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
									disabled={!formData.province}>
									<option value="">Pilih Kota / Kabupaten</option>
									{cities.map((city: City) => (
										<option key={city.id} value={city.id}>
											{city.name}
										</option>
									))}
								</select>
							</div>

							{/* Alamat Toko */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Alamat Toko
								</label>
								<input
									type="text"
									name="address"
									required
									value={formData.address}
									onChange={handleInputChange}
									placeholder="Jalan Raya Lenteng Agung No 60"
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
								/>
							</div>

							{/* Kode POS */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Kode POS
								</label>
								<input
									type="text"
									name="zipCode"
									required
									value={formData.zipCode}
									onChange={handleInputChange}
									placeholder="12630"
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
								/>
							</div>

							{/* Berapa lama usaha berdiri */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Berapa lama usaha anda berdiri?
								</label>
								<select
									name="businessAge"
									required
									value={formData.businessAge}
									onChange={handleInputChange}
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500">
									<option value="">Pilih Jawaban</option>
									{businessAges.map((age: OptionItem) => (
										<option key={age.id} value={age.id}>
											{age.name}
										</option>
									))}
								</select>
							</div>

							{/* Nama Pemilik Toko */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nama Pemilik Toko
								</label>
								<input
									type="text"
									name="ownerName"
									required
									value={formData.ownerName}
									onChange={handleInputChange}
									placeholder="Glen Rynaldy Hermanus"
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
								/>
							</div>

							{/* Metode Akuntansi */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Metode Akuntansi
								</label>
								<select
									name="accountingMethod"
									required
									value={formData.accountingMethod}
									onChange={handleInputChange}
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500">
									<option value="">Pilih Metode Akuntansi</option>
									{accountingMethods.map((method: OptionItem) => (
										<option key={method.id} value={method.id}>
											{method.name}
										</option>
									))}
								</select>
							</div>

							{/* Kurs Mata Uang */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Kurs Mata Uang
								</label>
								<select
									name="currency"
									required
									value={formData.currency}
									onChange={handleInputChange}
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500">
									<option value="">Pilih Kurs Mata Uang</option>
									{currencies.map((currency: OptionItem) => (
										<option key={currency.id} value={currency.id}>
											{currency.name}
										</option>
									))}
								</select>
							</div>

							{/* Deskripsi Toko */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Deskripsi Toko
								</label>
								<textarea
									name="description"
									rows={3}
									value={formData.description}
									onChange={handleInputChange}
									placeholder="Toko serba ada terdebes!"
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
								/>
							</div>

							{/* Submit Button */}
							<div className="pt-6">
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
									{loading ? "Menyimpan..." : "Simpan Data Toko"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
