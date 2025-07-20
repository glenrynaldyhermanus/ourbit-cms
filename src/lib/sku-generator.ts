export interface SKUOptions {
	autoGenerate: boolean;
	pattern: "category-sequential" | "name-based" | "custom" | "date-based";
	prefix?: string;
	suffix?: string;
	includeDate?: boolean;
	categoryCode?: string;
	sequentialLength?: number;
}

export interface SKUPattern {
	id: string;
	name: string;
	description: string;
	pattern: string;
	example: string;
}

export const SKU_PATTERNS: SKUPattern[] = [
	{
		id: "category-sequential",
		name: "Kategori + Sequential",
		description: "Kode kategori + nomor urut (contoh: ELEC-001)",
		pattern: "{CATEGORY}-{SEQUENTIAL}",
		example: "ELEC-001, FOOD-002",
	},
	{
		id: "name-based",
		name: "Berdasarkan Nama",
		description: "Huruf pertama dari setiap kata nama produk",
		pattern: "{NAME_INITIALS}",
		example: "Laptop HP → LHP, Susu Ultra → SU",
	},
	{
		id: "date-based",
		name: "Tanggal + Sequential",
		description: "Tanggal hari ini + nomor urut",
		pattern: "{DATE}-{SEQUENTIAL}",
		example: "240101-001, 240101-002",
	},
	{
		id: "custom",
		name: "Kustom",
		description: "Prefix + kode kustom + suffix",
		pattern: "{PREFIX}{CUSTOM}{SUFFIX}",
		example: "PROD-ABC-001, ITEM-XYZ-2024",
	},
];

export class SKUGenerator {
	private static async getNextSequentialNumber(
		categoryId: string | null,
		storeId: string,
		pattern: string
	): Promise<number> {
		// Query untuk mendapatkan nomor sequential terakhir
		const { supabase } = await import("./supabase");

		let query = supabase
			.from("products")
			.select("code")
			.eq("store_id", storeId)
			.not("code", "is", null);

		// Filter berdasarkan pattern
		if (pattern.includes("{CATEGORY}") && categoryId) {
			query = query.eq("category_id", categoryId);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching sequential number:", error);
			return 1;
		}

		// Extract numbers from existing codes
		const numbers =
			data
				?.map((item) => {
					const match = item.code?.match(/\d+$/);
					return match ? parseInt(match[0]) : 0;
				})
				.filter((num) => num > 0) || [];

		return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
	}

	private static formatDate(): string {
		const now = new Date();
		const year = now.getFullYear().toString().slice(-2);
		const month = (now.getMonth() + 1).toString().padStart(2, "0");
		const day = now.getDate().toString().padStart(2, "0");
		return `${year}${month}${day}`;
	}

	private static getCategoryCode(categoryName: string): string {
		if (!categoryName) return "GEN";

		// Ambil 3 huruf pertama dari nama kategori
		const words = categoryName.split(" ");
		if (words.length === 1) {
			return words[0].substring(0, 3).toUpperCase();
		}

		// Jika multi kata, ambil huruf pertama dari setiap kata
		return words
			.map((word) => word.charAt(0))
			.join("")
			.substring(0, 3)
			.toUpperCase();
	}

	private static getNameInitials(productName: string): string {
		if (!productName) return "PROD";

		const words = productName.split(" ");
		if (words.length === 1) {
			return words[0].substring(0, 3).toUpperCase();
		}

		return words
			.map((word) => word.charAt(0))
			.join("")
			.substring(0, 3)
			.toUpperCase();
	}

	static async generateSKU(
		productName: string,
		categoryId: string | null,
		categoryName: string | null,
		storeId: string,
		options: SKUOptions
	): Promise<string> {
		if (!options.autoGenerate) {
			return "";
		}

		const sequentialNumber = await this.getNextSequentialNumber(
			categoryId,
			storeId,
			options.pattern
		);

		let sku = "";

		switch (options.pattern) {
			case "category-sequential":
				const categoryCode = this.getCategoryCode(categoryName || "");
				sku = `${categoryCode}-${sequentialNumber.toString().padStart(3, "0")}`;
				break;

			case "name-based":
				const initials = this.getNameInitials(productName);
				sku = `${initials}-${sequentialNumber.toString().padStart(3, "0")}`;
				break;

			case "date-based":
				const date = this.formatDate();
				sku = `${date}-${sequentialNumber.toString().padStart(3, "0")}`;
				break;

			case "custom":
				const prefix = options.prefix || "PROD";
				const suffix = options.suffix || "";
				const customCode =
					options.categoryCode || this.getCategoryCode(categoryName || "");
				sku = `${prefix}-${customCode}-${sequentialNumber
					.toString()
					.padStart(3, "0")}${suffix}`;
				break;

			default:
				sku = `PROD-${sequentialNumber.toString().padStart(3, "0")}`;
		}

		return sku;
	}

	static validateSKU(sku: string): { isValid: boolean; message: string } {
		if (!sku.trim()) {
			return { isValid: false, message: "SKU tidak boleh kosong" };
		}

		if (sku.length < 3) {
			return { isValid: false, message: "SKU minimal 3 karakter" };
		}

		if (sku.length > 20) {
			return { isValid: false, message: "SKU maksimal 20 karakter" };
		}

		// Check for special characters (only allow alphanumeric, dash, underscore)
		const validPattern = /^[A-Za-z0-9-_]+$/;
		if (!validPattern.test(sku)) {
			return {
				isValid: false,
				message:
					"SKU hanya boleh berisi huruf, angka, dash (-), dan underscore (_)",
			};
		}

		return { isValid: true, message: "SKU valid" };
	}

	static async checkSKUUniqueness(
		sku: string,
		storeId: string,
		excludeId?: string
	): Promise<boolean> {
		const { supabase } = await import("./supabase");

		let query = supabase
			.from("products")
			.select("id")
			.eq("code", sku)
			.eq("store_id", storeId);

		if (excludeId) {
			query = query.neq("id", excludeId);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error checking SKU uniqueness:", error);
			return false;
		}

		return data.length === 0;
	}
}
